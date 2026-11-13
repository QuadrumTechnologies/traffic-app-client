"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { getWebSocket, onSocketOpen } from "@/app/dashboard/websocket";
import { useAppSelector } from "@/hooks/reduxHook";
import OverlayModal from "@/components/Modals/OverlayModal";

// Junction control (stage 1 of the redesign).
// - Commands are explicit and the page shows what the controller confirms:
//   Sending… → Confirmed, or No reply after 10 s, or Refused (with why).
// - Manual control is taken with a reason and ends by itself after a spell
//   without action (15 min by default), at 2 hours, or when the holder leaves.
// - Maintenance (restart, lamps, settings reset) is for client admins and
//   Quadrum, with the device ID typed to confirm. No password prompts.

export type ControlRole = "viewer" | "operator" | "admin" | "quadrum";

interface Lease {
  holderName: string;
  holderEmail: string;
  holderRole: "operator" | "admin" | "quadrum";
  reason: string;
  idleMinutes: number;
  startedAt: string;
  lastActionAt: string;
  idleEndsAt: string;
  hardEndsAt: string;
}

interface CommandState {
  id: string;
  command: string;
  status: "sent" | "confirmed" | "no_reply" | "refused";
  message: string;
}

type Dialog =
  | { kind: "take"; takeover: boolean }
  | { kind: "maintain"; command: "restart" | "lamps_off" | "reset_config" }
  | null;

const ROLE_WORD: Record<string, string> = {
  operator: "operator",
  admin: "client admin",
  quadrum: "Quadrum",
};

const MAINTENANCE: Record<string, { title: string; body: string; button: string }> = {
  restart: {
    title: "Restart the controller?",
    body: "It reboots and goes offline for a moment. While it restarts the signal cards keep their last state or flash, and it comes back running its plan. Manual control, if any, ends.",
    button: "Restart controller",
  },
  lamps_off: {
    title: "Turn the lamps off?",
    body: "Every signal at this junction goes dark until the lamps are turned on again. Only do this with police or a crew directing traffic.",
    button: "Turn lamps off",
  },
  reset_config: {
    title: "Reset the controller's settings?",
    body: "The controller goes back to its factory configuration. Its day plans may need to be sent again afterwards. This can't be undone from here.",
    button: "Reset settings",
  },
};

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function canOverride(role: ControlRole, lease: Lease) {
  if (role === "admin") return lease.holderRole === "operator" || lease.holderRole === "quadrum";
  if (role === "quadrum") return lease.holderRole === "operator";
  return false;
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function mmss(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function JunctionControl({
  deviceId,
  isOnline,
  role,
  myEmail,
}: {
  deviceId: string;
  isOnline: boolean;
  role: ControlRole;
  myEmail: string;
}) {
  const { deviceActiveStateData } = useAppSelector((state) => state.userDevice);
  const stateKnown = deviceActiveStateData?.DeviceID === deviceId;
  const auto = stateKnown ? Boolean(deviceActiveStateData?.Auto) : null;
  const lamps = stateKnown ? deviceActiveStateData?.Power !== false : null;

  const [lease, setLease] = useState<Lease | null>(null);
  const [leaseNote, setLeaseNote] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [last, setLast] = useState<CommandState | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const mine = useRef<Set<string>>(new Set());
  const now = useNow(1000);

  const me = (myEmail || "").toLowerCase();
  const isMine = Boolean(lease && lease.holderEmail === me);
  const canOperate = role === "operator" || role === "admin" || role === "quadrum";
  const canMaintain = role === "admin" || role === "quadrum";

  const send = useCallback(
    (payload: Record<string, unknown>) => {
      const id = newId();
      mine.current.add(id);
      setLast({ id, command: String(payload.command), status: "sent", message: "Sending to the controller…" });
      const socket = getWebSocket();
      const message = JSON.stringify({ event: "junction_command", payload: { DeviceID: deviceId, id, ...payload } });
      onSocketOpen(socket, () => socket.send(message));
    },
    [deviceId]
  );

  useEffect(() => {
    const socket = getWebSocket();
    const onMessage = (event: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data?.DeviceID !== deviceId) return;
      if (data.event === "control_lease") {
        setLease(data.lease || null);
        if (data.message) setLeaseNote(data.message);
        if (!data.lease) setWarning(null);
      } else if (data.event === "control_lease_warning") {
        if (String(data.holderEmail || "").toLowerCase() === me) setWarning(data.message);
      } else if (data.event === "command_status" && mine.current.has(data.id)) {
        setLast({ id: data.id, command: data.command, status: data.status, message: data.message });
      }
    };
    socket.addEventListener("message", onMessage);
    // Ask for the junction's state; the API answers with the lease as well.
    onSocketOpen(socket, () =>
      socket.send(JSON.stringify({ event: "state_request", payload: { DeviceID: deviceId } }))
    );
    return () => socket.removeEventListener("message", onMessage);
  }, [deviceId, me]);

  const endsAt = useMemo(() => {
    if (!lease) return null;
    return Math.min(new Date(lease.idleEndsAt).getTime(), new Date(lease.hardEndsAt).getTime());
  }, [lease]);

  // Mode chip: only what the controller reported, plus who holds control.
  let mode: { text: string; tone: "plan" | "manual" | "off" | "unknown" };
  if (!isOnline) mode = { text: "Offline", tone: "off" };
  else if (auto === null) mode = { text: "Reading the controller's mode…", tone: "unknown" };
  else if (lease) mode = { text: `Manual: ${lease.holderName}`, tone: "manual" };
  else if (auto) mode = { text: "Running its plan", tone: "plan" };
  else mode = { text: "Manual, set at the cabinet or another tool", tone: "manual" };

  const busy = last?.status === "sent";

  return (
    <section className="qtControl" aria-label="Junction control">
      <div className="qtControl__head">
        <h2>Control</h2>
        <span className={`qtMode qtMode--${mode.tone}`}>{mode.text}</span>
        {isOnline && lamps === false ? <span className="qtMode qtMode--off">Lamps off</span> : null}
      </div>

      {lease ? (
        <p className="qtControl__lease">
          <b>
            {isMine ? "You have" : `${lease.holderName} (${ROLE_WORD[lease.holderRole] || lease.holderRole}) has`} manual
            control
          </b>{" "}
          since {dayjs(lease.startedAt).format("HH:mm")}: &ldquo;{lease.reason}&rdquo;. Back to the plan at{" "}
          {dayjs(endsAt as number).format("HH:mm")}
          {isMine && endsAt ? ` (in ${mmss(endsAt - now)}) unless you act` : ""}.
        </p>
      ) : leaseNote ? (
        <p className="qtControl__note">{leaseNote}</p>
      ) : null}

      {warning && isMine ? (
        <p className="qtNotice" role="alert">
          {warning}{" "}
          <button type="button" className="qtButton" onClick={() => { setWarning(null); send({ command: "keep_control" }); }}>
            Keep control
          </button>
        </p>
      ) : null}

      {role === "viewer" ? (
        <p className="qtMuted">View-only access: you can watch this junction, but commands need an operator or client admin.</p>
      ) : !isOnline ? (
        <p className="qtMuted">Commands are off while the controller is offline.</p>
      ) : (
        <div className="qtControl__actions">
          {!lease && canOperate ? (
            <button type="button" className="qtButton" disabled={busy} onClick={() => setDialog({ kind: "take", takeover: false })}>
              Take manual control…
            </button>
          ) : null}
          {isMine ? (
            <>
              <button type="button" className="qtButton" disabled={busy} onClick={() => send({ command: "hold" })}>
                Hold stage +10 s
              </button>
              <button type="button" className="qtButton" disabled={busy} onClick={() => send({ command: "next" })}>
                Next stage
              </button>
              <button type="button" className="qtButton qtButton--quiet" disabled={busy} onClick={() => send({ command: "keep_control" })}>
                Keep control
              </button>
              <button type="button" className="qtButton qtButton--quiet" disabled={busy} onClick={() => send({ command: "manual_off" })}>
                Return to plan
              </button>
            </>
          ) : null}
          {lease && !isMine && canOverride(role, lease) ? (
            <>
              <button type="button" className="qtButton" disabled={busy} onClick={() => setDialog({ kind: "take", takeover: true })}>
                Take over…
              </button>
              <button type="button" className="qtButton qtButton--quiet" disabled={busy} onClick={() => send({ command: "manual_off" })}>
                Return to plan
              </button>
            </>
          ) : null}
        </div>
      )}

      {isMine ? (
        <p className="qtMuted qtControl__hint">
          Hold adds 10 s to the current stage. Next ends it early, unless it has less than 5 s left or is in amber; the
          controller runs its own amber and all-red.
        </p>
      ) : null}

      {last ? (
        <p className={`qtControl__status qtControl__status--${last.status}`} role="status">
          {last.status === "sent" ? "Sending… " : last.status === "confirmed" ? "Confirmed: " : last.status === "no_reply" ? "No reply: " : "Not done: "}
          {last.status === "sent" ? last.message.replace(/^Sending to the controller…$/, "waiting for the controller") : last.message}
        </p>
      ) : null}

      {canMaintain ? (
        <details className="qtControl__maint">
          <summary>Maintenance</summary>
          <p className="qtMuted">For client admins and Quadrum. Each one asks you to type the junction ID.</p>
          <div className="qtControl__actions">
            <button type="button" className="qtButton qtButton--quiet" disabled={!isOnline || busy} onClick={() => setDialog({ kind: "maintain", command: "restart" })}>
              Restart controller…
            </button>
            {lamps === false ? (
              <button type="button" className="qtButton qtButton--quiet" disabled={!isOnline || busy} onClick={() => send({ command: "lamps_on" })}>
                Turn lamps on
              </button>
            ) : (
              <button type="button" className="qtButton qtButton--quiet" disabled={!isOnline || busy} onClick={() => setDialog({ kind: "maintain", command: "lamps_off" })}>
                Turn lamps off…
              </button>
            )}
            <button type="button" className="qtButton qtButton--danger" disabled={!isOnline || busy} onClick={() => setDialog({ kind: "maintain", command: "reset_config" })}>
              Reset settings…
            </button>
          </div>
        </details>
      ) : null}

      {dialog?.kind === "take" ? (
        <OverlayModal onClose={() => setDialog(null)}>
          <TakeControlForm
            takeover={dialog.takeover}
            holder={lease?.holderName}
            onCancel={() => setDialog(null)}
            onSubmit={(reason, minutes) => {
              setDialog(null);
              send({ command: "manual_on", reason, minutes });
            }}
          />
        </OverlayModal>
      ) : null}

      {dialog?.kind === "maintain" ? (
        <OverlayModal onClose={() => setDialog(null)}>
          <TypedConfirm
            deviceId={deviceId}
            {...MAINTENANCE[dialog.command]}
            onCancel={() => setDialog(null)}
            onConfirm={(typed) => {
              const command = dialog.command;
              setDialog(null);
              send({ command, confirm: typed });
            }}
          />
        </OverlayModal>
      ) : null}
    </section>
  );
}

function TakeControlForm({
  takeover,
  holder,
  onCancel,
  onSubmit,
}: {
  takeover: boolean;
  holder?: string;
  onCancel: () => void;
  onSubmit: (reason: string, minutes: number) => void;
}) {
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError("Say why, for example “Police directing traffic”.");
      return;
    }
    onSubmit(reason.trim(), minutes);
  };
  return (
    <form className="qtConfirm" onSubmit={submit}>
      <h3>{takeover ? `Take over from ${holder}?` : "Take manual control?"}</h3>
      <p>
        The junction holds its current stage until you act. It goes back to its plan after the time below without
        action, after 2 hours at most, or about a minute after you close this page.
        {takeover ? ` ${holder} is told that you took over.` : ""}
      </p>
      <label className="qtField">
        <span>Why</span>
        <textarea className="qtInput" rows={2} maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </label>
      <label className="qtField">
        <span>Back to the plan after no action for</span>
        <select className="qtInput" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[5, 15, 30, 60].map((m) => (
            <option key={m} value={m}>
              {m} minutes
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="loginScreen__error" role="alert">{error}</p> : null}
      <div className="qtConfirm__actions">
        <button type="button" className="qtButton qtButton--quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="qtButton">
          {takeover ? "Take over" : "Take manual control"}
        </button>
      </div>
    </form>
  );
}

function TypedConfirm({
  deviceId,
  title,
  body,
  button,
  onCancel,
  onConfirm,
}: {
  deviceId: string;
  title: string;
  body: string;
  button: string;
  onCancel: () => void;
  onConfirm: (typed: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const ok = typed.trim().toUpperCase() === deviceId.toUpperCase();
  return (
    <form
      className="qtConfirm"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onConfirm(typed.trim());
      }}
    >
      <h3>{title}</h3>
      <p>{body}</p>
      <label className="qtField">
        <span>
          Type <b>{deviceId}</b> to confirm
        </span>
        <input className="qtInput" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoComplete="off" spellCheck={false} />
      </label>
      <div className="qtConfirm__actions">
        <button type="button" className="qtButton qtButton--quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="qtButton qtButton--danger" disabled={!ok}>
          {button}
        </button>
      </div>
    </form>
  );
}

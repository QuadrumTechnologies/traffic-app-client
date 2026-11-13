"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import HttpRequest from "@/store/services/HttpRequest";
import OverlayModal from "@/components/Modals/OverlayModal";
import { emitToastMessage } from "@/utils/toastFunc";

dayjs.extend(relativeTime);

// People and roles, in the layout of SmartSAV's Users page: role tiles, an
// invite button, and a card per person with pause, reset and role.

type Role = "admin" | "operator" | "viewer";
type Status = "active" | "invited" | "paused";

interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLoginAt: string | null;
  invitedAt: string | null;
  invitedBy: string | null;
  pausedAt: string | null;
  pausedBy: string | null;
  junctions: number;
  held?: HeldJunction[];
  purchases?: string[];
  library?: { phases: number; patterns: number; plans: number };
}

// A junction on its way out of someone's account: in trash (30 days) or
// recalled by Quadrum (7 days). The nightly job releases it after that.
interface HeldJunction {
  deviceId: string;
  reason: "trash" | "recalled";
  releaseAt: string | null;
}

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  department: string;
  lastLoginAt: string | null;
  isYou: boolean;
}

const ROLE_TEXT: Record<Role, { label: string; detail: string }> = {
  admin: {
    label: "Client admin",
    detail: "Adds controllers to the account and shares their junctions, plus everything an operator can do.",
  },
  operator: {
    label: "Operator",
    detail: "Sends commands and changes signal timing on the account's junctions.",
  },
  viewer: {
    label: "Viewer",
    detail: "Watches junctions live. Can't send commands or change timing.",
  },
};

const STATUS_TEXT: Record<Status, string> = {
  active: "Active",
  invited: "Invited",
  paused: "Paused",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function messageOf(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}

type Confirm =
  | { kind: "pause" | "remove"; person: Person }
  | null;

// Someone without an account asking for access (Request access page).
interface AccessRequestItem {
  id: string;
  purpose: "demo" | "access" | "buy" | "partner";
  purposeLabel: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  devices: string;
  deviceIds: string[];
  message: string;
  status: "new" | "approved" | "declined";
  createdAt: string;
}

export default function UsersPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [returnToStock, setReturnToStock] = useState(false);
  const [requests, setRequests] = useState<AccessRequestItem[]>([]);
  const [declining, setDeclining] = useState<AccessRequestItem | null>(null);
  const [declineNote, setDeclineNote] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await HttpRequest.get("/admin/access-requests?status=new");
      setRequests(data?.data?.requests || []);
    } catch {
      // The people list still works without the requests.
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const answer = async (
    request: AccessRequestItem,
    change: { action: "approve"; role: Role } | { action: "decline"; note: string }
  ) => {
    setBusyId(request.id);
    try {
      const { data } = await HttpRequest.patch(`/admin/access-requests/${request.id}`, change);
      setRequests((list) => list.filter((r) => r.id !== request.id));
      if (data?.data?.user) setPeople((list) => [data.data.user, ...list]);
      emitToastMessage(data?.message || "Done.", "success");
    } catch (error) {
      emitToastMessage(messageOf(error, "That request couldn't be updated."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await HttpRequest.get("/admin/users");
      setPeople(data?.data?.users || []);
      setAdmins(data?.data?.admins || []);
      setLoadFailed(false);
    } catch (error) {
      setLoadFailed(true);
      emitToastMessage(messageOf(error, "The list of people couldn't be loaded."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (updated: Person) =>
    setPeople((list) => list.map((p) => (p.id === updated.id ? updated : p)));

  const update = async (person: Person, change: { role?: Role; active?: boolean }) => {
    setBusyId(person.id);
    try {
      const { data } = await HttpRequest.patch(`/admin/users/${person.id}`, change);
      if (data?.data?.user) replace(data.data.user);
      emitToastMessage(data?.message || "Saved.", "success");
    } catch (error) {
      emitToastMessage(messageOf(error, "That change couldn't be saved."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const sendReset = async (person: Person) => {
    setBusyId(person.id);
    try {
      const { data } = await HttpRequest.post(`/admin/users/${person.id}/reset-password`, {});
      emitToastMessage(data?.message || "Email sent.", "success");
    } catch (error) {
      emitToastMessage(messageOf(error, "The email couldn't be sent."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (person: Person, returnToStock: boolean) => {
    setBusyId(person.id);
    try {
      const { data } = await HttpRequest.delete(`/admin/users/${person.id}`, {
        data: { returnToStock },
      });
      setPeople((list) => list.filter((p) => p.id !== person.id));
      emitToastMessage(data?.message || "Removed.", "success");
    } catch (error) {
      emitToastMessage(messageOf(error, "The account couldn't be removed."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const by = (role: Role) => people.filter((p) => p.role === role && p.status !== "paused").length;
    return {
      admin: by("admin"),
      operator: by("operator"),
      viewer: by("viewer"),
      paused: people.filter((p) => p.status === "paused").length,
    };
  }, [people]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [people, query]);

  return (
    <section className="qtUsers">
      <div className="qtUsers__head">
        <div>
          <h2 className="page-header">Users</h2>
          <p className="qtUsers__intro">
            Client accounts and what each person may do. Pausing an account
            signs that person out straight away.
          </p>
        </div>
        <button type="button" className="qtButton" onClick={() => setShowInvite(true)}>
          Invite a person
        </button>
      </div>

      <div className="qtTiles">
        <div className="qtTile">
          <p className="qtTile__label">Quadrum admins</p>
          <p className="qtTile__value">{admins.length}</p>
          <p className="qtTile__sub">Manage every account</p>
        </div>
        <div className="qtTile">
          <p className="qtTile__label">Client admins</p>
          <p className="qtTile__value">{counts.admin}</p>
          <p className="qtTile__sub">Own and share junctions</p>
        </div>
        <div className="qtTile">
          <p className="qtTile__label">Operators</p>
          <p className="qtTile__value">{counts.operator}</p>
          <p className="qtTile__sub">Commands and timing</p>
        </div>
        <div className="qtTile">
          <p className="qtTile__label">Viewers</p>
          <p className="qtTile__value">{counts.viewer}</p>
          <p className="qtTile__sub">Watch only</p>
        </div>
        <div className={`qtTile ${counts.paused ? "qtTile--offline" : ""}`}>
          <p className="qtTile__label">Paused</p>
          <p className="qtTile__value">{counts.paused}</p>
          <p className="qtTile__sub">Can&rsquo;t sign in</p>
        </div>
      </div>

      {requests.length > 0 ? (
        <section className="qtRequests" aria-label="Access requests">
          <h3 className="qtUsers__subhead">
            Requests <span className="qtMuted">({requests.length} new)</span>
          </h3>
          <ul className="qtRequests__list">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                busy={busyId === r.id}
                onApprove={(role) => answer(r, { action: "approve", role })}
                onDecline={() => {
                  setDeclineNote("");
                  setDeclining(r);
                }}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="qtUsers__tools">
        <label className="visually-hidden" htmlFor="people-search">
          Find a person
        </label>
        <input
          id="people-search"
          className="qtInput"
          type="search"
          placeholder="Find by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="qtButton qtButton--quiet"
          onClick={() => {
            load();
            loadRequests();
          }}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {loadFailed && people.length === 0 ? (
        <p className="qtNotice" role="alert">
          The list couldn&rsquo;t be loaded. Check your connection and choose Refresh.
        </p>
      ) : null}

      {!loading && !loadFailed && people.length === 0 ? (
        <p className="qtNotice">No client accounts yet. Invite the first person.</p>
      ) : null}

      <ul className="qtPeople">
        {shown.map((person) => {
          const busy = busyId === person.id;
          return (
            <li key={person.id} className={`qtPerson qtPerson--${person.status}`}>
              <div className="qtPerson__top">
                <span className="qtPerson__avatar" aria-hidden="true">
                  {initials(person.name)}
                </span>
                <div className="qtPerson__who">
                  <p className="qtPerson__name">{person.name}</p>
                  <p className="qtPerson__email">{person.email}</p>
                </div>
                <span className={`qtStatus qtStatus--${person.status}`}>
                  {STATUS_TEXT[person.status]}
                </span>
              </div>

              <dl className="qtPerson__facts">
                <div>
                  <dt>Last sign-in</dt>
                  <dd>
                    {person.lastLoginAt
                      ? dayjs(person.lastLoginAt).fromNow()
                      : person.status === "invited"
                      ? `Invited ${dayjs(person.invitedAt).fromNow()}`
                      : "Not recorded yet"}
                  </dd>
                </div>
                <div>
                  <dt>Junctions</dt>
                  <dd>{person.junctions}</dd>
                </div>
              </dl>
              {(person.held || []).length > 0 ? (
                <p className="qtPerson__note">
                  {(person.held || [])
                    .map(
                      (h) =>
                        `${h.deviceId} ${h.reason === "recalled" ? "recalled" : "in trash"}, released ${
                          h.releaseAt ? dayjs(h.releaseAt).format("D MMM") : "soon"
                        }`
                    )
                    .join("; ")}
                  . Removing the account releases {(person.held || []).length === 1 ? "it" : "them"} now.
                </p>
              ) : null}

              <label className="qtPerson__role">
                <span>Role</span>
                <select
                  value={person.role}
                  disabled={busy}
                  onChange={(e) => update(person, { role: e.target.value as Role })}
                >
                  {(Object.keys(ROLE_TEXT) as Role[]).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_TEXT[role].label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="qtPerson__roleDetail">{ROLE_TEXT[person.role].detail}</p>

              {person.status === "paused" && person.pausedBy ? (
                <p className="qtPerson__note">
                  Paused by {person.pausedBy}
                  {person.pausedAt ? `, ${dayjs(person.pausedAt).fromNow()}` : ""}.
                </p>
              ) : null}

              <div className="qtPerson__actions">
                {person.status === "paused" ? (
                  <button type="button" className="qtButton" disabled={busy} onClick={() => update(person, { active: true })}>
                    Resume
                  </button>
                ) : (
                  <button
                    type="button"
                    className="qtButton qtButton--quiet"
                    disabled={busy}
                    onClick={() => setConfirm({ kind: "pause", person })}
                  >
                    Pause
                  </button>
                )}
                {person.status !== "paused" ? (
                  <button type="button" className="qtButton qtButton--quiet" disabled={busy} onClick={() => sendReset(person)}>
                    {person.status === "invited" ? "Resend invitation" : "Send password reset"}
                  </button>
                ) : null}
                {person.junctions === 0 ? (
                  <button
                    type="button"
                    className="qtButton qtButton--danger"
                    disabled={busy}
                    onClick={() => {
                      setReturnToStock(false);
                      setConfirm({ kind: "remove", person });
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {admins.length > 0 ? (
        <>
          <h3 className="qtUsers__subhead">Quadrum admins</h3>
          <ul className="qtPeople qtPeople--compact">
            {admins.map((admin) => (
              <li key={admin.id} className="qtPerson">
                <div className="qtPerson__top">
                  <span className="qtPerson__avatar" aria-hidden="true">
                    {initials(admin.name)}
                  </span>
                  <div className="qtPerson__who">
                    <p className="qtPerson__name">
                      {admin.name} {admin.isYou ? <span className="qtPerson__you">(you)</span> : null}
                    </p>
                    <p className="qtPerson__email">{admin.email}</p>
                  </div>
                  <span className="qtStatus qtStatus--admin">Quadrum admin</span>
                </div>
                <p className="qtPerson__note">
                  Department {admin.department}. Last sign-in{" "}
                  {admin.lastLoginAt ? dayjs(admin.lastLoginAt).fromNow() : "not recorded yet"}.
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {showInvite ? (
        <OverlayModal onClose={() => setShowInvite(false)}>
          <InviteForm
            onDone={(person) => {
              setShowInvite(false);
              if (person) setPeople((list) => [person, ...list]);
            }}
          />
        </OverlayModal>
      ) : null}

      {declining ? (
        <OverlayModal onClose={() => setDeclining(null)}>
          <div className="qtConfirm">
            <h3>Decline {declining.company || declining.name || declining.email || declining.phone}?</h3>
            <p>
              {declining.email
                ? "If you add a note, it's emailed to them. Leave it empty to decline quietly."
                : "They gave no email address, so nothing is sent."}
            </p>
            {declining.email ? (
              <textarea
                className="qtInput"
                rows={3}
                maxLength={500}
                placeholder="For example: we don't offer integrations yet."
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
              />
            ) : null}
            <div className="qtConfirm__actions">
              <button type="button" className="qtButton qtButton--quiet" onClick={() => setDeclining(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="qtButton qtButton--danger"
                onClick={() => {
                  const r = declining;
                  setDeclining(null);
                  answer(r, { action: "decline", note: declineNote.trim() });
                }}
              >
                Decline request
              </button>
            </div>
          </div>
        </OverlayModal>
      ) : null}

      {confirm ? (
        <OverlayModal onClose={() => setConfirm(null)}>
          <div className="qtConfirm">
            {confirm.kind === "pause" ? (
              <>
                <h3>Pause {confirm.person.name}?</h3>
                <p>
                  They&rsquo;re signed out at their next action and can&rsquo;t
                  sign in until you resume the account. Their junctions and
                  timing stay as they are.
                </p>
              </>
            ) : (
              <RemoveDetails
                person={confirm.person}
                returnToStock={returnToStock}
                onReturnToStock={setReturnToStock}
              />
            )}
            <div className="qtConfirm__actions">
              <button type="button" className="qtButton qtButton--quiet" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`qtButton ${confirm.kind === "remove" ? "qtButton--danger" : ""}`}
                onClick={() => {
                  const { kind, person } = confirm;
                  setConfirm(null);
                  if (kind === "pause") update(person, { active: false });
                  else remove(person, returnToStock);
                }}
              >
                {confirm.kind === "pause" ? "Pause account" : "Remove account"}
              </button>
            </div>
          </div>
        </OverlayModal>
      ) : null}
    </section>
  );
}

function RequestCard({
  request,
  busy,
  onApprove,
  onDecline,
}: {
  request: AccessRequestItem;
  busy: boolean;
  onApprove: (role: Role) => void;
  onDecline: () => void;
}) {
  const [role, setRole] = useState<Role>("admin");
  const contact = [request.email, request.phone].filter(Boolean).join(" · ");
  return (
    <li className="qtRequests__item">
      <span className="qtRequests__purpose">{request.purposeLabel}</span>
      <p className="qtRequests__who">
        {request.company || request.name || contact}
        {request.company && request.name ? <span className="qtMuted"> · {request.name}</span> : null}
      </p>
      <p className="qtRequests__meta">
        {contact} · {dayjs(request.createdAt).fromNow()}
      </p>
      {request.devices ? (
        <p className="qtRequests__meta">
          Junctions: {request.devices}
          {request.deviceIds.length ? ` (IDs: ${request.deviceIds.join(", ")})` : ""}
        </p>
      ) : null}
      {request.message ? <p className="qtRequests__msg">{request.message}</p> : null}
      <div className="qtRequests__actions">
        {request.email ? (
          <>
            <label className="visually-hidden" htmlFor={`req-role-${request.id}`}>
              Role for {request.email}
            </label>
            <select
              id={`req-role-${request.id}`}
              value={role}
              disabled={busy}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {(Object.keys(ROLE_TEXT) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_TEXT[r].label}
                </option>
              ))}
            </select>
            <button type="button" className="qtButton" disabled={busy} onClick={() => onApprove(role)}>
              Approve and invite
            </button>
          </>
        ) : (
          <span className="qtMuted">No email: call them, then invite.</span>
        )}
        <button type="button" className="qtButton qtButton--quiet" disabled={busy} onClick={onDecline}>
          Decline
        </button>
      </div>
    </li>
  );
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// What removing an account does, spelled out before the click.
function RemoveDetails({
  person,
  returnToStock,
  onReturnToStock,
}: {
  person: Person;
  returnToStock: boolean;
  onReturnToStock: (value: boolean) => void;
}) {
  const held = person.held || [];
  const purchases = person.purchases || [];
  const lib = person.library || { phases: 0, patterns: 0, plans: 0 };
  const hasTiming = lib.phases + lib.patterns + lib.plans > 0;
  return (
    <>
      <h3>Remove {person.name}?</h3>
      <ul className="qtConfirm__list">
        <li>Their sign-in is deleted. This can&rsquo;t be undone.</li>
        {held.length > 0 ? (
          <li>
            {held.map((h) => h.deviceId).join(", ")} {held.length === 1 ? "leaves" : "leave"} the
            account now, without waiting for the{" "}
            {held.some((h) => h.reason === "recalled") ? "recall" : "trash"} period.
          </li>
        ) : null}
        {hasTiming ? (
          <li>
            Their saved timing ({plural(lib.phases, "phase")}, {plural(lib.patterns, "pattern")},{" "}
            {plural(lib.plans, "plan")}) isn&rsquo;t deleted. It stays with the junctions in
            Quadrum&rsquo;s pool.
          </li>
        ) : null}
      </ul>
      {purchases.length > 0 ? (
        <label className="qtConfirm__check">
          <input
            type="checkbox"
            checked={returnToStock}
            onChange={(e) => onReturnToStock(e.target.checked)}
          />
          <span>
            Put the controllers bought under this email back in stock as available:{" "}
            {purchases.join(", ")}. Leave unticked to keep the sale on record.
          </span>
        </label>
      ) : null}
    </>
  );
}

function InviteForm({ onDone }: { onDone: (person?: Person) => void }) {
  const [role, setRole] = useState<Role>("operator");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter the person's name and email address.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await HttpRequest.post("/admin/users", { name, email, role });
      emitToastMessage(data?.message || "Invitation sent.", "success");
      onDone(data?.data?.user);
    } catch (err) {
      setError(messageOf(err, "The invitation couldn't be sent."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="qtInvite" onSubmit={onSubmit} noValidate>
      <h3>Invite a person</h3>
      <p>
        They get an email with a link to choose their password. The link works
        for 3 days.
      </p>
      <label htmlFor="invite-name">Name</label>
      <input id="invite-name" name="name" className="qtInput" autoComplete="off" required />
      <label htmlFor="invite-email">Email</label>
      <input
        id="invite-email"
        name="email"
        type="email"
        className="qtInput"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
      />
      <fieldset className="qtInvite__roles">
        <legend>Role</legend>
        {(Object.keys(ROLE_TEXT) as Role[]).map((r) => (
          <label key={r} className={`qtInvite__role ${role === r ? "is-chosen" : ""}`}>
            <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
            <span>
              <strong>{ROLE_TEXT[r].label}</strong>
              <small>{ROLE_TEXT[r].detail}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {error ? (
        <p className="loginScreen__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="qtConfirm__actions">
        <button type="button" className="qtButton qtButton--quiet" onClick={() => onDone()}>
          Cancel
        </button>
        <button type="submit" className="qtButton" disabled={busy}>
          {busy ? "Sending…" : "Send invitation"}
        </button>
      </div>
    </form>
  );
}

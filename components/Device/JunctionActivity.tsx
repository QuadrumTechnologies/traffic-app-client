"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import HttpRequest from "@/store/services/HttpRequest";
import { getWebSocket } from "@/app/dashboard/websocket";

// What happened at this junction: commands, manual control, timing sent.
// Reloads when a command or a change of control is reported.

interface Entry {
  at: string;
  who: string | null;
  quadrum: boolean;
  text: string;
  ok: boolean;
}

export default function JunctionActivity({ deviceId }: { deviceId: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [all, setAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await HttpRequest.get(`/junctions/${deviceId}/activity`);
      setEntries(data?.data?.activity || []);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [deviceId]);

  useEffect(() => {
    load();
    const socket = getWebSocket();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onMessage = (event: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data?.DeviceID !== deviceId) return;
      if (data.event === "control_lease" || (data.event === "command_status" && data.status !== "sent")) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(load, 600);
      }
    };
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
      if (timer) clearTimeout(timer);
    };
  }, [deviceId, load]);

  const shown = entries ? (all ? entries : entries.slice(0, 6)) : [];

  return (
    <section className="qtActivity" aria-label="Activity">
      <div className="qtActivity__head">
        <h2>Activity</h2>
        <button type="button" className="qtButton qtButton--quiet" onClick={load}>
          Refresh
        </button>
      </div>
      {failed ? (
        <p className="qtMuted">The activity couldn&rsquo;t be loaded.</p>
      ) : entries === null ? (
        <p className="qtMuted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="qtMuted">Nothing yet. Commands, manual control and timing sent to the controller appear here.</p>
      ) : (
        <ol className="qtActivity__list">
          {shown.map((e, i) => (
            <li key={`${e.at}-${i}`} className={e.ok ? "" : "is-failed"}>
              <time dateTime={e.at}>{dayjs(e.at).format("D MMM, HH:mm")}</time>
              <span>
                {e.who ? (
                  <b>
                    {e.who}
                    {e.quadrum ? " (Quadrum)" : ""}:{" "}
                  </b>
                ) : null}
                {e.text}
              </span>
            </li>
          ))}
        </ol>
      )}
      {entries && entries.length > 6 ? (
        <button type="button" className="qtButton qtButton--quiet" onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer" : `Show all ${entries.length}`}
        </button>
      ) : null}
    </section>
  );
}

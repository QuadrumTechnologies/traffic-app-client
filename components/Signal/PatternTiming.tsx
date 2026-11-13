"use client";

import { useEffect, useMemo, useState } from "react";
import HttpRequest from "@/store/services/HttpRequest";
import { useAppSelector } from "@/hooks/reduxHook";
import SignalTimeline from "./SignalTimeline";
import { TimingPhase } from "./signalPattern";

interface Pattern {
  name: string;
  deviceId: string;
  configuredPhases: {
    name: string;
    phaseId: string;
    signalString: string;
    duration: number;
    index: number;
    enableAmber?: boolean;
    greenToRedAmberDelay?: number;
  }[];
}

// The junction's signal timing, big: one row per movement across the cycle
// of the chosen pattern. While the controller reports live, the phase it is
// running is highlighted and a cursor shows how far into it it is.
export default function PatternTiming({
  deviceId,
  isOnline,
  activePlan,
}: {
  deviceId: string;
  isOnline: boolean;
  activePlan?: string;
}) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const live = useAppSelector((state: any) => state.userDevice.activePhaseSignal);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;
    HttpRequest.get("/patterns")
      .catch(() => null)
      .then((patternRes) => {
        if (cancelled) return;
        const allPatterns: Pattern[] = patternRes?.data?.data?.patterns || [];
        const mine = allPatterns.filter((p) => p.deviceId === deviceId);
        setPatterns(mine);
        setSelected((current) => current || mine[0]?.name || "");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  const pattern = patterns.find((p) => p.name === selected);
  const timingPhases: TimingPhase[] = useMemo(
    () =>
      (pattern?.configuredPhases || [])
        .slice()
        .sort((a, b) => a.index - b.index)
        .map((phase) => ({
          name: phase.name,
          duration: Number(phase.duration) || 0,
          signalString: phase.signalString,
        })),
    [pattern]
  );

  // Amber shown before a movement loses its green: the longest amber set on
  // this pattern's phases, or 3 s when none is set.
  const amber = useMemo(() => {
    const ambers = (pattern?.configuredPhases || [])
      .filter((p) => p.enableAmber)
      .map((p) => Number(p.greenToRedAmberDelay) || 0)
      .filter((n) => n > 0);
    return ambers.length ? Math.max(...ambers) : 3;
  }, [pattern]);

  const liveSignal =
    isOnline && live && live.DeviceID === deviceId ? live.Phase : undefined;
  const liveCountdown =
    isOnline && live && live.DeviceID === deviceId && live.Countdown !== ""
      ? Number(live.Countdown)
      : undefined;
  const cycle = timingPhases.reduce((sum, p) => sum + p.duration, 0);

  return (
    <section className="qtCard" aria-labelledby="timing-title">
      <div className="qtCard__head">
        <div>
          <h2 id="timing-title">Signal timing</h2>
          <p>
            {pattern
              ? `${pattern.name}: ${timingPhases.length} phases, ${cycle} s cycle` +
                (activePlan ? `. Active plan on the controller: ${activePlan}` : "")
              : loaded
              ? "No patterns saved for this junction yet. The diagram shows a typical four-stage cycle."
              : "Loading patterns…"}
          </p>
        </div>
        {patterns.length > 1 ? (
          <label>
            <span className="visually-hidden">Pattern</span>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {patterns.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <SignalTimeline
        phases={timingPhases}
        amber={amber}
        variant="light"
        animate={!liveSignal && timingPhases.length === 0}
        liveSignalString={liveSignal}
        liveCountdown={liveCountdown}
      />
      <div className="qtLegend" aria-hidden="true">
        <span><i style={{ background: "#1f9a57" }} /> Green</span>
        <span><i style={{ background: "#e9a100" }} /> Amber</span>
        <span><i style={{ background: "rgba(210, 59, 46, 0.30)" }} /> Red</span>
        <span>
          {liveSignal
            ? "Highlighted: the phase the controller is running now"
            : isOnline
            ? "Waiting for the controller's next phase report"
            : "Live position shows when the controller is online"}
        </span>
      </div>
    </section>
  );
}

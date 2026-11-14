"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEMO_PHASES,
  Lamp,
  movementsOf,
  TimingPhase,
  timelineOf,
} from "./signalPattern";

interface SignalTimelineProps {
  phases?: TimingPhase[];
  amber?: number;
  // "dark" for photo/dark panels, "light" for cards.
  variant?: "dark" | "light";
  // Sweep a cursor across the cycle (login screen, previews).
  animate?: boolean;
  // Live signal string from the controller: the matching phase is highlighted.
  liveSignalString?: string;
  // Seconds left in the live phase, when the controller reports it.
  liveCountdown?: number;
  title?: string;
  className?: string;
  // Larger text for narrow panels such as the sign-in screen.
  fontScale?: number;
}

const WIDTH = 1000;
const LABEL_W = 150;
const ROW_H = 20;
const ROW_GAP = 8;
const HEADER_H = 34;
const AXIS_H = 26;

const COLORS = {
  dark: {
    G: "#36c07a",
    A: "#f3b42a",
    R: "rgba(236, 90, 76, 0.42)",
    X: "rgba(255, 255, 255, 0.12)",
    text: "rgba(255, 255, 255, 0.86)",
    muted: "rgba(255, 255, 255, 0.55)",
    grid: "rgba(255, 255, 255, 0.14)",
    cursor: "#ffffff",
    highlight: "rgba(76, 198, 212, 0.16)",
  },
  light: {
    G: "#1f9a57",
    A: "#e9a100",
    R: "rgba(210, 59, 46, 0.30)",
    X: "rgba(18, 24, 33, 0.10)",
    text: "#121821",
    muted: "#59606b",
    grid: "#d9dcd5",
    cursor: "#08707d",
    highlight: "rgba(8, 112, 125, 0.10)",
  },
};

const LAMP_NAMES: Record<Lamp, string> = {
  G: "green",
  A: "amber",
  R: "red",
  X: "dark",
};

export default function SignalTimeline({
  phases,
  amber = 3,
  variant = "light",
  animate = false,
  liveSignalString,
  liveCountdown,
  title,
  className,
  fontScale = 1,
}: SignalTimelineProps) {
  const fs = (size: number) => Math.round(size * fontScale);
  const usable = (phases || []).filter(
    (phase) => phase && Number(phase.duration) > 0 && phase.signalString
  );
  const pattern = usable.length ? usable : DEMO_PHASES;
  const colors = COLORS[variant];

  const movements = useMemo(() => movementsOf(pattern), [pattern]);
  const { cycle, rows, starts } = useMemo(
    () => timelineOf(pattern, movements, amber),
    [pattern, movements, amber]
  );

  const rowH = Math.round(ROW_H * Math.max(1, fontScale * 0.9));
  const headerH = Math.round(HEADER_H * fontScale);
  const axisH = Math.round(AXIS_H * fontScale);
  const labelW = Math.round(LABEL_W * fontScale);
  const plotW = WIDTH - labelW - 8;
  const height =
    headerH + movements.length * (rowH + ROW_GAP) - ROW_GAP + axisH + 6;
  const x = (seconds: number) => labelW + (seconds / (cycle || 1)) * plotW;

  // Cursor sweep for the animated view.
  const [now, setNow] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!animate || !cycle) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setNow(cycle * 0.3);
      return;
    }
    let frame = 0;
    const speed = 4; // simulated seconds per real second
    const tick = (time: number) => {
      if (startRef.current === null) startRef.current = time;
      setNow((((time - startRef.current) / 1000) * speed) % cycle);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, cycle]);

  // The live phase: the pattern phase whose signal string matches the
  // controller's, ignoring the leading/trailing markers.
  const livePhaseIndex = useMemo(() => {
    if (!liveSignalString) return -1;
    // Amber is the end of the stage it belongs to: compare with A read as G.
    const strip = (s: string) => String(s).replace(/^\*/, "").replace(/#$/, "").replace(/A/g, "G");
    const live = strip(liveSignalString);
    return pattern.findIndex((phase) => strip(phase.signalString) === live);
  }, [liveSignalString, pattern]);

  let cursorAt: number | null = animate ? now : null;
  if (livePhaseIndex >= 0) {
    const phaseStart = starts[livePhaseIndex];
    const phaseLength = Number(pattern[livePhaseIndex].duration) || 0;
    const left =
      typeof liveCountdown === "number" && liveCountdown >= 0
        ? Math.min(liveCountdown, phaseLength)
        : phaseLength;
    cursorAt = phaseStart + (phaseLength - left);
  }

  const tickStep = cycle > 150 ? 30 : cycle > 60 ? 10 : 5;
  const ticks: number[] = [];
  for (let s = 0; s <= cycle; s += tickStep) ticks.push(s);

  const summary =
    `Signal timing over a ${Math.round(cycle)} second cycle: ` +
    pattern
      .map((phase) => `${phase.name} ${Math.round(Number(phase.duration))} s`)
      .join(", ") +
    ".";

  return (
    <figure className={"signalTimeline " + (className || "")}>
      {title ? <figcaption className="signalTimeline__title">{title}</figcaption> : null}
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={summary}
        className="signalTimeline__svg"
      >
        {/* Phase bands and names */}
        {pattern.map((phase, i) => {
          const start = starts[i];
          const end = start + (Number(phase.duration) || 0);
          const isLive = i === livePhaseIndex;
          return (
            <g key={phase.name + i}>
              {isLive ? (
                <rect
                  x={x(start)}
                  y={0}
                  width={x(end) - x(start)}
                  height={height - axisH}
                  fill={colors.highlight}
                  rx={4}
                />
              ) : null}
              <line
                x1={x(start)}
                x2={x(start)}
                y1={4}
                y2={height - axisH}
                stroke={colors.grid}
                strokeWidth={1}
              />
              <text
                x={x(start) + 6}
                y={fs(20)}
                fill={isLive ? colors.cursor : colors.muted}
                fontSize={fs(14)}
                fontWeight={isLive ? 700 : 600}
                fontFamily="Overpass, Helvetica Neue, Arial, sans-serif"
              >
                {clip(phase.name, (x(end) - x(start)) / (8 * fontScale))}
                {` (${Math.round(Number(phase.duration))} s)`}
              </text>
            </g>
          );
        })}

        {/* Movement rows */}
        {movements.map((movement, r) => {
          const y = headerH + r * (rowH + ROW_GAP);
          return (
            <g key={movement.key}>
              <text
                x={labelW - 12}
                y={y + rowH / 2 + fs(5)}
                textAnchor="end"
                fill={colors.text}
                fontSize={fs(14)}
                fontFamily="Overpass Mono, ui-monospace, Menlo, monospace"
              >
                {movement.label}
              </text>
              {(rows[movement.key] || []).map((segment, s) => (
                <rect
                  key={s}
                  x={x(segment.start) + 1}
                  y={y}
                  width={Math.max(0, x(segment.end) - x(segment.start) - 2)}
                  height={rowH}
                  rx={3}
                  fill={colors[segment.lamp]}
                >
                  <title>
                    {`${movement.label}: ${LAMP_NAMES[segment.lamp]} ${Math.round(
                      segment.start
                    )}–${Math.round(segment.end)} s`}
                  </title>
                </rect>
              ))}
            </g>
          );
        })}

        {/* Time axis */}
        {ticks.map((s) => (
          <text
            key={s}
            x={x(s)}
            y={height - 6}
            textAnchor={s === 0 ? "start" : "middle"}
            fill={colors.muted}
            fontSize={fs(12)}
            fontFamily="Overpass Mono, ui-monospace, Menlo, monospace"
          >
            {s}s
          </text>
        ))}

        {/* Cursor */}
        {cursorAt !== null ? (
          <g>
            <line
              x1={x(cursorAt)}
              x2={x(cursorAt)}
              y1={headerH - 6}
              y2={height - axisH + 2}
              stroke={colors.cursor}
              strokeWidth={2}
            />
            <circle cx={x(cursorAt)} cy={headerH - 6} r={4} fill={colors.cursor} />
          </g>
        ) : null}
      </svg>
    </figure>
  );
}

function clip(text: string, maxChars: number) {
  const limit = Math.max(3, Math.floor(maxChars) - 5);
  return text.length > limit ? text.slice(0, limit - 1) + "…" : text;
}

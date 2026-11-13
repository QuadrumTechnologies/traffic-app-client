// Signal strings and timing rows shared by the timing diagram.
//
// A signal string looks like "*NRRRRRRERRRRRRSRRRRRRWRRRRRR#": for each
// approach (N, E, S, W) a letter per head: left, straight, right, bike,
// pedestrian, plus one spare. Each letter is R, A, G or X (dark).

export type Approach = "N" | "E" | "S" | "W";
export type Head = "left" | "straight" | "right" | "bike" | "pedestrian";
export type Lamp = "R" | "A" | "G" | "X";

export const APPROACHES: Approach[] = ["N", "E", "S", "W"];
export const HEADS: Head[] = ["left", "straight", "right", "bike", "pedestrian"];

export const APPROACH_NAMES: Record<Approach, string> = {
  N: "North",
  E: "East",
  S: "South",
  W: "West",
};

export const HEAD_LABELS: Record<Head, string> = {
  left: "left",
  straight: "ahead",
  right: "right",
  bike: "bike",
  pedestrian: "walk",
};

export type SignalState = Record<Approach, Record<Head, Lamp>>;

export interface TimingPhase {
  name: string;
  duration: number; // seconds
  signalString: string;
}

export interface Movement {
  key: string;
  approach: Approach;
  head: Head;
  label: string;
}

const LAMPS = new Set(["R", "A", "G", "X"]);

export function parseSignalString(signalString: string): SignalState {
  const state = {} as SignalState;
  for (const approach of APPROACHES) {
    state[approach] = {
      left: "R",
      straight: "R",
      right: "R",
      bike: "R",
      pedestrian: "R",
    };
  }
  const body = String(signalString || "").replace(/^\*/, "").replace(/#$/, "");
  const blocks = body.match(/[NESW][RAGX]{5,6}/g) || [];
  for (const block of blocks) {
    const approach = block[0] as Approach;
    HEADS.forEach((head, i) => {
      const lamp = block[i + 1];
      if (LAMPS.has(lamp)) state[approach][head] = lamp as Lamp;
    });
  }
  return state;
}

export function buildSignalString(
  green: Partial<Record<Approach, Partial<Record<Head, Lamp>>>>
): string {
  return (
    "*" +
    APPROACHES.map((approach) => {
      const heads = green[approach] || {};
      return (
        approach +
        HEADS.map((head) => heads[head] || "R").join("") +
        "R"
      );
    }).join("") +
    "#"
  );
}

// Rows worth drawing: every head that is ever not red in the pattern.
export function movementsOf(phases: TimingPhase[]): Movement[] {
  const states = phases.map((phase) => parseSignalString(phase.signalString));
  const rows: Movement[] = [];
  for (const approach of APPROACHES) {
    for (const head of HEADS) {
      if (states.some((state) => state[approach][head] !== "R")) {
        rows.push({
          key: approach + "-" + head,
          approach,
          head,
          label: approach + " " + HEAD_LABELS[head],
        });
      }
    }
  }
  return rows;
}

export interface Segment {
  start: number;
  end: number;
  lamp: Lamp;
}

// Lamp segments per movement over one cycle. A movement that loses its green
// shows amber for the last `amber` seconds of the phase; a movement that is
// green in both phases stays green.
export function timelineOf(
  phases: TimingPhase[],
  movements: Movement[],
  amber = 3
): { cycle: number; rows: Record<string, Segment[]>; starts: number[] } {
  const states = phases.map((phase) => parseSignalString(phase.signalString));
  const rows: Record<string, Segment[]> = {};
  const starts: number[] = [];
  let t = 0;
  phases.forEach((phase, i) => {
    starts.push(t);
    const duration = Math.max(0, Number(phase.duration) || 0);
    const next = states[(i + 1) % states.length];
    for (const movement of movements) {
      const lamp = states[i][movement.approach][movement.head];
      const nextLamp = next[movement.approach][movement.head];
      const list = (rows[movement.key] = rows[movement.key] || []);
      const losesGreen = lamp === "G" && nextLamp !== "G" && phases.length > 1;
      const amberTime = losesGreen ? Math.min(amber, duration) : 0;
      push(list, { start: t, end: t + duration - amberTime, lamp });
      if (amberTime > 0) {
        push(list, { start: t + duration - amberTime, end: t + duration, lamp: "A" });
      }
    }
    t += duration;
  });
  return { cycle: t, rows, starts };
}

function push(list: Segment[], segment: Segment) {
  if (segment.end <= segment.start) return;
  const last = list[list.length - 1];
  if (last && last.lamp === segment.lamp && last.end === segment.start) {
    last.end = segment.end;
  } else {
    list.push({ ...segment });
  }
}

// A typical four-stage cycle, used where there is no real pattern to show.
export const DEMO_PHASES: TimingPhase[] = [
  {
    name: "N–S ahead",
    duration: 24,
    signalString: buildSignalString({ N: { straight: "G" }, S: { straight: "G" } }),
  },
  {
    name: "N–S left",
    duration: 10,
    signalString: buildSignalString({ N: { left: "G" }, S: { left: "G" } }),
  },
  {
    name: "E–W ahead",
    duration: 20,
    signalString: buildSignalString({ E: { straight: "G" }, W: { straight: "G" } }),
  },
  {
    name: "E–W left",
    duration: 10,
    signalString: buildSignalString({ E: { left: "G" }, W: { left: "G" } }),
  },
];

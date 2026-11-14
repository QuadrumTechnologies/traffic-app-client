"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  APPROACHES,
  APPROACH_NAMES,
  Approach,
  Lamp,
  parseSignalString,
} from "@/components/Signal/signalPattern";

// A live, top-down picture of the junction: every approach's lamps as the
// controller reports them and, with `simulate` (the demo), traffic that obeys
// them: cars queue on red, go on green and turn into their lanes, and people
// cross when their walk lamp is green. Vehicles keep to the right.
//
// Everything is drawn once for the south approach and rotated for the others.

type Move = "left" | "straight" | "right";
type Pt = { x: number; y: number };
type Sample = { x: number; y: number; a: number; s: number };
type Lamps = ReturnType<typeof parseSignalString>;

const SIZE = 600;
const C = 300;
const LANE = 20;
const MED = 2;
const H = MED + 3 * LANE; // half the road width
const CW_IN = H + 4; // zebra crossing, distance from the centre
const CW_OUT = H + 18;
const CW_MID = (CW_IN + CW_OUT) / 2;
const STOP = H + 22; // stop line
const FAR = 340; // paths start and end off the drawing
const GAP = 25; // front-to-front spacing in a queue (a car is 18 long)
const VMAX = 58; // drawing units per second (a car length is about 5 m)
const ACC = 55;
const REACT = 0.7; // seconds before a stopped car moves off
const WALK = 26;

const ROT: Record<Approach, number> = { S: 0, W: 90, N: 180, E: -90 };
const MOVES: Move[] = ["left", "straight", "right"];
const LANE_X: Record<Move, number> = {
  left: C + MED + LANE * 0.5,
  straight: C + MED + LANE * 1.5,
  right: C + MED + LANE * 2.5,
};

// Vehicles per second, by approach and movement: busier north-south, a few
// turners. Below what a cycle can clear, so queues form on red and clear on
// green.
const DEMAND: Record<Approach, Record<Move, number>> = {
  N: { left: 0.035, straight: 0.13, right: 0.05 },
  S: { left: 0.04, straight: 0.14, right: 0.045 },
  E: { left: 0.03, straight: 0.1, right: 0.04 },
  W: { left: 0.03, straight: 0.11, right: 0.035 },
};
const PED_RATE = 0.07; // per kerb

const COLOR = {
  block: "#1d232a",
  asphalt: "#2a3038",
  box: "#2e353d",
  mark: "#cfd5db",
  median: "#e9b43a",
  off: "#3a4049",
  R: "#ec5a4c",
  A: "#f3b42a",
  G: "#36c07a",
  X: "#3a4049",
  housing: "#0d1115",
};
const CAR_COLORS = ["#d7dde3", "#9fb7c9", "#d9c38f", "#c99b95", "#a7c7a2", "#b9a6cf", "#e6e1d6", "#8ea0ad"];
const PED_COLORS = ["#f2c14e", "#7fc8f8", "#f78e69", "#c3e88d", "#e0aaff", "#ffd6a5"];

const NS = "http://www.w3.org/2000/svg";

function rot(p: Pt, deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const dx = p.x - C;
  const dy = p.y - C;
  return { x: C + dx * c - dy * s, y: C + dx * s + dy * c };
}

// --- paths -----------------------------------------------------------------

function addLine(out: Pt[], a: Pt, b: Pt) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
  for (let i = out.length ? 1 : 0; i <= n; i++) {
    out.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n });
  }
}

function addCubic(out: Pt[], p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  for (let i = 1; i <= 60; i++) {
    const t = i / 60;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
}

// The route of one movement from the south approach, before rotation.
function canonicalRoute(move: Move): Pt[] {
  const x = LANE_X[move];
  const pts: Pt[] = [];
  addLine(pts, { x, y: C + FAR }, { x, y: C + STOP });
  if (move === "straight") {
    addLine(pts, { x, y: C + STOP }, { x, y: C - FAR });
  } else if (move === "right") {
    const y = C + MED + LANE * 2.5; // outer lane of the road to the right
    addCubic(pts, { x, y: C + STOP }, { x, y: C + H - 4 }, { x: C + H - 4, y }, { x: C + STOP, y });
    addLine(pts, { x: C + STOP, y }, { x: C + FAR, y });
  } else {
    const y = C - MED - LANE * 0.5; // inner lane of the road to the left
    addCubic(pts, { x, y: C + STOP }, { x, y: C + 10 }, { x: C - 4, y }, { x: C - STOP, y });
    addLine(pts, { x: C - STOP, y }, { x: C - FAR, y });
  }
  return pts;
}

class Route {
  samples: Sample[] = [];
  len = 0;
  constructor(points: Pt[]) {
    let s = 0;
    for (let i = 0; i < points.length; i++) {
      if (i > 0) s += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      const j = Math.min(points.length - 1, i + 1);
      const k = j === i ? i - 1 : i;
      const a = (Math.atan2(points[j].y - points[k].y, points[j].x - points[k].x) * 180) / Math.PI;
      this.samples.push({ x: points[i].x, y: points[i].y, a, s });
    }
    this.len = s;
  }
  at(s: number): Sample {
    const list = this.samples;
    if (s <= 0) return list[0];
    if (s >= this.len) return list[list.length - 1];
    let lo = 0;
    let hi = list.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (list[mid].s < s) lo = mid;
      else hi = mid;
    }
    const a = list[lo];
    const b = list[hi];
    const f = (s - a.s) / Math.max(1e-6, b.s - a.s);
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, a: b.a, s };
  }
}

// Is a point on the zebra crossing of this arm?
function onCrossing(arm: Approach, p: Pt): boolean {
  const q = rot(p, -ROT[arm]); // back into the south-arm frame
  return Math.abs(q.x - C) <= H && q.y >= C + CW_IN - 2 && q.y <= C + CW_OUT + 2;
}

// --- simulation --------------------------------------------------------------

interface Car {
  s: number;
  v: number;
  el: SVGGElement;
  vmax: number;
  wait: number; // time stopped with room ahead (reaction)
}
interface Lane {
  approach: Approach;
  move: Move;
  route: Route;
  stopAt: number; // front bumper waits here
  crossings: { arm: Approach; from: number; mid: Pt }[];
  cars: Car[];
  timer: number;
}
interface Person {
  arm: Approach;
  dir: 1 | -1; // which kerb they start from
  s: number; // distance walked across
  v: number;
  crossing: boolean;
  slot: number;
  el: SVGCircleElement;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const nextArrival = (rate: number) => -Math.log(1 - Math.random()) / rate;

function makeCarEl(layer: SVGGElement): SVGGElement {
  const g = document.createElementNS(NS, "g");
  const body = document.createElementNS(NS, "rect");
  body.setAttribute("x", "-9");
  body.setAttribute("y", "-5");
  body.setAttribute("width", "18");
  body.setAttribute("height", "10");
  body.setAttribute("rx", "2.6");
  body.setAttribute("fill", pick(CAR_COLORS));
  const glass = document.createElementNS(NS, "rect");
  glass.setAttribute("x", "1.5");
  glass.setAttribute("y", "-4");
  glass.setAttribute("width", "4");
  glass.setAttribute("height", "8");
  glass.setAttribute("rx", "1.2");
  glass.setAttribute("fill", "#1f262e");
  glass.setAttribute("opacity", "0.85");
  g.appendChild(body);
  g.appendChild(glass);
  layer.appendChild(g);
  return g;
}

function makePersonEl(layer: SVGGElement): SVGCircleElement {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("r", "3.4");
  c.setAttribute("fill", pick(PED_COLORS));
  c.setAttribute("stroke", "#0d1115");
  c.setAttribute("stroke-width", "1");
  layer.appendChild(c);
  return c;
}

// Where a person stands or walks, in the drawing.
function personPoint(p: Person): Pt {
  const along = p.dir === 1 ? -(H + 12) + p.s : H + 12 - p.s;
  let x = C + along;
  let y = C + CW_MID;
  if (!p.crossing) {
    // Waiting on the kerb: a small group, side by side and a step back.
    const row = Math.floor(p.slot / 3);
    const col = (p.slot % 3) - 1;
    x = C + (p.dir === 1 ? -(H + 12 + row * 6) : H + 12 + row * 6);
    y = C + CW_MID + col * 6;
  }
  return rot({ x, y }, ROT[p.arm]);
}

class Simulation {
  lanes: Lane[] = [];
  people: Person[] = [];
  pedTimers: Record<string, number> = {};
  constructor(private carLayer: SVGGElement, private pedLayer: SVGGElement) {
    for (const approach of APPROACHES) {
      for (const move of MOVES) {
        const route = new Route(canonicalRoute(move).map((p) => rot(p, ROT[approach])));
        const stopAt = FAR - STOP - 7;
        const crossings: Lane["crossings"] = [];
        for (const arm of APPROACHES) {
          const first = route.samples.find((smp) => smp.s > stopAt - 30 && onCrossing(arm, smp));
          if (first) {
            const mid = route.at(first.s + 7);
            crossings.push({ arm, from: first.s, mid });
          }
        }
        this.lanes.push({ approach, move, route, stopAt, crossings, cars: [], timer: rand(0, 4) });
      }
    }
    for (const arm of APPROACHES) {
      this.pedTimers[arm + "1"] = rand(0, 10);
      this.pedTimers[arm + "-1"] = rand(0, 10);
    }
  }

  personNear(arm: Approach, point: Pt, reach: number): boolean {
    return this.people.some((p) => {
      if (p.arm !== arm || !p.crossing) return false;
      const q = personPoint(p);
      return Math.hypot(q.x - point.x, q.y - point.y) < reach;
    });
  }

  step(dt: number, lamps: Lamps) {
    // People
    for (const arm of APPROACHES) {
      const walk = lamps[arm].pedestrian;
      for (const dir of [1, -1] as const) {
        const key = arm + String(dir);
        this.pedTimers[key] -= dt;
        if (this.pedTimers[key] <= 0) {
          this.pedTimers[key] = nextArrival(PED_RATE);
          const waiting = this.people.filter((p) => p.arm === arm && p.dir === dir && !p.crossing);
          if (waiting.length < 6) {
            this.people.push({
              arm,
              dir,
              s: 0,
              v: WALK * rand(0.8, 1.25),
              crossing: false,
              slot: waiting.length,
              el: makePersonEl(this.pedLayer),
            });
          }
        }
      }
      for (const p of this.people) {
        if (p.arm !== arm) continue;
        if (!p.crossing && walk === "G") {
          p.crossing = true;
          p.s = (p.slot % 3) * 2; // set off a step apart
        }
        if (p.crossing) {
          const hurry = walk === "G" ? 1 : 1.5;
          p.s += p.v * hurry * dt;
        }
      }
    }
    const span = 2 * (H + 12);
    this.people = this.people.filter((p) => {
      if (p.crossing && p.s >= span) {
        p.el.remove();
        return false;
      }
      return true;
    });
    // Re-number the people still waiting on each kerb.
    for (const arm of APPROACHES) {
      for (const dir of [1, -1] as const) {
        let slot = 0;
        for (const p of this.people) if (p.arm === arm && p.dir === dir && !p.crossing) p.slot = slot++;
      }
    }

    // Vehicles
    for (const lane of this.lanes) {
      lane.timer -= dt;
      if (lane.timer <= 0) {
        lane.timer = nextArrival(DEMAND[lane.approach][lane.move]);
        const last = lane.cars[lane.cars.length - 1];
        if (!last || last.s > GAP + 6) {
          lane.cars.push({ s: 0, v: VMAX * 0.8, el: makeCarEl(this.carLayer), vmax: VMAX * rand(0.85, 1.1), wait: 0 });
        }
      }
      const lamp: Lamp = lamps[lane.approach][lane.move];
      for (let i = 0; i < lane.cars.length; i++) {
        const car = lane.cars[i];
        let limit = Infinity;
        if (i > 0) limit = lane.cars[i - 1].s - GAP;
        if (car.s <= lane.stopAt + 0.5) {
          const toLine = lane.stopAt - car.s;
          const mustStop = lamp === "R" || lamp === "X" || (lamp === "A" && toLine > 22);
          if (mustStop) limit = Math.min(limit, lane.stopAt);
        }
        // Give way to anyone still on a crossing ahead.
        for (const x of lane.crossings) {
          const ahead = x.from - car.s;
          if (ahead > 0 && ahead < 70 && this.personNear(x.arm, x.mid, 22)) {
            limit = Math.min(limit, x.from - 3);
          }
        }
        const room = limit - car.s;
        if (car.v < 0.5 && room > 1) {
          // Stopped: move off only after a moment, so a queue starts up
          // one car after another.
          car.wait += dt;
          if (car.wait < REACT) continue;
        }
        car.wait = 0;
        car.v = Math.min(car.vmax, car.v + ACC * dt);
        if (room < 45) car.v = Math.min(car.v, Math.max(0, room) * 1.8);
        let next = car.s + car.v * dt;
        if (next > limit) {
          next = Math.max(car.s, limit);
          car.v = 0;
        }
        car.s = next;
      }
      while (lane.cars.length && lane.cars[0].s > lane.route.len) {
        lane.cars.shift()!.el.remove();
      }
    }
  }

  render() {
    for (const lane of this.lanes) {
      for (const car of lane.cars) {
        const p = lane.route.at(car.s - 9);
        car.el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(1)})`);
      }
    }
    for (const p of this.people) {
      const q = personPoint(p);
      p.el.setAttribute("cx", q.x.toFixed(1));
      p.el.setAttribute("cy", q.y.toFixed(1));
    }
  }

  clear() {
    for (const lane of this.lanes) lane.cars.forEach((c) => c.el.remove());
    this.people.forEach((p) => p.el.remove());
  }
}

// --- words -------------------------------------------------------------------

const HEAD_WORDS: Record<string, string> = {
  left: "left",
  straight: "ahead",
  right: "right",
  bike: "bikes",
  pedestrian: "walk",
};

function namesOf(list: Approach[]): string {
  const names = list.map((a) => APPROACH_NAMES[a]);
  if (names.length === 4) return "All approaches";
  if (names.length === 1) return names[0];
  const rest = names.slice(1).map((n) => n.toLowerCase());
  return [names[0], ...rest.slice(0, -1)].join(", ") + " and " + rest[rest.length - 1];
}

// "North and south: ahead, right" for the movements on green now.
export function describeLamps(lamps: Lamps): string {
  const heads = ["left", "straight", "right", "bike", "pedestrian"] as const;
  const groups = new Map<string, Approach[]>();
  const seen = { G: false, A: false, R: false, X: false };
  for (const a of APPROACHES) {
    const on = heads.filter((h) => lamps[a][h] === "G").map((h) => HEAD_WORDS[h]);
    for (const h of heads) seen[lamps[a][h] as Lamp] = true;
    if (!on.length) continue;
    const key = on.join(", ");
    groups.set(key, [...(groups.get(key) || []), a]);
  }
  if (groups.size) {
    return Array.from(groups.entries())
      .map(([on, list]) => (on === "walk" ? `${namesOf(list)}: people crossing` : `${namesOf(list)}: ${on}`))
      .join(" · ");
  }
  if (seen.A) return "Changing: amber";
  if (seen.X && !seen.R) return "Signals dark";
  return "All red";
}

// --- drawing -----------------------------------------------------------------

const ARROW: Record<Move, string> = {
  straight: "M0 5 V-4.5 M-3.4 -1.2 L0 -4.8 L3.4 -1.2",
  left: "M2.6 5 V0.5 Q2.6 -3 -1.2 -3 H-4.6 M-2 -5.6 L-4.9 -3 L-2 -0.4",
  right: "M-2.6 5 V0.5 Q-2.6 -3 1.2 -3 H4.6 M2 -5.6 L4.9 -3 L2 -0.4",
};

function Arm({ approach }: { approach: Approach }) {
  // One approach, drawn for the south and rotated into place.
  const stripes = [];
  for (let x = C - H + 3; x <= C + H - 6; x += 8) {
    stripes.push(<rect key={x} x={x} y={C + CW_IN} width={4.5} height={CW_OUT - CW_IN} fill={COLOR.mark} opacity={0.55} />);
  }
  return (
    <g transform={`rotate(${ROT[approach]} ${C} ${C})`}>
      {/* lane lines: solid near the stop line (turn lanes), dashed beyond */}
      {[1, 2].map((i) => (
        <g key={i}>
          <line x1={C + MED + LANE * i} y1={C + STOP} x2={C + MED + LANE * i} y2={C + STOP + 70} stroke={COLOR.mark} strokeWidth={1.4} opacity={0.75} />
          <line x1={C + MED + LANE * i} y1={C + STOP + 70} x2={C + MED + LANE * i} y2={C + FAR} stroke={COLOR.mark} strokeWidth={1.4} strokeDasharray="9 9" opacity={0.6} />
          <line x1={C - MED - LANE * i} y1={C + CW_OUT + 4} x2={C - MED - LANE * i} y2={C + FAR} stroke={COLOR.mark} strokeWidth={1.4} strokeDasharray="9 9" opacity={0.45} />
        </g>
      ))}
      {/* median */}
      <line x1={C - 1.3} y1={C + CW_OUT + 4} x2={C - 1.3} y2={C + FAR} stroke={COLOR.median} strokeWidth={1.3} opacity={0.85} />
      <line x1={C + 1.3} y1={C + CW_OUT + 4} x2={C + 1.3} y2={C + FAR} stroke={COLOR.median} strokeWidth={1.3} opacity={0.85} />
      {/* stop line and crossing */}
      <rect x={C + MED} y={C + STOP - 1.5} width={3 * LANE} height={3} fill={COLOR.mark} opacity={0.85} />
      {stripes}
      {/* painted arrows */}
      {MOVES.map((m) => (
        <path key={m} d={ARROW[m]} transform={`translate(${LANE_X[m]} ${C + STOP + 34}) scale(1.5)`} stroke={COLOR.mark} strokeWidth={1.3} fill="none" opacity={0.55} strokeLinecap="round" />
      ))}
    </g>
  );
}

function LampBox({ x, y, color, path, title, glow, upright = 0 }: { x: number; y: number; color: string; path: string; title: string; glow: boolean; upright?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${upright})`}>
      <title>{title}</title>
      <rect x={-7} y={-7} width={14} height={14} rx={3} fill={COLOR.housing} stroke="#4a515b" strokeWidth={0.8} />
      {glow ? <rect x={-7} y={-7} width={14} height={14} rx={3} fill={color} opacity={0.22} /> : null}
      <path d={path} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

const WALKER = "M0 -4.2 a1.3 1.3 0 1 1 0.01 0 M0 -2.6 V1.2 M0 1.2 L-2 4.6 M0 1.2 L2 4.6 M-2.4 -0.6 L0 -1.8 L2.4 -0.6";
const BIKE = "M-3 2 a2 2 0 1 0 0.01 0 M3 2 a2 2 0 1 0 0.01 0 M-3 2 L-1 -2 H2 L3 2 M-1 -2 L0.6 2";

function ApproachLamps({ approach, lamps }: { approach: Approach; lamps: Lamps }) {
  // Lane lamps sit on the stop line and turn with the approach, so their
  // arrows point the way that traffic goes. Bike and walk lamps stay upright.
  const heads = lamps[approach];
  const name = APPROACH_NAMES[approach];
  const color = (l: Lamp) => COLOR[l] || COLOR.off;
  const word = (l: Lamp) => ({ R: "red", A: "amber", G: "green", X: "dark" })[l] || "dark";
  const upright = -ROT[approach];
  return (
    <g transform={`rotate(${ROT[approach]} ${C} ${C})`}>
      {MOVES.map((m) => (
        <LampBox key={m} x={LANE_X[m]} y={C + STOP - 1} color={color(heads[m])} path={ARROW[m]} title={`${name} ${HEAD_WORDS[m]}: ${word(heads[m])}`} glow={heads[m] === "G" || heads[m] === "A"} />
      ))}
      <LampBox x={C + H + 11} y={C + STOP + 26} upright={upright} color={color(heads.bike)} path={BIKE} title={`${name} bikes: ${word(heads.bike)}`} glow={heads.bike === "G"} />
      {[-1, 1].map((side) => (
        <LampBox key={side} x={C + side * (H + 11)} y={C + CW_OUT + 10} upright={upright} color={color(heads.pedestrian)} path={WALKER} title={`${name} crossing: ${word(heads.pedestrian)}`} glow={heads.pedestrian === "G" || heads.pedestrian === "A"} />
      ))}
    </g>
  );
}

export interface LiveJunctionProps {
  signalString?: string;
  countdown?: string | number;
  simulate?: boolean;
  online?: boolean;
  title?: string;
}

export default function LiveJunction({ signalString, countdown, simulate = false, online = true, title }: LiveJunctionProps) {
  const lamps = useMemo(() => parseSignalString(signalString || ""), [signalString]);
  const hasSignal = Boolean(signalString);
  const lampsRef = useRef(lamps);
  lampsRef.current = lamps;
  const carLayer = useRef<SVGGElement>(null);
  const pedLayer = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing;

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!simulate || !carLayer.current || !pedLayer.current || !svgRef.current) return;
    const sim = new Simulation(carLayer.current, pedLayer.current);
    // Start with traffic already on the roads.
    for (let i = 0; i < 160; i++) sim.step(0.1, lampsRef.current);
    sim.render();
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let visible = true;
    const frame = (t: number) => {
      acc += Math.min(0.25, Math.max(0, (t - last) / 1000));
      last = t;
      if (acc >= 1 / 30) {
        const dt = Math.min(0.06, acc);
        acc = 0;
        if (playingRef.current && visible && !document.hidden) {
          sim.step(dt, lampsRef.current);
          sim.render();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      });
      observer.observe(svgRef.current);
    }
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      sim.clear();
    };
  }, [simulate]);

  const seconds = Number(countdown);
  const countdownText =
    !hasSignal || !online
      ? "–"
      : String(countdown).toUpperCase() === "X"
      ? "Held"
      : Number.isFinite(seconds) && seconds >= 0
      ? `${seconds} s`
      : "–";
  const now = hasSignal && online ? describeLamps(lamps) : online ? "Waiting for the controller's next report" : "Offline: last known lamps";

  return (
    <section className="qtLive" aria-label={title || "Live junction view"}>
      <div className="qtLive__head">
        <div>
          <p className="qtLive__now" aria-live="polite">{now}</p>
          {simulate ? <p className="qtLive__note">Traffic is simulated: it follows the demo controller&apos;s lamps.</p> : null}
        </div>
        <div className="qtLive__right">
          <span className="qtLive__count" title="Time left in this stage">
            {countdownText.endsWith(" s") ? (
              <>
                {countdownText.slice(0, -2)}
                <small> s</small>
              </>
            ) : (
              countdownText
            )}
          </span>
          {simulate ? (
            <button type="button" className="qtLive__play" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
              {playing ? "Pause" : "Play"}
            </button>
          ) : null}
        </div>
      </div>
      <svg ref={svgRef} className="qtLive__map" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Junction drawing. ${now}`}>
        <rect x={0} y={0} width={SIZE} height={SIZE} fill={COLOR.asphalt} />
        {/* kerbs and pavements */}
        {[
          [-20, -20, C - H + 20, C - H + 20],
          [C + H, -20, C - H + 20, C - H + 20],
          [-20, C + H, C - H + 20, C - H + 20],
          [C + H, C + H, C - H + 20, C - H + 20],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={18} fill={COLOR.block} />
        ))}
        <rect x={C - H} y={C - H} width={2 * H} height={2 * H} fill={COLOR.box} />
        {APPROACHES.map((a) => (
          <Arm key={a} approach={a} />
        ))}
        <g ref={carLayer} />
        <g ref={pedLayer} />
        {APPROACHES.map((a) => (
          <ApproachLamps key={a} approach={a} lamps={lamps} />
        ))}
        {/* names, kept upright */}
        <g className="qtLive__labels">
          <text x={C - H - 8} y={20} textAnchor="end">From north</text>
          <text x={C + H + 8} y={SIZE - 12}>From south</text>
          <text x={12} y={C + H + 22}>From west</text>
          <text x={SIZE - 12} y={C - H - 12} textAnchor="end">From east</text>
          <text x={18} y={26} className="qtLive__compass">N ↑</text>
        </g>
      </svg>
    </section>
  );
}

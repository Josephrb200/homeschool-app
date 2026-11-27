"use client";

/**
 * Interactive demonstrations for transformations. Each lets the student change
 * one thing (the mirror line, the turn, the vector, the scale factor) and see
 * the image move. Keyboard operable; every state is also described in words.
 */

import { useId, useState } from "react";
import type { PlaneSpec } from "@/engine/types";
import { PlaneDiagram } from "./PlaneDiagram";
import { MathText } from "./MathText";
import {
  coord,
  cornerList,
  enlarge,
  grid,
  map,
  mirrorName,
  mirrorSegment,
  reflect,
  rotate,
  shift,
  turnWords,
  vec,
  vectorWords,
  type Mirror,
  type P,
  type Shape,
  type Turn,
  type Window,
} from "@/content/maths/transformations/geometry";

function Slider({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; show?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{show ?? String(value).replace("-", "−")}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Choices<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div className="choice-row" role="group" aria-label={label}>
      {options.map(([k, text]) => (
        <button key={k} type="button" className="choice" aria-pressed={value === k} onClick={() => onChange(k)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <p aria-live="polite" style={{ fontSize: "1.15rem" }}>
      {children}
    </p>
  );
}

const W: Window = { x: [-6, 6], y: [-6, 6] };
const FLAG: Shape = [[1, 1], [2, 1], [2, 2], [4, 3], [2, 4], [1, 4]];

// ---------------------------------------------------------------- reflection

function ReflectExplore() {
  const [kind, setKind] = useState<"x" | "y" | "y=x">("x");
  const [c, setC] = useState(0);
  const m: Mirror = kind === "y=x" ? { kind: "y=x" } : { kind, c };
  const shape: Shape = kind === "x" ? shift(FLAG, [c, 0]) : kind === "y" ? shift(FLAG, [0, c]) : shift(FLAG, [1, -3]);
  const img = map(shape, (p) => reflect(p, m));
  const P0 = shape[3];
  const plane: PlaneSpec = grid(W, [{ s: shape, label: "A" }, { s: img, label: "B", tone: "image" }], {
    lines: [{ ...mirrorSegment(m, W), label: mirrorName(m), tone: "mirror" }],
    points: [{ at: P0 }, { at: reflect(P0, m) }],
    description: `Shape A with corners ${cornerList(shape)} reflected in ${mirrorName(m)} to give B with corners ${cornerList(img)}.`,
  });
  return (
    <>
      <p>Pick a mirror line and move it. Watch the tip of the flag: it is always the same distance from the mirror on both sides.</p>
      <Choices label="Mirror line" value={kind} options={[["x", "Vertical: x = …"], ["y", "Horizontal: y = …"], ["y=x", "Diagonal: y = x"]] as const} onChange={setKind} />
      {kind !== "y=x" && <Slider label={kind === "x" ? "x =" : "y ="} value={c} min={-1} max={1} onChange={setC} />}
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={380} />
      <Readout>
        The tip {coord(P0)} reflects to <strong>{coord(reflect(P0, m))}</strong>.{" "}
        {m.kind === "x" ? `Only the x-coordinate changes.` : m.kind === "y" ? `Only the y-coordinate changes.` : `The coordinates swap.`}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- rotation

function RotateExplore() {
  const [deg, setDeg] = useState<"90" | "180" | "270">("90");
  const [cx, setCx] = useState(0);
  const turn: Turn = deg === "180" ? { deg: 180, dir: "clockwise", c: [cx, 0] } : { deg: 90, dir: deg === "90" ? "clockwise" : "anticlockwise", c: [cx, 0] };
  const shape = FLAG;
  const img = map(shape, (p) => rotate(p, turn));
  const plane: PlaneSpec = grid(W, [{ s: shape, label: "A" }, { s: img, label: "B", tone: "image" }], {
    points: [{ at: turn.c, label: "C", hollow: true }],
    description: `Shape A with corners ${cornerList(shape)} rotated ${turnWords(turn)} about ${coord(turn.c)} to give B with corners ${cornerList(img)}.`,
  });
  const P0 = shape[3];
  const d: P = [P0[0] - turn.c[0], P0[1] - turn.c[1]];
  const Q = rotate(P0, turn);
  const nd: P = [Q[0] - turn.c[0], Q[1] - turn.c[1]];
  return (
    <>
      <p>Choose a turn and move the centre C. The shape turns like a door on a hinge at C. It never flips.</p>
      <Choices label="Turn" value={deg} options={[["90", "90° clockwise"], ["270", "90° anticlockwise"], ["180", "180°"]] as const} onChange={setDeg} />
      <Slider label="Centre C x-coordinate" value={cx} min={-1} max={1} onChange={setCx} />
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={380} />
      <Readout>
        The tip is {vectorWords(d)} from C. After the turn it is <strong>{vectorWords(nd)}</strong> from C, at {coord(Q)}.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- translation

function TranslateExplore() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(-3);
  const shape: Shape = shift(FLAG, [-3, 0]);
  const img = shift(shape, [a, b]);
  const plane: PlaneSpec = grid(W, [{ s: shape, label: "A" }, { s: img, label: "B", tone: "image" }], {
    arrows: a || b ? [{ from: shape[0], to: img[0] }] : [],
    description: `Shape A with corners ${cornerList(shape)} translated by ${a} across and ${b} up to give B with corners ${cornerList(img)}.`,
  });
  return (
    <>
      <p>Change the two numbers of the column vector. The top one slides the shape left or right; the bottom one slides it up or down.</p>
      <Slider label="Top number (right +, left −)" value={a} min={-3} max={4} onChange={setA} />
      <Slider label="Bottom number (up +, down −)" value={b} min={-5} max={2} onChange={setB} />
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={380} />
      <Readout>
        <MathText text={`${vec([a, b])} means ${vectorWords([a, b])}.`} /> Every corner moves the same way, and the shape doesn&apos;t turn.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- enlargement

function EnlargeExplore() {
  const [k2, setK2] = useState(4);
  const k = k2 / 2;
  const c: P = [-5, -5];
  const shape: Shape = [[-3, -4], [-1, -4], [-1, -3], [-3, -2]];
  const img = map(shape, (p) => enlarge(p, k, c));
  const plane: PlaneSpec = grid(W, [{ s: shape, label: "A" }, { s: img, label: k === 1 ? undefined : "B", tone: "image", dashed: k === 1 }], {
    points: [{ at: c, label: "C", hollow: true }],
    lines: shape.map((p) => ({ a: c, b: enlarge(p, Math.max(k, 1), c), tone: "faint" as const, dashed: true })),
    description: `Shape A with corners ${cornerList(shape)} enlarged by scale factor ${k} from C ${coord(c)} to give B with corners ${cornerList(img)}.`,
  });
  const sf = k === 0.5 ? "½" : k === 1.5 ? "1½" : k === 2.5 ? "2½" : String(k);
  return (
    <>
      <p>Change the scale factor. Every distance from C is multiplied by it, so the image slides along the dashed lines as it grows or shrinks.</p>
      <Slider label="Scale factor" value={k2} min={1} max={5} onChange={setK2} show={sf} />
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={380} />
      <Readout>
        Scale factor {sf}: the bottom side was 2 long and is now <strong>{2 * k}</strong> long.{" "}
        {k < 1 ? "A scale factor less than 1 makes the shape smaller." : k === 1 ? "Scale factor 1 leaves it the same size." : `Every length is ${sf} times as long.`}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- describing

const DESCRIBE: { name: string; img: (s: Shape) => Shape; clue: string; full: string }[] = [
  { name: "Translation", img: (s) => shift(s, [-6, -6]), clue: "Same size, same way round, not turned: it just slid.", full: "Translation by vec(−6,−6)" },
  { name: "Reflection", img: (s) => map(s, (p) => reflect(p, { kind: "x", c: 0 })), clue: "Same size, but flipped: it faces the other way.", full: "Reflection in the line x = 0 (the y-axis)" },
  { name: "Rotation", img: (s) => map(s, (p) => rotate(p, { deg: 90, dir: "clockwise", c: [0, 0] })), clue: "Same size, not flipped, but turned on its side.", full: "Rotation 90° clockwise about (0, 0)" },
  { name: "Enlargement", img: (s) => map(s, (p) => enlarge(p, 0.5, [-6, -6])), clue: "A different size: here every length is halved.", full: "Enlargement, scale factor ½, centre (−6, −6)" },
];

function DescribeSort() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const shape: Shape = [[2, 2], [4, 2], [4, 4], [6, 6], [2, 6]];
  const d = DESCRIBE[i];
  const img = d.img(shape);
  const plane: PlaneSpec = grid(W, [{ s: shape, label: "A" }, { s: img, label: "B", tone: "image" }], {
    description: `Shape A with corners ${cornerList(shape)} and shape B with corners ${cornerList(img)}.`,
  });
  return (
    <>
      <p>Look at A and B. Decide the type first, then press the button to check.</p>
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={380} />
      <div className="row">
        {!shown && (
          <button type="button" className="btn" onClick={() => setShown(true)}>
            Show the answer
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setI((i + 1) % DESCRIBE.length);
            setShown(false);
          }}
        >
          Next example
        </button>
      </div>
      <Readout>
        {shown ? (
          <>
            <strong>{d.name}.</strong> {d.clue} Full description: <MathText text={d.full} />.
          </>
        ) : (
          "Is it a reflection, a rotation, a translation or an enlargement?"
        )}
      </Readout>
    </>
  );
}

export const TRANSFORM_DEMOS = {
  "reflect-explore": ReflectExplore,
  "rotate-explore": RotateExplore,
  "translate-explore": TranslateExplore,
  "enlarge-explore": EnlargeExplore,
  "describe-sort": DescribeSort,
};

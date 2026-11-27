"use client";

/**
 * Interactive demonstrations for frequency trees and probability tree
 * diagrams. Sliders and buttons only (keyboard operable), no timers, and
 * every state is also described in words.
 */

import { useId, useState } from "react";
import { TreeDiagram } from "./TreeDiagram";
import type { TreeSpec } from "@/engine/types";

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{value}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
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

// ------------------------------------------------------------ frequency tree

function FrequencyTreeFill() {
  const [total, setTotal] = useState(60);
  const [adults, setAdults] = useState(25);
  const [adultPop, setAdultPop] = useState(15);
  const [childPop, setChildPop] = useState(20);
  const a = Math.min(adults, total);
  const c = total - a;
  const ap = Math.min(adultPop, a);
  const cp = Math.min(childPop, c);
  const tree: TreeSpec = {
    root: String(total),
    stages: ["Age", "Bought popcorn?"],
    branches: [
      { label: "Adults", count: String(a), children: [{ label: "Popcorn", count: String(ap) }, { label: "No popcorn", count: String(a - ap) }] },
      { label: "Children", count: String(c), children: [{ label: "Popcorn", count: String(cp) }, { label: "No popcorn", count: String(c - cp) }] },
    ],
    description: `Frequency tree. ${total} people: ${a} adults (${ap} popcorn, ${a - ap} no popcorn) and ${c} children (${cp} popcorn, ${c - cp} no popcorn).`,
  };
  return (
    <>
      <p>Change the facts. The tree works out every other box by taking away.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <Slider label="People at the cinema" value={total} min={20} max={100} onChange={setTotal} />
        <Slider label="Adults" value={a} min={0} max={total} onChange={setAdults} />
        <Slider label="Adults who bought popcorn" value={ap} min={0} max={a} onChange={setAdultPop} />
        <Slider label="Children who bought popcorn" value={cp} min={0} max={c} onChange={setChildPop} />
      </div>
      <TreeDiagram tree={tree} />
      <Readout>
        Children: {total} − {a} = <strong>{c}</strong>. Adults with no popcorn: {a} − {ap} = <strong>{a - ap}</strong>. Children with no popcorn: {c} − {cp} = <strong>{c - cp}</strong>. Popcorn altogether: {ap} + {cp} = {ap + cp}. Check: {ap} + {a - ap} + {cp} + {c - cp} = {total}.
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ probability tree: with or without putting back

const ROUTES = [
  { i: 0, j: 0, name: "Red, Red" },
  { i: 0, j: 1, name: "Red, Blue" },
  { i: 1, j: 0, name: "Blue, Red" },
  { i: 1, j: 1, name: "Blue, Blue" },
];

function TreeBag({ startReplace }: { startReplace: boolean }) {
  const [red, setRed] = useState(3);
  const [blue, setBlue] = useState(2);
  const [replace, setReplace] = useState(startReplace);
  const [chosen, setChosen] = useState<number[]>([0]);
  const n = red + blue;
  const cnt = [red, blue];
  const first = (i: number) => ({ t: cnt[i], b: n });
  const second = (i: number, j: number) => (replace ? { t: cnt[j], b: n } : { t: cnt[j] - (i === j ? 1 : 0), b: n - 1 });
  const fr = (x: { t: number; b: number }) => `${x.t}/${x.b}`;
  const leaf = (i: number, j: number) => {
    const a = first(i);
    const b = second(i, j);
    return { t: a.t * b.t, b: a.b * b.b };
  };
  const tree: TreeSpec = {
    stages: ["First counter", "Second counter"],
    branches: [0, 1].map((i) => ({
      label: ["Red", "Blue"][i],
      p: fr(first(i)),
      children: [0, 1].map((j) => ({ label: ["Red", "Blue"][j], p: fr(second(i, j)), end: ["Red", "Blue"][i] + ", " + ["Red", "Blue"][j] })),
    })),
    highlight: chosen,
    description: `Tree diagram, ${replace ? "with" : "without"} replacement. First: Red ${fr(first(0))}, Blue ${fr(first(1))}. After Red: Red ${fr(second(0, 0))}, Blue ${fr(second(0, 1))}. After Blue: Red ${fr(second(1, 0))}, Blue ${fr(second(1, 1))}.`,
  };
  const toggle = (k: number) => setChosen((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k].sort()));
  const parts = chosen.map((k) => {
    const { i, j } = ROUTES[k];
    const l = leaf(i, j);
    return { k, text: `${ROUTES[k].name}: ${fr(first(i))} × ${fr(second(i, j))} = ${l.t}/${l.b}`, l };
  });
  const bottom = parts[0]?.l.b ?? 1;
  const top = parts.reduce((a, p) => a + p.l.t, 0);
  return (
    <>
      <p>A bag of red and blue counters. Take one, then take a second. Choose the routes you want, and see how the probabilities multiply along each route and add across routes.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <Slider label="Red counters" value={red} min={1} max={8} onChange={setRed} />
        <Slider label="Blue counters" value={blue} min={1} max={8} onChange={setBlue} />
      </div>
      <div className="row" role="group" aria-label="Put the first counter back?" style={{ flexWrap: "wrap" }}>
        <button type="button" className="choice" aria-pressed={replace} onClick={() => setReplace(true)}>
          Put the first one back
        </button>
        <button type="button" className="choice" aria-pressed={!replace} onClick={() => setReplace(false)}>
          Keep the first one out
        </button>
      </div>
      <div className="row" role="group" aria-label="Choose routes" style={{ flexWrap: "wrap" }}>
        {ROUTES.map((r, k) => (
          <button key={r.name} type="button" className="choice" aria-pressed={chosen.includes(k)} onClick={() => toggle(k)}>
            {r.name}
          </button>
        ))}
      </div>
      <TreeDiagram tree={tree} />
      <Readout>
        {replace
          ? `The first counter goes back, so the second branches are the same as the first: still ${n} counters.`
          : `The first counter stays out, so there are ${n - 1} left for the second pick. After a red, only ${red - 1} red ${red - 1 === 1 ? "is" : "are"} left; after a blue, only ${blue - 1} blue.`}{" "}
        {parts.length === 0 ? "Choose a route to work out its probability." : `${parts.map((p) => p.text).join(". ")}.`}
        {parts.length > 1 && ` Add the routes: ${parts.map((p) => `${p.l.t}/${p.l.b}`).join(" + ")} = ${top}/${bottom}.`}
      </Readout>
    </>
  );
}

export const TREE_DEMOS = {
  "frequency-tree-fill": FrequencyTreeFill,
  "tree-multiply": () => <TreeBag startReplace />,
  "tree-without-replacement": () => <TreeBag startReplace={false} />,
};

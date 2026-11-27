/**
 * Question generators for the sequences chain.
 *
 * Sequences are written with commas and a trailing "…": 3, 7, 11, 15, …
 * Negative numbers use the true minus sign. nth-term answers are marked as
 * expressions, so "4n + 3" and "3 + 4n" are both right.
 * Tier 1 is guided practice; tier 2 is independent practice and the skill check.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { TableSpec } from "@/engine/types";
import { choiceQ, intQ, nonZero, num, type Gen, type Q } from "../graphs/plot";

type Pick = (r: Rng, t: 1 | 2) => Q;

const list = (xs: number[]) => `${xs.map(num).join(", ")}, …`;
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const arith = (a: number, d: number, n: number) => Array.from({ length: n }, (_, i) => a + i * d);
const step = (d: number) => (d >= 0 ? `add ${d}` : `subtract ${-d}`);

/** "4n + 3", "−3n + 20", "n − 2". */
export function nthTerm(d: number, c: number): string {
  const t = d === 1 ? "n" : d === -1 ? "−n" : `${num(d)}n`;
  if (c === 0) return t;
  return c > 0 ? `${t} + ${c}` : `${t} − ${-c}`;
}

const exprAnswer = (value: string) => ({ kind: "expression" as const, value, form: "simplified" as const });
const NTH_HELP = "Type an expression using n, like 4n + 3 or 20 − 3n.";

// ================================================================ term-to-term and position-to-term

const nextTerm = (r: Rng, tier: 1 | 2): Q => {
  const d = tier === 1 ? r.pick([2, 3, 4, 5, 6, -2, -3, 7]) : nonZero(r, -9, 11);
  const a = tier === 1 ? (d > 0 ? r.int(1, 12) : r.int(30, 60)) : r.int(-10, 30);
  const terms = arith(a, d, 4);
  const ans = a + 4 * d;
  return intQ(ans, {
    prompt: `Here is a sequence: ${list(terms)} What is the next term?`,
    wrong: [
      { value: terms[3] - d, misconception: "seq-wrong-direction" },
      { value: a + 5 * d, misconception: "seq-skipped-term" },
    ],
    hints: ["Work out the gap between each term and the next.", `Each time you ${step(d)}.`],
    solution: [`The terms go ${d > 0 ? "up" : "down"} by ${Math.abs(d)} each time: the rule is ${step(d)}.`, `${num(terms[3])} ${d > 0 ? "+" : "−"} ${Math.abs(d)} = ${num(ans)}`, `The next term is ${num(ans)}.`],
  });
};

const ruleChoice = (r: Rng): Q => {
  const d = nonZero(r, -8, 9);
  const a = d > 0 ? r.int(1, 15) : r.int(40, 70);
  const terms = arith(a, d, 5);
  const right = `${step(d)[0].toUpperCase()}${step(d).slice(1)}`;
  const opp = `${step(-d)[0].toUpperCase()}${step(-d).slice(1)}`;
  const first = `Add ${Math.abs(a)}`;
  const times = `Multiply by ${Math.abs(d) === 1 ? 2 : Math.abs(d)}`;
  return choiceQ(r, [right, opp, first, times], {
    prompt: `What is the term-to-term rule for ${list(terms)}?`,
    mc: { [opp]: "seq-wrong-direction", [first]: "seq-used-term-not-position", [times]: "seq-added-not-multiplied" },
    hints: ["Look at how you get from one term to the next.", `From ${num(terms[0])} to ${num(terms[1])}, then ${num(terms[1])} to ${num(terms[2])}: the same change each time?`],
    solution: [`${num(terms[0])} → ${num(terms[1])} → ${num(terms[2])}: the terms go ${d > 0 ? "up" : "down"} by ${Math.abs(d)} each time.`, `The rule is: ${right}`],
  });
};

const missingTerm = (r: Rng, tier: 1 | 2): Q => {
  const d = tier === 1 ? r.pick([3, 4, 5, 6, 8, 10]) : nonZero(r, -9, 9);
  const a = r.int(-5, 20);
  const terms = arith(a, d, 5);
  const gap = r.int(1, 3);
  const shown = terms.map((t, i) => (i === gap ? "__" : num(t))).join(", ");
  return intQ(terms[gap], {
    prompt: `Find the missing term: ${shown}, …`,
    wrong: [
      { value: terms[gap - 1] + (terms[gap + 1] - terms[gap - 1]), misconception: "seq-skipped-term" },
      { value: terms[gap - 1] - d, misconception: "seq-wrong-direction" },
    ],
    hints: ["Use two terms that sit next to each other to find the gap.", `The gap is ${Math.abs(d)} each time.`],
    solution: [`The rule is ${step(d)}.`, `${num(terms[gap - 1])} ${d > 0 ? "+" : "−"} ${Math.abs(d)} = ${num(terms[gap])}`, `The missing term is ${num(terms[gap])}.`],
  });
};

const doublingNext = (r: Rng): Q => {
  const k = r.pick([2, 2, 3, 10]);
  const a = k === 10 ? r.int(1, 5) : r.int(1, 7);
  const terms = [a, a * k, a * k * k, a * k ** 3];
  const ans = a * k ** 4;
  const last = terms[3] - terms[2];
  return intQ(ans, {
    prompt: `Here is a sequence: ${list(terms)} What is the next term?`,
    wrong: [{ value: terms[3] + last, misconception: "seq-added-not-multiplied" }],
    hints: ["The gaps aren't the same, so it isn't adding the same amount.", `How do you get from ${a} to ${a * k}? Try multiplying.`],
    solution: [`Each term is the one before multiplied by ${k}.`, `${terms[3]} × ${k} = ${ans}`, `The next term is ${ans}.`],
  });
};

const positionToTerm = (r: Rng, tier: 1 | 2): Q => {
  const d = r.pick([2, 3, 4, 5, 6, 7]);
  const c = tier === 1 ? r.int(1, 9) : nonZero(r, -9, 9);
  const n = tier === 1 ? r.int(3, 9) : r.pick([10, 12, 15, 20, 25, 50, 100]);
  const ans = d * n + c;
  const rule = nthTerm(d, c);
  return intQ(ans, {
    prompt: `The rule for the nth term of a sequence is ${rule}. Work out the ${ord(n)} term.`,
    wrong: [
      { value: Number(`${d}${n}`) + c, misconception: "seq-concatenated" },
      { value: d * (n + c), misconception: "seq-rule-order" },
      { value: d * n, misconception: "seq-rule-order" },
    ],
    hints: [`n is the position, so put n = ${n} into ${rule}.`, `${d}n means ${d} × n. Multiply first, then ${c > 0 ? "add" : "subtract"}.`],
    solution: [`Put n = ${n} into ${rule}.`, `${d} × ${n} ${c > 0 ? "+" : "−"} ${Math.abs(c)} = ${d * n} ${c > 0 ? "+" : "−"} ${Math.abs(c)}`, `The ${ord(n)} term is ${num(ans)}.`],
  });
};

const firstTerms = (r: Rng): Q => {
  const a = r.int(1, 9);
  const k = r.pick([2, 3]);
  const sub = r.int(1, Math.max(1, a - 1));
  const t = [a];
  for (let i = 0; i < 3; i++) t.push(t[i] * k - sub);
  const ans = t[3];
  return intQ(ans, {
    prompt: `The first term of a sequence is ${a}. The term-to-term rule is "multiply by ${k}, then subtract ${sub}". What is the 4th term?`,
    wrong: [
      { value: t[2], misconception: "seq-skipped-term" },
      { value: (t[2] - sub) * k, misconception: "seq-rule-order" },
      { value: t[3] * k - sub, misconception: "seq-skipped-term" },
    ],
    hints: ["Use the rule on the 1st term to get the 2nd, then on the 2nd to get the 3rd, and so on.", `2nd term: ${a} × ${k} − ${sub} = ${t[1]}.`],
    solution: [`2nd: ${a} × ${k} − ${sub} = ${t[1]}`, `3rd: ${t[1]} × ${k} − ${sub} = ${t[2]}`, `4th: ${t[2]} × ${k} − ${sub} = ${t[3]}. The 4th term is ${ans}.`],
  });
};

const patternTable = (r: Rng): Q => {
  const shapes = [
    { name: "squares made of matchsticks", d: 3, a: 4 },
    { name: "triangles made of matchsticks", d: 2, a: 3 },
    { name: "hexagons made of matchsticks", d: 5, a: 6 },
    { name: "tables and chairs (chairs round joined tables)", d: 2, a: 4 },
  ];
  const s = r.pick(shapes);
  const n = r.int(5, 8);
  const ans = s.a + (n - 1) * s.d;
  const table: TableSpec = {
    corner: "Pattern",
    columns: ["1", "2", "3", "4"],
    rows: [{ head: s.name.startsWith("tables") ? "Chairs" : "Matchsticks", cells: arith(s.a, s.d, 4).map(String) }],
    description: `A table of a pattern of ${s.name}. Pattern 1 uses ${s.a}, pattern 2 uses ${s.a + s.d}, pattern 3 uses ${s.a + 2 * s.d}, pattern 4 uses ${s.a + 3 * s.d}.`,
  };
  return intQ(ans, {
    prompt: `A pattern of ${s.name} grows like this. How many ${s.name.startsWith("tables") ? "chairs" : "matchsticks"} are in pattern ${n}?`,
    visual: { kind: "table", table },
    wrong: [
      { value: s.a * n, misconception: "seq-nth-first-term" },
      { value: s.a + n * s.d, misconception: "seq-skipped-term" },
    ],
    answerHelp: "Type a whole number, like 19.",
    hints: [`Each new pattern adds ${s.d} more.`, `Keep adding ${s.d} until you reach pattern ${n}.`],
    solution: [`Each pattern has ${s.d} more than the one before.`, `Pattern 4 has ${s.a + 3 * s.d}. Add ${s.d} for each pattern after that: ${arith(s.a + 4 * s.d, s.d, n - 4).join(", ")}.`, `Pattern ${n} has ${ans}.`],
  });
};

const sequences: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([(r) => nextTerm(r, 1), ruleChoice, (r) => missingTerm(r, 1), (r) => positionToTerm(r, 1), doublingNext, patternTable])(r, 1);
  return r.pick<Pick>([(r) => nextTerm(r, 2), (r) => missingTerm(r, 2), (r) => positionToTerm(r, 2), firstTerms, patternTable, ruleChoice])(r, 2);
};

// ================================================================ special sequences

const SQUARE = (n: number) => n * n;
const CUBE = (n: number) => n ** 3;
const TRI = (n: number) => (n * (n + 1)) / 2;

const nthSpecial = (r: Rng, tier: 1 | 2): Q => {
  const kind = r.pick(["square", "cube", "triangular"] as const);
  const n = kind === "cube" ? r.int(2, tier === 1 ? 5 : 10) : r.int(4, tier === 1 ? 10 : 15);
  if (kind === "square") {
    return intQ(SQUARE(n), {
      prompt: `What is the ${ord(n)} square number?`,
      wrong: [{ value: 2 * n, misconception: "seq-square-doubled" }, { value: TRI(n), misconception: "seq-triangular-square" }],
      hints: ["Square numbers are 1 × 1, 2 × 2, 3 × 3, …", `The ${ord(n)} one is ${n} × ${n}.`],
      solution: [`The ${ord(n)} square number is ${n}² = ${n} × ${n}.`, `= ${SQUARE(n)}`],
    });
  }
  if (kind === "cube") {
    return intQ(CUBE(n), {
      prompt: `What is the ${ord(n)} cube number?`,
      wrong: [{ value: 3 * n, misconception: "seq-cube-tripled" }, { value: SQUARE(n), misconception: "seq-cube-tripled" }],
      hints: ["Cube numbers are 1 × 1 × 1, 2 × 2 × 2, 3 × 3 × 3, …", `The ${ord(n)} one is ${n} × ${n} × ${n}.`],
      solution: [`The ${ord(n)} cube number is ${n}³ = ${n} × ${n} × ${n}.`, `= ${CUBE(n)}`],
    });
  }
  const tri = Array.from({ length: n }, (_, i) => TRI(i + 1));
  return intQ(TRI(n), {
    prompt: `The triangular numbers start 1, 3, 6, 10, … What is the ${ord(n)} triangular number?`,
    wrong: [{ value: SQUARE(n), misconception: "seq-triangular-square" }, { value: TRI(n - 1), misconception: "seq-skipped-term" }, { value: TRI(n + 1), misconception: "seq-skipped-term" }],
    hints: ["Each triangular number adds one more than last time: + 2, + 3, + 4, …", `The ${ord(n)} triangular number is 1 + 2 + 3 + … + ${n}.`],
    solution: [`Keep adding one more each time: ${tri.join(", ")}.`, `The ${ord(n)} triangular number is ${TRI(n)}.`],
  });
};

const nextSpecial = (r: Rng): Q => {
  const kind = r.pick(["square", "cube", "triangular"] as const);
  const f = kind === "square" ? SQUARE : kind === "cube" ? CUBE : TRI;
  const start = kind === "cube" ? 1 : r.int(1, 4);
  const terms = [0, 1, 2, 3].map((i) => f(start + i));
  const ans = f(start + 4);
  const lastGap = terms[3] - terms[2];
  return intQ(ans, {
    prompt: `What is the next term? ${list(terms)}`,
    wrong: [{ value: terms[3] + lastGap, misconception: "seq-quad-as-linear" }],
    hints: [`Do you recognise these numbers? Try ${kind === "triangular" ? "dots arranged in triangles" : kind === "square" ? "multiplying a number by itself" : "n × n × n"}.`, `They are the ${kind} numbers.`],
    solution: [`These are the ${kind} numbers: ${terms.join(", ")} are ${kind === "triangular" ? "triangular numbers" : terms.map((t, i) => `${start + i}${kind === "square" ? "²" : "³"}`).join(", ")}.`, kind === "triangular" ? `The gaps go up by 1: ${lastGap} then ${ans - terms[3]}. ${terms[3]} + ${ans - terms[3]} = ${ans}.` : `The next is ${start + 4}${kind === "square" ? "²" : "³"} = ${ans}.`, `The next term is ${ans}.`],
  });
};

const whichIsSpecial = (r: Rng): Q => {
  const kind = r.pick(["square", "cube", "triangular"] as const);
  const isIt = (n: number) =>
    kind === "square" ? Number.isInteger(Math.sqrt(n)) : kind === "cube" ? Math.abs(Math.round(Math.cbrt(n)) ** 3 - n) === 0 : Number.isInteger((Math.sqrt(8 * n + 1) - 1) / 2);
  const right = kind === "square" ? SQUARE(r.int(5, 12)) : kind === "cube" ? CUBE(r.int(2, 6)) : TRI(r.int(5, 12));
  const tempting =
    kind === "square" ? [2 * r.int(5, 12), 10 * r.int(2, 5), TRI(r.int(5, 9))] : kind === "cube" ? [3 * r.int(3, 9), SQUARE(r.int(4, 9)), 9 * 3] : [SQUARE(r.int(3, 8)), 2 * r.int(6, 15), 5 * r.int(3, 6)];
  const wrong = [...new Set(tempting.filter((t) => !isIt(t) && t !== right))];
  while (wrong.length < 3) {
    const t = r.int(10, 99);
    if (!isIt(t) && !wrong.includes(t) && t !== right) wrong.push(t);
  }
  const mcId = kind === "square" ? "seq-square-doubled" : kind === "cube" ? "seq-cube-tripled" : "seq-triangular-square";
  const options = [String(right), ...wrong.slice(0, 3).map(String)];
  return choiceQ(r, options, {
    prompt: `Which of these is a ${kind} number?`,
    mc: Object.fromEntries(options.slice(1).map((o) => [o, mcId])),
    hints: [
      kind === "square" ? "A square number is a number times itself." : kind === "cube" ? "A cube number is a number times itself, times itself again." : "Triangular numbers: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, …",
      "Check each option.",
    ],
    solution: [
      kind === "square" ? `${right} = ${Math.sqrt(right)} × ${Math.sqrt(right)}.` : kind === "cube" ? `${right} = ${Math.round(Math.cbrt(right))} × ${Math.round(Math.cbrt(right))} × ${Math.round(Math.cbrt(right))}.` : `${right} is in the list 1, 3, 6, 10, 15, … (it is 1 + 2 + … + ${(Math.sqrt(8 * right + 1) - 1) / 2}).`,
      `So ${right} is a ${kind} number.`,
    ],
  });
};

const nameSequence = (r: Rng): Q => {
  const kind = r.pick(["Arithmetic", "Geometric", "Square numbers", "Triangular numbers"] as const);
  let terms: number[];
  if (kind === "Arithmetic") terms = arith(r.int(1, 15), r.pick([2, 3, 4, 5, 7, -3, -4]), 5);
  else if (kind === "Geometric") {
    const a = r.int(1, 5);
    const k = r.pick([2, 3]);
    terms = [0, 1, 2, 3, 4].map((i) => a * k ** i);
  } else if (kind === "Square numbers") terms = [1, 2, 3, 4, 5].map(SQUARE);
  else terms = [1, 2, 3, 4, 5].map(TRI);
  const all = ["Arithmetic", "Geometric", "Square numbers", "Triangular numbers"];
  return choiceQ(r, [kind, ...all.filter((a) => a !== kind)], {
    prompt: `What type of sequence is ${list(terms)}?`,
    mc: Object.fromEntries(all.filter((a) => a !== kind).map((a) => [a, "seq-type-mixup"])),
    keepOrder: true,
    hints: ["Look at the gaps between terms.", "Same gap: arithmetic. Multiply each time: geometric. Gaps 3, 5, 7: square. Gaps 2, 3, 4: triangular."],
    solution: [
      kind === "Arithmetic"
        ? `The gap is the same each time (${num(terms[1] - terms[0])}).`
        : kind === "Geometric"
          ? `Each term is multiplied by ${terms[1] / terms[0]}.`
          : kind === "Square numbers"
            ? "They are 1², 2², 3², 4², 5²."
            : "The gaps are 2, 3, 4, 5: these make triangles of dots.",
      `It is ${kind === "Arithmetic" ? "an arithmetic sequence" : kind === "Geometric" ? "a geometric sequence" : `the ${kind.toLowerCase()}`}. Answer: ${kind}`,
    ],
  });
};

const specialSequences: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([(r) => nthSpecial(r, 1), nextSpecial, whichIsSpecial, nameSequence])(r, 1);
  return r.pick<Pick>([(r) => nthSpecial(r, 2), nextSpecial, whichIsSpecial, nameSequence, (r) => nthSpecial(r, 2)])(r, 2);
};

// ================================================================ nth term

const findNth = (r: Rng, tier: 1 | 2): Q => {
  const d = tier === 1 ? r.int(2, 9) : r.pick([2, 3, 4, 5, 6, 7, -2, -3, -4, -5]);
  let c = tier === 1 ? r.int(-4, 9) : r.int(-9, 25);
  if (d < 0 && c < 10) c += 15;
  if (c === 0) c = d > 0 ? 1 : 20;
  const terms = arith(d + c, d, 4);
  const rule = nthTerm(d, c);
  const timesTable = arith(d, d, 4);
  return {
    prompt: `Find the nth term of ${list(terms)}`,
    answer: exprAnswer(rule),
    wrongAnswers: [],
    wrongExpressions: [
      { value: nthTerm(1, d), misconception: "seq-nth-difference-added" },
      { value: nthTerm(d, terms[0]), misconception: "seq-nth-first-term" },
      { value: nthTerm(d, 0), misconception: "seq-nth-no-adjust" },
      ...(d < 0 ? [{ value: nthTerm(-d, c + 2 * d), misconception: "seq-nth-sign" }, { value: nthTerm(-d, c), misconception: "seq-nth-sign" }] : []),
    ].filter((w, i, all) => w.value !== rule && all.findIndex((v) => v.value === w.value) === i),
    answerHelp: NTH_HELP,
    hints: [`The terms go ${d > 0 ? "up" : "down"} by ${Math.abs(d)}, so the nth term starts ${d === -1 ? "−n" : d === 1 ? "n" : `${num(d)}n`}.`, `Compare with ${num(d)}n: ${list(timesTable)} What do you add to get the sequence?`],
    solution: [
      `The difference is ${num(d)}, so compare with ${num(d)}n: ${timesTable.map(num).join(", ")}.`,
      `Each term is ${Math.abs(c)} ${c > 0 ? "more" : "less"} than ${num(d)}n (${num(terms[0])} ${c > 0 ? "−" : "+"} ${Math.abs(c)} = ${num(d)}).`,
      `The nth term is ${rule}.`,
    ],
  };
};

const termFromNth = (r: Rng, tier: 1 | 2): Q => {
  const d = tier === 1 ? r.int(2, 9) : nonZero(r, -6, 9);
  const c = tier === 1 ? r.int(1, 9) : r.int(-9, 30);
  const n = r.pick([10, 20, 30, 50, 100, 12, 25]);
  const rule = nthTerm(d, c);
  const ans = d * n + c;
  const conc = d > 0 ? Number(`${d}${n}`) + c : -Number(`${-d}${n}`) + c;
  return intQ(ans, {
    prompt: `A sequence has nth term ${rule}. Work out the ${ord(n)} term.`,
    wrong: [
      { value: conc, misconception: "seq-concatenated" },
      { value: d * (n + c), misconception: "seq-rule-order" },
    ],
    hints: [`Put n = ${n} into ${rule}.`, `Multiply first: ${num(d)} × ${n}.`],
    solution: [`n = ${n}: ${num(d)} × ${n}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`, `= ${num(d * n)}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`, `The ${ord(n)} term is ${num(ans)}.`],
  });
};

const whichTerm = (r: Rng): Q => {
  const d = r.int(2, 8);
  const c = nonZero(r, -6, 9);
  const n = r.int(8, 30);
  const value = d * n + c;
  const rule = nthTerm(d, c);
  return intQ(n, {
    prompt: `A sequence has nth term ${rule}. Which term is equal to ${value}?`,
    wrong: [
      { value: d * value + c, misconception: "seq-solved-backwards" },
      { value: (value + c) / d, misconception: "seq-rule-order" },
    ],
    answerHelp: "Type the term number, like 12.",
    hints: [`Solve ${rule} = ${value}.`, `${c > 0 ? `Subtract ${c}` : `Add ${-c}`} from both sides, then divide by ${d}.`],
    solution: [`${rule} = ${value}`, `${d}n = ${value - c}`, `n = ${value - c} ÷ ${d} = ${n}. It is the ${ord(n)} term, so the answer is ${n}.`],
  });
};

const inSequence = (r: Rng): Q => {
  const d = r.int(3, 9);
  const c = nonZero(r, -5, 8);
  const rule = nthTerm(d, c);
  const yes = r.next() < 0.5;
  const n = r.int(10, 40);
  const value = d * n + c + (yes ? 0 : r.int(1, d - 1));
  const exact = (value - c) / d;
  const terms = arith(d + c, d, 4);
  return choiceQ(r, yes ? ["Yes", "No"] : ["No", "Yes"], {
    prompt: `The sequence ${list(terms)} has nth term ${rule}. Is ${value} a term in the sequence?`,
    mc: { [yes ? "No" : "Yes"]: "seq-solved-backwards" },
    keepOrder: true,
    hints: [`Solve ${rule} = ${value}.`, "If n comes out as a whole number, it is a term. If not, it isn't."],
    solution: [
      `${d}n = ${value} ${c > 0 ? "−" : "+"} ${Math.abs(c)} = ${value - c}`,
      `n = ${value - c} ÷ ${d} = ${Number.isInteger(exact) ? exact : `${Math.floor(exact)} remainder ${(value - c) % d}`}`,
      yes ? `n is a whole number, so ${value} is the ${ord(exact)} term. Answer: Yes` : `n isn't a whole number, so ${value} is not in the sequence. Answer: No`,
    ],
  });
};

const nthTermSkill: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([(r) => findNth(r, 1), (r) => termFromNth(r, 1), (r) => findNth(r, 1), whichTerm])(r, 1);
  return r.pick<Pick>([(r) => findNth(r, 2), (r) => termFromNth(r, 2), whichTerm, inSequence, (r) => findNth(r, 2)])(r, 2);
};

// ================================================================ other sequences

const fibonacciNext = (r: Rng, tier: 1 | 2): Q => {
  const a = r.int(1, tier === 1 ? 5 : 9);
  const b = r.int(1, tier === 1 ? 6 : 12);
  const t = [a, b];
  while (t.length < 6) t.push(t[t.length - 1] + t[t.length - 2]);
  const shown = tier === 1 ? t.slice(0, 5) : t.slice(0, 4);
  const ans = t[shown.length];
  const lastGap = shown[shown.length - 1] - shown[shown.length - 2];
  return intQ(ans, {
    prompt: `Each term of this sequence is the sum of the two terms before it. ${list(shown)} What is the next term?`,
    wrong: [{ value: shown[shown.length - 1] + lastGap, misconception: "seq-fib-as-arithmetic" }, { value: shown[shown.length - 1] * 2, misconception: "seq-fib-as-arithmetic" }],
    hints: ["Add the last two terms.", `${shown[shown.length - 2]} + ${shown[shown.length - 1]}`],
    solution: [`Add the last two terms: ${shown[shown.length - 2]} + ${shown[shown.length - 1]}.`, `The next term is ${ans}.`],
  });
};

const fibonacciMissing = (r: Rng): Q => {
  const a = r.int(1, 8);
  const b = r.int(2, 10);
  const t = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
  return intQ(b, {
    prompt: `In a Fibonacci-type sequence each term is the sum of the two before it. The first term is ${a} and the third term is ${t[2]}. What is the second term?`,
    wrong: [{ value: t[2] + a, misconception: "seq-fib-as-arithmetic" }, { value: (a + t[2]) / 2, misconception: "seq-fib-as-arithmetic" }],
    hints: ["The 3rd term = the 1st term + the 2nd term.", `${a} + ? = ${t[2]}`],
    solution: [`The 3rd term is the 1st plus the 2nd: ${a} + ? = ${t[2]}.`, `? = ${t[2]} − ${a}`, `The second term is ${b}.`],
  });
};

const geometricNext = (r: Rng, tier: 1 | 2): Q => {
  const halving = tier === 2 && r.next() < 0.4;
  if (halving) {
    const last = r.int(1, 9);
    const k = r.pick([2, 2, 10]);
    const t = [0, 1, 2, 3].map((i) => last * k ** (4 - i));
    const ans = last;
    return intQ(ans, {
      prompt: `Here is a geometric sequence: ${list(t)} What is the next term?`,
      wrong: [{ value: t[3] - (t[2] - t[3]), misconception: "seq-geometric-as-arithmetic" }],
      hints: ["Each term is divided by the same number.", `${t[0]} ÷ ${t[1]} = ${k}`],
      solution: [`Each term is the one before divided by ${k}.`, `${t[3]} ÷ ${k} = ${ans}`, `The next term is ${ans}.`],
    });
  }
  const k = r.pick([2, 3, 4, 5]);
  const a = r.int(1, k > 3 ? 3 : 6);
  const t = [0, 1, 2, 3].map((i) => a * k ** i);
  const ans = a * k ** 4;
  return intQ(ans, {
    prompt: `Here is a geometric sequence: ${list(t)} What is the next term?`,
    wrong: [{ value: t[3] + (t[3] - t[2]), misconception: "seq-geometric-as-arithmetic" }],
    hints: ["In a geometric sequence you multiply by the same number each time.", `${t[1]} ÷ ${t[0]} = ${k}`],
    solution: [`Each term is the one before multiplied by ${k}.`, `${t[3]} × ${k} = ${ans}`, `The next term is ${ans}.`],
  });
};

const commonRatio = (r: Rng): Q => {
  const k = r.pick([2, 3, 4, 5, 10]);
  const a = r.int(1, 6);
  const t = [0, 1, 2, 3].map((i) => a * k ** i);
  return intQ(k, {
    prompt: `What is each term multiplied by in the geometric sequence ${list(t)}?`,
    wrong: [{ value: t[1] - t[0], misconception: "seq-geometric-as-arithmetic" }],
    answerHelp: "Type a whole number, like 3.",
    hints: ["Divide a term by the one before it.", `${t[1]} ÷ ${t[0]}`],
    solution: [`${t[1]} ÷ ${t[0]} = ${k}, and ${t[2]} ÷ ${t[1]} = ${k}.`, `Each term is multiplied by ${k}.`],
  });
};

const quadraticNext = (r: Rng, tier: 1 | 2): Q => {
  const firstGap = r.int(1, 6);
  const second = tier === 1 ? r.pick([1, 2]) : r.pick([1, 2, 3, 4]);
  const a = r.int(1, 10);
  const t = [a];
  let gap = firstGap;
  for (let i = 0; i < 5; i++) {
    t.push(t[i] + gap);
    gap += second;
  }
  const shown = t.slice(0, 5);
  const ans = t[5];
  const gaps = shown.slice(1).map((v, i) => v - shown[i]);
  return intQ(ans, {
    prompt: `Here is a quadratic sequence: ${list(shown)} What is the next term?`,
    wrong: [{ value: shown[4] + gaps[3], misconception: "seq-quad-as-linear" }],
    hints: ["Write down the gaps between the terms.", `The gaps are ${gaps.join(", ")}. How do the gaps change?`],
    solution: [`The gaps are ${gaps.join(", ")}: they go up by ${second} each time.`, `The next gap is ${gaps[3] + second}, so ${shown[4]} + ${gaps[3] + second} = ${ans}.`, `The next term is ${ans}.`],
  });
};

const identifyType = (r: Rng): Q => {
  const kind = r.pick(["Arithmetic", "Geometric", "Fibonacci-type", "Quadratic"] as const);
  let terms: number[];
  if (kind === "Arithmetic") terms = arith(r.int(1, 15), r.pick([3, 4, 6, 7, 9]), 5);
  else if (kind === "Geometric") terms = [];
  else if (kind === "Fibonacci-type") {
    const t = [r.int(1, 4), r.int(2, 6)];
    while (t.length < 6) t.push(t[t.length - 1] + t[t.length - 2]);
    terms = t.slice(0, 6);
  } else {
    const a = r.int(1, 5);
    terms = [1, 2, 3, 4, 5].map((n) => n * n + a);
  }
  if (kind === "Geometric") {
    const a = r.int(1, 4);
    const k = r.pick([2, 3]);
    terms = [0, 1, 2, 3, 4].map((i) => a * k ** i);
  }
  const all = ["Arithmetic", "Geometric", "Fibonacci-type", "Quadratic"];
  return choiceQ(r, [kind, ...all.filter((a) => a !== kind)], {
    prompt: `What type of sequence is ${list(terms)}?`,
    mc: Object.fromEntries(all.filter((a) => a !== kind).map((a) => [a, "seq-type-mixup"])),
    keepOrder: true,
    hints: ["Work out the gaps. Are they the same? Do they change steadily?", "Also try: is each term the two before added? Is each term multiplied by the same number?"],
    solution: [
      kind === "Arithmetic"
        ? `The gap is always ${terms[1] - terms[0]}.`
        : kind === "Geometric"
          ? `Each term is multiplied by ${terms[1] / terms[0]}.`
          : kind === "Fibonacci-type"
            ? `Each term is the two before added: ${terms[0]} + ${terms[1]} = ${terms[2]}, ${terms[1]} + ${terms[2]} = ${terms[3]}.`
            : `The gaps are ${terms.slice(1).map((v, i) => v - terms[i]).join(", ")}: they go up by 2 each time.`,
      `It is ${kind === "Arithmetic" ? "an arithmetic" : kind === "Geometric" ? "a geometric" : kind === "Quadratic" ? "a quadratic" : "a Fibonacci-type"} sequence. Answer: ${kind}`,
    ],
  });
};

const otherSequences: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([(r) => fibonacciNext(r, 1), (r) => geometricNext(r, 1), (r) => quadraticNext(r, 1), identifyType])(r, 1);
  return r.pick<Pick>([(r) => fibonacciNext(r, 2), fibonacciMissing, (r) => geometricNext(r, 2), commonRatio, (r) => quadraticNext(r, 2), identifyType])(r, 2);
};

export const SEQUENCE_GENERATORS: Record<string, Gen> = {
  "alg-sequences": sequences,
  "alg-special-sequences": specialSequences,
  "alg-nth-term": nthTermSkill,
  "alg-other-sequences": otherSequences,
};

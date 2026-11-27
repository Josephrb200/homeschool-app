/**
 * Question generators for the remaining ratio, proportion and percentage
 * skills: scale drawings and maps, unit rates, inverse proportion, reverse
 * percentages, simple and compound interest, speed, distance-time graphs,
 * density and pressure, and converting compound units.
 *
 * Every number is chosen so the method is short and the answer exact (or,
 * for compound interest, rounded to the nearest penny). Predicted wrong
 * answers are checked so they never equal the right one.
 *
 * Tier 1 is guided practice; tier 2 is independent practice and the skill check.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { add, div, frac, mul, simplify, sub, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { GraphSpec } from "@/engine/types";
import { dec, roundDp, showDec, showMoney } from "../decimals/dec";
import { cap, choiceQ, clean, decAnswer, NAMES, num, shuffle, type Gen, type Q } from "../calculation/helpers";

const HELP_WHOLE = "Type a whole number, like 24.";
const HELP_DEC = "Type a number. Decimals are fine, like 2.5.";
const HELP_MONEY = "Type an amount in pounds, like 84.50. The £ sign is fine but not needed.";
const HELP_PENNY = "Type an amount in pounds to the nearest penny, like 1234.56. The £ sign is fine.";

const name = (r: Rng) => r.pick(NAMES);
/** £12.50, and £34,000 with commas from £10,000 up. */
const money = (f: Fraction) => showMoney(f).replace(/^£(\d{5,})/, (_, w: string) => `£${w.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
/** Money answer: exact, typed as a decimal, shown as £. */
const moneyQ = (value: Fraction) => ({ answer: decAnswer(value), answerText: money(value) });
/** Big whole numbers with commas from 1,000 (for map scales: 1 : 25,000). */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ================================================================ scale drawings and maps

const MAP_SCALES = [10000, 20000, 25000, 50000, 100000] as const;

function mapToReal(r: Rng): Q {
  const n = r.pick(MAP_SCALES);
  // Map distance chosen so the real distance is a tidy number of km.
  const cmUnits = n === 10000 || n === 20000 ? r.int(2, 30) * 5 : r.int(2, 24); // n=10000: tenths of cm → 0.5 cm steps
  const cm = n === 10000 || n === 20000 ? dec(cmUnits, 1) : frac(cmUnits);
  const realCm = mul(cm, frac(n));
  const km = div(realCm, frac(100000));
  return {
    prompt: `A map has a scale of 1 : ${big(n)}. Two villages are ${num(cm)} cm apart on the map. How far apart are they in real life, in kilometres?`,
    answer: decAnswer(km),
    wrongAnswers: clean(km, [
      { value: realCm, misconception: "scale-units-not-converted" },
      { value: div(realCm, frac(100)), misconception: "scale-units-not-converted" },
      { value: div(realCm, frac(1000)), misconception: "units-wrong-factor" },
      { value: div(cm, frac(n)), misconception: "scale-wrong-way" },
    ]),
    answerHelp: "Type a number of kilometres. Decimals are fine, like 2.5.",
    hints: [`1 : ${big(n)} means 1 cm on the map is ${big(n)} cm in real life. So multiply by ${big(n)}.`, `Then change cm to km: 100 cm = 1 m and 1000 m = 1 km, so divide by 100,000.`],
    solution: [`Real distance: ${num(cm)} × ${big(n)} = ${big(realCm.n / realCm.d)} cm.`, `${big(realCm.n / realCm.d)} cm ÷ 100 = ${num(div(realCm, frac(100)))} m, and ÷ 1000 = ${num(km)} km.`, `${num(km)} km`],
  };
}

function realToMap(r: Rng): Q {
  const n = r.pick([20000, 25000, 50000, 100000] as const);
  const cm = r.int(2, 24);
  const km = div(mul(frac(cm), frac(n)), frac(100000));
  const realCm = mul(km, frac(100000));
  return {
    prompt: `A map has a scale of 1 : ${big(n)}. A footpath is ${num(km)} km long in real life. How long is it on the map, in centimetres?`,
    answer: intAnswer(cm),
    wrongAnswers: clean(cm, [
      { value: mul(km, frac(n)), misconception: "scale-wrong-way" },
      { value: div(km, frac(n)), misconception: "scale-units-not-converted" },
    ]),
    answerHelp: "Type a number of centimetres.",
    hints: [`Change ${num(km)} km into cm first: × 1000 gives m, × 100 gives cm.`, `Then divide by ${big(n)}, because the map is ${big(n)} times smaller.`],
    solution: [`${num(km)} km = ${big(realCm.n)} cm.`, `${big(realCm.n)} ÷ ${big(n)} = ${cm}`, `${cm} cm`],
  };
}

const intAnswer = (value: number) => ({ kind: "integer" as const, value });

function drawingScale(r: Rng, tier: number): Q {
  const per = r.pick([2, 4, 5, 10, 20, 50] as const); // 1 cm represents per m (or km)
  const unit = per >= 20 ? "km" : "m";
  const what = unit === "km" ? r.pick(["two towns", "two islands", "two harbours"]) : r.pick(["a garden", "a classroom", "a car park", "a swimming pool"]);
  const toReal = tier === 1 || r.next() < 0.6;
  const cm = dec(r.int(3, 30) * 5, 1); // 0.5 cm steps
  const real = mul(cm, frac(per));
  if (toReal) {
    return {
      prompt: unit === "km"
        ? `On a scale drawing, 1 cm represents ${per} km. The distance between ${what} is ${num(cm)} cm on the drawing. What is the real distance, in km?`
        : `On a scale drawing of ${what}, 1 cm represents ${per} m. A wall is ${num(cm)} cm long on the drawing. How long is the real wall, in metres?`,
      answer: decAnswer(real),
      wrongAnswers: clean(real, [
        { value: div(cm, frac(per)), misconception: "scale-wrong-way" },
        { value: add(cm, frac(per)), misconception: "scale-added" },
      ]),
      answerHelp: HELP_DEC,
      hints: [`Every 1 cm on the drawing is ${per} ${unit} in real life.`, `So multiply: ${num(cm)} × ${per}.`],
      solution: [`1 cm → ${per} ${unit}.`, `${num(cm)} cm → ${num(cm)} × ${per} = ${num(real)} ${unit}.`, `${num(real)} ${unit}`],
    };
  }
  return {
    prompt: `On a scale drawing, 1 cm represents ${per} ${unit}. A real length is ${num(real)} ${unit}. How long is it on the drawing, in cm?`,
    answer: decAnswer(cm),
    wrongAnswers: clean(cm, [{ value: mul(real, frac(per)), misconception: "scale-wrong-way" }]),
    answerHelp: HELP_DEC,
    hints: [`Each ${per} ${unit} in real life is 1 cm on the drawing.`, `So divide: ${num(real)} ÷ ${per}.`],
    solution: [`${per} ${unit} → 1 cm.`, `${num(real)} ÷ ${per} = ${num(cm)}`, `${num(cm)} cm`],
  };
}

function scaleAsRatio(r: Rng): Q {
  const opts = [
    { per: r.pick([2, 5, 10, 20, 50]), unit: "m", f: 100 },
    { per: r.pick([1, 2, 5, 10]), unit: "km", f: 100000 },
  ];
  const o = r.pick(opts);
  const n = o.per * o.f;
  return {
    prompt: `A map uses the scale "1 cm represents ${o.per} ${o.unit}". Write this scale as a ratio in the form 1 : n.`,
    answer: { kind: "ratio", value: [1, n], requireSimplest: false },
    answerText: `1:${n}`,
    wrongAnswers: [{ value: [1, o.per], misconception: "scale-units-not-converted" }],
    answerHelp: "Type a ratio with a colon, like 1:5000. Don't put spaces inside the number.",
    hints: [`A ratio scale has no units, so both sides must be in the same unit. Change ${o.per} ${o.unit} into cm.`, o.unit === "m" ? `1 m = 100 cm.` : `1 km = 1000 m = 100,000 cm.`],
    solution: [`${o.per} ${o.unit} = ${o.per} × ${big(o.f)} = ${big(n)} cm.`, `So 1 cm represents ${big(n)} cm.`, `1:${n}`],
  };
}

const scaleMaps: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.6 ? drawingScale(r, 1) : mapToReal(r);
  const k = r.pick(["map", "back", "drawing", "ratio"] as const);
  if (k === "map") return mapToReal(r);
  if (k === "back") return realToMap(r);
  if (k === "drawing") return drawingScale(r, 2);
  return scaleAsRatio(r);
};

// ================================================================ unit rates and pay

function pay(r: Rng, tier: number): Q {
  const who = name(r);
  const rate = dec(r.int(18, 30) * 50, 2); // £9.00 to £15.00 in 50p steps
  const kind = tier === 1 ? r.pick(["earn", "rate"] as const) : r.pick(["earn", "rate", "overtime", "overtime"] as const);
  if (kind === "earn") {
    const h = r.int(3, 9);
    const total = mul(rate, frac(h));
    return {
      prompt: `${who} earns ${money(rate)} an hour. How much does ${who} earn for ${h} hours of work?`,
      ...moneyQ(total),
      wrongAnswers: clean(total, [{ value: add(rate, frac(h)), misconception: "rate-added" }]),
      answerHelp: HELP_MONEY,
      hints: [`Each hour earns ${money(rate)}.`, `Multiply: ${money(rate)} × ${h}.`],
      solution: [`${h} hours × ${money(rate)} per hour.`, `${showDec(rate, 2)} × ${h} = ${showDec(total, 2)}`, money(total)],
    };
  }
  if (kind === "rate") {
    const h = r.int(4, 8);
    const rate2 = dec(r.int(180, 300) * 5, 2); // any 5p
    const total = mul(rate2, frac(h));
    return {
      prompt: `${who} is paid ${money(total)} for ${h} hours of work. What is ${who}'s hourly rate of pay?`,
      ...moneyQ(rate2),
      wrongAnswers: clean(rate2, [{ value: mul(total, frac(h)), misconception: "prop-forgot-divide" }]),
      answerHelp: HELP_MONEY,
      hints: [`Hourly rate means the pay for 1 hour.`, `Divide the pay by the number of hours: ${money(total)} ÷ ${h}.`],
      solution: [`Pay for 1 hour = total ÷ hours.`, `${showDec(total, 2)} ÷ ${h} = ${showDec(rate2, 2)}`, money(rate2)],
    };
  }
  const basic = r.pick([35, 37, 38, 40]);
  const over = r.int(2, 8);
  const base = dec(r.int(10, 16) * 100, 2); // whole pounds so 1.5× is tidy
  const total = add(mul(base, frac(basic)), mul(mul(base, frac(3, 2)), frac(over)));
  return {
    prompt: `${who} is paid ${money(base)} an hour for the first ${basic} hours each week, and "time and a half" for any extra hours. One week ${who} works ${basic + over} hours. How much is ${who} paid?`,
    ...moneyQ(total),
    wrongAnswers: clean(total, [
      { value: mul(base, frac(basic + over)), misconception: "rate-overtime-normal" },
      { value: add(mul(base, frac(basic)), mul(add(base, frac(1, 2)), frac(over))), misconception: "rate-half-wrong" },
    ]),
    answerHelp: HELP_MONEY,
    hints: [`Time and a half means 1.5 × the normal rate: ${money(base)} × 1.5 = ${money(mul(base, frac(3, 2)))}.`, `${basic} hours at ${money(base)}, plus ${over} hours at ${money(mul(base, frac(3, 2)))}.`],
    solution: [`Normal: ${basic} × ${money(base)} = ${money(mul(base, frac(basic)))}.`, `Overtime: ${over} × ${money(mul(base, frac(3, 2)))} = ${money(mul(mul(base, frac(3, 2)), frac(over)))}.`, `Total: ${money(total)}`],
  };
}

function unitPrice(r: Rng, tier: number): Q {
  const item = r.pick([
    { pack: "cans of drink", one: "can" },
    { pack: "yoghurts", one: "yoghurt" },
    { pack: "batteries", one: "battery" },
    { pack: "pencils", one: "pencil" },
  ]);
  if (tier === 2 && r.next() < 0.5) {
    // Compare two packs.
    const nA = r.pick([4, 6, 8]);
    let nB = r.pick([10, 12, 15, 20]);
    const pA = r.int(15, 60);
    let pB = r.int(15, 60);
    while (pA === pB) pB = r.int(15, 60);
    nB = nB === nA ? nB + 2 : nB;
    const costA = pA * nA;
    const costB = pB * nB;
    const right = pA < pB ? `The pack of ${nA}` : `The pack of ${nB}`;
    const wrongPick = pA < pB ? `The pack of ${nB}` : `The pack of ${nA}`;
    return choiceQ(
      r,
      right,
      [{ text: wrongPick, mc: "prop-picked-dearer" }, { text: "They are the same value" }],
      {
        prompt: `A pack of ${nA} ${item.pack} costs ${money(dec(costA, 2))}. A pack of ${nB} costs ${money(dec(costB, 2))}. Which pack is better value?`,
        hints: [`Work out the price of one ${item.one} in each pack. Working in pence helps.`, `${costA}p ÷ ${nA} and ${costB}p ÷ ${nB}.`],
        solution: [`Pack of ${nA}: ${costA}p ÷ ${nA} = ${pA}p each.`, `Pack of ${nB}: ${costB}p ÷ ${nB} = ${pB}p each.`, `${right} is better value (${Math.min(pA, pB)}p each)`],
      },
      true,
    );
  }
  const n = r.pick([4, 5, 6, 8, 10, 12]);
  const each = r.int(12, 95);
  const cost = each * n;
  return {
    prompt: `A pack of ${n} ${item.pack} costs ${money(dec(cost, 2))}. What is the price of one ${item.one}, in pence?`,
    answer: intAnswer(each),
    wrongAnswers: clean(each, [{ value: dec(each, 2), misconception: "rate-pounds-pence" }]),
    answerHelp: "Type a number of pence, like 45.",
    hints: [`Change to pence: ${money(dec(cost, 2))} = ${cost}p.`, `Divide by ${n}.`],
    solution: [`${money(dec(cost, 2))} = ${cost}p.`, `${cost} ÷ ${n} = ${each}`, `${each}p each`],
  };
}

function otherRate(r: Rng): Q {
  const ctx = r.pick([
    { a: "A tap fills a bath with", u: "litres", t: "minutes", per: "litres per minute", lo: 6, hi: 15 },
    { a: "A printer prints", u: "pages", t: "minutes", per: "pages per minute", lo: 8, hi: 30 },
    { a: "Isla types", u: "words", t: "minutes", per: "words per minute", lo: 25, hi: 60 },
    { a: "A machine fills", u: "bottles", t: "hours", per: "bottles per hour", lo: 40, hi: 120 },
  ]);
  const rate = r.int(ctx.lo, ctx.hi);
  const t = r.int(3, 9);
  const amount = rate * t;
  const askTime = r.next() < 0.4;
  if (askTime) {
    const t2 = r.int(2, 12);
    return {
      prompt: `${ctx.a} ${amount} ${ctx.u} in ${t} ${ctx.t}, always at the same rate. How many ${ctx.t} does it take for ${rate * t2} ${ctx.u}?`,
      answer: intAnswer(t2),
      wrongAnswers: clean(t2, [{ value: rate * t2 * rate, misconception: "rate-multiplied-by-rate" }]),
      answerHelp: HELP_WHOLE,
      hints: [`First find the rate: ${amount} ÷ ${t} = ${rate} ${ctx.per}.`, `Then divide ${rate * t2} by ${rate}.`],
      solution: [`Rate: ${amount} ÷ ${t} = ${rate} ${ctx.per}.`, `${rate * t2} ÷ ${rate} = ${t2}`, `${t2} ${ctx.t}`],
    };
  }
  return {
    prompt: `${ctx.a} ${amount} ${ctx.u} in ${t} ${ctx.t}. What is the rate, in ${ctx.per}?`,
    answer: intAnswer(rate),
    wrongAnswers: clean(rate, [{ value: amount * t, misconception: "prop-forgot-divide" }, { value: frac(t, amount), misconception: "rate-upside-down" }]),
    answerHelp: HELP_WHOLE,
    hints: [`"Per minute" means "for each 1 minute". Share the ${ctx.u} equally between the ${ctx.t}.`, `${amount} ÷ ${t}.`],
    solution: [`${ctx.per[0].toUpperCase()}${ctx.per.slice(1)} = ${ctx.u} ÷ ${ctx.t}.`, `${amount} ÷ ${t} = ${rate}`, `${rate} ${ctx.per}`],
  };
}

const unitRates: Gen = (r, tier) => {
  const k = r.pick(["pay", "pay", "price", "rate"] as const);
  if (k === "pay") return pay(r, tier);
  if (k === "price") return unitPrice(r, tier);
  return otherRate(r);
};

// ================================================================ inverse proportion

const JOBS = [
  { who: "builders", job: "build a wall", t: "days" },
  { who: "painters", job: "paint a school", t: "days" },
  { who: "pumps", job: "empty a pond", t: "hours" },
  { who: "volunteers", job: "pack the food parcels", t: "hours" },
] as const;

function workers(r: Rng, tier: number): Q {
  const j = r.pick(JOBS);
  // total work = w1 × t1 = w2 × t2, all whole numbers.
  const totals = [12, 18, 24, 30, 36, 48, 60, 72];
  const total = r.pick(totals);
  const divisors = Array.from({ length: total }, (_, i) => i + 1).filter((d) => total % d === 0 && d >= 2 && d <= 12 && total / d >= 2);
  const w1 = r.pick(divisors);
  let w2 = r.pick(divisors);
  while (w2 === w1) w2 = r.pick(divisors);
  const t1 = total / w1;
  const t2 = total / w2;
  const askWorkers = tier === 2 && r.next() < 0.35;
  if (askWorkers) {
    return {
      prompt: `${w1} ${j.who} take ${t1} ${j.t} to ${j.job}. How many ${j.who}, working at the same rate, would be needed to do it in ${t2} ${j.t}?`,
      answer: intAnswer(w2),
      wrongAnswers: clean(w2, [{ value: frac(w1 * t2, t1), misconception: "invp-treated-as-direct" }]),
      answerHelp: HELP_WHOLE,
      hints: [`Work out the total work: ${w1} ${j.who} × ${t1} ${j.t} = ${total} "${j.who.slice(0, -1)}-${j.t.slice(0, -1)}s".`, `Share ${total} between ${t2} ${j.t}: ${total} ÷ ${t2}.`],
      solution: [`Total work: ${w1} × ${t1} = ${total}.`, `${total} ÷ ${t2} = ${w2}`, `${w2} ${j.who}`],
    };
  }
  return {
    prompt: `${w1} ${j.who} take ${t1} ${j.t} to ${j.job}. How long would ${w2} ${j.who} take, working at the same rate?`,
    answer: intAnswer(t2),
    wrongAnswers: clean(t2, [
      { value: frac(t1 * w2, w1), misconception: "invp-treated-as-direct" },
      { value: t1 + (w1 - w2), misconception: "invp-added" },
    ]),
    answerHelp: `Type a number of ${j.t}.`,
    hints: [`More ${j.who} means less time. Find how long 1 would take first: ${w1} × ${t1}.`, `1 would take ${total} ${j.t}. Now share that between ${w2}.`],
    solution: [`1 ${j.who.slice(0, -1)} would take ${w1} × ${t1} = ${total} ${j.t}.`, `${w2} ${j.who} take ${total} ÷ ${w2} = ${t2} ${j.t}.`, `${t2} ${j.t}`],
  };
}

function speedTime(r: Rng): Q {
  const d = r.pick([120, 180, 240, 360]);
  const speeds = [20, 30, 40, 45, 60, 72, 80, 90, 120].filter((s) => (d * 60) % s === 0 && d / s >= 1);
  const s1 = r.pick(speeds);
  let s2 = r.pick(speeds);
  while (s2 === s1) s2 = r.pick(speeds);
  const t1 = frac(d, s1);
  const t2m = (d * 60) / s2;
  const t1m = (d * 60) / s1;
  return {
    prompt: `At an average speed of ${s1} km/h, a journey takes ${hoursText(t1m)}. How many minutes would the same journey take at ${s2} km/h?`,
    answer: intAnswer(t2m),
    wrongAnswers: clean(t2m, [{ value: frac(t1m * s2, s1), misconception: "invp-treated-as-direct" }]),
    answerHelp: "Type a number of minutes.",
    hints: [`Speed and time are inversely proportional: go faster, take less time. Speed × time stays the same.`, `Time in minutes at ${s1} km/h: ${t1m}. Then ${s1} × ${t1m} = ${s2} × ?`],
    solution: [`${s1} km/h for ${t1m} minutes (${num(t1)} hours).`, `${s1} × ${t1m} = ${s1 * t1m}, and ${s1 * t1m} ÷ ${s2} = ${t2m}.`, `${t2m} minutes`],
  };
}

function hoursText(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h} hour${h === 1 ? "" : "s"}` : "", m ? `${m} minutes` : ""].filter(Boolean).join(" ");
}

function inverseFormula(r: Rng): Q {
  const k = r.pick([24, 36, 48, 60, 72, 120]);
  const ds = Array.from({ length: k }, (_, i) => i + 1).filter((x) => k % x === 0 && x >= 2 && x <= 20 && k / x >= 2);
  const x1 = r.pick(ds);
  let x2 = r.pick(ds);
  while (x2 === x1) x2 = r.pick(ds);
  return {
    prompt: `y is inversely proportional to x. When x = ${x1}, y = ${k / x1}. Find y when x = ${x2}.`,
    answer: intAnswer(k / x2),
    wrongAnswers: clean(k / x2, [{ value: frac((k / x1) * x2, x1), misconception: "invp-treated-as-direct" }]),
    answerHelp: HELP_DEC,
    hints: [`Inversely proportional means x × y is always the same number.`, `${x1} × ${k / x1} = ${k}. So ${x2} × y = ${k}.`],
    solution: [`x × y is constant: ${x1} × ${k / x1} = ${k}.`, `y = ${k} ÷ ${x2}`, `y = ${k / x2}`],
  };
}

function spotInverse(r: Rng): Q {
  const inv = r.pick([
    "The number of people sharing a pizza, and the size of each slice",
    "The speed of a car, and the time a journey takes",
    "The number of taps filling a bath, and the time it takes to fill",
    "The number of workers, and the time a job takes",
  ]);
  const direct = shuffle(r, [
    "The number of tickets bought, and their total cost",
    "The distance driven at a steady speed, and the time taken",
    "The amount of petrol bought, and its cost",
    "The number of hours worked, and the pay earned",
    "The length of a side of a square, and its perimeter",
  ]).slice(0, 3);
  return choiceQ(
    r,
    inv,
    direct.map((t) => ({ text: t, mc: "invp-treated-as-direct" })),
    {
      prompt: "Which pair of quantities is in inverse proportion?",
      hints: [`In inverse proportion, when one quantity doubles, the other halves.`, `Ask yourself: if I double the first, does the second double or halve?`],
      solution: [`For the others, doubling one doubles the other: that's direct proportion.`, `Here, doubling the first halves the second.`, inv],
    },
  );
}

const inverseProportion: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.7 ? workers(r, 1) : spotInverse(r);
  const k = r.pick(["workers", "workers", "speed", "formula", "spot"] as const);
  if (k === "workers") return workers(r, 2);
  if (k === "speed") return speedTime(r);
  if (k === "formula") return inverseFormula(r);
  return spotInverse(r);
};

// ================================================================ reverse percentages

function reversePercent(r: Rng, tier: number): Q {
  const up = r.next() < 0.5;
  const p = tier === 1 ? r.pick([10, 20, 25, 50] as const) : r.pick([5, 15, 20, 30, 35, 40, 12, 8] as const);
  const step = p % 5 === 0 ? 20 : 25;
  const orig = frac(r.int(2, 30) * step);
  const mult = frac(up ? 100 + p : 100 - p, 100);
  const now = mul(orig, mult);
  if (now.d !== 1 && mul(now, frac(100)).d !== 1) return reversePercent(r, tier);
  const ctx = up
    ? r.pick([
        { s: `After a ${p}% price rise, a bike costs ${money(now)}.`, q: "What did it cost before the rise?" },
        { s: `A house increased in value by ${p}%. It is now worth ${money(mul(now, frac(1000)))}.`, q: "What was it worth before?", k: 1000 },
        { s: `A shop adds ${p}% to the price it pays for a jacket, and sells it for ${money(now)}.`, q: "How much did the shop pay?" },
      ])
    : r.pick([
        { s: `In a sale, everything is ${p}% off. A coat costs ${money(now)} in the sale.`, q: "What was the price before the sale?" },
        { s: `A car lost ${p}% of its value in a year. It is now worth ${money(mul(now, frac(100)))}.`, q: "What was it worth a year ago?", k: 100 },
      ]);
  const k = (ctx as { k?: number }).k ?? 1;
  const O = mul(orig, frac(k));
  const N = mul(now, frac(k));
  const pct = up ? 100 + p : 100 - p;
  return {
    prompt: `${ctx.s} ${ctx.q}`,
    ...moneyQ(O),
    wrongAnswers: clean(O, [
      { value: up ? mul(N, frac(100 - p, 100)) : mul(N, frac(100 + p, 100)), misconception: "rev-percent-of-new" },
      { value: mul(N, frac(p, 100)), misconception: "rev-gave-change" },
    ]),
    answerHelp: HELP_MONEY,
    hints: [`The new price is ${pct}% of the original (100% ${up ? "+" : "−"} ${p}%). Don't take ${p}% of the new price!`, `${pct}% = ${money(N)}. Find 1% by dividing by ${pct}, then multiply by 100. Or divide by the multiplier ${showDec(frac(pct, 100))}.`],
    solution: [`The new amount is ${pct}% of the original: ${pct}% = ${money(N)}.`, `1% = ${money(N)} ÷ ${pct} = ${money(div(N, frac(pct)))}, so 100% = ${money(O)}. (Or ${money(N)} ÷ ${showDec(frac(pct, 100))}.)`, `Original: ${money(O)}`],
  };
}

function vat(r: Rng): Q {
  const ex = frac(r.int(3, 60) * 5);
  const inc = mul(ex, frac(6, 5));
  return {
    prompt: `A price of ${money(inc)} includes VAT at 20%. What is the price without VAT?`,
    ...moneyQ(ex),
    wrongAnswers: clean(ex, [
      { value: mul(inc, frac(4, 5)), misconception: "rev-percent-of-new" },
      { value: mul(inc, frac(1, 5)), misconception: "rev-gave-change" },
    ]),
    answerHelp: HELP_MONEY,
    hints: [`The price with VAT is 120% of the price without VAT.`, `120% = ${money(inc)}. Divide by 1.2 (or find 10% by dividing by 12).`],
    solution: [`120% = ${money(inc)}.`, `${money(inc)} ÷ 1.2 = ${money(ex)}`, `Without VAT: ${money(ex)}`],
  };
}

const reverse: Gen = (r, tier) => (tier === 2 && r.next() < 0.25 ? vat(r) : reversePercent(r, tier));

// ================================================================ simple interest

function simpleInterest(r: Rng, tier: number): Q {
  const P = frac(r.int(2, 40) * 50);
  const rate = tier === 1 ? r.pick([2, 3, 4, 5, 10]) : r.pick([1.5, 2, 2.5, 3, 4, 5, 6]);
  const years = r.int(2, tier === 1 ? 5 : 8);
  const R = rate === 1.5 ? frac(3, 2) : rate === 2.5 ? frac(5, 2) : frac(rate);
  const oneYear = mul(P, div(R, frac(100)));
  const I = mul(oneYear, frac(years));
  const total = add(P, I);
  const who = name(r);
  const compound = mul(P, frac((100 * R.d + R.n) ** years, (100 * R.d) ** years));
  const kind = tier === 1 ? r.pick(["interest", "total"] as const) : r.pick(["interest", "total", "rate", "years"] as const);
  const rateText = `${showDec(R)}%`;
  if (kind === "rate") {
    return {
      prompt: `${who} invests ${money(P)} in a savings account that pays simple interest. After ${years} years, ${who} has earned ${money(I)} interest. What is the rate of interest per year?`,
      answer: decAnswer(R),
      answerText: rateText,
      wrongAnswers: clean(R, [{ value: mul(R, frac(years)), misconception: "si-forgot-years" }]),
      answerHelp: "Type the percentage, like 3 or 2.5. The % sign is fine.",
      hints: [`Interest for 1 year: ${money(I)} ÷ ${years} = ${money(oneYear)}.`, `What percentage of ${money(P)} is ${money(oneYear)}? Divide, then × 100.`],
      solution: [`One year's interest: ${money(I)} ÷ ${years} = ${money(oneYear)}.`, `${money(oneYear)} ÷ ${money(P)} × 100 = ${showDec(R)}.`, `${rateText} per year`],
    };
  }
  if (kind === "years") {
    return {
      prompt: `${who} invests ${money(P)} at ${rateText} simple interest per year. How many years will it take to earn ${money(I)} interest?`,
      answer: intAnswer(years),
      wrongAnswers: [],
      answerHelp: HELP_WHOLE,
      hints: [`Interest for 1 year: ${rateText} of ${money(P)}.`, `How many lots of ${money(oneYear)} make ${money(I)}?`],
      solution: [`${rateText} of ${money(P)} = ${money(oneYear)} per year.`, `${money(I)} ÷ ${money(oneYear)} = ${years}`, `${years} years`],
    };
  }
  const askTotal = kind === "total";
  const a = askTotal ? total : I;
  return {
    prompt: `${who} puts ${money(P)} in a bank account that pays ${rateText} simple interest per year. ${askTotal ? `How much is in the account after ${years} years?` : `How much interest does ${who} earn in ${years} years?`}`,
    ...moneyQ(a),
    wrongAnswers: clean(a, [
      { value: askTotal ? I : total, misconception: askTotal ? "si-interest-only" : "si-gave-total" },
      { value: askTotal ? add(P, oneYear) : oneYear, misconception: "si-one-year" },
      ...(mul(compound, frac(100)).d === 1 ? [{ value: askTotal ? compound : sub(compound, P), misconception: "si-used-compound" }] : []),
    ]),
    answerHelp: HELP_MONEY,
    hints: [`Simple interest is the same every year: ${rateText} of ${money(P)}.`, `One year: ${money(oneYear)}. Multiply by ${years}${askTotal ? ", then add it to the money you started with" : ""}.`],
    solution: [
      `One year's interest: ${rateText} of ${money(P)} = ${money(oneYear)}.`,
      `${years} years: ${money(oneYear)} × ${years} = ${money(I)}.`,
      askTotal ? `Total: ${money(P)} + ${money(I)} = ${money(total)}` : `Interest: ${money(I)}`,
    ],
  };
}

const simple: Gen = (r, tier) => simpleInterest(r, tier);

// ================================================================ compound interest and depreciation

const pow = (f: Fraction, n: number): Fraction => {
  let out = frac(1);
  for (let i = 0; i < n; i++) out = mul(out, f);
  return out;
};

function compoundValue(r: Rng, tier: number): Q {
  const grow = tier === 1 || r.next() < 0.6;
  const P = tier === 1 ? frac(r.int(2, 20) * 100) : frac(r.int(10, 200) * 50);
  const rate = tier === 1 ? r.pick([10, 5, 20]) : grow ? r.pick([2, 3, 4, 5, 6, 1.5, 2.5, 3.5]) : r.pick([10, 12, 15, 20, 25]);
  const n = tier === 1 ? 2 : r.int(2, 5);
  const R = Number.isInteger(rate) ? frac(rate) : frac(rate * 2, 2);
  const m = grow ? add(frac(1), div(R, frac(100))) : sub(frac(1), div(R, frac(100)));
  const exact = mul(P, pow(m, n));
  const value = roundDp(exact, 2);
  const simpleV = grow ? add(P, mul(P, mul(div(R, frac(100)), frac(n)))) : sub(P, mul(P, mul(div(R, frac(100)), frac(n))));
  const oneLess = roundDp(mul(P, pow(m, n - 1)), 2);
  const wrongWay = roundDp(mul(P, pow(grow ? sub(frac(1), div(R, frac(100))) : add(frac(1), div(R, frac(100))), n)), 2);
  const mText = showDec(m);
  const rateText = `${showDec(R)}%`;
  const ctx = grow
    ? r.pick([`${name(r)} invests ${money(P)} in an account paying ${rateText} compound interest per year.`, `A savings account pays ${rateText} compound interest per year. ${money(P)} is put in it.`])
    : r.pick([`A car is bought for ${money(P)}. It loses ${rateText} of its value each year (depreciation).`, `A laptop costs ${money(P)}. Its value falls by ${rateText} each year.`]);
  const steps: string[] = [];
  let v = P;
  for (let i = 1; i <= Math.min(n, 2); i++) {
    const nv = mul(v, m);
    steps.push(`Year ${i}: ${money(roundDp(v, 2))} × ${mText} = ${money(roundDp(nv, 2))}`);
    v = nv;
  }
  return {
    prompt: `${ctx} ${grow ? "How much will be in the account" : "What will it be worth"} after ${n} years? ${value.d === 1 || exact.d === value.d ? "" : "Give your answer to the nearest penny."}`.trim(),
    answer: { kind: "decimal", exact: exact.n / exact.d, dp: 2, strict: true },
    answerText: money(value),
    wrongAnswers: clean(value, [
      { value: simpleV, misconception: "comp-used-simple" },
      { value: wrongWay, misconception: "comp-wrong-multiplier" },
      { value: oneLess, misconception: "comp-years-off" },
    ]),
    answerHelp: HELP_PENNY,
    hints: [
      `Each year the amount is multiplied by the same number. ${grow ? "Up" : "Down"} ${rateText} means × ${mText}.`,
      `Multiply by ${mText} once for each year: ${money(P)} × ${mText}${sup(n)}. On a calculator, use the power button (x^y).`,
    ],
    solution: [
      `Multiplier: 100% ${grow ? "+" : "−"} ${rateText} = ${showDec(add(frac(100), grow ? R : frac(-R.n, R.d)))}% = ${mText}.`,
      ...(n === 2 ? steps : [`${money(P)} × ${mText}${sup(n)} = ${showDec(roundDp(exact, 4))}...`]),
      `After ${n} years: ${money(value)}`,
    ],
  };
}

function compoundChoice(r: Rng): Q {
  const P = r.int(5, 40) * 100;
  const rate = r.int(2, 9);
  const n = r.int(3, 6);
  const grow = r.next() < 0.6;
  const m = grow ? `1.0${rate}` : `0.9${10 - rate}`;
  const right = `${P} × ${m}${sup(n)}`;
  return choiceQ(
    r,
    right,
    [
      { text: `${P} × ${grow ? `0.0${rate}` : `0.0${rate}`}${sup(n)}`, mc: "comp-multiplier-change-only" },
      { text: `${P} × ${m} × ${n}`, mc: "comp-used-simple" },
      { text: `${P} × ${grow ? `0.9${10 - rate}` : `1.0${rate}`}${sup(n)}`, mc: "comp-wrong-multiplier" },
    ],
    {
      prompt: grow
        ? `£${P} is invested at ${rate}% compound interest per year. Which calculation gives the amount after ${n} years?`
        : `A machine worth £${P} loses ${rate}% of its value every year. Which calculation gives its value after ${n} years?`,
      hints: [`${grow ? "Up" : "Down"} ${rate}% each year means multiply by ${m} each year.`, `Multiplying by ${m} ${n} times is the same as × ${m}${sup(n)}.`],
      solution: [`Multiplier: 100% ${grow ? "+" : "−"} ${rate}% = ${grow ? 100 + rate : 100 - rate}% = ${m}.`, `${n} years means multiply by ${m} ${n} times.`, right],
    },
  );
}

const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) => String(n).split("").map((d) => SUPS[Number(d)]).join("");

function multiplier(r: Rng): Q {
  const up = r.next() < 0.5;
  const p = r.pick([3, 4, 6, 7, 12, 15, 2.5, 35]);
  const P = Number.isInteger(p) ? frac(p) : frac(p * 2, 2);
  const m = up ? add(frac(1), div(P, frac(100))) : sub(frac(1), div(P, frac(100)));
  return {
    prompt: `What decimal multiplier would you use for a ${showDec(P)}% ${up ? "increase" : "decrease"}?`,
    answer: decAnswer(m),
    wrongAnswers: clean(m, [
      { value: div(P, frac(100)), misconception: "comp-multiplier-change-only" },
      { value: up ? sub(frac(1), div(P, frac(100))) : add(frac(1), div(P, frac(100))), misconception: "comp-wrong-multiplier" },
      ...(p < 10 && Number.isInteger(p) ? [{ value: add(frac(1), frac(p, 10)), misconception: "comp-multiplier-place" }] : []),
    ]),
    answerHelp: "Type a decimal, like 1.05.",
    hints: [`Start from 100% and ${up ? "add" : "take away"} ${showDec(P)}%.`, `${up ? 100 + p : 100 - p}% as a decimal: divide by 100.`],
    solution: [`100% ${up ? "+" : "−"} ${showDec(P)}% = ${showDec(add(frac(100), up ? P : frac(-P.n, P.d)))}%.`, `÷ 100 to make it a decimal.`, `Multiplier: ${showDec(m)}`],
  };
}

const compound: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.7 ? compoundValue(r, 1) : multiplier(r);
  const k = r.pick(["value", "value", "value", "choice", "multiplier"] as const);
  if (k === "value") return compoundValue(r, 2);
  if (k === "choice") return compoundChoice(r);
  return multiplier(r);
};

// ================================================================ speed, distance, time

/** Times that are a whole number of minutes and simple hours: 15, 20, 30, 45 min, 1 h 30 min... */
const TIME_MINS = [15, 20, 30, 40, 45, 75, 90, 120, 150, 180] as const;

function speed(r: Rng, tier: number): Q {
  const unit = r.pick([
    { d: "km", s: "km/h" },
    { d: "miles", s: "mph" },
  ]);
  const kind = tier === 1 ? r.pick(["speed", "distance", "time"] as const) : r.pick(["speed", "distance", "time", "minutes", "average"] as const);
  const mins = r.pick(TIME_MINS);
  const hrs = simplify(frac(mins, 60));
  const vChoices = [12, 20, 24, 30, 36, 40, 48, 50, 60, 64, 70, 80].filter((v) => mul(frac(v), hrs).d === 1);
  const v = r.pick(vChoices);
  const d = mul(frac(v), hrs).n;
  const t = hoursText(mins);
  if (kind === "speed") {
    return {
      prompt: `${v >= 30 ? "A car" : "A cyclist"} travels ${d} ${unit.d} in ${t}. What is the average speed in ${unit.s}?`,
      answer: intAnswer(v),
      wrongAnswers: clean(v, [
        { value: frac(d, mins), misconception: "spd-minutes-not-hours" },
        { value: d * mins, misconception: "spd-multiplied" },
        ...(mins > 60 && mins % 60 !== 0 ? [{ value: frac(d * 100, Math.floor(mins / 60) * 100 + (mins % 60)), misconception: "time-decimal-hours" }] : []),
      ]),
      answerHelp: `Type a number. The units (${unit.s}) are fine but not needed.`,
      hints: [`Speed = distance ÷ time, with the time in hours.`, `${t} = ${num(hrs)} hours. Work out ${d} ÷ ${num(hrs)}.`],
      solution: [`Time in hours: ${t} = ${num(hrs)} hours.`, `Speed = ${d} ÷ ${num(hrs)} = ${v}`, `${v} ${unit.s}`],
    };
  }
  if (kind === "distance") {
    return {
      prompt: `${v >= 30 ? "A van drives" : "A cyclist rides"} at a steady ${v} ${unit.s} for ${t}. How far does it go, in ${unit.d}?`,
      answer: intAnswer(d),
      wrongAnswers: clean(d, [
        { value: v * mins, misconception: "spd-minutes-not-hours" },
        { value: frac(v, mins), misconception: "spd-divided" },
        ...(mins < 60 ? [{ value: mul(frac(v), frac(mins, 100)), misconception: "time-decimal-hours" }] : []),
      ]),
      answerHelp: HELP_DEC,
      hints: [`Distance = speed × time, with the time in hours.`, `${t} = ${num(hrs)} hours. Work out ${v} × ${num(hrs)}.`],
      solution: [`Time in hours: ${t} = ${num(hrs)} hours.`, `Distance = ${v} × ${num(hrs)} = ${d}`, `${d} ${unit.d}`],
    };
  }
  if (kind === "time" || kind === "minutes") {
    const askMinutes = kind === "minutes" || mins % 60 !== 0;
    const ans = askMinutes ? mins : mins / 60;
    return {
      prompt: `A train travels ${d} ${unit.d} at an average speed of ${v} ${unit.s}. How long does the journey take, in ${askMinutes ? "minutes" : "hours"}?`,
      answer: intAnswer(ans),
      wrongAnswers: clean(ans, [
        ...(askMinutes ? [{ value: hrs, misconception: "spd-hours-not-minutes" }] : []),
        { value: d * v, misconception: "spd-multiplied" },
        { value: frac(v, d), misconception: "spd-divided" },
      ]),
      answerHelp: askMinutes ? "Type a number of minutes." : "Type a number of hours.",
      hints: [`Time = distance ÷ speed.`, `${d} ÷ ${v} gives the time in hours.${askMinutes ? " Then × 60 for minutes." : ""}`],
      solution: [`Time = ${d} ÷ ${v} = ${num(hrs)} hours.`, askMinutes ? `${num(hrs)} × 60 = ${mins} minutes.` : `That's ${mins / 60} hours.`, `${ans} ${askMinutes ? "minutes" : "hours"}`],
    };
  }
  // Average speed over two parts.
  const m2 = r.pick(TIME_MINS.filter((x) => x <= 90));
  const total = mins + m2;
  const totalH = frac(total, 60);
  const v2Choices = vChoices.filter((x) => mul(frac(x), frac(m2, 60)).d === 1 && x !== v);
  if (v2Choices.length === 0) return speed(r, tier);
  const v2 = r.pick(v2Choices);
  const d2 = mul(frac(v2), frac(m2, 60)).n;
  const avg = div(frac(d + d2), totalH);
  if (avg.d !== 1) return speed(r, tier);
  return {
    prompt: `${cap(name(r))} drives ${d} ${unit.d} in ${t}, then stops for no time at all and drives another ${d2} ${unit.d} in ${hoursText(m2)}. What is the average speed for the whole journey, in ${unit.s}?`,
    answer: intAnswer(avg.n),
    wrongAnswers: clean(avg, [{ value: frac(v + v2, 2), misconception: "spd-averaged-speeds" }]),
    answerHelp: HELP_WHOLE,
    hints: [`Average speed = total distance ÷ total time. Don't average the two speeds.`, `Total distance ${d + d2} ${unit.d}; total time ${hoursText(total)}.`],
    solution: [`Total distance: ${d} + ${d2} = ${d + d2} ${unit.d}. Total time: ${hoursText(total)} = ${num(totalH)} hours.`, `${d + d2} ÷ ${num(totalH)} = ${avg.n}`, `${avg.n} ${unit.s}`],
  };
}

const speedGen: Gen = (r, tier) => speed(r, tier);

// ================================================================ distance-time graphs

interface Journey {
  pts: [number, number][];
  /** Speeds in km/h of each segment (0 for a stop). */
  speeds: number[];
  graph: GraphSpec;
}

function journey(r: Rng): Journey {
  // Segment lengths in minutes, multiples of 10 or 15, and km chosen so speeds are whole km/h.
  const t1 = r.pick([20, 30, 40, 60]);
  const v1 = r.pick([12, 15, 18, 24, 30, 36].filter((v) => (v * t1) % 60 === 0));
  const d1 = (v1 * t1) / 60;
  const stop = r.pick([10, 15, 20, 30]);
  const t3 = r.pick([20, 30, 40, 60].filter((t) => t !== t1));
  // Either carry on further, or come home.
  const home = r.next() < 0.5;
  let d3: number;
  if (home) d3 = 0;
  else {
    const extra = r.pick([6, 8, 10, 12, 15].filter((e) => (e * 60) % t3 === 0));
    d3 = d1 + (extra ?? 6);
  }
  const t4 = r.pick([30, 40, 60]);
  const pts: [number, number][] = [
    [0, 0],
    [t1, d1],
    [t1 + stop, d1],
    [t1 + stop + t3, d3],
  ];
  if (!home) pts.push([t1 + stop + t3 + t4, 0]);
  // Every moving part needs a whole-number speed; otherwise pick again.
  if (pts.slice(1).some((p, i) => ((Math.abs(p[1] - pts[i][1]) * 60) % (p[0] - pts[i][0])) !== 0)) return journey(r);
  const speeds = pts.slice(1).map((p, i) => Math.abs(p[1] - pts[i][1]) / ((p[0] - pts[i][0]) / 60));
  const maxT = pts[pts.length - 1][0];
  const maxD = Math.max(...pts.map((p) => p[1]));
  const yMax = Math.ceil((maxD + 2) / 4) * 4;
  const xMax = Math.ceil(maxT / 20) * 20;
  const letters = ["A", "B", "C", "D"];
  const graph: GraphSpec = {
    x: { min: 0, max: xMax, step: 10, labelStep: 20, label: "Time (minutes)" },
    y: { min: 0, max: yMax, step: yMax > 24 ? 4 : 2, labelStep: yMax > 24 ? 8 : 4, label: "Distance from home (km)" },
    curves: pts.slice(1).map((p, i) => ({ points: [pts[i], p] as [number, number][], label: { text: letters[i], at: [(pts[i][0] + p[0]) / 2, (pts[i][1] + p[1]) / 2 + yMax / 14] as [number, number] } })),
    description: `Distance-time graph. ${pts.slice(1).map((p, i) => `Part ${letters[i]}: from ${pts[i][0]} minutes at ${pts[i][1]} km to ${p[0]} minutes at ${p[1]} km`).join(". ")}.`,
  };
  return { pts, speeds, graph };
}

const dtGraphs: Gen = (r, tier) => {
  const J = journey(r);
  const { pts, speeds, graph } = J;
  const letters = ["A", "B", "C", "D"];
  const who = name(r);
  const kind = tier === 1 ? r.pick(["far", "stop", "speed1"] as const) : r.pick(["speed1", "speedN", "fastest", "stop", "far"] as const);
  const visual = { kind: "graph" as const, graph };
  const intro = `The graph shows ${who}'s bike ride.`;
  if (kind === "far") {
    const far = Math.max(...pts.map((p) => p[1]));
    const at = pts.find((p) => p[1] === far)!;
    return {
      prompt: `${intro} What is the furthest ${who} gets from home, in km?`,
      visual,
      answer: intAnswer(far),
      wrongAnswers: clean(far, [{ value: at[0], misconception: "dt-read-wrong-axis" }]),
      answerHelp: "Type a number of kilometres.",
      hints: [`Distance from home is on the vertical axis.`, `Find the highest point of the graph and read across to the distance axis.`],
      solution: [`The highest point is at ${at[0]} minutes.`, `Reading across, it is at ${far} km.`, `${far} km`],
    };
  }
  if (kind === "stop") {
    const len = pts[2][0] - pts[1][0];
    return {
      prompt: `${intro} For how many minutes does ${who} stop?`,
      visual,
      answer: intAnswer(len),
      wrongAnswers: clean(len, [{ value: pts[2][0], misconception: "dt-read-point-not-gap" }, { value: pts[1][1], misconception: "dt-read-wrong-axis" }]),
      answerHelp: "Type a number of minutes.",
      hints: [`When ${who} stops, the distance doesn't change, so the line is flat.`, `Part B is flat. Read the time where it starts and where it ends.`],
      solution: [`The flat part (B) goes from ${pts[1][0]} to ${pts[2][0]} minutes.`, `${pts[2][0]} − ${pts[1][0]} = ${len}`, `${len} minutes`],
    };
  }
  if (kind === "fastest") {
    const moving = speeds.map((s, i) => ({ s, i })).filter((x) => x.s > 0);
    const best = moving.reduce((a, b) => (b.s > a.s ? b : a));
    if (moving.filter((x) => x.s === best.s).length > 1) return dtGraphs(r, 1);
    const longest = moving.reduce((a, b) => (pts[b.i + 1][0] - pts[b.i][0] > pts[a.i + 1][0] - pts[a.i][0] ? b : a));
    return choiceQ(
      r,
      `Part ${letters[best.i]}`,
      speeds.map((_, i) => ({ text: `Part ${letters[i]}`, mc: i === longest.i ? "dt-longest-not-steepest" : speeds[i] === 0 ? "dt-flat-fast" : undefined })),
      {
        prompt: `${intro} In which part of the ride is ${who} travelling fastest?`,
        visual,
        hints: [`On a distance-time graph, the steeper the line, the faster the speed.`, `A flat line means stopped. Look for the steepest line, going up or down.`],
        solution: [moving.map((m) => `Part ${letters[m.i]}: ${m.s} km/h`).join(", ") + ".", `The steepest line is part ${letters[best.i]}.`, `Part ${letters[best.i]}`],
      },
      true,
    );
  }
  const i = kind === "speed1" ? 0 : speeds.length - 1;
  const p0 = pts[i];
  const p1 = pts[i + 1];
  const dist = Math.abs(p1[1] - p0[1]);
  const mins = p1[0] - p0[0];
  const v = speeds[i];
  return {
    prompt: `${intro} What is ${who}'s speed in part ${letters[i]}, in km/h?`,
    visual,
    answer: intAnswer(v),
    wrongAnswers: clean(v, [
      { value: frac(dist, mins), misconception: "spd-minutes-not-hours" },
      { value: dist, misconception: "dt-gave-distance" },
    ]),
    answerHelp: "Type a number. km/h is fine but not needed.",
    hints: [`Part ${letters[i]} goes from ${p0[0]} to ${p1[0]} minutes, and from ${p0[1]} km to ${p1[1]} km.`, `Speed = distance ÷ time in hours. ${mins} minutes = ${mins === 60 ? "1 hour" : `${num(simplify(frac(mins, 60)))} hours`}.`],
    solution: [`Distance: ${dist} km. Time: ${mins} minutes = ${mins === 60 ? "1 hour" : `${num(simplify(frac(mins, 60)))} hours`}.`, `${dist} ÷ ${num(simplify(frac(mins, 60)))} = ${v}`, `${v} km/h`],
  };
};

// ================================================================ density and pressure

const MATERIALS = [
  { m: "a block of wood", d: dec(6, 1) },
  { m: "a piece of aluminium", d: dec(27, 1) },
  { m: "a lump of iron", d: dec(79, 1) },
  { m: "a glass paperweight", d: dec(25, 1) },
  { m: "a copper bar", d: dec(9, 0) },
  { m: "a plastic toy", d: dec(12, 1) },
] as const;

function density(r: Rng, tier: number): Q {
  const mat = r.pick(MATERIALS);
  const V = r.int(2, 30) * 10;
  const M = mul(mat.d, frac(V));
  const kind = tier === 1 ? r.pick(["density", "mass", "pressure"] as const) : r.pick(["density", "mass", "volume", "pressure", "force", "cuboid"] as const);
  if (kind === "density") {
    return {
      prompt: `${cap(mat.m)} has a mass of ${num(M)} g and a volume of ${V} cm³. Work out its density in g/cm³.`,
      answer: decAnswer(mat.d),
      wrongAnswers: clean(mat.d, [
        { value: mul(M, frac(V)), misconception: "dens-multiplied" },
        { value: div(frac(V), M), misconception: "dens-upside-down" },
      ]),
      answerHelp: "Type a number. Decimals are fine, like 2.7. Units aren't needed.",
      hints: [`Density = mass ÷ volume.`, `${num(M)} ÷ ${V}.`],
      solution: [`Density = mass ÷ volume.`, `${num(M)} ÷ ${V} = ${num(mat.d)}`, `${num(mat.d)} g/cm³`],
    };
  }
  if (kind === "mass") {
    return {
      prompt: `${cap(mat.m)} has a density of ${num(mat.d)} g/cm³ and a volume of ${V} cm³. Work out its mass in grams.`,
      answer: decAnswer(M),
      wrongAnswers: clean(M, [{ value: div(frac(V), mat.d), misconception: "dens-divided" }, { value: div(mat.d, frac(V)), misconception: "dens-divided" }]),
      answerHelp: HELP_DEC,
      hints: [`Mass = density × volume.`, `${num(mat.d)} × ${V}.`],
      solution: [`Mass = density × volume.`, `${num(mat.d)} × ${V} = ${num(M)}`, `${num(M)} g`],
    };
  }
  if (kind === "volume") {
    return {
      prompt: `${cap(mat.m)} has a mass of ${num(M)} g. Its density is ${num(mat.d)} g/cm³. Work out its volume in cm³.`,
      answer: decAnswer(frac(V)),
      wrongAnswers: clean(V, [{ value: mul(M, mat.d), misconception: "dens-multiplied" }]),
      answerHelp: HELP_DEC,
      hints: [`Volume = mass ÷ density.`, `${num(M)} ÷ ${num(mat.d)}.`],
      solution: [`Volume = mass ÷ density.`, `${num(M)} ÷ ${num(mat.d)} = ${V}`, `${V} cm³`],
    };
  }
  if (kind === "cuboid") {
    const [a, b, c] = [r.int(2, 8), r.int(2, 6), r.int(1, 5)];
    const vol = a * b * c;
    const mass = mul(mat.d, frac(vol));
    return {
      prompt: `A cuboid measures ${a} cm by ${b} cm by ${c} cm. It is made of a material with density ${num(mat.d)} g/cm³. Work out its mass in grams.`,
      answer: decAnswer(mass),
      wrongAnswers: clean(mass, [{ value: frac(vol), misconception: "dens-forgot-density" }, { value: div(frac(vol), mat.d), misconception: "dens-divided" }]),
      answerHelp: HELP_DEC,
      hints: [`Find the volume first: length × width × height.`, `Volume = ${vol} cm³. Mass = density × volume.`],
      solution: [`Volume = ${a} × ${b} × ${c} = ${vol} cm³.`, `Mass = ${num(mat.d)} × ${vol} = ${num(mass)}`, `${num(mass)} g`],
    };
  }
  const A = r.int(2, 12);
  const P = r.int(3, 40) * 5;
  const F = A * P;
  const ctx = r.pick(["A box rests on the floor.", "A statue stands on a plinth.", "A crate sits on a trailer."]);
  if (kind === "force") {
    return {
      prompt: `${ctx} The area touching the surface is ${A} m², and the pressure is ${P} N/m². Work out the force, in newtons.`,
      answer: intAnswer(F),
      wrongAnswers: clean(F, [{ value: frac(P, A), misconception: "dens-divided" }]),
      answerHelp: "Type a number of newtons.",
      hints: [`Pressure = force ÷ area, so force = pressure × area.`, `${P} × ${A}.`],
      solution: [`Force = pressure × area.`, `${P} × ${A} = ${F}`, `${F} N`],
    };
  }
  return {
    prompt: `${ctx} It pushes down with a force of ${F} N on an area of ${A} m². Work out the pressure in N/m².`,
    answer: intAnswer(P),
    wrongAnswers: clean(P, [{ value: F * A, misconception: "dens-multiplied" }, { value: frac(A, F), misconception: "dens-upside-down" }]),
    answerHelp: "Type a number. N/m² is fine but not needed.",
    hints: [`Pressure = force ÷ area.`, `${F} ÷ ${A}.`],
    solution: [`Pressure = force ÷ area.`, `${F} ÷ ${A} = ${P}`, `${P} N/m²`],
  };
}

const densityGen: Gen = (r, tier) => density(r, tier);

// ================================================================ converting compound units

function convertCompound(r: Rng, tier: number): Q {
  const kind = tier === 1 ? r.pick(["kmh-ms", "ms-kmh", "per-min-hour"] as const) : r.pick(["kmh-ms", "ms-kmh", "per-min-hour", "price", "density"] as const);
  if (kind === "kmh-ms") {
    const k = r.int(1, 8);
    const kmh = 18 * k;
    const ms = 5 * k;
    return {
      prompt: `Change ${kmh} km/h into m/s.`,
      answer: intAnswer(ms),
      wrongAnswers: clean(ms, [
        { value: kmh * 1000, misconception: "ccu-one-step" },
        { value: frac(kmh, 3600), misconception: "ccu-one-step" },
        { value: frac(kmh * 1000, 60), misconception: "ccu-wrong-time" },
        { value: frac(kmh * 36, 10), misconception: "ccu-wrong-way" },
      ]),
      answerHelp: "Type a number. m/s is fine but not needed.",
      hints: [`Change the distance: ${kmh} km = ${kmh * 1000} m, so it's ${kmh * 1000} metres per hour.`, `Change the time: 1 hour = 3600 seconds, so divide by 3600.`],
      solution: [`${kmh} km/h = ${big(kmh * 1000)} m per hour.`, `${big(kmh * 1000)} ÷ 3600 = ${ms} m per second.`, `${ms} m/s`],
    };
  }
  if (kind === "ms-kmh") {
    const k = r.int(1, 10);
    const ms = 5 * k;
    const kmh = 18 * k;
    return {
      prompt: `${ms >= 25 ? "A cheetah runs" : ms >= 10 ? "A cyclist rides" : "A runner jogs"} at ${ms} m/s. What is this in km/h?`,
      answer: intAnswer(kmh),
      wrongAnswers: clean(kmh, [
        { value: frac(ms * 10, 36), misconception: "ccu-wrong-way" },
        { value: ms * 3600, misconception: "ccu-one-step" },
        { value: frac(ms * 60, 1000), misconception: "ccu-wrong-time" },
      ]),
      answerHelp: "Type a number. km/h is fine but not needed.",
      hints: [`In 1 hour there are 3600 seconds, so in an hour it runs ${ms} × 3600 metres.`, `Then change metres to km: ÷ 1000.`],
      solution: [`${ms} m/s × 3600 = ${big(ms * 3600)} m per hour.`, `${big(ms * 3600)} ÷ 1000 = ${kmh} km per hour.`, `${kmh} km/h`],
    };
  }
  if (kind === "per-min-hour") {
    const toHour = r.next() < 0.6;
    const ctx = r.pick([
      { u: "litres", w: "A tap lets out" },
      { u: "pages", w: "A printer prints" },
      { u: "words", w: "A reporter types" },
    ]);
    if (toHour) {
      const perMin = r.int(4, 45);
      return {
        prompt: `${ctx.w} ${perMin} ${ctx.u} per minute. How many ${ctx.u} is that per hour?`,
        answer: intAnswer(perMin * 60),
        wrongAnswers: clean(perMin * 60, [{ value: perMin * 100, misconception: "time-hundred-minutes" }, { value: frac(perMin, 60), misconception: "ccu-wrong-way" }]),
        answerHelp: HELP_WHOLE,
        hints: [`There are 60 minutes in an hour.`, `${perMin} × 60.`],
        solution: [`1 hour = 60 minutes.`, `${perMin} × 60 = ${perMin * 60}`, `${perMin * 60} ${ctx.u} per hour`],
      };
    }
    const perMin = r.int(3, 30);
    return {
      prompt: `${ctx.w} ${perMin * 60} ${ctx.u} per hour. How many ${ctx.u} is that per minute?`,
      answer: intAnswer(perMin),
      wrongAnswers: clean(perMin, [{ value: perMin * 3600, misconception: "ccu-wrong-way" }, { value: frac(perMin * 60, 100), misconception: "time-hundred-minutes" }]),
      answerHelp: HELP_WHOLE,
      hints: [`There are 60 minutes in an hour, so there are fewer ${ctx.u} in a minute.`, `${perMin * 60} ÷ 60.`],
      solution: [`1 hour = 60 minutes.`, `${perMin * 60} ÷ 60 = ${perMin}`, `${perMin} ${ctx.u} per minute`],
    };
  }
  if (kind === "price") {
    const pence = r.int(12, 99) * 10; // per kg
    const perG = dec(pence, 3);
    return {
      prompt: `Cheese costs ${money(dec(pence, 2))} per kg. What is this in pence per gram?`,
      answer: decAnswer(perG),
      wrongAnswers: clean(perG, [
        { value: frac(pence), misconception: "ccu-one-step" },
        { value: dec(pence, 5), misconception: "ccu-one-step" },
      ]),
      answerHelp: "Type a number of pence. Decimals are fine, like 0.85.",
      hints: [`Change pounds to pence: ${money(dec(pence, 2))} = ${pence}p per kg.`, `1 kg = 1000 g, so divide by 1000.`],
      solution: [`${money(dec(pence, 2))} per kg = ${pence}p per kg.`, `${pence} ÷ 1000 = ${showDec(perG)}`, `${showDec(perG)}p per gram`],
    };
  }
  const g = dec(r.int(5, 120), 1); // g/cm³
  const kg = mul(g, frac(1000));
  return {
    prompt: `A metal has a density of ${num(g)} g/cm³. What is this in kg/m³?`,
    answer: decAnswer(kg),
    wrongAnswers: clean(kg, [
      { value: div(g, frac(1000)), misconception: "ccu-wrong-way" },
      { value: mul(g, frac(1000000)), misconception: "ccu-one-step" },
    ]),
    answerHelp: HELP_DEC,
    hints: [`1 m³ = 100 × 100 × 100 = 1,000,000 cm³, so a cubic metre weighs ${num(g)} × 1,000,000 g.`, `Then change grams to kg: ÷ 1000. Altogether that's × 1000.`],
    solution: [`1 m³ = 1,000,000 cm³, so 1 m³ has a mass of ${num(g)} × 1,000,000 g.`, `÷ 1000 to change g to kg: ${num(g)} × 1000 = ${num(kg)}.`, `${num(kg)} kg/m³`],
  };
}

const compoundUnits: Gen = (r, tier) => convertCompound(r, tier);


export const PROPORTION_GENERATORS: Record<string, Gen> = {
  "ratio-scale-maps": scaleMaps,
  "ratio-unit-rates": unitRates,
  "ratio-inverse-proportion": inverseProportion,
  "pct-reverse": reverse,
  "pct-simple-interest": simple,
  "pct-compound": compound,
  "ratio-speed": speedGen,
  "ratio-distance-time-graphs": dtGraphs,
  "ratio-density-pressure": densityGen,
  "ratio-convert-compound-units": compoundUnits,
};

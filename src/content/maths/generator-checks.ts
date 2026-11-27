/**
 * Shared checks for question generators (used by tests only): every answer
 * as written is marked correct, every predicted wrong answer is caught with
 * its misconception, and the text has no glitches like "undefined" or "1x".
 */
import { expect } from "vitest";
import { parseExpression, polyEquals } from "@/engine/algebra";
import { parseFormula, sameFormula, showInterval } from "@/engine/equations";
import { frac } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import { makeQuestion, questionFromId } from "@/content/questions";
import { MISCONCEPTIONS } from "@/content";
import type { Question } from "@/engine/types";

export const SEEDS = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

const ascii = (s: string) => s.replace(/−/g, "-").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).join("")}`);

function textOk(q: Question) {
  const all = [q.prompt, ...q.hints, ...q.solution, q.answerHelp ?? "", answerText(q)].join(" | ");
  expect(all, q.id).not.toMatch(/undefined|NaN|null|\[object/);
  expect(all, q.id).not.toMatch(/(^|[\s(+−=×-])1[a-z](?![a-z(])/);
  expect(all, q.id).not.toMatch(/\+ −|− −|\+ \+|− \+/);
  expect(all, q.id).not.toMatch(/\b0[a-z]\b/);
}

export function checkQuestion(q: Question) {
  const mc = (id: string) => expect(MISCONCEPTIONS[id], `${q.id}: misconception ${id}`).toBeDefined();
  const a = q.answer;
  expect(q.hints.length, q.id).toBeGreaterThan(0);
  expect(q.solution.length, q.id).toBeGreaterThan(0);
  textOk(q);
  expect(questionFromId(q.id)).toEqual(q);
  const expectWrong = (raw: string, id: string) => {
    const res = markAnswer(q, raw, MISCONCEPTIONS);
    expect(res.correct, `${q.prompt}: wrong answer "${raw}" was marked right`).toBe(false);
    expect(res.misconception, `${q.prompt}: "${raw}" → ${res.feedback}`).toBe(id);
  };
  const expectRight = (raw: string) => expect(markAnswer(q, raw, MISCONCEPTIONS).outcome, `${q.prompt} → ${raw}: ${markAnswer(q, raw, MISCONCEPTIONS).feedback}`).toBe("correct");

  if (a.kind !== "choice") expect(q.answerHelp, q.id).toBeTruthy();
  switch (a.kind) {
    case "expression": {
      const want = parseExpression(a.value);
      expect(want.ok, a.value).toBe(true);
      expectRight(a.value);
      expectRight(ascii(a.value));
      for (const w of q.wrongExpressions ?? []) {
        mc(w.misconception);
        const p = parseExpression(w.value);
        expect(p.ok && want.ok && !polyEquals(p.poly, want.poly), `${q.prompt}: wrong "${w.value}" equals the answer`).toBe(true);
        expectWrong(w.value, w.misconception);
      }
      break;
    }
    case "integer":
      expectRight(String(a.value));
      expectRight(ascii(`x = ${a.value}`));
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        expectWrong(String(w.value), w.misconception);
      }
      break;
    case "choice":
      expect(new Set(a.options).size, `${q.id} options repeat: ${a.options.join(" / ")}`).toBe(a.options.length);
      expectRight(a.options[a.correctIndex]);
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        expect(w.value).not.toBe(a.correctIndex);
        expectWrong(a.options[w.value as number], w.misconception);
      }
      break;
    case "inequality": {
      const shown = showInterval(a.value, a.variable);
      expectRight(shown);
      expectRight(ascii(shown));
      for (const id of [a.inclusiveMisconception, a.directionMisconception, a.equalsMisconception]) if (id) mc(id);
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        const b = a.value.lower ?? a.value.upper!;
        const op = a.value.lower ? (b.inclusive ? "≥" : ">") : b.inclusive ? "≤" : "<";
        expectWrong(`${a.variable} ${op} ${String(w.value).replace("-", "−")}`, w.misconception);
      }
      break;
    }
    case "roots":
      expectRight(answerText(q));
      expectRight(ascii([...a.values].reverse().join(", ")));
      if (a.missingMisconception) mc(a.missingMisconception);
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        expectWrong((w.value as number[]).map((n) => `${a.variable} = ${n}`).join(" or "), w.misconception);
      }
      break;
    case "assignment": {
      expectRight(answerText(q));
      const vars = Object.keys(a.values).sort();
      expectRight(ascii([...vars].reverse().map((v) => `${v}=${a.values[v]}`).join(" ")));
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        expectWrong(vars.map((v, i) => `${v} = ${(w.value as number[])[i]}`).join(", "), w.misconception);
      }
      break;
    }
    case "formula": {
      const want = parseFormula(a.value);
      expect(want, a.value).toBeTruthy();
      expectRight(answerText(q));
      expectRight(ascii(a.value));
      for (const w of q.wrongExpressions ?? []) {
        mc(w.misconception);
        const p = parseFormula(w.value);
        expect(p && !sameFormula(p, want!), `${q.prompt}: wrong "${w.value}" equals the answer`).toBe(true);
        expectWrong(`${a.subject} = ${w.value}`, w.misconception);
      }
      break;
    }
    case "list":
      expectRight(a.value.join(", "));
      for (const w of q.wrongAnswers) {
        mc(w.misconception);
        expectWrong((w.value as number[]).join(", "), w.misconception);
      }
      break;
    default:
      throw new Error(`unexpected answer kind ${a.kind} in ${q.id}`);
  }
  void frac;
}

/** Run every generator over many seeds, and check each misconception is reachable. */
export function checkGenerators(skillIds: string[], misconceptionIds: string[]) {
  const used = new Set<string>();
  for (const skillId of skillIds)
    for (const tier of [1, 2] as const)
      for (const seed of SEEDS) {
        const q = makeQuestion(skillId, tier, seed);
        checkQuestion(q);
        for (const w of [...q.wrongAnswers, ...(q.wrongExpressions ?? [])]) used.add(w.misconception);
        const a = q.answer;
        if (a.kind === "inequality") for (const id of [a.inclusiveMisconception, a.directionMisconception, a.equalsMisconception]) if (id) used.add(id);
        if (a.kind === "roots" && a.missingMisconception) used.add(a.missingMisconception);
        if (a.kind === "list") for (const id of [a.missingMisconception, a.extraMisconception]) if (id) used.add(id);
      }
  for (const id of misconceptionIds) expect(used.has(id), `misconception ${id} is never used`).toBe(true);
}

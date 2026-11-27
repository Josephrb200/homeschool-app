/**
 * Worked steps for finding a percentage of an amount from 10%, 5% and 1%.
 * Shared by the question generators and the interactive percentage bar.
 */

import { frac, mul, type Fraction } from "@/engine/fraction";
import { showDec, showMoney } from "../decimals/dec";

export const pctOf = (p: number, amount: Fraction) => mul(frac(p, 100), amount);

/** Steps to build p% from 10%, 5% and 1% (p a whole number). */
export function buildSteps(p: number, A: Fraction, money: boolean): string[] {
  const fmt = (f: Fraction) => (money ? showMoney(f) : showDec(f));
  const ten = mul(A, frac(1, 10));
  const steps: string[] = [];
  if (p === 50) return [`50% is a half. ${fmt(A)} ÷ 2 = ${fmt(pctOf(50, A))}`];
  if (p === 25) return [`25% is a quarter. ${fmt(A)} ÷ 4 = ${fmt(pctOf(25, A))}`];
  if (p === 75) return [`25% is a quarter: ${fmt(A)} ÷ 4 = ${fmt(pctOf(25, A))}`, `75% is three quarters: 3 × ${fmt(pctOf(25, A))} = ${fmt(pctOf(75, A))}`];
  if (p >= 5) steps.push(`10% of ${fmt(A)} = ${fmt(A)} ÷ 10 = ${fmt(ten)}`);
  const tens = Math.floor(p / 10);
  const rest = p % 10;
  const parts: { pct: number; v: Fraction }[] = [];
  if (tens > 1) {
    steps.push(`${tens * 10}% = ${tens} × ${fmt(ten)} = ${fmt(pctOf(tens * 10, A))}`);
  }
  if (tens > 0) parts.push({ pct: tens * 10, v: pctOf(tens * 10, A) });
  if (rest >= 5) {
    steps.push(`5% = half of 10% = ${fmt(pctOf(5, A))}`);
    parts.push({ pct: 5, v: pctOf(5, A) });
  }
  const ones = rest % 5;
  if (ones > 0) {
    steps.push(`1% of ${fmt(A)} = ${fmt(A)} ÷ 100 = ${fmt(pctOf(1, A))}`);
    if (ones > 1) steps.push(`${ones}% = ${ones} × ${fmt(pctOf(1, A))} = ${fmt(pctOf(ones, A))}`);
    parts.push({ pct: ones, v: pctOf(ones, A) });
  }
  if (parts.length > 1) steps.push(`${p}% = ${parts.map((x) => `${x.pct}%`).join(" + ")} = ${parts.map((x) => fmt(x.v)).join(" + ")} = ${fmt(pctOf(p, A))}`);
  return steps;
}


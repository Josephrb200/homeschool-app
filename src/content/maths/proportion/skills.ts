/**
 * The remaining ratio, proportion and percentage skills (KS3/KS4, GCSE
 * Foundation, DfE R1, R2, R9-R11, R13, R14, R16, G15):
 * scale drawings and maps, unit rates, inverse proportion, reverse
 * percentages, simple and compound interest, and compound measures
 * (speed, distance-time graphs, density, pressure, converting units).
 *
 * Scale and inverse proportion join the "Ratio and proportion" chain; the
 * three percentage skills join "Percentages"; the five compound measure
 * skills make a new chain, "Speed, density and rates".
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Ones not built
 * yet (for example rearranging formulae, real-life graphs) are dropped by the
 * content registry until they go live.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

const skill = (id: string, topic: string, name: string, objective: string, typicalYear: number, prerequisites: string[]): Skill => ({
  id,
  topic,
  name,
  objective,
  typicalYear,
  gcseTier: "foundation",
  prerequisites,
});

/** Join the "Ratio and proportion" chain. */
export const RATIO_EXTRA_SKILLS: Skill[] = [
  skill("ratio-scale-maps", "Ratio", "Scale drawings and map scales", "I can use a scale to find real distances from a map or drawing, and the other way round.", 7, ["ratio-simplify", "num-units"]),
  skill("ratio-inverse-proportion", "Proportion", "Inverse proportion problems", "I can spot inverse proportion (more of one means less of the other) and solve problems with it.", 10, ["ratio-direct-proportion"]),
];

/** Join the "Percentages" chain. */
export const PERCENT_EXTRA_SKILLS: Skill[] = [
  skill("pct-simple-interest", "Percentages", "Simple interest", "I can work out simple interest, and the total in an account after a number of years.", 9, ["pct-of-amount"]),
  skill("pct-reverse", "Percentages", "Reverse percentages (finding the original amount)", "I can find the original amount after a percentage increase or decrease.", 10, ["pct-increase-decrease"]),
  skill("pct-compound", "Percentages", "Compound interest, growth and depreciation", "I can use a multiplier and powers to work out compound interest, growth and depreciation.", 10, ["pct-increase-decrease", "num-powers-roots"]),
];

/** A new chain: "Speed, density and rates". */
export const COMPOUND_MEASURE_SKILLS: Skill[] = [
  skill("ratio-unit-rates", "Compound measures", "Unit pricing and rates of pay", "I can work out rates of pay, prices per item and other rates, and compare value for money.", 8, ["ratio-unitary-method"]),
  skill("ratio-speed", "Compound measures", "Speed, distance and time", "I can use speed = distance ÷ time, change minutes into hours, and find average speed.", 8, ["num-time-money", "alg-rearrange"]),
  skill("ratio-distance-time-graphs", "Compound measures", "Distance-time graphs and gradient as a rate", "I can read a distance-time graph and work out speeds from it.", 9, ["ratio-speed", "alg-real-life-graphs"]),
  skill("ratio-density-pressure", "Compound measures", "Density and pressure", "I can use density = mass ÷ volume and pressure = force ÷ area.", 10, ["ratio-speed"]),
  skill("ratio-convert-compound-units", "Compound measures", "Converting compound units (e.g. km/h to m/s)", "I can change compound units, like km/h into m/s, by converting one part at a time.", 10, ["ratio-speed", "num-units"]),
];

export const ALL_PROPORTION_SKILLS = [...RATIO_EXTRA_SKILLS, ...PERCENT_EXTRA_SKILLS, ...COMPOUND_MEASURE_SKILLS];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, ...(pointsTo ? { pointsTo } : {}) }];

export const PROPORTION_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // scale
  mc("scale-units-not-converted", "Didn't change the units after using the scale", "A map scale like 1 : 25,000 works in the same units on both sides: 1 cm is 25,000 cm. Change cm into m (÷ 100) or km (÷ 100,000) at the end.", "num-units"),
  mc("scale-wrong-way", "Used the scale the wrong way round", "Real life is bigger than the map. Going from map to real life, multiply by the scale. Going from real life to the map, divide."),
  mc("scale-added", "Added the scale instead of multiplying", "Every 1 cm on the drawing stands for the same real length, so multiply the drawing length by it."),
  // rates
  mc("rate-added", "Added instead of multiplying", "The rate is for each hour. For several hours, multiply the rate by the number of hours."),
  mc("rate-overtime-normal", "Paid the extra hours at the normal rate", "Overtime at 'time and a half' is 1.5 times the normal rate. Work out the normal hours and the overtime hours separately."),
  mc("rate-half-wrong", "Added 50p instead of half the rate", "Time and a half means the normal rate plus half of it, so multiply the rate by 1.5. It isn't the rate plus 50p."),
  mc("rate-pounds-pence", "Gave the answer in pounds, not pence", "The question asks for pence. £0.45 = 45p: multiply pounds by 100."),
  mc("rate-upside-down", "Divided the wrong way round", "'Per minute' means divide by the number of minutes: amount ÷ time."),
  mc("rate-multiplied-by-rate", "Multiplied instead of dividing", "To find how long, divide the total amount by the rate per minute."),
  // inverse proportion
  mc("invp-treated-as-direct", "Treated inverse proportion like direct proportion", "Here, more of one means less of the other. More workers finish faster. Multiply to find the total (workers × time), then divide.", "ratio-direct-proportion"),
  mc("invp-added", "Added or took away instead of multiplying and dividing", "Proportion is about multiplying. Find the total work first (workers × time), then share it out."),
  // reverse percentages
  mc("rev-percent-of-new", "Took the percentage of the new amount", "The percentage was of the original amount, not the new one. The new amount is (100 + p)% or (100 − p)% of the original. Divide by that multiplier."),
  mc("rev-gave-change", "Gave the size of the change, not the original", "That's how much the price changed by. The question asks for the original amount."),
  // simple interest
  mc("si-gave-total", "Gave the total instead of the interest", "That includes the money put in. The interest is only the extra earned."),
  mc("si-interest-only", "Gave the interest instead of the total", "The question asks how much is in the account, so add the interest to the money put in."),
  mc("si-one-year", "Only worked out one year", "That is one year's interest. Simple interest is the same every year, so multiply by the number of years."),
  mc("si-forgot-years", "Forgot to divide by the number of years", "That interest was earned over several years. Divide by the number of years first to get one year's interest."),
  mc("si-used-compound", "Used compound interest instead of simple", "With simple interest, the interest is worked out on the starting amount every year, so it is the same each year."),
  // compound
  mc("comp-used-simple", "Worked it out as simple interest", "With compound interest, each year's percentage is of the new amount, so it grows faster. Multiply by the multiplier once for each year: amount × multiplier^years."),
  mc("comp-wrong-multiplier", "Used the multiplier for the opposite change", "For an increase the multiplier is more than 1 (5% up is × 1.05). For a decrease it's less than 1 (5% down is × 0.95)."),
  mc("comp-years-off", "Multiplied for one year too few", "Multiply by the multiplier once for every year. After 3 years, that's 3 times."),
  mc("comp-multiplier-change-only", "Used the percentage change as the multiplier", "0.05 would give just 5% of the amount. The multiplier includes the 100% you started with: 100% + 5% = 105% = 1.05."),
  mc("comp-multiplier-place", "Wrote the percentage in the tenths place", "3% is 0.03, not 0.3. So a 3% increase is × 1.03."),
  // speed
  mc("spd-minutes-not-hours", "Used minutes when the speed is per hour", "For km/h or mph, the time must be in hours. 45 minutes = 0.75 hours (divide minutes by 60)."),
  mc("spd-multiplied", "Multiplied when it should divide", "Speed = distance ÷ time and time = distance ÷ speed. Only distance = speed × time is a multiplication."),
  mc("spd-divided", "Divided when it should multiply", "Distance = speed × time. Dividing makes the answer far too small."),
  mc("spd-hours-not-minutes", "Gave the time in hours, not minutes", "Distance ÷ speed gives hours. The question asks for minutes, so multiply by 60."),
  mc("spd-averaged-speeds", "Averaged the two speeds", "Average speed is total distance ÷ total time. Averaging the speeds is only right if both parts take the same time."),
  // distance-time graphs
  mc("dt-read-wrong-axis", "Read the wrong axis", "Time goes along the bottom. Distance goes up the side. Check which one the question asks about."),
  mc("dt-read-point-not-gap", "Gave the time it ended, not how long it lasted", "How long means the difference: the end time take away the start time."),
  mc("dt-longest-not-steepest", "Picked the longest line instead of the steepest", "Speed is about steepness, not length. A steep line covers lots of distance in a short time."),
  mc("dt-flat-fast", "Thought a flat line means moving", "A flat line means the distance isn't changing, so the person has stopped."),
  mc("dt-gave-distance", "Gave the distance instead of the speed", "That's how far they went. For the speed, divide the distance by the time in hours."),
  // density and pressure
  mc("dens-multiplied", "Multiplied when it should divide", "Density = mass ÷ volume, and pressure = force ÷ area. A formula triangle can help you see which way round."),
  mc("dens-divided", "Divided when it should multiply", "Mass = density × volume, and force = pressure × area."),
  mc("dens-upside-down", "Divided the wrong way round", "Density is mass ÷ volume (mass on top). Pressure is force ÷ area (force on top)."),
  mc("dens-forgot-density", "Found the volume but didn't use the density", "You've found the volume. Now multiply by the density to get the mass."),
  // compound units
  mc("ccu-one-step", "Only converted one part of the unit", "A compound unit has two parts, like km and hours. Convert both: km → m (× 1000) and hours → seconds (÷ 3600)."),
  mc("ccu-wrong-time", "Used the wrong time conversion", "1 hour = 60 minutes = 3600 seconds. km/h to m/s needs 3600, not 60."),
  mc("ccu-wrong-way", "Converted the wrong way", "Check the size: there are more seconds than hours, so less distance is covered each second. km/h → m/s makes the number smaller (÷ 3.6); m/s → km/h makes it bigger (× 3.6)."),
]);

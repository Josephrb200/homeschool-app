/**
 * Lessons for the remaining ratio, proportion and percentage skills (six
 * stages, like every chain). Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const PROPORTION_LESSONS: Record<SkillId, Lesson> = {
  "ratio-scale-maps": {
    skillId: "ratio-scale-maps",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Maps, plans and models are all drawn to scale. A scale lets you measure a few centimetres on paper and work out a real distance, like how far it is to walk to a friend's house, or how big a room really is.",
      byTheEnd: ["Use a scale like '1 cm represents 5 m' in both directions.", "Use a map scale like 1 : 25,000 and change the units.", "Write a scale as a ratio 1 : n."],
    },
    teaching: {
      paragraphs: [
        "A scale tells you how a drawing compares with real life. '1 cm represents 5 m' means every centimetre on the drawing is 5 metres in real life.",
        "From drawing to real life, multiply. 4.5 cm on the drawing is 4.5 × 5 = 22.5 m. From real life to drawing, divide. 30 m is 30 ÷ 5 = 6 cm.",
        "Maps often use a ratio, like 1 : 25,000. This has no units: 1 cm on the map is 25,000 cm in real life. 1 mm would be 25,000 mm.",
        "So with a ratio scale, multiply, then change the units. 6 cm on a 1 : 25,000 map is 150,000 cm. Divide by 100 for metres (1500 m), then by 1000 for kilometres (1.5 km).",
        "Useful: 1 km = 1000 m = 100,000 cm. To write '1 cm represents 2 km' as a ratio, change 2 km into cm: 200,000 cm. So the scale is 1 : 200,000.",
      ],
      demo: "map-scale",
      examples: [
        {
          question: "On a plan, 1 cm represents 2 m. A room is 3.5 cm long on the plan. How long is the real room?",
          steps: ["Drawing to real life, so multiply.", "3.5 × 2 = 7", "The room is 7 m long."],
        },
        {
          question: "A map has a scale of 1 : 50,000. Two towns are 8 cm apart on the map. How far apart are they in km?",
          steps: ["8 × 50,000 = 400,000 cm.", "400,000 cm ÷ 100 = 4000 m, and 4000 m ÷ 1000 = 4 km.", "4 km"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-unit-rates": {
    skillId: "ratio-unit-rates",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "A rate tells you how much of one thing you get for each one of another: pounds per hour of work, pence per can, pages per minute. Rates help you check your pay, and spot which pack in a shop is really better value.",
      byTheEnd: ["Work out pay from an hourly rate, including overtime.", "Find the price of one item and compare value.", "Find and use other rates, like litres per minute."],
    },
    teaching: {
      paragraphs: [
        "'Per' means 'for each'. £9.50 per hour means you earn £9.50 for each hour you work. For 6 hours, multiply: 6 × £9.50 = £57.",
        "To find a rate, divide. If you earn £68.40 for 8 hours, your hourly rate is £68.40 ÷ 8 = £8.55.",
        "Overtime is often paid at 'time and a half': 1.5 times the normal rate. At £12 an hour, overtime is £12 × 1.5 = £18 an hour. Work out normal hours and overtime hours separately, then add.",
        "To compare value, find the price of one item in each pack (or the price per 100 g). The lower price per item is better value. Working in pence avoids decimals: £2.70 for 6 cans = 270p ÷ 6 = 45p a can.",
        "Other rates work the same way. A printer prints 120 pages in 5 minutes: 120 ÷ 5 = 24 pages per minute. To print 72 pages takes 72 ÷ 24 = 3 minutes.",
      ],
      demo: "pay-rate",
      examples: [
        {
          question: "Femi earns £11 an hour for the first 37 hours and time and a half after that. One week Femi works 40 hours. How much is Femi paid?",
          steps: ["Normal: 37 × £11 = £407.", "Overtime rate: £11 × 1.5 = £16.50. 3 hours × £16.50 = £49.50.", "Total: £407 + £49.50 = £456.50"],
        },
        {
          question: "A pack of 4 batteries costs £2.60. A pack of 10 costs £6. Which is better value?",
          steps: ["Pack of 4: 260p ÷ 4 = 65p each.", "Pack of 10: 600p ÷ 10 = 60p each.", "The pack of 10 is better value."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-inverse-proportion": {
    skillId: "ratio-inverse-proportion",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Some things go up together: more tickets, more cost. But some work the other way: more people painting a fence means it gets done faster. This is inverse proportion, and mixing the two up is one of the most common exam mistakes.",
      byTheEnd: ["Tell direct and inverse proportion apart.", "Solve problems like 'how long would 3 builders take?'.", "Use the fact that x × y stays the same."],
    },
    teaching: {
      paragraphs: [
        "In direct proportion, when one amount doubles, so does the other. In inverse proportion, when one amount doubles, the other halves.",
        "Workers and time are inversely proportional (if everyone works at the same rate). If 4 builders take 6 days, 8 builders would take 3 days, and 2 builders would take 12 days.",
        "The trick is to find the total amount of work first. 4 builders × 6 days = 24 'builder-days'. One builder alone would take 24 days. So 3 builders take 24 ÷ 3 = 8 days.",
        "Speed and time for a journey are also inversely proportional: going faster means taking less time. Speed × time (the distance) stays the same.",
        "In general, if y is inversely proportional to x, then x × y is always the same number. If x = 4 when y = 15, then x × y = 60, so when x = 6, y = 60 ÷ 6 = 10.",
      ],
      demo: "inverse-workers",
      examples: [
        {
          question: "5 pumps can empty a pond in 12 hours. How long would 3 pumps take?",
          steps: ["Fewer pumps means more time. Total work: 5 × 12 = 60 pump-hours.", "With 3 pumps: 60 ÷ 3.", "20 hours"],
        },
        {
          question: "y is inversely proportional to x. When x = 3, y = 20. Find y when x = 5.",
          steps: ["x × y stays the same: 3 × 20 = 60.", "5 × y = 60, so y = 60 ÷ 5.", "y = 12"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "pct-simple-interest": {
    skillId: "pct-simple-interest",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "When you save money in a bank, the bank pays you interest. When you borrow, you pay interest. Simple interest is the most straightforward kind: the same amount every year.",
      byTheEnd: ["Work out simple interest for several years.", "Find the total in an account.", "Work backwards to find the rate or the number of years."],
    },
    teaching: {
      paragraphs: [
        "Interest is extra money, given as a percentage of the amount you put in (the principal).",
        "Simple interest is worked out on the starting amount every year, so it's the same each year. £400 at 3% simple interest earns 3% of £400 = £12 every year.",
        "For several years, multiply. Over 5 years that's £12 × 5 = £60 interest.",
        "Read the question carefully. 'How much interest?' is £60. 'How much is in the account?' is £400 + £60 = £460.",
        "You can work backwards too. If £500 earns £75 in 3 years, one year's interest is £75 ÷ 3 = £25, which is 5% of £500.",
      ],
      demo: "interest-simple",
      examples: [
        {
          question: "£800 is invested at 4% simple interest per year. How much is in the account after 3 years?",
          steps: ["One year: 4% of £800 = £32.", "Three years: £32 × 3 = £96.", "Total: £800 + £96 = £896"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "pct-reverse": {
    skillId: "pct-reverse",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A jacket is £68 in a 15% off sale. What was it before? Reverse percentages work backwards to the original amount. Most people get this wrong the first time, because the obvious method doesn't work.",
      byTheEnd: ["Explain why you can't just take the percentage off the new amount.", "Find the original amount after an increase or a decrease.", "Remove VAT from a price."],
    },
    teaching: {
      paragraphs: [
        "The percentage in the question is always a percentage of the original amount. So you can't take 15% of the sale price and add it back on: that 15% would be of the wrong amount.",
        "Instead, work out what percentage of the original you've got. After 15% off, you have 100% − 15% = 85% of the original. After a 20% rise, you have 120%.",
        "Then find 1% and scale up to 100%. If 85% = £68, then 1% = £68 ÷ 85 = £0.80, and 100% = £80.",
        "Quicker, with a calculator: divide by the multiplier. 85% is 0.85, so £68 ÷ 0.85 = £80. For a 20% increase, divide by 1.2.",
        "Prices with VAT at 20% are 120% of the price without VAT. To remove VAT, divide by 1.2.",
        "Check by going forwards: 15% off £80 is £80 − £12 = £68. ✓",
      ],
      demo: "reverse-percent-bar",
      examples: [
        {
          question: "After a 25% increase, a bus fare is £3.50. What was it before?",
          steps: ["The new fare is 125% of the old fare.", "125% = £3.50, so 1% = £0.028 and 100% = £2.80. (Or £3.50 ÷ 1.25 = £2.80.)", "£2.80"],
        },
        {
          question: "In a sale, a game is 30% off. It costs £28. What was the original price?",
          steps: ["After 30% off, the price is 70% of the original.", "70% = £28, so 10% = £4 and 100% = £40.", "£40"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "pct-compound": {
    skillId: "pct-compound",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Real savings accounts, loans, population growth and the value of a car all change by a percentage of the current amount each year. This is compound change, and it's how money can grow surprisingly fast, or debts can grow out of control.",
      byTheEnd: ["Find the decimal multiplier for a percentage increase or decrease.", "Work out compound interest and depreciation over several years.", "Use a power to repeat a multiplier."],
    },
    teaching: {
      paragraphs: [
        "A multiplier does a percentage change in one step. An increase of 5% leaves you with 105%, which is × 1.05. A decrease of 15% leaves 85%, which is × 0.85.",
        "With compound interest, each year's interest is worked out on the new amount, not the starting amount. £1000 at 10%: after 1 year £1000 × 1.1 = £1100; after 2 years £1100 × 1.1 = £1210. That's £10 more than simple interest.",
        "Multiplying by 1.1 twice is the same as × 1.1². For n years, multiply by the multiplier to the power n: amount × 1.1ⁿ. Use the power button on your calculator.",
        "Depreciation means losing value. A car worth £12,000 that loses 15% a year is worth £12,000 × 0.85³ = £7369.50 after 3 years.",
        "Money answers are given to the nearest penny (2 decimal places).",
      ],
      demo: "interest-compound",
      examples: [
        {
          question: "£2000 is invested at 3% compound interest per year. How much is in the account after 4 years?",
          steps: ["Multiplier: 100% + 3% = 103% = 1.03.", "£2000 × 1.03⁴ = 2251.0162...", "£2251.02 (to the nearest penny)"],
        },
        {
          question: "A phone costs £600. It loses 20% of its value each year. What is it worth after 2 years?",
          steps: ["Multiplier: 100% − 20% = 80% = 0.8.", "Year 1: £600 × 0.8 = £480. Year 2: £480 × 0.8 = £384.", "£384"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-speed": {
    skillId: "ratio-speed",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "How long will the journey take? How fast was the train going? Speed, distance and time questions appear on almost every GCSE paper, and the most common mistake is forgetting to change minutes into hours.",
      byTheEnd: ["Use speed = distance ÷ time, and rearrange it.", "Change minutes into hours (and back).", "Work out average speed for a whole journey."],
    },
    teaching: {
      paragraphs: [
        "Speed = distance ÷ time. A car that goes 150 km in 3 hours has an average speed of 150 ÷ 3 = 50 km/h (kilometres per hour).",
        "Rearranged: distance = speed × time, and time = distance ÷ speed. A formula triangle with D on top and S and T underneath helps you remember: cover the one you want.",
        "For km/h or mph, the time must be in hours. 45 minutes is 45 ÷ 60 = 0.75 hours, not 0.45 hours. Useful: 15 min = 0.25 h, 30 min = 0.5 h, 20 min = 1/3 h, 90 min = 1.5 h.",
        "If time comes out in hours and the question wants minutes, multiply by 60: 1.25 hours = 75 minutes.",
        "Average speed for a whole journey = total distance ÷ total time. Don't just average the speeds.",
      ],
      demo: "speed-journey",
      examples: [
        {
          question: "A cyclist rides 18 km in 45 minutes. What is the average speed in km/h?",
          steps: ["45 minutes = 45 ÷ 60 = 0.75 hours.", "Speed = 18 ÷ 0.75 = 24.", "24 km/h"],
        },
        {
          question: "A coach travels 105 miles at 70 mph. How long does it take, in minutes?",
          steps: ["Time = 105 ÷ 70 = 1.5 hours.", "1.5 × 60 = 90.", "90 minutes"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-distance-time-graphs": {
    skillId: "ratio-distance-time-graphs",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A distance-time graph tells the story of a journey at a glance: when someone was moving, when they stopped, and how fast they went. Reading these graphs is a common exam question, and the same idea (steepness shows a rate) comes up all over science.",
      byTheEnd: ["Read times and distances off a distance-time graph.", "Spot when someone has stopped.", "Work out a speed from the graph, and say which part is fastest."],
    },
    teaching: {
      paragraphs: [
        "Time goes along the bottom (horizontal axis). Distance from the start goes up the side (vertical axis).",
        "A line going up means moving away from home. A line going down means coming back. A flat line means stopped: time passes but the distance doesn't change.",
        "The steeper the line, the faster the speed. Steepness is about how much distance in how much time, not how long the line is.",
        "To find a speed, read the distance travelled and the time taken for that part. Then speed = distance ÷ time. If time is in minutes, change it to hours for km/h: 12 km in 30 minutes = 12 ÷ 0.5 = 24 km/h.",
        "The speed is the gradient of the line: how far up for each unit across.",
      ],
      demo: "dt-graph-builder",
      examples: [
        {
          question: "A graph shows a line from (0 minutes, 0 km) to (20 minutes, 6 km). What is the speed in km/h?",
          steps: ["Distance: 6 km. Time: 20 minutes = 1/3 hour.", "Speed = 6 ÷ 1/3 = 6 × 3 = 18.", "18 km/h"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-density-pressure": {
    skillId: "ratio-density-pressure",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Why does a steel ship float but a steel bolt sinks? Why do snowshoes stop you sinking into snow? Density and pressure answer these questions. They work just like speed: one quantity divided by another.",
      byTheEnd: ["Use density = mass ÷ volume, and rearrange it.", "Use pressure = force ÷ area, and rearrange it.", "Find a volume first, then a mass."],
    },
    teaching: {
      paragraphs: [
        "Density is how much mass is packed into each unit of volume. Density = mass ÷ volume. A block with mass 540 g and volume 200 cm³ has density 540 ÷ 200 = 2.7 g/cm³.",
        "Rearranged: mass = density × volume, and volume = mass ÷ density. The same triangle trick works, with M on top, D and V underneath.",
        "Pressure is how much force pushes on each unit of area. Pressure = force ÷ area, measured in newtons per square metre (N/m²).",
        "Rearranged: force = pressure × area, and area = force ÷ pressure. The same force on a smaller area gives a bigger pressure, which is why a pin is sharp and snowshoes are wide.",
        "Sometimes you need the volume first. A cuboid 5 cm × 4 cm × 2 cm has volume 40 cm³. With density 8 g/cm³ its mass is 8 × 40 = 320 g.",
      ],
      demo: "density-blocks",
      examples: [
        {
          question: "A block of iron has density 7.9 g/cm³ and volume 30 cm³. What is its mass?",
          steps: ["Mass = density × volume.", "7.9 × 30 = 237", "237 g"],
        },
        {
          question: "A box pushes down with a force of 150 N on an area of 3 m². What is the pressure?",
          steps: ["Pressure = force ÷ area.", "150 ÷ 3 = 50", "50 N/m²"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-convert-compound-units": {
    skillId: "ratio-convert-compound-units",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Is 30 m/s faster than 100 km/h? You can only compare speeds, prices or densities when they're in the same units. Converting a compound unit means converting both of its parts.",
      byTheEnd: ["Change km/h into m/s and back.", "Change rates per minute into rates per hour.", "Convert other compound units one part at a time."],
    },
    teaching: {
      paragraphs: [
        "A compound unit is made of two units, like km/h (kilometres per hour). To convert it, change one part at a time.",
        "72 km/h into m/s: first the distance, 72 km = 72,000 m, so it's 72,000 m per hour. Then the time: an hour is 3600 seconds, so divide by 3600. 72,000 ÷ 3600 = 20 m/s.",
        "Going back, from m/s to km/h: × 3600 then ÷ 1000, which is the same as × 3.6. 20 m/s × 3.6 = 72 km/h.",
        "Check the size makes sense. In one second you go much less far than in one hour, so the number in m/s is smaller.",
        "The same method works for anything: 12 litres per minute is 12 × 60 = 720 litres per hour; £4.50 per kg is 450p per 1000 g, which is 0.45p per gram.",
      ],
      demo: "unit-rate-convert",
      examples: [
        {
          question: "Change 54 km/h into m/s.",
          steps: ["54 km = 54,000 m, so 54,000 m per hour.", "54,000 ÷ 3600 = 15.", "15 m/s"],
        },
        {
          question: "A tap lets out 9 litres per minute. How many litres per hour?",
          steps: ["1 hour = 60 minutes.", "9 × 60 = 540", "540 litres per hour"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};

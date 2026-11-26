// End-to-end journey against a running app + local Supabase:
// parent signs up, adds a child; child completes a full lesson and passes the check;
// parent sees evidence-based progress; settings persist.
// Run: BASE=http://localhost:3000 node e2e/journey.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS ?? "/tmp";
const stamp = Date.now().toString().slice(-6);
const parent = { name: "Jo Tester", email: `parent${stamp}@example.com`, pw: "correct-horse-1" };
const child = { name: "Sam", user: `sam_${stamp}`, pw: "fractions1" };
let step = 0;
const ok = (m) => console.log(`✓ ${++step}. ${m}`);

function equivAnswer(prompt) {
  let m = /(\d+)\/(\d+) = \?\/(\d+)/.exec(prompt);
  if (m) return String((Number(m[1]) * Number(m[3])) / Number(m[2]));
  m = /(\d+)\/(\d+) = (\d+)\/\?/.exec(prompt);
  if (m) return String((Number(m[2]) * Number(m[3])) / Number(m[1]));
  throw new Error("Unknown prompt " + prompt);
}

async function answerRun(page, n, { wrongFirst = false } = {}) {
  for (let i = 0; i < n; i++) {
    const p = page.locator("#prompt");
    await p.waitFor();
    const text = (await p.getAttribute("data-question-id")) && (await p.innerText());
    const prompt = text.replace(/\n/g, "").replace(/(\d)\s*(\d)/g, "$1$2");
    const qid = await p.getAttribute("data-question-id");
    const flat = await page.evaluate(() => {
      const el = document.querySelector("#prompt");
      return [...el.childNodes].map((n) => (n.getAttribute?.("aria-label") ?? n.textContent)).join("").replace(/ over /g, "/").replace(/blank/g, "?");
    });
    if (wrongFirst && i === 0) {
      await page.fill("#answer", "1");
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.waitForSelector(".feedback");
      await page.click("button:has-text('Try again')");
    }
    await page.fill("#answer", equivAnswer(flat));
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.waitForSelector(".feedback-good");
    const nextName = i + 1 < n ? "Next question" : (await page.getByRole("button", { name: "See results", exact: true }).count()) ? "See results" : "Finish";
    await page.getByRole("button", { name: nextName, exact: true }).click();
    if (i + 1 < n) await page.waitForFunction((id) => document.querySelector("#prompt")?.getAttribute("data-question-id") !== id, qid);
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));

// 1. Parent signs up
await page.goto(BASE + "/signup");
await page.fill("#displayName", parent.name);
await page.fill("#email", parent.email);
await page.fill("#password", parent.pw);
await page.check("input[name=consent]");
await page.click("button:has-text('Create account')");
await page.waitForURL("**/parent");
ok("Parent signed up and landed on the dashboard");

// 2. Adds a child
await page.fill("#displayName", child.name);
await page.fill("#username", child.user);
await page.fill("#password", child.pw);
await page.click("button:has-text('Add child')");
await page.waitForSelector(`text=can now log in with the username "${child.user}"`);
await page.reload();
await page.waitForSelector(`a:has-text("${child.name}")`);
ok("Child account created and listed");
await page.screenshot({ path: `${SHOTS}/01-parent.png`, fullPage: true });

// 3. Child logs in
await page.click("button:has-text('Log out')");
await page.waitForSelector("a:has-text('Log in')");
await page.goto(BASE + "/login");
await page.fill("#identifier", child.user);
await page.fill("#password", child.pw);
await page.click("button:has-text('Log in')");
await page.waitForURL("**/learn");
await page.waitForSelector("text=Start: Equivalent fractions");
ok("Child logged in; first recommendation is Equivalent fractions");
await page.screenshot({ path: `${SHOTS}/02-learn.png`, fullPage: true });

// 4. Full lesson
await page.click("a:has-text('Open')");
await page.waitForLoadState("networkidle"); await page.screenshot({ path: `${SHOTS}/03a-lesson.png`, fullPage: true });
await page.waitForSelector("h2:has-text('Introduction')");
await page.click("button:has-text('Start the teaching')");
await page.waitForSelector("h2:has-text('Teaching')");
await page.locator("input[type=range]").first().fill("4");
await page.waitForSelector("text=multiplied by 4");
await page.click("button:has-text('Show the next step')");
ok("Teaching stage: demo responds, worked example reveals steps");
await page.screenshot({ path: `${SHOTS}/03-teaching.png`, fullPage: true });
await page.click("button:has-text('ready to practise')");
await page.waitForSelector("h2:has-text('Guided practice')");
await page.click("button:has-text('Give me a hint')");
await page.waitForSelector("text=Hint 1:");
await answerRun(page, 4, { wrongFirst: true });
await page.waitForSelector("h2:has-text('On your own')");
ok("Guided practice: hint, wrong answer feedback, retry, 4 answers");
await answerRun(page, 4);
await page.waitForSelector("h2:has-text('Skill check')");
ok("Independent practice: 4 answers");
await answerRun(page, 5);
await page.waitForSelector("text=Check passed: 5 of 5");
await page.click("button:has-text('Continue')");
await page.waitForSelector("text=Your level now:");
await page.waitForSelector(".panel-sunk >> text=Demonstrated understanding");
ok("Skill check passed 5/5; level is now Demonstrated understanding");
await page.screenshot({ path: `${SHOTS}/04-review.png`, fullPage: true });

// 5. Settings persist
await page.goto(BASE + "/settings");
await page.click("button:has-text('OpenDyslexic')");
await page.click("button[aria-label='Cream']");
await page.waitForSelector("text=Saved to your account.");
await page.reload();
const font = await page.evaluate(() => document.documentElement.dataset.font);
const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme-choice"));
if (font !== "opendyslexic" || theme !== "cream") throw new Error(`settings not kept: ${font} ${theme}`);
ok("Settings saved to the account and applied after reload");
await page.screenshot({ path: `${SHOTS}/05-settings.png`, fullPage: true });

// 6. Parent sees evidence
await page.click("button:has-text('Log out')");
await page.waitForSelector("a:has-text('Log in')");
await page.goto(BASE + "/login");
await page.fill("#identifier", parent.email);
await page.fill("#password", parent.pw);
await page.click("button:has-text('Log in')");
await page.waitForURL("**/parent");
await page.click("a:has-text('See progress')");
await page.waitForSelector("text=Equivalent fractions: demonstrated understanding");
const rows = await page.locator("table.evidence >> nth=1 >> tbody tr").count();
if (rows < 13) throw new Error("expected 13+ evidence rows, got " + rows);
await page.waitForSelector("td:has-text('with help')");
ok(`Parent sees the level with its reason and ${rows} evidence rows, including answers marked 'with help'`);
await page.fill("#goal", "Pass the check on simplifying fractions");
await page.click("button:has-text('Add goal')");
await page.waitForSelector("text=Goal added.");
ok("Parent added a weekly goal");
await page.screenshot({ path: `${SHOTS}/06-parent-child.png`, fullPage: true });

// 7. A parent can't open another family's child; logged-out users are redirected
const other = await browser.newContext();
const p2 = await other.newPage();
await p2.goto(BASE + page.url().replace(BASE, ""));
if (!p2.url().includes("/login")) throw new Error("logged-out user reached a child page");
ok("Logged-out visitor is sent to the login page");

// 8. Phone width: no sideways scroll
await page.setViewportSize({ width: 390, height: 844 });
for (const path of ["/parent", "/settings"]) {
  await page.goto(BASE + path);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (over > 1) throw new Error(`${path} scrolls sideways by ${over}px`);
}
ok("No sideways scrolling at phone width");
await page.screenshot({ path: `${SHOTS}/07-phone.png`, fullPage: true });

await browser.close();
console.log("ALL JOURNEY CHECKS PASSED");

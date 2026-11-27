/**
 * Renders text with fractions written as a/b shown stacked. Screen readers hear
 * "3 over 4" and read-aloud reads the plain text.
 */
export function MathText({ text }: { text: string }) {
  // A root on top is part of the fraction: √3/2 is "root 3, over 2".
  const parts = text.split(/((?:√?\d+|\?)\/(?:\d+|\?))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^(√?\d+|\?)\/(\d+|\?)$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        return (
          <span key={i} className="frac" role="img" aria-label={`${m[1] === "?" ? "blank" : m[1].replace("√", "root ")} over ${m[2] === "?" ? "blank" : m[2]}`}>
            <span className="num" aria-hidden="true">{m[1]}</span>
            <span className="den" aria-hidden="true">{m[2]}</span>
          </span>
        );
      })}
    </>
  );
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** "²" → " squared", "³" → " cubed", "⁻⁴" → " to the power negative 4", "ⁿ" → " to the power n". */
function speakPower(p: string): string {
  if (p === "²") return " squared";
  if (p === "³") return " cubed";
  const neg = p.startsWith("⁻");
  const body = (neg ? p.slice(1) : p).split("").map((c) => (c === "ⁿ" ? "n" : String(SUPERSCRIPT.indexOf(c)))).join("");
  return ` to the power ${neg ? "negative " : ""}${body}`;
}

/** Text for speech: "3/4" becomes "3 over 4", "−" becomes "minus", "−3" becomes "negative 3", "7²" becomes "7 squared". */
export function speakable(text: string) {
  return text
    // Trigonometry: "sin⁻¹" is "inverse sine"; "sin" is said "sine", not "sin".
    .replace(/\b(sin|cos|tan)⁻¹/g, (_, f: string) => `inverse ${f === "sin" ? "sine" : f}`)
    .replace(/\bsin\b/g, "sine")
    .replace(/θ/g, "theta")
    .replace(/√(\d+)\/(\d+)/g, "root $1 over $2")
    .replace(/√/g, "the square root of ")
    .replace(/∛/g, "the cube root of ")
    .replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+/g, speakPower)
    // A minus sign stuck to a number (no space after it) is a negative number.
    .replace(/(^|[\s(])−(?=\d)/g, "$1negative ")
    .replace(/\?\/(\d+)/g, "blank over $1")
    .replace(/(\d+)\/\?/g, "$1 over blank")
    .replace(/(\d+)\/(\d+)/g, "$1 over $2")
    .replace(/−/g, " minus ")
    .replace(/(\d)°/g, "$1 degrees")
    .replace(/∠/g, "angle ")
    .replace(/≤/g, " is less than or equal to ")
    .replace(/≥/g, " is greater than or equal to ")
    .replace(/\s<\s/g, " is less than ")
    .replace(/\s>\s/g, " is greater than ")
    .replace(/≡/g, " is identical to ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/£(\d+)/g, "$1 pounds")
    // Ratios: "3:2" is read "3 to 2" (not as a time).
    .replace(/(\d+)\s*:\s*(?=\d)(?!\d\d\s*(am|pm)\b)/gi, "$1 to ");
}

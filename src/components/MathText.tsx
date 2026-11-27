/**
 * Renders text with fractions written as a/b shown stacked. Screen readers hear
 * "3 over 4" and read-aloud reads the plain text.
 */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/((?:\d+|\?)\/(?:\d+|\?)|vec\([^,()]+,[^,()]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const v = VEC.exec(p);
        if (v) {
          const [top, bottom] = [v[1].trim(), v[2].trim()];
          return (
            <span key={i} className="colvec" role="img" aria-label={`column vector ${speakable(top)}, ${speakable(bottom)}`}>
              <span aria-hidden="true">{top}</span>
              <span aria-hidden="true">{bottom}</span>
            </span>
          );
        }
        const m = /^(\d+|\?)\/(\d+|\?)$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        return (
          <span key={i} className="frac" role="img" aria-label={`${m[1] === "?" ? "blank" : m[1]} over ${m[2] === "?" ? "blank" : m[2]}`}>
            <span className="num" aria-hidden="true">{m[1]}</span>
            <span className="den" aria-hidden="true">{m[2]}</span>
          </span>
        );
      })}
    </>
  );
}

/** A column vector, written vec(3,−2) in text: top number, then bottom number. */
const VEC = /^vec\(([^,()]+),([^,()]+)\)$/;

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
    .replace(/vec\(([^,()]+),\s*([^,()]+)\)/g, "column vector $1, $2")
    .replace(/√/g, "the square root of ")
    .replace(/∛/g, "the cube root of ")
    .replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+/g, speakPower)
    // A minus sign stuck to a number (no space after it) is a negative number.
    .replace(/(^|[\s(,])−(?=\d)/g, "$1negative ")
    .replace(/\?\/(\d+)/g, "blank over $1")
    .replace(/(\d+)\/\?/g, "$1 over blank")
    .replace(/(\d+)\/(\d+)/g, "$1 over $2")
    .replace(/−/g, " minus ")
    .replace(/(\d)°/g, "$1 degrees")
    .replace(/∠/g, "angle ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/£(\d+)/g, "$1 pounds")
    // Ratios: "3:2" is read "3 to 2" (not as a time).
    .replace(/(\d+)\s*:\s*(?=\d)(?!\d\d\s*(am|pm)\b)/gi, "$1 to ");
}

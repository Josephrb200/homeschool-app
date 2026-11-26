/**
 * Renders text with fractions written as a/b shown stacked. Screen readers hear
 * "3 over 4" and read-aloud reads the plain text.
 */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/((?:\d+|\?)\/(?:\d+|\?))/g);
  return (
    <>
      {parts.map((p, i) => {
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

/** Text for speech: "3/4" becomes "3 over 4", "−" becomes "minus". */
export function speakable(text: string) {
  return text
    .replace(/\?\/(\d+)/g, "blank over $1")
    .replace(/(\d+)\/\?/g, "$1 over blank")
    .replace(/(\d+)\/(\d+)/g, "$1 over $2")
    .replace(/−/g, " minus ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/£(\d+)/g, "$1 pounds");
}

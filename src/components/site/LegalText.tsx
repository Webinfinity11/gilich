/** Plain text from the admin: blank line = new paragraph, a line starting with "## " = heading */
export function LegalText({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <article className="prose-site container-site max-w-[900px] py-16 text-[15px] leading-relaxed text-muted">
      {blocks.map((block, i) => {
        const [first, ...rest] = block.split("\n");
        const heading = first.startsWith("## ") ? first.slice(3).trim() : null;
        const body = (heading ? rest.join("\n") : block).trim();
        return (
          <section key={i}>
            {heading && <h2>{heading}</h2>}
            {body && <p className="whitespace-pre-line">{body}</p>}
          </section>
        );
      })}
    </article>
  );
}

import { parseBody, type Block } from "@/lib/content";
import { EditorialVisual } from "./editorial-visual";

export function ArticleBody({ raw }: { raw: string }) {
  const blocks = parseBody(raw);
  return (
    <div className="prose-shift">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function LinkedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("http://") || part.startsWith("https://") ? (
          <a
            key={`${part}-${index}`}
            href={part}
            className="break-all text-purple underline decoration-purple/40 underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            {part}
          </a>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[1.125rem] leading-[1.8] text-fg/92">
          <LinkedText text={block.text} />
        </p>
      );
    case "h2":
      return <h2 className="deck">{block.text}</h2>;
    case "h3":
      return <h3 className="label text-xl">{block.text}</h3>;
    case "quote":
      return (
        <blockquote className="my-8 border-l-2 border-lime pl-5">
          <p className="deck text-[2rem] leading-snug">{block.text}</p>
          {block.cite && <cite className="caption mt-3 block text-sm not-italic text-muted">— {block.cite}</cite>}
        </blockquote>
      );
    case "pullquote":
      return (
        <aside className="my-12">
          <p className="deck max-w-xl text-[clamp(2rem,4vw,3.125rem)] text-purple">{block.text}</p>
        </aside>
      );
    case "stat":
      return (
        <figure className="my-10 rounded-[1.5rem] border border-line bg-bg-elevated px-6 py-8 text-center">
          <p className="display text-5xl text-lime">{block.value}</p>
          <figcaption className="caption mt-2 text-sm text-muted">{block.label}</figcaption>
        </figure>
      );
    case "ul":
      return (
        <ul className="mb-8 list-disc space-y-2 pl-6 text-[1.125rem] leading-8">
          {block.items.map((item) => (
            <li key={item}>
              <LinkedText text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mb-8 list-decimal space-y-2 pl-6 text-[1.125rem] leading-8">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "hr":
      return <hr className="my-10 border-line" />;
    case "visual":
      return (
        <figure className="my-10 overflow-hidden rounded-[1.5rem]">
          <EditorialVisual theme={block.theme} className="h-64 w-full" />
          {block.caption && <figcaption className="caption px-1 pt-3 text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteStory, saveStoryDraft, setStoryStatus } from "@/app/actions/stories";
import { CATEGORY_LABELS, VISUAL_THEMES, parseBody, serializeBody, type Block } from "@/lib/content";
import type { StoryCategory } from "@prisma/client";

type Story = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  dek: string;
  body: string;
  category: string;
  visualTheme: string;
  seoDescription: string | null;
  status: string;
  isBrief: boolean;
  featured: boolean;
  leadStory: boolean;
  tags: { tag: { name: string } }[];
};

export function StoryEditor({ story, canDelete }: { story: Story; canDelete: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(story.title === "Untitled story" ? "" : story.title);
  const [subtitle, setSubtitle] = useState(story.subtitle ?? "");
  const [dek, setDek] = useState(story.dek);
  const [category, setCategory] = useState(story.category);
  const [visualTheme, setVisualTheme] = useState(story.visualTheme);
  const [seoDescription, setSeo] = useState(story.seoDescription ?? "");
  const [tags, setTags] = useState(story.tags.map((item) => item.tag.name).join(", "));
  const [blocks, setBlocks] = useState<Block[]>(parseBody(story.body));
  const [isBrief, setBrief] = useState(story.isBrief);
  const [featured, setFeatured] = useState(story.featured);
  const [leadStory, setLead] = useState(story.leadStory);
  const [message, setMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [saving, setSaving] = useState(false);

  function payload() {
    return {
      title: title || "Untitled story",
      subtitle,
      dek: dek || title,
      category: category as StoryCategory,
      visualTheme,
      seoDescription,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      body: serializeBody(blocks),
      isBrief,
      featured,
      leadStory,
    };
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    await saveStoryDraft(story.id, payload());
    setSaving(false);
    setMessage("Draft saved.");
    router.refresh();
  }

  function updateBlock(index: number, next: Block) {
    setBlocks((current) => current.map((block, i) => (i === index ? next : block)));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add title"
          className="display w-full bg-transparent text-4xl outline-none placeholder:text-faint sm:text-5xl"
        />
        <input
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          placeholder="Add subtitle"
          className="mt-3 w-full bg-transparent text-xl text-muted outline-none"
        />
        <textarea
          value={dek}
          onChange={(event) => setDek(event.target.value)}
          placeholder="Dek — the one-sentence promise of the story"
          className="mt-4 w-full resize-none bg-transparent text-lg leading-7 outline-none"
          rows={2}
        />
        <div className="mt-8 space-y-4">
          {blocks.map((block, index) => (
            <BlockEditor
              key={index}
              block={block}
              onChange={(next) => updateBlock(index, next)}
              onRemove={() => setBlocks((current) => current.filter((_, i) => i !== index))}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["p", "h2", "quote", "pullquote", "stat", "ul", "hr"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className="rounded-full border border-line px-3 py-1 text-xs"
              onClick={() =>
                setBlocks((current) => [
                  ...current,
                  type === "ul"
                    ? { type, items: [""] }
                    : type === "stat"
                      ? { type, value: "", label: "" }
                      : type === "hr"
                        ? { type }
                        : { type, text: "" },
                ])
              }
            >
              + {type}
            </button>
          ))}
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[1.2rem] border border-line p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-faint">Status · {story.status.replace("_", " ")}</p>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={save} className="rounded-full bg-bg-elevated px-4 py-2 text-sm">
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <a
              href={`/stories/${story.slug}?preview=1`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-4 py-2 text-center text-sm"
            >
              Preview
            </a>
            <button type="button" onClick={() => setPublishing(true)} className="rounded-full bg-lime px-4 py-2 text-sm text-[#142006]">
              Publish
            </button>
            {story.status === "PUBLISHED" && (
              <button type="button" onClick={() => setStoryStatus(story.id, "DRAFT")} className="text-sm text-muted">
                Unpublish
              </button>
            )}
            <button type="button" onClick={() => setStoryStatus(story.id, "IN_REVIEW")} className="text-sm text-muted">
              Send to review
            </button>
          </div>
          {message && <p className="mt-2 text-xs text-lime">{message}</p>}
        </div>
        <label className="block text-sm">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-transparent px-2 py-2">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Cover visual
          <select value={visualTheme} onChange={(event) => setVisualTheme(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-transparent px-2 py-2">
            {VISUAL_THEMES.map((theme) => (
              <option key={theme}>{theme}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Tags
          <input value={tags} onChange={(event) => setTags(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-transparent px-2 py-2" placeholder="AI, USC, Policy" />
        </label>
        <label className="block text-sm">
          SEO description
          <textarea value={seoDescription} onChange={(event) => setSeo(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-transparent px-2 py-2" rows={3} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isBrief} onChange={(event) => setBrief(event.target.checked)} />
          The Brief
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={leadStory} onChange={(event) => setLead(event.target.checked)} />
          Lead story
        </label>
        {canDelete && (
          <button type="button" className="text-sm text-danger" onClick={() => deleteStory(story.id)}>
            Delete
          </button>
        )}
      </aside>

      {publishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={() => setPublishing(false)} />
          <div className="relative w-full max-w-md rounded-[1.4rem] bg-bg p-6 shadow-glow">
            <h2 className="display text-2xl">Ready to publish?</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="text-faint">Title</dt><dd>{title}</dd></div>
              <div><dt className="text-faint">Subtitle</dt><dd>{subtitle || "—"}</dd></div>
              <div><dt className="text-faint">Category</dt><dd>{CATEGORY_LABELS[category]}</dd></div>
              <div><dt className="text-faint">URL</dt><dd>/stories/{story.slug}</dd></div>
            </dl>
            <label className="mt-4 block text-sm">
              Or schedule
              <input type="datetime-local" value={schedule} onChange={(event) => setSchedule(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-transparent px-2 py-2" />
            </label>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-lime px-4 py-2 text-sm text-[#142006]"
                onClick={async () => {
                  await saveStoryDraft(story.id, payload());
                  if (schedule) await setStoryStatus(story.id, "SCHEDULED", new Date(schedule).toISOString());
                  else await setStoryStatus(story.id, "PUBLISHED");
                  setPublishing(false);
                  router.refresh();
                }}
              >
                Publish Story
              </button>
              <button type="button" className="text-sm" onClick={() => setPublishing(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: Block;
  onChange: (block: Block) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-transparent focus-within:border-line">
      <button type="button" onClick={onRemove} className="absolute -left-8 top-2 hidden text-xs text-faint group-hover:block">
        ×
      </button>
      {block.type === "p" || block.type === "h2" || block.type === "h3" || block.type === "quote" || block.type === "pullquote" ? (
        <textarea
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
          placeholder={block.type === "p" ? "Write, or paste…" : block.type}
          className={`w-full resize-none bg-transparent outline-none ${block.type === "h2" ? "text-2xl tracking-[-0.03em]" : block.type === "pullquote" ? "serif text-2xl text-purple" : "text-lg leading-8"}`}
          rows={block.type === "p" ? 4 : 2}
        />
      ) : null}
      {block.type === "stat" && (
        <div className="flex gap-2">
          <input value={block.value} onChange={(event) => onChange({ ...block, value: event.target.value })} placeholder="Stat" className="w-28 bg-transparent text-3xl outline-none" />
          <input value={block.label} onChange={(event) => onChange({ ...block, label: event.target.value })} placeholder="Label" className="flex-1 bg-transparent outline-none" />
        </div>
      )}
      {block.type === "ul" && (
        <textarea
          value={block.items.join("\n")}
          onChange={(event) => onChange({ type: "ul", items: event.target.value.split("\n") })}
          className="w-full bg-transparent leading-7 outline-none"
          rows={4}
        />
      )}
      {block.type === "hr" && <hr className="border-line" />}
    </div>
  );
}

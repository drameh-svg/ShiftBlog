export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "pullquote"; text: string }
  | { type: "stat"; value: string; label: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "visual"; theme: string; caption?: string };

export const BLOCK_TYPES = [
  "p",
  "h2",
  "h3",
  "quote",
  "pullquote",
  "stat",
  "ul",
  "ol",
  "hr",
  "visual",
] as const;

export function parseBody(raw: string): Block[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [{ type: "p", text: raw }];
    return parsed.filter(isBlock);
  } catch {
    return [{ type: "p", text: raw }];
  }
}

function isBlock(value: unknown): value is Block {
  if (!value || typeof value !== "object") return false;
  const block = value as { type?: string };
  return typeof block.type === "string" && (BLOCK_TYPES as readonly string[]).includes(block.type);
}

export function serializeBody(blocks: Block[]) {
  return JSON.stringify(blocks);
}

export function blocksToPlainText(blocks: Block[]) {
  return blocks
    .map((block) => {
      if ("text" in block) return block.text;
      if ("items" in block) return block.items.join(" ");
      if (block.type === "stat") return `${block.value} ${block.label}`;
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

export function estimateReadingMinutes(blocks: Block[]) {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "Latest news",
  OPINION: "Op-eds",
  ANALYSIS: "Analysis",
  EXPLAINER: "The Brief",
  CAMPUS: "Campus",
  INTERVIEW: "Interview",
  RESEARCH: "Research",
  ESSAY: "Essay",
};

export const READ_FILTERS: { label: string; category: "CAMPUS" | "NEWS" | "OPINION" }[] = [
  { label: "Campus", category: "CAMPUS" },
  { label: "Latest news", category: "NEWS" },
  { label: "Op-eds", category: "OPINION" },
];

export const TAGS = [
  "AI",
  "USC",
  "Policy",
  "Ethics",
  "Privacy",
  "Education",
  "Big Tech",
  "Digital Rights",
  "National",
  "Global",
  "Opinion",
] as const;

export const VISUAL_THEMES = [
  "aurora",
  "grid",
  "liquid",
  "data",
  "glass",
  "scan",
  "orb",
  "type",
] as const;

export const NOTE_COLORS = ["lime", "purple", "lavender", "cream", "gray"] as const;

export const STORY_STATUSES = ["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export const SUBMISSION_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "NEEDS_REVISION",
  "REJECTED",
] as const;
export const OPPORTUNITY_STATUSES = [
  "OPEN",
  "UPCOMING",
  "CLOSING_SOON",
  "ONGOING",
  "COMPLETED",
] as const;

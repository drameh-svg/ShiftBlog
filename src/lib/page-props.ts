export type Search = Promise<Record<string, string | string[] | undefined>>;
export type SlugParams = Promise<{ slug: string }>;
export type IdParams = Promise<{ id: string }>;

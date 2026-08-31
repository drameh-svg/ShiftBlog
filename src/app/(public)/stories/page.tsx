import { redirect } from "next/navigation";

export default async function StoriesRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  redirect(category ? `/read?category=${category}` : "/read");
}

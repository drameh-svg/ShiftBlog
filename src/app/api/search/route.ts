import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchContent(query);
  return NextResponse.json({
    stories: results.stories.map((story) => ({
      slug: story.slug,
      title: story.title,
      category: story.category,
    })),
    discussions: results.discussions.map((discussion) => ({
      slug: discussion.slug,
      title: discussion.title,
    })),
    authors: results.authors,
  });
}

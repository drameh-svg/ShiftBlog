import { redirect } from "next/navigation";
import { createStoryAction } from "@/app/actions/stories";

export default async function NewStoryPage() {
  await createStoryAction();
  redirect("/editor");
}

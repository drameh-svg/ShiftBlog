import { prisma } from "@/lib/prisma";
import { updateIdeaStatus } from "@/app/actions/submissions";
import { SUBMISSION_STATUSES } from "@/lib/content";

export default async function IdeasPage() {
  const ideas = await prisma.ideaSubmission.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="display text-4xl">Ideas</h1>
      <div className="mt-6 space-y-4">
        {ideas.map((item) => (
          <article key={item.id} className="rounded-[1.2rem] border border-line p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-lime">{item.category} · {item.status.replace("_", " ")}</p>
            <h2 className="mt-1 text-xl">{item.topic}</h2>
            <p className="text-sm text-muted">{item.anonymous ? "Anonymous" : item.name}</p>
            <p className="mt-3 text-sm leading-6">{item.idea}</p>
            <p className="mt-2 text-sm text-muted">{item.why}</p>
            <form
              className="mt-3 flex gap-2"
              action={async (formData) => {
                "use server";
                await updateIdeaStatus(item.id, String(formData.get("status")) as never);
              }}
            >
              <select name="status" defaultValue={item.status} className="rounded-xl border border-line bg-transparent px-2 py-1 text-sm">
                {SUBMISSION_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button className="text-sm text-purple">Update</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}

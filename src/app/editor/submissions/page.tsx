import { prisma } from "@/lib/prisma";
import { updateSubmissionStatus } from "@/app/actions/submissions";
import { SUBMISSION_STATUSES } from "@/lib/content";

export default async function SubmissionsPage() {
  const submissions = await prisma.articleSubmission.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="display text-4xl">Submissions</h1>
      <div className="mt-6 space-y-4">
        {submissions.map((item) => (
          <article key={item.id} className="rounded-[1.2rem] border border-line p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-purple">{item.articleType} · {item.status.replace("_", " ")}</p>
            <h2 className="mt-1 text-xl">{item.title}</h2>
            <p className="text-sm text-muted">{item.name} · {item.email}</p>
            <p className="mt-3 text-sm leading-6">{item.pitch}</p>
            <details className="mt-3 text-sm">
              <summary>Draft</summary>
              <p className="mt-2 whitespace-pre-wrap leading-7">{item.draft}</p>
            </details>
            <StatusForm id={item.id} current={item.status} kind="writing" />
          </article>
        ))}
        {submissions.length === 0 && <p className="text-sm text-muted">No writing submissions yet.</p>}
      </div>
    </div>
  );
}

function StatusForm({ id, current, kind }: { id: string; current: string; kind: "writing" | "idea" }) {
  return (
    <form
      className="mt-3 flex gap-2"
      action={async (formData) => {
        "use server";
        const status = String(formData.get("status"));
        if (kind === "writing") await updateSubmissionStatus(id, status as never);
      }}
    >
      <select name="status" defaultValue={current} className="rounded-xl border border-line bg-transparent px-2 py-1 text-sm">
        {SUBMISSION_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
      <button className="text-sm text-purple">Update</button>
    </form>
  );
}

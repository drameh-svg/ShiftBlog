import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/permissions";
import { createEditorAccount, updateMemberRole } from "@/app/actions/team";

export default async function TeamPage() {
  const user = await getCurrentUser();
  const members = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const admin = canManageTeam(user?.role);

  return (
    <div>
      <h1 className="display text-4xl">Team</h1>
      <p className="mt-2 text-sm text-muted">Public accounts never inherit editorial access. Only admins can change roles.</p>
      {admin && (
        <form action={createEditorAccount} className="mt-6 grid gap-3 rounded-[1.2rem] border border-line p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-medium">Add editorial account</h2>
          <input name="name" required placeholder="Name" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
          <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
          <input name="password" type="password" required minLength={8} placeholder="Temporary password" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
          <select name="role" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm">
            <option>EDITOR</option>
            <option>ADMIN</option>
          </select>
          <button className="rounded-full bg-fg px-4 py-2 text-sm text-bg">Create</button>
        </form>
      )}
      <ul className="mt-8 divide-y divide-line">
        {members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p>{member.name}</p>
              <p className="text-xs text-muted">{member.email}</p>
            </div>
            {admin ? (
              <form
                action={async (formData) => {
                  "use server";
                  await updateMemberRole(member.id, String(formData.get("role")) as never);
                }}
              >
                <select name="role" defaultValue={member.role} className="rounded-xl border border-line bg-transparent px-2 py-1">
                  <option>PUBLIC</option>
                  <option>EDITOR</option>
                  <option>ADMIN</option>
                </select>
                <button className="ml-2 text-purple">Save</button>
              </form>
            ) : (
              <span className="text-muted">{member.role}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

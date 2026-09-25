import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";
import TeamPanel from "@/components/TeamPanel";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const workspace = await getCurrentWorkspace(userId);
  if (!workspace) {
    return null;
  }

  const [members, invites] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invite.findMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const myMembership = members.find((m) => m.user.id === userId);
  const canInvite =
    myMembership?.role === "OWNER" || myMembership?.role === "ADMIN";

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-2xl text-ink">Team</h1>
        <p className="mt-1 text-sm text-muted">
          Manage who has access to {workspace.name}.
        </p>

        <div className="mt-8">
          <TeamPanel
            workspaceId={workspace.id}
            initialMembers={members}
            initialInvites={invites.map((i) => ({
              ...i,
              createdAt: i.createdAt.toISOString(),
            }))}
            canInvite={canInvite}
          />
        </div>
      </div>
    </main>
  );
}

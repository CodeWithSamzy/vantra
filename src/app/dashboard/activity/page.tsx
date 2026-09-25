import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";
import ActivityList from "@/components/ActivityList";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const workspace = await getCurrentWorkspace(userId);

  const entries = workspace
    ? await prisma.activityLog.findMany({
        where: { workspaceId: workspace.id },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-2xl text-ink">Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Everything happening in {workspace?.name}.
        </p>

        <div className="mt-8 rounded-lg border border-line bg-white">
          <ActivityList
            entries={entries.map((e) => ({
              id: e.id,
              action: e.action,
              createdAt: e.createdAt.toISOString(),
              user: e.user,
            }))}
          />
        </div>
      </div>
    </main>
  );
}
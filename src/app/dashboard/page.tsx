import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";
import VerifyEmailBanner from "@/components/VerifyEmailBanner";
import ProjectsPanel from "@/components/ProjectsPanel";
import ActivityList from "@/components/ActivityList";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const workspace = await getCurrentWorkspace(userId);
  const plan = session!.user!.plan;

  const [projects, recentActivity] = workspace
    ? await Promise.all([
        prisma.project.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.activityLog.findMany({
          where: { workspaceId: workspace.id },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ])
    : [[], []];

  const emailVerified = Boolean(
    (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true },
      })
    )?.emailVerified
  );

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl text-ink">
              Welcome back, {session!.user!.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {workspace?.name} &middot; you&apos;re on the{" "}
              <span className="font-medium text-accent-deep">{plan}</span>{" "}
              plan.
            </p>
          </div>
          {plan === "FREE" && (
            <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-deep hover:bg-accent/90">
              Upgrade to Pro
            </button>
          )}
        </div>

        {!emailVerified && (
          <VerifyEmailBanner email={session!.user!.email ?? ""} />
        )}

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-xs text-muted">Projects</p>
            <p className="mt-1 font-serif text-2xl text-ink">
              {projects.length}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-xs text-muted">Plan</p>
            <p className="mt-1 font-serif text-2xl text-ink">{plan}</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-xs text-muted">Status</p>
            <p className="mt-1 font-serif text-2xl text-ink">Active</p>
          </div>
        </div>

        <div className="mt-8">
          {workspace && (
            <ProjectsPanel
              workspaceId={workspace.id}
              initialProjects={projects}
            />
          )}
        </div>

        <div className="mt-8 rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line p-4">
            <span className="text-sm font-medium text-ink">
              Recent activity
            </span>
            <Link
              href="/dashboard/activity"
              className="text-sm text-accent-deep hover:underline"
            >
              View all
            </Link>
          </div>
          <ActivityList
            entries={recentActivity.map((e) => ({
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
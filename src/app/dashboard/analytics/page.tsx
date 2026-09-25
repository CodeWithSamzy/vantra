import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getWorkspaceAnalytics } from "@/lib/analytics";
import EmptyState from "@/components/EmptyState";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";

export const metadata = { title: "Analytics" };

function Breakdown({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate text-muted">{item.label}</span>
            <span className="tabular-nums text-ink">{item.value}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line p-4">
      <span className="text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const workspace = await getCurrentWorkspace(userId);

  if (!workspace) {
    return (
      <main className="flex-1 p-4 py-6 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-serif text-2xl text-ink">Analytics</h1>
          <div className="mt-8 rounded-lg border border-line bg-white">
            <EmptyState
              title="No workspace yet"
              description="Analytics fills in once your workspace has projects and tasks."
            />
          </div>
        </div>
      </main>
    );
  }

  const analytics = await getWorkspaceAnalytics(workspace.id);
  const { trend, totals } = analytics;

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-2xl text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          How {workspace.name} has been moving over the last {analytics.windowDays} days.
        </p>

        {totals.projects === 0 ? (
          <div className="mt-8 rounded-lg border border-line bg-white">
            <EmptyState
              title="Nothing to measure yet"
              description="Create a project and start checking off tasks, and your activity will show up here."
              actionLabel="Create a project"
              actionHref="/dashboard/projects"
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Active projects"
                value={totals.activeProjects}
                sub={`of ${totals.projects} projects`}
              />
              <StatCard
                label="Tasks done"
                value={totals.tasksDone}
                sub={`of ${totals.tasks} tasks`}
              />
              <StatCard
                label="Completion"
                value={`${analytics.completionRate}%`}
                sub="tasks completed"
              />
              <StatCard
                label="Activity (7d)"
                value={trend.last7}
                sub={
                  trend.pct === null
                    ? "no prior week to compare"
                    : `${trend.pct >= 0 ? "+" : ""}${trend.pct}% vs previous week`
                }
              />
            </div>

            <div className="mt-6 rounded-lg border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line p-4">
                <span className="text-sm font-medium text-ink">Activity</span>
                <span className="text-xs text-muted">
                  last {analytics.windowDays} days
                </span>
              </div>
              <div className="p-4">
                <BarChart data={analytics.dailyActivity} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-line bg-white">
                <CardHeader>Tasks by status</CardHeader>
                <div className="p-6">
                  {totals.tasks === 0 ? (
                    <EmptyState
                      compact
                      title="No tasks yet"
                      description="Add tasks to a project to see progress here."
                      actionLabel="Go to projects"
                      actionHref="/dashboard/projects"
                    />
                  ) : (
                    <DonutChart
                      segments={analytics.taskStatus}
                      caption="tasks"
                      ariaLabel="Tasks by status"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-white">
                <CardHeader>Projects by status</CardHeader>
                <div className="p-6">
                  <Breakdown items={analytics.projectsByStatus} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-line bg-white">
                <CardHeader>Most active people</CardHeader>
                <div className="p-6">
                  {analytics.contributors.length === 0 ? (
                    <EmptyState
                      compact
                      title="No activity yet"
                      description="Nothing has happened in this workspace over the last 30 days."
                    />
                  ) : (
                    <Breakdown
                      items={analytics.contributors.map((person) => ({
                        label: person.name,
                        value: person.count,
                      }))}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-white">
                <CardHeader>Busiest projects</CardHeader>
                <div className="p-6">
                  {analytics.busiestProjects.length === 0 ? (
                    <EmptyState
                      compact
                      title="No activity yet"
                      description="Project activity appears here as your team works."
                    />
                  ) : (
                    <ul className="space-y-3">
                      {analytics.busiestProjects.map((project) => (
                        <li
                          key={project.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="truncate text-ink hover:underline"
                          >
                            {project.name}
                          </Link>
                          <span className="tabular-nums text-muted">
                            {project.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
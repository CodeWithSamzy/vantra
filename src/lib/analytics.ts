import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function shortDay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type WorkspaceAnalytics = Awaited<
  ReturnType<typeof getWorkspaceAnalytics>
>;

export async function getWorkspaceAnalytics(workspaceId: string) {
  const today = startOfDay(new Date());
  const windowStart = new Date(today.getTime() - (WINDOW_DAYS - 1) * DAY_MS);
  const last7Start = new Date(today.getTime() - 6 * DAY_MS);
  const prev7Start = new Date(today.getTime() - 13 * DAY_MS);

  const [projects, tasks, activity, members] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true, status: true },
    }),
    prisma.task.findMany({
      where: { project: { workspaceId } },
      select: { id: true, status: true },
    }),
    prisma.activityLog.findMany({
      where: { workspaceId, createdAt: { gte: windowStart } },
      select: { createdAt: true, userId: true, projectId: true },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  const buckets = new Map<string, number>();
  for (let i = 0; i < WINDOW_DAYS; i++) {
    buckets.set(dayKey(new Date(windowStart.getTime() + i * DAY_MS)), 0);
  }
  for (const entry of activity) {
    const key = dayKey(entry.createdAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const dailyActivity = Array.from(buckets.entries()).map(([key, value]) => {
    const [year, month, day] = key.split("-").map(Number);
    return { label: shortDay(new Date(year, month, day)), value };
  });

  let activityLast7 = 0;
  let activityPrev7 = 0;
  for (const entry of activity) {
    if (entry.createdAt >= last7Start) activityLast7 += 1;
    else if (entry.createdAt >= prev7Start) activityPrev7 += 1;
  }

  const trendPct =
    activityPrev7 === 0
      ? null
      : Math.round(((activityLast7 - activityPrev7) / activityPrev7) * 100);

  const tasksTodo = tasks.filter((t) => t.status === "TODO").length;
  const tasksInProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;

  const statusCounts = new Map<string, number>();
  for (const project of projects) {
    statusCounts.set(project.status, (statusCounts.get(project.status) ?? 0) + 1);
  }

  const contributorCounts = new Map<string, number>();
  const projectCounts = new Map<string, number>();
  for (const entry of activity) {
    contributorCounts.set(
      entry.userId,
      (contributorCounts.get(entry.userId) ?? 0) + 1
    );
    if (entry.projectId) {
      projectCounts.set(
        entry.projectId,
        (projectCounts.get(entry.projectId) ?? 0) + 1
      );
    }
  }

  const memberNames = new Map(
    members.map((m) => [m.userId, m.user.name ?? m.user.email])
  );
  const contributors = Array.from(contributorCounts.entries())
    .map(([id, count]) => ({ name: memberNames.get(id) ?? "Former member", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const busiestProjects = Array.from(projectCounts.entries())
    .map(([id, count]) => ({
      id,
      name: projectNames.get(id) ?? "Deleted project",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    windowDays: WINDOW_DAYS,
    dailyActivity,
    trend: { last7: activityLast7, prev7: activityPrev7, pct: trendPct },
    totals: {
      projects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      tasks: tasks.length,
      tasksTodo,
      tasksInProgress,
      tasksDone,
    },
    completionRate:
      tasks.length === 0 ? 0 : Math.round((tasksDone / tasks.length) * 100),
    taskStatus: [
      { label: "To do", value: tasksTodo, color: "#c9c5bb" },
      { label: "In progress", value: tasksInProgress, color: "#d98e30" },
      { label: "Done", value: tasksDone, color: "#12151c" },
    ],
    projectsByStatus: Array.from(statusCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value),
    contributors,
    busiestProjects,
  };
}

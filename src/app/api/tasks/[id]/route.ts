import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, logActivity } from "@/lib/workspace";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

type TaskStatus = (typeof TASK_STATUSES)[number];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    (TASK_STATUSES as readonly string[]).includes(value)
  );
}

async function getAccessibleTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!task) return null;

  const membership = await getMembership(task.project.workspaceId, userId);
  if (!membership) return null;

  return task;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const task = await getAccessibleTask(id, session.user.id);
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!isTaskStatus(status)) {
    return NextResponse.json(
      { error: "That is not a valid task status." },
      { status: 400 }
    );
  }

  if (task.status === status) {
    return NextResponse.json(task);
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { status },
  });

  await logActivity({
    workspaceId: task.project.workspaceId,
    userId: session.user.id,
    action: `moved task "${task.title}" to ${STATUS_LABELS[status]}`,
    projectId: task.projectId,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const task = await getAccessibleTask(id, session.user.id);
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  await logActivity({
    workspaceId: task.project.workspaceId,
    userId: session.user.id,
    action: `deleted task "${task.title}" from "${task.project.name}"`,
    projectId: task.projectId,
  });

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
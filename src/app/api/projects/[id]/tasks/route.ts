import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, logActivity } from "@/lib/workspace";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const membership = await getMembership(project.workspaceId, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { title } = await req.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Task title is required." },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: { title: title.trim(), projectId },
  });

  await logActivity({
    workspaceId: project.workspaceId,
    userId: session.user.id,
    action: `added task "${task.title}" to "${project.name}"`,
    projectId: project.id,
  });

  return NextResponse.json(task, { status: 201 });
}
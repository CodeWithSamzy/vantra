import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, logActivity } from "@/lib/workspace";

async function getAccessibleProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return null;
  const membership = await getMembership(project.workspaceId, userId);
  if (!membership) return null;
  return project;
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
  const existing = await getAccessibleProject(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const body = await req.json();
  const data: { name?: string; description?: string | null; status?: string } = {};

  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim() || null;
  }
  if (typeof body.status === "string") {
    data.status = body.status;
  }

  const project = await prisma.project.update({ where: { id }, data });

  if (data.status) {
    await logActivity({
      workspaceId: project.workspaceId,
      userId: session.user.id,
      action: `marked "${project.name}" as ${data.status}`,
      projectId: project.id,
    });
  }

  return NextResponse.json(project);
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
  const existing = await getAccessibleProject(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  await logActivity({
    workspaceId: existing.workspaceId,
    userId: session.user.id,
    action: `deleted project "${existing.name}"`,
  });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, logActivity } from "@/lib/workspace";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { name, description, workspaceId } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Project name is required." },
      { status: 400 }
    );
  }
  if (!workspaceId) {
    return NextResponse.json(
      { error: "Workspace is required." },
      { status: 400 }
    );
  }

  const membership = await getMembership(workspaceId, session.user.id);
  if (!membership) {
    return NextResponse.json(
      { error: "You don't have access to this workspace." },
      { status: 403 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      workspaceId,
      createdById: session.user.id,
    },
  });

  await logActivity({
    workspaceId,
    userId: session.user.id,
    action: `created project "${project.name}"`,
    projectId: project.id,
  });

  return NextResponse.json(project, { status: 201 });
}
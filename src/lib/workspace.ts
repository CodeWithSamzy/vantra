import { prisma } from "@/lib/prisma";

function slugify(base: string) {
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + crypto.randomUUID().slice(0, 6)
  );
}

export async function createPersonalWorkspace(userId: string, name: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name: `${name}'s workspace`,
      slug: slugify(name),
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
  return workspace;
}

export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ ...m.workspace, role: m.role }));
}

export async function getCurrentWorkspace(
  userId: string,
  preferredId?: string | null
) {
  const workspaces = await getUserWorkspaces(userId);
  if (workspaces.length === 0) return null;

  if (preferredId) {
    const match = workspaces.find((w) => w.id === preferredId);
    if (match) return match;
  }

  return workspaces[0];
}

export async function getMembership(workspaceId: string, userId: string) {
  return prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
}

export async function logActivity({
  workspaceId,
  userId,
  action,
  projectId,
}: {
  workspaceId: string;
  userId: string;
  action: string;
  projectId?: string;
}) {
  await prisma.activityLog.create({
    data: { workspaceId, userId, action, projectId },
  });
}
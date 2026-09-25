import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/workspace";
import TaskBoard from "@/components/TaskBoard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });

  return { title: project?.name ?? "Project not found" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) notFound();

  const membership = await getMembership(project.workspaceId, userId);
  if (!membership) notFound();

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/projects"
          className="text-sm text-muted hover:text-ink"
        >
          ← All projects
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-ink">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-muted">{project.description}</p>
        )}

        <div className="mt-8">
          <TaskBoard projectId={project.id} initialTasks={project.tasks} />
        </div>
      </div>
    </main>
  );
}
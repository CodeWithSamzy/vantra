import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";
import ProjectsPanel from "@/components/ProjectsPanel";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const workspace = await getCurrentWorkspace(userId);
  const projects = workspace
    ? await prisma.project.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-2xl text-ink">Projects</h1>
        <p className="mt-1 text-sm text-muted">
          All your projects in one place.
        </p>

        <div className="mt-8">
          {workspace && (
            <ProjectsPanel
              workspaceId={workspace.id}
              initialProjects={projects}
            />
          )}
        </div>
      </div>
    </main>
  );
}

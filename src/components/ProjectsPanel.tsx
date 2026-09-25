"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string | Date;
};

type SortKey = "newest" | "oldest" | "name" | "status";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A-Z)" },
  { value: "status", label: "Status" },
];

function filterPillClass(active: boolean) {
  return active
    ? "rounded-md bg-ink px-2.5 py-1 text-xs text-paper"
    : "rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-ink";
}

export default function ProjectsPanel({
  workspaceId,
  initialProjects,
}: {
  workspaceId: string;
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const statuses = useMemo(
    () => Array.from(new Set(projects.map((p) => p.status))).sort(),
    [projects]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    const time = (v: string | Date) => new Date(v).getTime();

    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => time(a.createdAt) - time(b.createdAt));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        sorted.sort(
          (a, b) =>
            a.status.localeCompare(b.status) || a.name.localeCompare(b.name)
        );
        break;
      default:
        sorted.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    }

    return sorted;
  }, [projects, query, statusFilter, sort]);

  const filtersActive = query.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setName(p.name);
    setDescription(p.description ?? "");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);

    if (editing) {
      const res = await fetch(`/api/projects/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === editing.id ? data : p))
      );
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, workspaceId }),
      });
      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setProjects((prev) => [data, ...prev]);
    }

    setModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This can't be undone.")) return;

    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  };

  const toggleStatus = async (p: Project) => {
    const nextStatus = p.status === "active" ? "done" : "active";
    const res = await fetch(`/api/projects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      setProjects((prev) => prev.map((x) => (x.id === p.id ? data : x)));
      router.refresh();
    }
  };

  return (
    <>
      <div className="rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line p-4">
          <span className="text-sm font-medium text-ink">Your projects</span>
          <button
            onClick={openCreate}
            className="text-sm text-accent-deep hover:underline"
          >
            + New project
          </button>
        </div>


        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={filterPillClass(statusFilter === "all")}
            >
              All ({projects.length})
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={filterPillClass(statusFilter === s)}
              >
                {s} ({projects.filter((p) => p.status === s).length})
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="project-sort" className="sr-only">
              Sort projects
            </label>
            <select
              id="project-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink lg:w-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtersActive && visible.length > 0 && (
          <p className="border-b border-line px-4 py-2 text-xs text-muted">
            Showing {visible.length} of {projects.length}
          </p>
        )}

        {projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted">
              No projects yet. Create your first one to get started.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              Create project
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted">No projects match your search.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm text-accent-deep hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul>
            {visible.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between border-b border-line p-4 text-sm last:border-0"
              >
                <div>
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                  {p.description && (
                    <p className="mt-0.5 text-xs text-muted">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(p)}
                    className="text-muted hover:text-ink"
                    title="Click to toggle status"
                  >
                    {p.status}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs text-muted hover:text-ink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h2 className="font-serif text-lg text-ink">
              {editing ? "Edit project" : "New project"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1 block text-xs text-muted"
                >
                  Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="project-description"
                  className="mb-1 block text-xs text-muted"
                >
                  Description (optional)
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

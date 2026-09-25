"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

const NETWORK_ERROR =
  "We could not reach the server. Check your connection and try again.";

export default function TaskBoard({
  projectId,
  initialTasks,
}: {
  projectId: string;
  initialTasks: Task[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || adding) return;

    setError("");
    setAdding(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "We could not add that task. Please try again.");
        return;
      }

      setTasks((prev) => [...prev, data]);
      setNewTitle("");
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setAdding(false);
    }
  };

  const moveTask = async (task: Task, status: Task["status"]) => {
    if (busyTaskId) return;

    const previousStatus = task.status;
    setError("");
    setBusyTaskId(task.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: previousStatus } : t
          )
        );
        setError(data.error ?? "We could not move that task. Please try again.");
        return;
      }

      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
      router.refresh();
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: previousStatus } : t
        )
      );
      setError(NETWORK_ERROR);
    } finally {
      setBusyTaskId(null);
    }
  };

  const deleteTask = async (id: string) => {
    if (busyTaskId) return;

    setError("");
    setBusyTaskId(id);

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error ?? "We could not delete that task. Please try again."
        );
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <div>
      {error && (
        <p
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          type="text"
          placeholder="Add a task…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);

          return (
            <div key={col.key}>
              <div className="mb-2 text-xs font-medium text-muted">
                {col.label} ({columnTasks.length})
              </div>
              <div className="flex flex-col gap-2">
                {columnTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-lg border border-line bg-white p-3 text-sm ${
                      busyTaskId === t.id ? "opacity-60" : ""
                    }`}
                  >
                    <p className="text-ink">{t.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => moveTask(t, c.key)}
                            disabled={busyTaskId !== null}
                            className="text-muted hover:text-ink disabled:opacity-60"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        disabled={busyTaskId !== null}
                        className="text-red-600 hover:underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line p-3 text-xs text-muted">
                    Nothing here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
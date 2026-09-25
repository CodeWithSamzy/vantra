"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mt-8 rounded-lg border border-line bg-white p-8 text-center">
          <h1 className="font-serif text-xl text-ink">Something went wrong</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            We could not load this page. It is usually temporary - try again,
            and if it keeps happening come back in a few minutes.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
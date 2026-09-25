"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="font-serif text-xl text-ink">
          Vantra
        </Link>
        <h1 className="mt-8 font-serif text-2xl text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We could not load this page. It is usually temporary - try again, and
          if it keeps happening come back in a few minutes.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-ink"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
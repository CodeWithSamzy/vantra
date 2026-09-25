import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found - Vantra",
  description: "The page you were looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
          <Link href="/" className="font-serif text-xl text-ink">
            Vantra
          </Link>
          <p className="mt-10 text-sm font-medium text-accent-deep">404</p>
          <h1 className="mt-3 font-serif text-3xl text-ink">Page not found</h1>
          <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-muted">
            We couldn&apos;t find the page you were looking for. It may have
            been moved or deleted.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              Back to dashboard
            </Link>
            <Link href="/" className="text-sm text-muted hover:text-ink">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

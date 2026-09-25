import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-xl text-ink">Vantra</span>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <Link
            href="/signup"
            className="rounded-md bg-ink px-4 py-2 text-paper hover:bg-ink/90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-20 pb-32">
        <div className="max-w-2xl">
          <p className="text-sm text-accent-deep">For small teams who ship</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-ink sm:text-6xl">
            Run your projects without the busywork.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Vantra keeps your team&apos;s work in one place — no setup
            marathon, no bloated features you&apos;ll never touch.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-deep hover:bg-accent/90"
            >
              Start free
            </Link>
            <Link href="/login" className="text-sm text-muted hover:text-ink">
              Already have an account?
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-16 sm:grid-cols-3">
          <div>
            <h3 className="font-serif text-lg text-ink">Built for focus</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              One view of your projects — nothing to configure before you can
              use it.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">Fair pricing</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Start free. Upgrade only when your team actually outgrows it.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">Your data, secured</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every account is isolated and access-controlled from day one.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

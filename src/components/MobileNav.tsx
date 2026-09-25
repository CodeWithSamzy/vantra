"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NAV_LINKS } from "@/components/navLinks";

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      data-mobile-nav
      className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur lg:hidden"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-serif text-lg text-ink">
          Vantra
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="rounded-md border border-line bg-white p-2 text-ink hover:bg-paper"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav-panel"
          className="border-t border-line px-2 py-2 text-sm"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  active
                    ? "block rounded-md bg-ink px-3 py-2 text-paper"
                    : "block rounded-md px-3 py-2 text-muted hover:bg-white hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-muted hover:bg-white hover:text-ink"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
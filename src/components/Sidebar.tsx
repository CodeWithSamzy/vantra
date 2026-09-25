"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NAV_LINKS } from "@/components/navLinks";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-col justify-between border-r border-line p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
      <div>
        <Link href="/dashboard" className="font-serif text-xl text-ink">
          Vantra
        </Link>
        <nav className="mt-10 flex flex-col gap-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-md bg-ink px-3 py-2 text-paper"
                    : "rounded-md px-3 py-2 text-muted hover:bg-paper hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-left text-sm text-muted hover:text-ink"
      >
        Log out
      </button>
    </aside>
  );
}
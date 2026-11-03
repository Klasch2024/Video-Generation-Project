"use client";

import { Film, LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/videos", label: "All Videos", icon: Film, end: false },
];

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-base-700 bg-base-950 px-3">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-base-600 bg-base-850">
            <Film className="h-4 w-4 text-accent-500" />
          </div>
          <div>
            <div className="font-display text-sm font-bold leading-none text-base-50">
              Video Studio
            </div>
            <div className="mt-0.5 text-[11px] font-medium leading-none text-base-400">
              Production
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => {
            const isActive = end ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-base-800 text-base-50"
                    : "text-base-400 hover:bg-base-800 hover:text-base-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-[17px] w-[17px]",
                    isActive ? "text-accent-500" : "text-base-500"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pb-5">
          <div className="rounded-xl border border-base-700 bg-base-850 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-base-500">
              Character Studio
            </div>
            <div className="mt-0.5 text-[11px] text-base-400">
              Anime-style short-form video
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col pl-56">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-base-700 bg-base-950 px-8">
          <div />
          <Link
            href="/videos/new"
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Video
          </Link>
        </header>
        <main className="mx-4 mb-4 mt-4 min-w-0 flex-1 rounded-2xl border border-base-700 bg-base-850 px-8 py-8 shadow-card">
          {children}
        </main>
      </div>
    </div>
  );
}

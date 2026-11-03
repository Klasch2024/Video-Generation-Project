"use client";

import { Film, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { to: "/",       label: "Dashboard",  icon: LayoutGrid, exact: true  },
  { to: "/videos", label: "All Videos", icon: Film,        exact: false },
];

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-base-700 bg-base-950 px-3 py-4">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 bg-base-850">
            <Film className="h-4 w-4 text-base-300" />
          </div>
          <div>
            <div className="text-sm font-bold leading-none text-base-50">
              Video Studio
            </div>
            <div className="mt-0.5 text-[11px] leading-none text-base-500">
              Character Generator
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to) && pathname !== "/";
            const isActive = exact ? pathname === to : active;
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
                    "h-4 w-4",
                    isActive ? "text-base-200" : "text-base-600"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer hint */}
        <div className="rounded-xl border border-base-700 bg-base-900 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-base-600">
            Anime short-form
          </div>
          <div className="mt-0.5 text-[11px] text-base-500">
            Looksmaxing · Educational
          </div>
        </div>
      </aside>

      {/* Page content */}
      <div className="flex min-h-screen flex-1 flex-col pl-52">
        <main className="mx-4 mb-4 mt-4 min-w-0 flex-1 rounded-2xl border border-base-700 bg-base-850 px-8 py-8 shadow-card">
          {children}
        </main>
      </div>
    </div>
  );
}

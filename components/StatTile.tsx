import type { LucideIcon } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function StatTile({
  label,
  value,
  icon: Icon,
  sub,
  accent = "default",
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sub?: string;
  accent?: "default" | "success" | "warning" | "danger";
  className?: string;
}) {
  const chip = {
    default: "bg-base-700 text-base-300",
    success: "bg-success-500/15 text-success-500",
    warning: "bg-warning-500/15 text-warning-500",
    danger:  "bg-danger-500/15 text-danger-500",
  }[accent];

  return (
    <div
      className={cn(
        "rounded-2xl border border-base-700 bg-base-850 p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-base-500">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight text-base-50">
            {value}
          </div>
          {sub && (
            <div className="mt-1 text-xs text-base-400">{sub}</div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              chip
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
        )}
      </div>
    </div>
  );
}

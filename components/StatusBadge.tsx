import type { VideoStatus } from "@/lib/db";

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const MAP: Record<VideoStatus, { label: string; cls: string }> = {
  planned:     { label: "Planned",     cls: "border-base-600 bg-base-800 text-base-400" },
  in_progress: { label: "In Progress", cls: "border-warning-500/40 bg-warning-500/10 text-warning-500" },
  completed:   { label: "Completed",   cls: "border-success-500/40 bg-success-500/10 text-success-500" },
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const { label, cls } = MAP[status] ?? MAP.planned;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cls)}>
      {label}
    </span>
  );
}

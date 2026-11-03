function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function PlatformBadge({
  label,
  posted,
}: {
  label: string;
  posted: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        posted
          ? "border-success-500/40 bg-success-500/10 text-success-500"
          : "border-base-600 bg-base-800 text-base-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          posted ? "bg-success-500" : "bg-base-600"
        )}
      />
      {label}
    </span>
  );
}

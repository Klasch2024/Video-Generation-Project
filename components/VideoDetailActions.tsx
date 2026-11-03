"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Video, VideoStatus } from "@/lib/db";

export function VideoDetailActions({ video }: { video: Video }) {
  const router = useRouter();
  const [status, setStatus] = useState<VideoStatus>(video.status);
  const [yt, setYt] = useState(video.youtube_posted);
  const [tt, setTt] = useState(video.tiktok_posted);
  const [saving, setSaving] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
    setSaving(false);
  }

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as VideoStatus;
    setStatus(s);
    await patch({ status: s });
  }

  async function toggleYt() {
    setYt((v) => !v);
    await patch({ youtube_posted: !yt });
  }

  async function toggleTt() {
    setTt((v) => !v);
    await patch({ tiktok_posted: !tt });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={handleStatus}
        disabled={saving}
        className="rounded-xl border border-base-600 bg-base-800 px-3 py-2 text-sm font-medium text-base-200 outline-none focus:border-accent-500 disabled:opacity-50"
      >
        <option value="planned">Planned</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <Toggle label="YouTube" active={yt} onToggle={toggleYt} disabled={saving} />
      <Toggle label="TikTok" active={tt} onToggle={toggleTt} disabled={saving} />
    </div>
  );
}

function Toggle({
  label,
  active,
  onToggle,
  disabled,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={[
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50",
        active
          ? "border-success-500/40 bg-success-500/10 text-success-500"
          : "border-base-600 bg-base-800 text-base-400 hover:border-base-500 hover:text-base-200",
      ].join(" ")}
    >
      <span className={[
        "h-2 w-2 rounded-full",
        active ? "bg-success-500" : "bg-base-600",
      ].join(" ")} />
      {label}
    </button>
  );
}

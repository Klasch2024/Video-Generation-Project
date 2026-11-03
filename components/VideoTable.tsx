"use client";

import { useState } from "react";
import { Download, ExternalLink, Trash2, Plus, Check, X, Music, Link2 } from "lucide-react";
import type { Video, VideoStatus, VideoPart } from "@/lib/db";

function cn(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

async function apiPatch(id: number, body: Record<string, unknown>) {
  await fetch(`/api/videos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const STATUS_STYLES: Record<VideoStatus, string> = {
  planned:     "bg-base-700 text-base-300",
  in_progress: "bg-warning-500/15 text-warning-500",
  completed:   "bg-success-500/15 text-success-500",
};

const STATUS_LABELS: Record<VideoStatus, string> = {
  planned:     "Planned",
  in_progress: "In Progress",
  completed:   "Completed",
};

// ─── Inline status dropdown ───────────────────────────────────────────────────
function StatusPill({
  status,
  onChange,
}: {
  status: VideoStatus;
  onChange: (s: VideoStatus) => void;
}) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as VideoStatus)}
      className={cn(
        "cursor-pointer appearance-none rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none",
        STATUS_STYLES[status]
      )}
    >
      <option value="planned">Planned</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}

// ─── Platform toggle button ───────────────────────────────────────────────────
function PlatformToggle({
  label,
  posted,
  onToggle,
}: {
  label: string;
  posted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title={posted ? `${label}: posted` : `${label}: not posted — click to mark`}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        posted
          ? "bg-success-500/15 text-success-500"
          : "bg-base-700 text-base-500 hover:text-base-300"
      )}
    >
      {posted && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}

// ─── Inline add-part form ─────────────────────────────────────────────────────
function AddPartInline({
  videoId,
  nextPart,
  onAdded,
}: {
  videoId: number;
  nextPart: number;
  onAdded: (part: VideoPart) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gofile, setGofile] = useState("");
  const [download, setDownload] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/videos/${videoId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        part_number: nextPart,
        gofile_url: gofile.trim() || undefined,
        download_url: download.trim() || undefined,
      }),
    });
    if (!res.ok) {
      setError("Failed to add part.");
      setLoading(false);
      return;
    }
    const part = await res.json();
    onAdded(part);
    setGofile("");
    setDownload("");
    setOpen(false);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-base-500 hover:text-base-300 transition-colors py-2"
      >
        <Plus className="h-3.5 w-3.5" />
        Add part {nextPart}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <span className="w-16 text-xs font-semibold text-base-400">Part {nextPart}</span>
      <input
        type="url"
        placeholder="Gofile URL (view)"
        value={gofile}
        onChange={(e) => setGofile(e.target.value)}
        className="h-8 flex-1 min-w-[180px] rounded-lg border border-base-600 bg-base-900 px-3 text-xs text-base-100 placeholder:text-base-600 outline-none focus:border-accent-600"
      />
      <input
        type="url"
        placeholder="Download URL (tmpfiles)"
        value={download}
        onChange={(e) => setDownload(e.target.value)}
        className="h-8 flex-1 min-w-[180px] rounded-lg border border-base-600 bg-base-900 px-3 text-xs text-base-100 placeholder:text-base-600 outline-none focus:border-accent-600"
      />
      {error && <span className="text-xs text-danger-500">{error}</span>}
      <button
        type="submit"
        disabled={loading}
        className="h-8 rounded-lg bg-base-700 px-3 text-xs font-semibold text-base-200 hover:bg-base-600 disabled:opacity-50"
      >
        {loading ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="h-8 rounded-lg px-2 text-base-500 hover:text-base-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────
function VideoCard({
  video: initial,
  onDelete,
}: {
  video: Video;
  onDelete: (id: number) => void;
}) {
  const [video, setVideo] = useState(initial);

  async function handleStatus(status: VideoStatus) {
    await apiPatch(video.id, { status });
    setVideo((v) => ({ ...v, status }));
  }

  async function handlePlatform(field: "youtube_posted" | "tiktok_posted") {
    const next = !video[field];
    await apiPatch(video.id, { [field]: next });
    setVideo((v) => ({ ...v, [field]: next }));
  }

  async function handleDeletePart(partId: number) {
    await fetch(`/api/videos/${video.id}/parts?partId=${partId}`, { method: "DELETE" });
    setVideo((v) => ({ ...v, parts: v.parts?.filter((p) => p.id !== partId) }));
  }

  function handlePartAdded(part: VideoPart) {
    setVideo((v) => ({ ...v, parts: [...(v.parts ?? []), part] }));
  }

  const parts = video.parts ?? [];
  const nextPart = parts.length + 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-base-700 bg-base-850">
      {/* ── Card header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-base-700 bg-base-800/60 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-base-50 leading-snug">
            {video.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {video.topic && (
              <span className="text-xs text-base-500">{video.topic}</span>
            )}
            {video.bg_music_url && (
              <a
                href={video.bg_music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-base-500 hover:text-base-300 transition-colors"
              >
                <Music className="h-3 w-3" />
                Music
              </a>
            )}
            {video.thread_url && (
              <a
                href={video.thread_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-base-500 hover:text-base-300 transition-colors"
              >
                <Link2 className="h-3 w-3" />
                Thread
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={video.status} onChange={handleStatus} />
          <PlatformToggle
            label="YouTube"
            posted={video.youtube_posted}
            onToggle={() => handlePlatform("youtube_posted")}
          />
          <PlatformToggle
            label="TikTok"
            posted={video.tiktok_posted}
            onToggle={() => handlePlatform("tiktok_posted")}
          />
          <button
            onClick={() => {
              if (confirm(`Delete "${video.title}" and all its parts?`)) {
                onDelete(video.id);
              }
            }}
            className="rounded-lg p-1.5 text-base-600 hover:bg-base-700 hover:text-danger-500 transition-colors"
            title="Delete video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Parts table ── */}
      <div className="divide-y divide-base-700/60">
        {parts.length === 0 && (
          <div className="px-5 py-3 text-xs text-base-600 italic">No parts yet</div>
        )}

        {parts.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[64px_1fr_1fr_32px] items-center gap-3 px-5 py-2.5 hover:bg-base-800/40 transition-colors"
          >
            <span className="text-xs font-semibold text-base-400">
              Part {p.part_number}
            </span>

            {/* Gofile / view */}
            {p.gofile_url ? (
              <a
                href={p.gofile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-base-300 hover:text-accent-500 transition-colors truncate"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{p.gofile_url.replace("https://gofile.io/d/", "gofile/")}</span>
              </a>
            ) : (
              <span className="text-xs text-base-600">— no view link</span>
            )}

            {/* Download */}
            {p.download_url ? (
              <a
                href={p.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-base-300 hover:text-accent-500 transition-colors truncate"
              >
                <Download className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Download MP4</span>
              </a>
            ) : (
              <span className="text-xs text-base-600">— no download</span>
            )}

            <button
              onClick={() => handleDeletePart(p.id)}
              className="justify-self-end rounded p-1 text-base-700 hover:text-danger-500 transition-colors"
              title="Remove part"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add part */}
        <div className="px-5">
          <AddPartInline
            videoId={video.id}
            nextPart={nextPart}
            onAdded={handlePartAdded}
          />
        </div>
      </div>

      {/* ── Description ── */}
      {video.description && (
        <div className="border-t border-base-700/60 px-5 py-3">
          <p className="text-xs leading-relaxed text-base-500">{video.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function VideoTable({ videos: initial }: { videos: Video[] }) {
  const [videos, setVideos] = useState(initial);

  async function handleDelete(id: number) {
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setVideos((v) => v.filter((x) => x.id !== id));
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-500">
        <p className="text-sm">No videos yet. Hit &ldquo;New Video&rdquo; to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} onDelete={handleDelete} />
      ))}
    </div>
  );
}

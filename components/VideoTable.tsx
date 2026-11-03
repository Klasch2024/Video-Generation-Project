"use client";

import { useState } from "react";
import {
  Download, ExternalLink, Trash2, Plus, Check, X,
  Music, Link2, Pencil, Save, ChevronDown, ChevronUp,
} from "lucide-react";
import type { Video, VideoStatus, VideoPart } from "@/lib/db";

function cn(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

async function apiPatch(id: number, body: Record<string, unknown>) {
  const res = await fetch(`/api/videos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

const STATUS_STYLES: Record<VideoStatus, string> = {
  planned:     "bg-base-700 text-base-300",
  in_progress: "bg-warning-500/15 text-warning-500",
  completed:   "bg-success-500/15 text-success-500",
};

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status, onChange }: { status: VideoStatus; onChange: (s: VideoStatus) => void }) {
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

// ─── Platform toggle ──────────────────────────────────────────────────────────
function PlatformToggle({ label, posted, onToggle }: { label: string; posted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={posted ? `${label}: posted — click to unmark` : `${label}: not posted — click to mark`}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        posted ? "bg-success-500/15 text-success-500" : "bg-base-700 text-base-500 hover:text-base-300"
      )}
    >
      {posted && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}

// ─── Inline edit form for video metadata ─────────────────────────────────────
function EditForm({
  video,
  onSave,
  onCancel,
}: {
  video: Video;
  onSave: (updated: Partial<Video>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle]       = useState(video.title);
  const [topic, setTopic]       = useState(video.topic ?? "");
  const [music, setMusic]       = useState(video.bg_music_url ?? "");
  const [thread, setThread]     = useState(video.thread_url ?? "");
  const [desc, setDesc]         = useState(video.description ?? "");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    const patch = {
      title:        title.trim(),
      topic:        topic.trim() || null,
      bg_music_url: music.trim() || null,
      thread_url:   thread.trim() || null,
      description:  desc.trim() || null,
    };
    const ok = await apiPatch(video.id, patch);
    if (!ok) { setError("Save failed — try again."); setLoading(false); return; }
    onSave(patch);
    setLoading(false);
  }

  const inputCls = "w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-base-400";

  return (
    <form onSubmit={handleSave} className="space-y-3 border-t border-base-700 bg-base-900/50 px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-base-500">Edit details</p>

      {error && (
        <p className="rounded-lg bg-danger-500/10 px-3 py-1.5 text-xs text-danger-500">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-medium text-base-500">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-base-500">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Testosterone, Lipmaxing…"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-base-500">Background Music URL</label>
          <input
            type="url"
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputCls}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-medium text-base-500">Source Thread URL</label>
          <input
            type="url"
            value={thread}
            onChange={(e) => setThread(e.target.value)}
            placeholder="https://looksmax.org/threads/…"
            className={inputCls}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-medium text-base-500">Description / Hashtags</label>
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description and hashtags for social posting…"
            className={cn(inputCls, "resize-none")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-base-600 px-4 py-1.5 text-xs font-medium text-base-400 hover:bg-base-800"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          <Save className="h-3 w-3" /> {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ─── Editable part row ───────────────────────────────────────────────────────
function PartRow({
  videoId,
  part,
  onUpdate,
  onDelete,
}: {
  videoId: number;
  part: VideoPart;
  onUpdate: (updated: VideoPart) => void;
  onDelete: (partId: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [gofile, setGofile]   = useState(part.gofile_url ?? "");
  const [download, setDownload] = useState(part.download_url ?? "");
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        part_number:  part.part_number,
        gofile_url:   gofile.trim() || null,
        download_url: download.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
    }
    setLoading(false);
  }

  const inputCls = "h-7 flex-1 min-w-[140px] rounded border border-base-600 bg-base-900 px-2 text-xs text-base-100 placeholder:text-base-600 outline-none focus:border-base-400";

  if (editing) {
    return (
      <form
        onSubmit={save}
        className="flex flex-wrap items-center gap-2 px-5 py-2 bg-base-900/40"
      >
        <span className="w-14 text-xs font-semibold text-base-400">Part {part.part_number}</span>
        <input
          type="url"
          placeholder="Gofile URL"
          value={gofile}
          onChange={(e) => setGofile(e.target.value)}
          className={inputCls}
        />
        <input
          type="url"
          placeholder="Download URL (tmpfiles)"
          value={download}
          onChange={(e) => setDownload(e.target.value)}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-7 rounded bg-base-700 px-3 text-xs font-semibold text-base-200 hover:bg-base-600 disabled:opacity-50"
        >
          {loading ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setGofile(part.gofile_url ?? ""); setDownload(part.download_url ?? ""); setEditing(false); }}
          className="h-7 rounded px-2 text-base-500 hover:text-base-300"
        >
          <X className="h-3 w-3" />
        </button>
      </form>
    );
  }

  return (
    <div className="group grid grid-cols-[64px_1fr_1fr_56px] items-center gap-3 px-5 py-2.5 hover:bg-base-800/40 transition-colors">
      <span className="text-xs font-semibold text-base-400">Part {part.part_number}</span>

      {part.gofile_url ? (
        <a
          href={part.gofile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 truncate text-xs text-base-300 hover:text-accent-500 transition-colors"
        >
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{part.gofile_url.replace("https://gofile.io/d/", "gofile/")}</span>
        </a>
      ) : (
        <span className="text-xs text-base-600 italic">— no view link</span>
      )}

      {part.download_url ? (
        <a
          href={part.download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 truncate text-xs text-base-300 hover:text-accent-500 transition-colors"
        >
          <Download className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Download MP4</span>
        </a>
      ) : (
        <span className="text-xs text-base-600 italic">— no download</span>
      )}

      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1 text-base-700 opacity-0 group-hover:opacity-100 hover:text-base-300 transition-all"
          title="Edit part"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={() => onDelete(part.id)}
          className="rounded p-1 text-base-700 opacity-0 group-hover:opacity-100 hover:text-danger-500 transition-all"
          title="Remove part"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Inline add-part form ─────────────────────────────────────────────────────
function AddPartInline({ videoId, nextPart, onAdded }: { videoId: number; nextPart: number; onAdded: (part: VideoPart) => void }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [gofile, setGofile]   = useState("");
  const [download, setDownload] = useState("");
  const [error, setError]     = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/videos/${videoId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        part_number:  nextPart,
        gofile_url:   gofile.trim() || undefined,
        download_url: download.trim() || undefined,
      }),
    });
    if (!res.ok) { setError("Failed to add part."); setLoading(false); return; }
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
        className="flex items-center gap-1.5 py-2 text-xs font-medium text-base-600 hover:text-base-300 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add part {nextPart}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <span className="w-14 text-xs font-semibold text-base-400">Part {nextPart}</span>
      <input
        type="url"
        placeholder="Gofile URL (view)"
        value={gofile}
        onChange={(e) => setGofile(e.target.value)}
        className="h-8 flex-1 min-w-[160px] rounded-lg border border-base-600 bg-base-900 px-3 text-xs text-base-100 placeholder:text-base-600 outline-none focus:border-base-400"
      />
      <input
        type="url"
        placeholder="Download URL (tmpfiles)"
        value={download}
        onChange={(e) => setDownload(e.target.value)}
        className="h-8 flex-1 min-w-[160px] rounded-lg border border-base-600 bg-base-900 px-3 text-xs text-base-100 placeholder:text-base-600 outline-none focus:border-base-400"
      />
      {error && <span className="text-xs text-danger-500">{error}</span>}
      <button
        type="submit"
        disabled={loading}
        className="h-8 rounded-lg bg-base-700 px-3 text-xs font-semibold text-base-200 hover:bg-base-600 disabled:opacity-50"
      >
        {loading ? "…" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-lg px-2 text-base-500 hover:text-base-300">
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────
function VideoCard({ video: initial, onDelete }: { video: Video; onDelete: (id: number) => void }) {
  const [video, setVideo]   = useState(initial);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(true);

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

  function handlePartUpdated(updated: VideoPart) {
    setVideo((v) => ({
      ...v,
      parts: v.parts?.map((p) => (p.id === updated.id ? updated : p)),
    }));
  }

  function handleSave(updated: Partial<Video>) {
    setVideo((v) => ({ ...v, ...updated }));
    setEditing(false);
  }

  const parts    = video.parts ?? [];
  const nextPart = parts.length + 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-base-700 bg-base-850">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-base-700 bg-base-800/50 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug text-base-50">{video.title}</h3>
          </div>
          {video.topic && (
            <span className="mt-0.5 inline-block text-xs text-base-500">{video.topic}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={video.status} onChange={handleStatus} />
          <PlatformToggle label="YouTube" posted={video.youtube_posted} onToggle={() => handlePlatform("youtube_posted")} />
          <PlatformToggle label="TikTok"  posted={video.tiktok_posted}  onToggle={() => handlePlatform("tiktok_posted")} />

          <button
            onClick={() => { setEditing((e) => !e); setExpanded(true); }}
            title="Edit details"
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              editing ? "bg-base-700 text-base-200" : "text-base-600 hover:bg-base-700 hover:text-base-200"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => { if (confirm(`Delete "${video.title}"?`)) onDelete(video.id); }}
            className="rounded-lg p-1.5 text-base-600 hover:bg-base-700 hover:text-danger-500 transition-colors"
            title="Delete video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Info bar (music / thread / description preview) ── */}
      <div
        className={cn(
          "border-b border-base-700/60 px-5",
          (video.bg_music_url || video.thread_url || video.description) ? "" : "hidden"
        )}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-between py-2.5 text-left"
        >
          <div className="flex flex-wrap items-center gap-4">
            {video.bg_music_url && (
              <a
                href={video.bg_music_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-base-500 hover:text-base-300 transition-colors"
              >
                <Music className="h-3 w-3" />
                Background Music ↗
              </a>
            )}
            {video.thread_url && (
              <a
                href={video.thread_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-base-500 hover:text-base-300 transition-colors"
              >
                <Link2 className="h-3 w-3" />
                Source Thread ↗
              </a>
            )}
            {video.description && (
              <span className="max-w-md truncate text-xs text-base-600 italic">
                {video.description}
              </span>
            )}
          </div>
          <span className="ml-2 flex-shrink-0 text-base-600">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {/* Expanded description */}
        {expanded && video.description && (
          <div className="pb-3">
            <p className="rounded-lg bg-base-900/60 px-3 py-2.5 text-xs leading-relaxed text-base-400">
              {video.description}
            </p>
          </div>
        )}
      </div>

      {/* ── Edit form ── */}
      {editing && (
        <EditForm
          video={video}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* ── Parts ── */}
      <div className="divide-y divide-base-700/60">
        {parts.length === 0 && (
          <div className="px-5 py-2.5 text-xs italic text-base-600">No parts yet</div>
        )}

        {parts.map((p) => (
          <PartRow
            key={p.id}
            videoId={video.id}
            part={p}
            onUpdate={handlePartUpdated}
            onDelete={handleDeletePart}
          />
        ))}

        {/* Add part */}
        <div className="px-5">
          <AddPartInline videoId={video.id} nextPart={nextPart} onAdded={handlePartAdded} />
        </div>
      </div>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Download, ExternalLink, Trash2 } from "lucide-react";
import type { Video, VideoStatus } from "@/lib/db";
import { StatusBadge } from "./StatusBadge";
import { PlatformBadge } from "./PlatformBadge";

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function formatTopic(topic: string | null) {
  return topic ?? "—";
}

async function patch(id: number, body: Record<string, unknown>) {
  await fetch(`/api/videos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function VideoTable({
  videos: initial,
}: {
  videos: Video[];
}) {
  const [videos, setVideos] = useState(initial);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleStatus(id: number, status: VideoStatus) {
    await patch(id, { status });
    setVideos((v) => v.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function handleToggle(id: number, field: "tiktok_posted" | "youtube_posted", current: boolean) {
    await patch(id, { [field]: !current });
    setVideos((v) =>
      v.map((x) => (x.id === id ? { ...x, [field]: !current } : x))
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this video and all its parts?")) return;
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
    <div className="overflow-hidden rounded-xl border border-base-700">
      {/* Header */}
      <div className="grid grid-cols-[1fr_110px_130px_140px_80px_44px] items-center gap-4 border-b border-base-700 bg-base-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-base-500">
        <span>Title / Topic</span>
        <span>Parts</span>
        <span>Status</span>
        <span>Platforms</span>
        <span className="text-right">Links</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-base-700">
        {videos.map((v) => {
          const open = expanded.has(v.id);
          const partCount = v.parts?.length ?? 0;
          return (
            <div key={v.id}>
              {/* Main row */}
              <div className="grid grid-cols-[1fr_110px_130px_140px_80px_44px] items-center gap-4 px-4 py-3 transition-colors hover:bg-base-800">
                {/* Title */}
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    onClick={() => toggle(v.id)}
                    className="flex-shrink-0 rounded p-0.5 text-base-500 hover:text-base-200"
                    aria-label="expand"
                  >
                    {open
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0">
                    <Link
                      href={`/videos/${v.id}`}
                      className="truncate text-sm font-semibold text-base-100 hover:text-accent-500"
                    >
                      {v.title}
                    </Link>
                    {v.topic && (
                      <div className="mt-0.5 text-[11px] text-base-500">
                        {formatTopic(v.topic)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Parts */}
                <span className="text-sm text-base-400">
                  {partCount} {partCount === 1 ? "part" : "parts"}
                </span>

                {/* Status select */}
                <select
                  value={v.status}
                  onChange={(e) => handleStatus(v.id, e.target.value as VideoStatus)}
                  className="w-full rounded-lg border border-base-600 bg-base-800 px-2 py-1 text-[11px] font-medium text-base-200 outline-none focus:border-accent-500"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => handleToggle(v.id, "youtube_posted", v.youtube_posted)}>
                    <PlatformBadge label="YT" posted={v.youtube_posted} />
                  </button>
                  <button onClick={() => handleToggle(v.id, "tiktok_posted", v.tiktok_posted)}>
                    <PlatformBadge label="TT" posted={v.tiktok_posted} />
                  </button>
                </div>

                {/* Links */}
                <div className="flex justify-end gap-1">
                  {v.thread_url && (
                    <a
                      href={v.thread_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-base-500 hover:bg-base-700 hover:text-base-200"
                      title="Source thread"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(v.id)}
                  className="flex justify-center rounded-lg p-1.5 text-base-600 hover:bg-base-700 hover:text-danger-500"
                  title="Delete video"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Parts drawer */}
              {open && (
                <div className="border-t border-base-700 bg-base-900 px-4 py-3">
                  {partCount === 0 ? (
                    <p className="text-xs text-base-500">No parts yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {v.parts!.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-4 rounded-lg border border-base-700 bg-base-850 px-4 py-2.5"
                        >
                          <span className="w-16 text-xs font-semibold text-base-400">
                            Part {p.part_number}
                          </span>
                          {p.gofile_url && (
                            <a
                              href={p.gofile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-base-300 hover:text-accent-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          )}
                          {p.download_url && (
                            <a
                              href={p.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-base-300 hover:text-accent-500"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          )}
                          {p.duration_seconds && (
                            <span className="ml-auto text-xs text-base-500">
                              {Math.floor(p.duration_seconds / 60)}m {p.duration_seconds % 60}s
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/videos/${v.id}`}
                      className="text-xs font-medium text-base-400 hover:text-accent-500"
                    >
                      Manage parts →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

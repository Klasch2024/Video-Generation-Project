"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function AddVideoForm({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title:        (fd.get("title") as string).trim(),
      topic:        (fd.get("topic") as string).trim() || undefined,
      thread_url:   (fd.get("thread_url") as string).trim() || undefined,
      bg_music_url: (fd.get("bg_music_url") as string).trim() || undefined,
      description:  (fd.get("description") as string).trim() || undefined,
    };
    if (!body.title) { setError("Title is required."); setLoading(false); return; }

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const { error: e } = await res.json().catch(() => ({}));
      setError(e ?? "Failed to create video.");
      setLoading(false);
      return;
    }
    const video = await res.json();
    router.push(`/videos/${video.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-base-50">New Video</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-base-400 hover:bg-base-700 hover:text-base-100">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
          {error}
        </p>
      )}

      <Field label="Title *" name="title" placeholder="How To Increase Testosterone Naturally" />
      <Field label="Topic" name="topic" placeholder="Testosterone, Lipmaxing, Neck Training…" />
      <Field label="Source thread URL" name="thread_url" placeholder="https://looksmax.org/threads/…" type="url" />
      <Field label="Background music YouTube URL" name="bg_music_url" placeholder="https://www.youtube.com/watch?v=…" type="url" />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-400">Description / Hashtags</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Short description and hashtags for social posting"
          className="w-full resize-none rounded-xl border border-base-600 bg-base-800 px-4 py-2.5 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-base-600 px-5 py-2 text-sm font-medium text-base-300 hover:bg-base-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent-500 px-6 py-2 text-sm font-semibold text-ink disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {loading ? "Creating…" : "Create video"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-base-400">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full rounded-xl border border-base-600 bg-base-800 px-4 py-2.5 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
      />
    </div>
  );
}

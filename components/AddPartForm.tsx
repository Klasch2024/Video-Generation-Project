"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddPartForm({
  videoId,
  nextPart,
  onAdded,
}: {
  videoId: number;
  nextPart: number;
  onAdded: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      part_number:      Number(fd.get("part_number")),
      gofile_url:       (fd.get("gofile_url") as string).trim() || undefined,
      download_url:     (fd.get("download_url") as string).trim() || undefined,
      duration_seconds: fd.get("duration_seconds")
        ? Number(fd.get("duration_seconds"))
        : undefined,
    };
    const res = await fetch(`/api/videos/${videoId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const { error: e } = await res.json().catch(() => ({}));
      setError(e ?? "Failed to add part.");
      setLoading(false);
      return;
    }
    setOpen(false);
    setLoading(false);
    onAdded();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-dashed border-base-600 px-5 py-2.5 text-sm font-medium text-base-400 hover:border-accent-500 hover:text-accent-500 transition-colors"
      >
        + Add part
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-base-700 bg-base-900 p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-base-200">Add Part</h3>
      {error && (
        <p className="text-sm text-danger-500">{error}</p>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-base-500">Part #</label>
          <input
            type="number"
            name="part_number"
            defaultValue={nextPart}
            min={1}
            required
            className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="block text-xs font-medium text-base-500">Gofile view URL</label>
          <input
            type="url"
            name="gofile_url"
            placeholder="https://gofile.io/d/…"
            className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-accent-500"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="block text-xs font-medium text-base-500">Download URL (tmpfiles)</label>
          <input
            type="url"
            name="download_url"
            placeholder="https://tmpfiles.org/dl/…"
            className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-accent-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-base-500">Duration (sec)</label>
          <input
            type="number"
            name="duration_seconds"
            min={0}
            placeholder="90"
            className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-600 outline-none focus:border-accent-500"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-base-600 px-4 py-2 text-sm font-medium text-base-400 hover:bg-base-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent-500 px-5 py-2 text-sm font-semibold text-ink disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {loading ? "Saving…" : "Save part"}
        </button>
      </div>
    </form>
  );
}

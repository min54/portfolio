"use client";

import { useState } from "react";
import type { DevTool } from "@/types/devtool";
import { createDevToolAction, updateDevToolAction } from "@/app/admin/devtools/actions";

interface Props {
  devtool?: DevTool;
}

export default function DevToolForm({ devtool }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!devtool;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const title       = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const url         = (form.elements.namedItem("url") as HTMLInputElement).value || null;
    const is_published = (form.elements.namedItem("is_published") as HTMLInputElement).checked;

    const data = { title, description: description || null, url, is_published, order_index: 0 };

    const result = isEdit
      ? await updateDevToolAction(devtool.id, data)
      : await createDevToolAction(data);

    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">제목 *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={devtool?.title ?? ""}
          placeholder="개발도구 이름"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">설명</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={devtool?.description ?? ""}
          placeholder="개발도구 설명"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">URL <span className="text-zinc-600">(선택)</span></label>
        <input
          name="url"
          type="url"
          defaultValue={devtool?.url ?? ""}
          placeholder="https://example.com"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          name="is_published"
          type="checkbox"
          defaultChecked={devtool?.is_published ?? true}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-900"
        />
        <span className="text-sm text-zinc-400">공개</span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
      >
        {loading ? "저장 중..." : isEdit ? "저장" : "추가"}
      </button>
    </form>
  );
}

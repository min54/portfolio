"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadFile } from "@/lib/storage";
import { updateWorkAction } from "@/app/admin/actions";
import type { Work } from "@/types/database";

const ORIENTATIONS = ["landscape", "portrait", "square"] as const;

interface Props {
  work: Work;
}

export default function EditForm({ work }: Props) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(work.thumbnail_url);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const title = (form.elements.namedItem("title") as HTMLInputElement).value;
      const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
      const orientation = (form.elements.namedItem("orientation") as HTMLSelectElement).value as
        | "landscape" | "portrait" | "square";
      const is_published = (form.elements.namedItem("is_published") as HTMLInputElement).checked;

      const info = (form.elements.namedItem("info") as HTMLTextAreaElement).value;
      const url = (form.elements.namedItem("url") as HTMLInputElement).value || null;
      let thumbnail_url = work.thumbnail_url;
      let video_url = work.video_url;

      if (thumbnailFile) thumbnail_url = await uploadFile("thumbnails", thumbnailFile);
      if (videoFile) video_url = await uploadFile("videos", videoFile);

      const result = await updateWorkAction(work.id, {
        title,
        description: description || null,
        info: info || null,
        thumbnail_url,
        video_url,
        url,
        orientation,
        is_published,
      });

      if (result?.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">제목 *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={work.title}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">설명</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={work.description ?? ""}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">
          Info <span className="text-zinc-600">(선택 — 카드 우측에 표시될 상세 텍스트)</span>
        </label>
        <textarea
          name="info"
          rows={5}
          defaultValue={work.info ?? ""}
          placeholder="기술 스택, 제작 배경, 링크 등 상세 정보 (선택)"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">방향 *</label>
        <select
          name="orientation"
          defaultValue={work.orientation}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-400 transition-colors"
        >
          {ORIENTATIONS.map((o) => (
            <option key={o} value={o}>
              {o === "landscape" ? "가로형" : o === "portrait" ? "세로형" : "정방형"}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">대표 이미지 (변경 시만 선택)</label>
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors overflow-hidden relative bg-zinc-900">
          <Image src={thumbnailPreview} alt="preview" fill className="object-cover" />
          <input type="file" accept="image/*" onChange={handleThumbnail} className="sr-only" />
        </label>
      </div>

      {/* 바로가기 URL */}
      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">
          바로가기 URL <span className="text-zinc-600">(선택 — 클릭 시 이동할 페이지)</span>
        </label>
        <input
          name="url"
          type="url"
          defaultValue={work.url ?? ""}
          placeholder="https://example.com"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          영상 파일{" "}
          <span className="text-zinc-600">
            {work.video_url ? "(변경 시만 선택)" : "(선택 — 없으면 이미지만 표시)"}
          </span>
        </label>
        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-900">
          <span className="text-sm text-zinc-500">
            {videoFile
              ? `✓ ${videoFile.name}`
              : work.video_url
              ? "현재 영상 유지 · 변경하려면 클릭"
              : "영상 없음 · 추가하려면 클릭"}
          </span>
          <input type="file" accept="video/*" onChange={handleVideo} className="sr-only" />
        </label>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          name="is_published"
          type="checkbox"
          defaultChecked={work.is_published}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-900"
        />
        <span className="text-sm text-zinc-400">공개 (쇼케이스에 노출)</span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}

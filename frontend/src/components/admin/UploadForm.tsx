"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadFile } from "@/lib/storage";
import { createWorkAction } from "@/app/admin/actions";

const ORIENTATIONS = ["landscape", "portrait", "square"] as const;

export default function UploadForm() {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    if (!thumbnailFile) {
      setError("이미지 파일을 선택해주세요.");
      return;
    }

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
      const thumbnail_url = await uploadFile("thumbnails", thumbnailFile);
      const video_url = videoFile ? await uploadFile("videos", videoFile) : null;

      const result = await createWorkAction({
        title,
        description: description || null,
        info: info || null,
        thumbnail_url,
        video_url,
        url,
        orientation,
        is_published,
        order_index: 0,
      });

      if (result?.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">제목 *</label>
        <input
          name="title"
          type="text"
          required
          placeholder="작업물 제목"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">설명</label>
        <textarea
          name="description"
          rows={3}
          placeholder="작업물 설명 (선택)"
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
          placeholder="기술 스택, 제작 배경, 링크 등 상세 정보 (선택)"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">방향 *</label>
        <select
          name="orientation"
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
        <label className="text-sm text-zinc-400">대표 이미지 *</label>
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors overflow-hidden relative bg-zinc-900">
          {thumbnailPreview ? (
            <Image src={thumbnailPreview} alt="preview" fill className="object-cover" />
          ) : (
            <span className="text-sm text-zinc-500">클릭하여 이미지 선택</span>
          )}
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
          placeholder="https://example.com"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          영상 파일 <span className="text-zinc-600">(선택 — 없으면 이미지만 표시)</span>
        </label>
        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-900">
          <span className="text-sm text-zinc-500">
            {videoFile ? `✓ ${videoFile.name}` : "클릭하여 영상 선택 (.mp4 권장)"}
          </span>
          <input type="file" accept="video/*" onChange={handleVideo} className="sr-only" />
        </label>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          name="is_published"
          type="checkbox"
          defaultChecked
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
        {loading ? "업로드 중..." : "업로드"}
      </button>
    </form>
  );
}

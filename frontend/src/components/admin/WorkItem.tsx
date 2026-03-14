"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteWorkAction } from "@/app/admin/actions";
import type { Work } from "@/types/database";

interface Props {
  work: Work;
  onDelete: (id: string) => void;
}

export default function WorkItem({ work, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: work.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  async function handleDelete() {
    if (!confirm(`"${work.title}" 을 삭제할까요?`)) return;
    setDeleting(true);
    const { error } = await deleteWorkAction(work.id);
    if (error) {
      alert(error);
      setDeleting(false);
      return;
    }
    onDelete(work.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg group"
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing px-1 touch-none"
        aria-label="drag handle"
      >
        ⠿
      </button>

      {/* 썸네일 */}
      <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
        <Image
          src={work.thumbnail_url}
          alt={work.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{work.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {work.orientation} · {work.is_published ? "공개" : "비공개"}
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/admin/edit/${work.id}`}
          className="px-3 py-1.5 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
        >
          편집
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-xs text-red-400 bg-zinc-800 hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "삭제"}
        </button>
      </div>
    </div>
  );
}

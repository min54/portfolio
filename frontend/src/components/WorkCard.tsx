"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { Work } from "@/types/database";

const ASPECT: Record<Work["orientation"], string> = {
  landscape: "aspect-video",
  portrait: "aspect-[9/16]",
  square: "aspect-square",
};

interface Props {
  work: Work;
}

export default function WorkCard({ work }: Props) {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (modalOpen && modalVideoRef.current && videoRef.current) {
      modalVideoRef.current.currentTime = videoRef.current.currentTime;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [modalOpen]);

  function handleMouseEnter() {
    if (!work.video_url || !videoRef.current) return;
    setHovered(true);
    playPromiseRef.current = videoRef.current.play();
    playPromiseRef.current?.catch(() => {});
  }

  function handleMouseLeave() {
    if (!work.video_url || !videoRef.current) return;
    setHovered(false);
    const vid = videoRef.current;
    if (playPromiseRef.current) {
      playPromiseRef.current.then(() => {
        vid.pause();
        vid.currentTime = 0;
      }).catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }

  function handleClick() {
    setModalOpen(true);
  }

  return (
    <>
      <div className="w-full group">
        {/* 이미지/영상 영역 */}
        <div
          className={`relative w-full overflow-hidden rounded-lg bg-zinc-900/60 cursor-pointer
            ${ASPECT[work.orientation]}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {/* 이미지 — 호버 시 scale up */}
          <Image
            src={work.thumbnail_url}
            alt={work.title}
            fill
            onLoad={() => setLoaded(true)}
            className={`object-cover transition-all duration-700 ease-out rounded-lg
              ${loaded ? "img-fadein" : "opacity-0"}
              ${hovered && work.video_url ? "opacity-0" : "opacity-100"}
              ${hovered ? "scale-105" : "scale-100"}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />

          {/* 영상 */}
          {work.video_url && (
            <video
              ref={videoRef}
              src={work.video_url}
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500
                ${hovered ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* 하단 그라디언트 — 항상 표시, 중앙까지 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.1) 55%, transparent 70%)",
            }}
          />

          {/* 호버 오버레이 */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-500
              ${hovered ? "opacity-15" : "opacity-0"}`}
          />
        </div>

        {/* 텍스트 영역 */}
        <div className="mt-3 flex flex-col gap-1">
          <div className="w-6 h-px bg-zinc-600 mb-1" />

          <p className="font-serif text-sm text-zinc-100 leading-snug tracking-tight">
            {work.title}
          </p>

          {work.description && (
            <p className="text-[11px] text-zinc-500 leading-relaxed tracking-wide line-clamp-2 font-sans uppercase">
              {work.description}
            </p>
          )}

          {work.url && (
            <a
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-1 text-[10px] text-zinc-500 hover:text-zinc-200 uppercase tracking-widest transition-colors w-fit"
            >
              바로가기 ↗
            </a>
          )}
        </div>
      </div>

      {/* 확대 모달 — 항상 DOM에 유지, visibility로 토글 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.95)",
          opacity: modalOpen ? 1 : 0,
          pointerEvents: modalOpen ? "auto" : "none",
        }}
        onClick={() => setModalOpen(false)}
      >
        <div
          className="relative max-w-5xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {work.video_url ? (
            <video
              ref={modalVideoRef}
              src={work.video_url}
              loop
              muted
              playsInline
              controls
              preload="auto"
              className="w-full max-h-[85vh] object-contain"
            />
          ) : (
            <div className={`relative w-full ${ASPECT[work.orientation]} max-h-[85vh]`}>
              <Image
                src={work.thumbnail_url}
                alt={work.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          )}

          {/* 모달 하단 텍스트 */}
          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="font-serif text-zinc-100 text-lg">{work.title}</p>
              {work.description && (
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                  {work.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="text-zinc-600 hover:text-zinc-200 text-xs uppercase tracking-widest transition-colors mt-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

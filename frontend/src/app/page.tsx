import Link from "next/link";
import { getWorks } from "@/lib/works";
import WorkCard from "@/components/WorkCard";
import HeroWrapper from "@/components/HeroWrapper";

export const revalidate = 60;

export default async function HomePage() {
  const works = await getWorks();

  if (works.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-zinc-600 text-xs tracking-widest uppercase">No works yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* 히어로 */}
      <div className="relative w-full">
        <HeroWrapper />
        {/* 하단 페이드 아웃 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />
      </div>

      {/* 워크 목록 */}
      <div className="px-5 py-8 sm:px-10 sm:py-16">
        <div className="flex flex-col gap-16 max-w-5xl mx-auto">
          {works.map((work) => (
            <div key={work.id} className="flex gap-8 items-start">
              {/* 이미지 카드 */}
              <div className="w-1/2 flex-shrink-0">
                <WorkCard work={work} />
              </div>
              {/* Info 패널 */}
              <div className="flex-1 pt-2">
                {work.info ? (
                  <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {work.info}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/admin"
        className="fixed bottom-5 right-5 text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors select-none"
      >
        admin
      </Link>
    </main>
  );
}

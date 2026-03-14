import { getWorks } from "@/lib/works";
import WorksList from "@/components/admin/WorksList";
import Link from "next/link";

export default async function DashboardPage() {
  const works = await getWorks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Works</h2>
          <p className="text-sm text-zinc-500 mt-1">{works.length}개의 콘텐츠</p>
        </div>
        <Link
          href="/admin/upload"
          className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        >
          + 새 업로드
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="text-center py-24 text-zinc-600">
          <p>아직 콘텐츠가 없습니다.</p>
          <Link href="/admin/upload" className="text-zinc-400 hover:text-white text-sm mt-2 inline-block">
            첫 번째 작업물 업로드하기 →
          </Link>
        </div>
      ) : (
        <WorksList initialWorks={works} />
      )}
    </div>
  );
}

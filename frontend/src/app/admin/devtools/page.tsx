import Link from "next/link";
import { getDevTools } from "@/lib/devtools";
import DevToolsList from "@/components/admin/DevToolsList";

export default async function DevToolsPage() {
  const items = await getDevTools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">개발도구</h2>
          <p className="text-sm text-zinc-500 mt-1">{items.length}개</p>
        </div>
        <Link href="/admin/devtools/upload" className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
          + 새 추가
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 text-zinc-600">
          <p>아직 개발도구가 없습니다.</p>
          <Link href="/admin/devtools/upload" className="text-zinc-400 hover:text-white text-sm mt-2 inline-block">
            첫 번째 추가하기 →
          </Link>
        </div>
      ) : (
        <DevToolsList initialItems={items} />
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { getDevTool } from "@/lib/devtools";
import DevToolForm from "@/components/admin/DevToolForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DevToolEditPage({ params }: Props) {
  const { id } = await params;
  const item = await getDevTool(id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">개발도구 편집</h2>
        <p className="text-sm text-zinc-500 mt-1 truncate">{item.title}</p>
      </div>
      <DevToolForm devtool={item} />
    </div>
  );
}

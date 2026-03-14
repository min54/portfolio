import { notFound } from "next/navigation";
import { getWork } from "@/lib/works";
import EditForm from "@/components/admin/EditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const work = await getWork(id);

  if (!work) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">편집</h2>
        <p className="text-sm text-zinc-500 mt-1 truncate">{work.title}</p>
      </div>
      <EditForm work={work} />
    </div>
  );
}

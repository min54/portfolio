import DevToolForm from "@/components/admin/DevToolForm";

export default function DevToolUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">개발도구 추가</h2>
        <p className="text-sm text-zinc-500 mt-1">제목, 설명, URL을 입력하세요.</p>
      </div>
      <DevToolForm />
    </div>
  );
}

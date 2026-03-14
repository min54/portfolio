import UploadForm from "@/components/admin/UploadForm";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">새 업로드</h2>
        <p className="text-sm text-zinc-500 mt-1">이미지와 영상을 함께 업로드하세요.</p>
      </div>
      <UploadForm />
    </div>
  );
}

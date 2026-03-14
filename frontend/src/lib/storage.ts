import { createClient } from "@/lib/supabase/client";

export async function uploadFile(
  bucket: "thumbnails" | "videos",
  file: File,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: "thumbnails" | "videos", url: string): Promise<void> {
  const supabase = createClient();
  // URL에서 파일 경로 추출
  const path = url.split(`/storage/v1/object/public/${bucket}/`)[1];
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

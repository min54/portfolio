import { createClient } from "@/lib/supabase/server";
import type { Work } from "@/types/database";

export async function getWorks(): Promise<Work[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Work[];
}

export async function getWork(id: string): Promise<Work | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Work;
}

import { createClient } from "@/lib/supabase/server";
import type { DevTool } from "@/types/devtool";

export async function getDevTools(): Promise<DevTool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dev_tools")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DevTool[];
}

export async function getDevTool(id: string): Promise<DevTool | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dev_tools")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DevTool;
}

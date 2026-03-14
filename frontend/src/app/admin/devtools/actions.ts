"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DevToolInsert, DevToolUpdate } from "@/types/devtool";

export async function createDevToolAction(data: DevToolInsert): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("dev_tools")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();
  const order_index = last ? (last as { order_index: number }).order_index + 1 : 0;
  const { error } = await supabase.from("dev_tools").insert({ ...data, order_index } as never);
  if (error) return { error: error.message };
  revalidatePath("/admin/devtools");
  revalidatePath("/");
  redirect("/admin/devtools");
}

export async function updateDevToolAction(id: string, data: DevToolUpdate): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("dev_tools").update(data as never).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/devtools");
  revalidatePath("/");
  redirect("/admin/devtools");
}

export async function deleteDevToolAction(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("dev_tools").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/devtools");
  revalidatePath("/");
  return { error: null };
}

export async function updateDevToolOrderAction(
  items: { id: string; order_index: number }[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  await Promise.all(
    items.map(({ id, order_index }) =>
      supabase.from("dev_tools").update({ order_index } as never).eq("id", id),
    ),
  );
  revalidatePath("/admin/devtools");
  revalidatePath("/");
  return { error: null };
}

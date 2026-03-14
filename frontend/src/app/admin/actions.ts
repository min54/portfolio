"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { WorkInsert, WorkUpdate } from "@/types/database";

export async function loginAction(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function createWorkAction(data: WorkInsert): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("works")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order_index = last ? (last as any).order_index + 1 : 0;

  const { error } = await supabase.from("works").insert({ ...data, order_index } as never);
  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard");
}

export async function updateWorkAction(id: string, data: WorkUpdate): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("works").update(data as never).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard");
}

export async function deleteWorkAction(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { error: null };
}

export async function updateOrderAction(
  items: { id: string; order_index: number }[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  await Promise.all(
    items.map(({ id, order_index }) =>
      supabase.from("works").update({ order_index } as never).eq("id", id),
    ),
  );

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { error: null };
}

export interface DevTool {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export type DevToolInsert = Omit<DevTool, "id" | "created_at">;
export type DevToolUpdate = Partial<DevToolInsert>;

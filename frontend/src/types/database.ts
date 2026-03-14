export type Orientation = "landscape" | "portrait" | "square";

export interface Work {
  id: string;
  title: string;
  description: string | null;
  info: string | null;
  thumbnail_url: string;
  video_url: string | null;
  url: string | null;
  orientation: Orientation;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export type WorkInsert = Omit<Work, "id" | "created_at">;
export type WorkUpdate = Partial<WorkInsert>;

export type Database = {
  public: {
    Tables: {
      works: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          info: string | null;
          thumbnail_url: string;
          video_url: string | null;
          url: string | null;
          orientation: Orientation;
          order_index: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          info?: string | null;
          thumbnail_url: string;
          video_url?: string | null;
          url?: string | null;
          orientation?: Orientation;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          info?: string | null;
          thumbnail_url?: string;
          video_url?: string | null;
          url?: string | null;
          orientation?: Orientation;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      orientation: Orientation;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

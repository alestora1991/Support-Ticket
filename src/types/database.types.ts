export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: "open" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "critical";
          category: string;
          user_id: string;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "critical";
          category: string;
          user_id: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "critical";
          category?: string;
          user_id?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_comments: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_attachments: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          public: boolean | null;
          avif_autodetection: boolean | null;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
        };
        Insert: {
          id: string;
          name: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string | null;
          name: string | null;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
          path_tokens: string[] | null;
        };
        Insert: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
        };
        Update: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

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
      companies: {
        Row: {
          id: string;
          name: string;
          plan: "free" | "starter" | "pro" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          role: "admin" | "agent" | "client";
          avatar_url: string | null;
          is_agent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          role?: "admin" | "agent" | "client";
          avatar_url?: string | null;
          is_agent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: "admin" | "agent" | "client";
          avatar_url?: string | null;
          is_agent?: boolean;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          email: string;
          phone?: string | null;
          company_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          company_name?: string | null;
          notes?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string | null;
          created_by: string;
          assigned_to: string | null;
          subject: string;
          description: string;
          status: "open" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          category: "technical" | "billing" | "sales" | "feedback" | "other";
          ai_suggested_response: string | null;
          ai_classification: string | null;
          ai_priority_suggestion: "low" | "medium" | "high" | "urgent" | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id?: string | null;
          created_by: string;
          assigned_to?: string | null;
          subject: string;
          description: string;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: "technical" | "billing" | "sales" | "feedback" | "other";
          ai_suggested_response?: string | null;
          ai_classification?: string | null;
          ai_priority_suggestion?:
            | "low"
            | "medium"
            | "high"
            | "urgent"
            | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
        };
        Update: {
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: "technical" | "billing" | "sales" | "feedback" | "other";
          assigned_to?: string | null;
          ai_suggested_response?: string | null;
          ai_classification?: string | null;
          ai_priority_suggestion?: "low" | "medium" | "high" | "urgent" | null;
          resolved_at?: string | null;
          closed_at?: string | null;
        };
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          sender_type: "agent" | "client" | "system";
          content: string;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          sender_type: "agent" | "client" | "system";
          content: string;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: {
          content?: string;
          is_internal?: boolean;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          content: string;
          category: string;
          is_published: boolean;
          views: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          content: string;
          category?: string;
          is_published?: boolean;
          views?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string;
          is_published?: boolean;
          views?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

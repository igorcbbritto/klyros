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
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          role: "super_admin" | "admin" | "agent" | "viewer" | "client";
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
          role?: "super_admin" | "admin" | "agent" | "viewer" | "client";
          avatar_url?: string | null;
          is_agent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: "super_admin" | "admin" | "agent" | "viewer" | "client";
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
      equipments: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          serial_number: string | null;
          brand: string | null;
          model: string | null;
          category: "clinical" | "building" | "it" | "general";
          location: string | null;
          status: "active" | "maintenance" | "decommissioned";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          serial_number?: string | null;
          brand?: string | null;
          model?: string | null;
          category?: "clinical" | "building" | "it" | "general";
          location?: string | null;
          status?: "active" | "maintenance" | "decommissioned";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          serial_number?: string | null;
          brand?: string | null;
          model?: string | null;
          category?: "clinical" | "building" | "it" | "general";
          location?: string | null;
          status?: "active" | "maintenance" | "decommissioned";
          notes?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string | null;
          equipment_id: string | null;
          created_by: string;
          assigned_to: string | null;
          subject: string;
          description: string;
          status: "open" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          category: "technical" | "billing" | "sales" | "feedback" | "clinical" | "building" | "other";
          source: "agent" | "customer" | "public_form" | "email";
          ai_suggested_response: string | null;
          ai_classification: string | null;
          ai_priority_suggestion: "low" | "medium" | "high" | "urgent" | null;
          read_by_agent_at: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id?: string | null;
          equipment_id?: string | null;
          created_by: string;
          assigned_to?: string | null;
          subject: string;
          description: string;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: "technical" | "billing" | "sales" | "feedback" | "clinical" | "building" | "other";
          source?: "agent" | "customer" | "public_form" | "email";
          ai_suggested_response?: string | null;
          ai_classification?: string | null;
          ai_priority_suggestion?: "low" | "medium" | "high" | "urgent" | null;
          read_by_agent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
        };
        Update: {
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: "technical" | "billing" | "sales" | "feedback" | "clinical" | "building" | "other";
          assigned_to?: string | null;
          ai_suggested_response?: string | null;
          ai_classification?: string | null;
          ai_priority_suggestion?: "low" | "medium" | "high" | "urgent" | null;
          read_by_agent_at?: string | null;
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
      notifications: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          type: "new_ticket" | "ticket_reply" | "ticket_resolved" | "system";
          title: string;
          message: string;
          ticket_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          type: "new_ticket" | "ticket_reply" | "ticket_resolved" | "system";
          title: string;
          message: string;
          ticket_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          type?: "new_ticket" | "ticket_reply" | "ticket_resolved" | "system";
          title?: string;
          message?: string;
          ticket_id?: string | null;
          is_read?: boolean;
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

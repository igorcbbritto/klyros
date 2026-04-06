export type UserRole = "admin" | "agent" | "client";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCategory =
  | "technical"
  | "billing"
  | "sales"
  | "feedback"
  | "other";

export interface Company {
  id: string;
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  is_agent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  company_id: string;
  customer_id: string | null;
  created_by: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  ai_suggested_response: string | null;
  ai_classification: string | null;
  ai_priority_suggestion: TicketPriority | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  customer?: Customer;
  creator?: User;
  assignee?: User;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "agent" | "client" | "system";
  content: string;
  is_internal: boolean;
  created_at: string;
  sender?: User;
}

export interface KnowledgeBaseArticle {
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
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  newTicketsToday: number;
  averageResponseTime: number;
  ticketsByStatus: { status: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsByDay: { date: string; count: number }[];
  agentsPerformance: {
    name: string;
    resolved: number;
    open: number;
  }[];
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
import { Ticket, TicketMessage, User, Customer } from "@/types";
import {
  ArrowLeft,
  Send,
  Clock,
  User as UserIcon,
  Tag,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!ticketId) return;
      setLoading(true);
      const supabase = createClient();

      const { data: ticketData } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (ticketData) {
        setTicket(ticketData as Ticket);

        if (ticketData.customer_id) {
          const { data: custData } = await supabase
            .from("customers")
            .select("*")
            .eq("id", ticketData.customer_id)
            .single();
          setCustomer((custData as Customer) || null);
        }

        const { data: msgData } = await supabase
          .from("ticket_messages")
          .select("*, sender:users(name)")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });
        setMessages((msgData as unknown as TicketMessage[]) || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [ticketId]);

  const handleSend = async () => {
    if (!newMessageContent.trim() || !ticketId) return;
    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticketId,
          sender_id: user?.id || "00000000-0000-0000-0000-000000000000",
          sender_type: "agent",
          content: newMessageContent,
          is_internal: false,
        })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data as TicketMessage]);
        setNewMessageContent("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn flex items-center justify-center py-20">
          <p className="text-gray-400">Carregando chamado...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn text-center py-20">
          <p className="text-gray-500 text-lg font-medium">Chamado não encontrado</p>
          <Link href="/dashboard/chamados" className="text-blue-600 text-sm mt-2 inline-block">
            Voltar para chamados
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Breadcrumb + Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/chamados"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{ticket.id}</h1>
              <Badge variant="status" value={ticket.status} />
              <Badge variant="priority" value={ticket.priority} />
            </div>
            <p className="text-gray-600 mt-1">{ticket.subject}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"
            style={{ height: "calc(100vh - 220px)" }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">
                  Nenhuma mensagem ainda.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.sender_type === "agent" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        msg.sender_type === "agent"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-4 py-2.5 text-sm",
                        msg.sender_type === "agent"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1.5",
                          msg.sender_type === "agent"
                            ? "text-blue-200"
                            : "text-gray-400"
                        )}
                      >
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Suggestion */}
            {ticket.ai_suggested_response && (
              <div className="mx-5 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
                <Bot className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 mb-1">
                    Sugestão de IA
                  </p>
                  <p className="text-sm text-purple-800">
                    {ticket.ai_suggested_response}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNewMessageContent(ticket.ai_suggested_response || "")
                  }
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  Usar
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <input
                type="text"
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua resposta..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessageContent.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {/* Ticket Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">
                Informações
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Cliente:</span>
                  <span className="text-gray-900 font-medium">
                    {customer?.name ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Criado:</span>
                  <span className="text-gray-900">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Categoria:</span>
                  <span className="text-gray-900 capitalize">
                    {ticket.category}
                  </span>
                </div>
              </dl>
            </div>

            {/* AI Analysis */}
            {(ticket.ai_classification || ticket.ai_priority_suggestion) && (
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Análise de IA</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  {ticket.ai_classification && (
                    <div>
                      <span className="text-gray-500">Classificação:</span>
                      <p className="text-gray-900 font-medium mt-0.5">
                        {ticket.ai_classification}
                      </p>
                    </div>
                  )}
                  {ticket.ai_priority_suggestion && (
                    <div>
                      <span className="text-gray-500">
                        Prioridade sugerida:
                      </span>
                      <div className="mt-1">
                        <Badge
                          variant="priority"
                          value={ticket.ai_priority_suggestion}
                        />
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Ações</h3>
              <div className="space-y-2">
                <StatusButton
                  ticket={ticket}
                  newStatus="in_progress"
                  label="Em Andamento"
                  colorClass="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                />
                <StatusButton
                  ticket={ticket}
                  newStatus="resolved"
                  label="Marcar como Resolvido"
                  colorClass="bg-green-50 text-green-700 hover:bg-green-100"
                />
                <StatusButton
                  ticket={ticket}
                  newStatus="closed"
                  label="Fechar Chamado"
                  colorClass="bg-gray-50 text-gray-600 hover:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusButton({
  ticket,
  newStatus,
  label,
  colorClass,
}: {
  ticket: Ticket;
  newStatus: Ticket["status"];
  label: string;
  colorClass: string;
}) {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const supabase = createClient();
      const updates: Record<string, string | null> = { status: newStatus };
      if (newStatus === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }
      if (newStatus === "closed") {
        updates.closed_at = new Date().toISOString();
      }

      await supabase.from("tickets").update(updates).eq("id", ticket.id);

      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticket.id)
        .single();
      if (data) {
        // Simple page-level refresh: update local state
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={updating || ticket.status === newStatus}
      className={cn(
        "w-full px-3 py-2 text-sm rounded-lg transition-colors font-medium disabled:opacity-50",
        colorClass
      )}
    >
      {updating ? "Salvando..." : label}
    </button>
  );
}

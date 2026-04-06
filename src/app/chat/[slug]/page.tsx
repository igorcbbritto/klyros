"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, User, ChevronLeft, Sparkles, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_type: "client" | "agent" | "system";
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function PublicChatPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!slug) return;
    const fetchCompany = async () => {
      const res = await fetch(`/api/chat/company?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCompanyId(data.id);
        setCompanyName(data.name);
      } else {
        setCompanyName("Empresa ");
      }
    };
    fetchCompany();
  }, [slug]);

  const handleSubmitForm = async () => {
    if (!companyName || !clientName) return;
    setShowForm(false);
    setSending(true);

    try {
      const res = await fetch("/api/chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companyName: companyName,
          clientName,
          clientEmail,
          message: "Olá, preciso de suporte.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicketId(data.ticketId);
      }
    } catch {
      console.error("Failed to create ticket");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);

    try {
      const res = await fetch(`/api/chat/ticket/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { ...data, sender_type: "client" }]);
        setNewMessage("");
        setAiSuggestion(data.ai_suggestion || "");
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold">{companyName}</h1>
          {ticketId && (
            <p className="text-xs text-slate-400">Chamado #{ticketId}</p>
          )}
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full" title="Online" />
      </div>

      {showForm ? (
        /* Client info form */
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Iniciar Atendimento</h2>
              <p className="text-sm text-gray-500">Informe seus dados para começar</p>
            </div>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSubmitForm}
              disabled={!clientName || !companyId}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Iniciar Chat"
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Chat area */
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {/* Welcome message */}
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                S
              </div>
              <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 shadow-sm rounded-bl-sm max-w-[70%]">
                <p className="text-sm">Olá! Em breve um atendente irá responder. Como posso ajudar?</p>
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender_type === "client" && "flex-row-reverse"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${msg.sender_type === "client" ? "bg-blue-500" : msg.sender_type === "agent" ? "bg-green-500" : "bg-gray-400"}`}>
                  {msg.sender_type === "client" ? clientName.charAt(0) : "A"}
                </div>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_type === "client" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_type === "client" ? "text-blue-200" : "text-gray-400"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && (
            <div className="mx-3 p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
              <p className="text-xs text-purple-700 flex-1">{aiSuggestion}</p>
              <button
                onClick={() => setNewMessage(aiSuggestion)}
                className="px-2 py-1 bg-purple-600 text-white text-xs rounded transition-colors"
              >
                Usar
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

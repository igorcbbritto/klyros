"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn, formatDate } from "@/lib/utils";
import { Ticket, Customer, TicketMessage } from "@/types";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "online" | "offline";
}

interface MessageItem {
  id: string;
  sender: "agent" | "client";
  content: string;
  timestamp: string;
}

export default function AtendimentoPage() {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      // Fetch open/in_progress tickets as contacts
      const { data: activeTickets } = await supabase
        .from("tickets")
        .select("*, customer:customers(*)")
        .in("status", ["open", "in_progress"])
        .order("updated_at", { ascending: false });

      const ticketsData = (activeTickets as unknown as (Ticket & { customer: Customer })[]) || [];

      const chatContacts: ChatContact[] = ticketsData.map((t) => ({
        id: t.id,
        name: (t.customer as Customer)?.name || "Cliente",
        lastMessage: t.subject,
        time: t.updated_at ? formatDate(t.updated_at) : "",
        unread: t.status === "open" ? 1 : 0,
        status: "offline",
      }));

      setContacts(chatContacts);
      if (chatContacts.length > 0) {
        setSelectedContact(chatContacts[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact?.id) {
        setMessages([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedContact.id)
        .order("created_at", { ascending: true });
      setMessages(
        ((data as unknown as TicketMessage[]) || []).map((msg) => ({
          id: msg.id,
          sender: msg.sender_type === "agent" ? "agent" : "client",
          content: msg.content,
          timestamp: msg.created_at,
        }))
      );
    };
    fetchMessages();
  }, [selectedContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!messageInput.trim() || !selectedContact) return;
    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: selectedContact.id,
          sender_id: user?.id || "00000000-0000-0000-0000-000000000000",
          sender_type: "agent",
          content: messageInput,
          is_internal: false,
        })
        .select()
        .single();

      if (!error && data) {
        const msg = data as unknown as TicketMessage;
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            sender: msg.sender_type === "agent" ? "agent" : "client",
            content: msg.content,
            timestamp: msg.created_at,
          },
        ]);
        setMessageInput("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }, [messageInput, selectedContact]);

  const handleSelectContact = useCallback(
    (contact: ChatContact) => {
      setSelectedContact(contact);
    },
    []
  );

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-20">
            <p className="text-gray-400">Carregando atendimentos...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-20 text-gray-500">
            <p className="text-lg font-medium">Nenhum atendimento ativo</p>
            <p className="text-sm mt-1">Quando houver chamados abertos, eles aparecerão aqui</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
            <div className="flex h-full">
              {/* Contacts Sidebar */}
              <div className="w-80 border-r border-gray-100 flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar conversas..."
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left",
                        selectedContact?.id === contact.id && "bg-blue-50 border-blue-100"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {contact.name.charAt(0)}
                        </div>
                        {contact.status === "online" && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                          <p className="text-xs text-gray-400">{contact.time}</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{contact.lastMessage}</p>
                      </div>
                      {contact.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                {selectedContact && (
                  <>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {selectedContact.name.charAt(0)}
                          </div>
                          {selectedContact.status === "online" && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selectedContact.name}</p>
                          <p className="text-xs text-gray-500">{selectedContact.status === "online" ? "Online" : "Offline"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">
                          Nenhuma mensagem nesta conversa ainda.
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className={cn("flex gap-2", msg.sender === "agent" && "flex-row-reverse")}>
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold",
                              msg.sender === "agent" ? "bg-blue-500" : "bg-gray-400"
                            )}>
                              {msg.sender === "agent" ? "A" : msg.content.charAt(0).toUpperCase()}
                            </div>
                            <div className={cn("max-w-[70%] rounded-2xl px-4 py-2",
                              msg.sender === "agent"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                            )}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={cn("text-xs mt-1", msg.sender === "agent" ? "text-blue-200" : "text-gray-400")}>
                                {formatDate(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-white">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                            placeholder="Digite uma mensagem..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Smile className="w-4 h-4" />
                          </button>
                        </div>
                        {messageInput.trim() ? (
                          <button
                            onClick={handleSend}
                            disabled={sending}
                            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                            <Mic className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

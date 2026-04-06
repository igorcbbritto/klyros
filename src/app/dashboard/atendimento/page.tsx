"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn, formatDate } from "@/lib/utils";
import { mockAgents } from "@/dashboard-mocks";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "agent" | "client";
  content: string;
  timestamp: string;
}

const chatContacts = [
  { id: "1", name: "João Silva", message: "Ainda não consegui acessar...", time: "14:32", unread: 2, status: "online" },
  { id: "2", name: "Maria Santos", message: "Obrigada pela ajuda!", time: "13:15", unread: 0, status: "online" },
  { id: "3", name: "Carlos Oliveira", message: "Quando será resolvido?", time: "11:00", unread: 1, status: "offline" },
  { id: "4", name: "Ana Pereira", message: "Preciso de mais informações", time: "Ontem", unread: 0, status: "offline" },
];

const initialMessages: Record<string, ChatMessage[]> = {
  "1": [
    { id: "1", sender: "client", content: "Olá, estou tendo problemas para acessar minha conta.", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: "2", sender: "agent", content: "Olá João! Vou te ajudar com isso. Pode me dizer qual erro aparece?", timestamp: new Date(Date.now() - 7000000).toISOString() },
    { id: "3", sender: "client", content: "Aparece 'Credenciais inválidas' mas tenho certeza que a senha está correta.", timestamp: new Date(Date.now() - 6800000).toISOString() },
    { id: "4", sender: "agent", content: "Entendi. Vou verificar sua conta no sistema. Um momento por favor.", timestamp: new Date(Date.now() - 6600000).toISOString() },
    { id: "5", sender: "client", content: "Ainda não consegui acessar...", timestamp: new Date(Date.now() - 3600000).toISOString() },
  ],
  "2": [
    { id: "1", sender: "client", content: "Oi! Preciso de ajuda com a configuração.", timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: "2", sender: "agent", content: "Claro Maria! Qual configuração você precisa alterar?", timestamp: new Date(Date.now() - 86300000).toISOString() },
    { id: "3", sender: "client", content: "Obrigada pela ajuda!", timestamp: new Date(Date.now() - 86200000).toISOString() },
  ],
  "3": [
    { id: "1", sender: "client", content: "Quando será resolvido meu chamado aberto?", timestamp: new Date(Date.now() - 172800000).toISOString() },
  ],
};

export default function AtendimentoPage() {
  const [selectedContact, setSelectedContact] = useState(chatContacts[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages["1"] || []);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmoji] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectContact = (contact: typeof chatContacts[0]) => {
    setSelectedContact(contact);
    setMessages(initialMessages[contact.id] || []);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "agent",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
  };

  const filteredContacts = chatContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
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
                      selectedContact.id === contact.id && "bg-blue-50 border-blue-100"
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
                      <p className="text-xs text-gray-500 truncate mt-0.5">{contact.message}</p>
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
                {messages.map((msg) => (
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
                ))}
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
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Digite uma mensagem..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  {message.trim() ? (
                    <button
                      onClick={handleSend}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

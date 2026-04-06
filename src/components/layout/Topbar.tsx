"use client";

import { Search, Bell, LogOut, Sparkles, Ticket, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function logout() {
  localStorage.removeItem("helpdesk_demo");
  window.location.href = "/login";
}

const mockNotifications = [
  { id: "1", type: "new_ticket" as const, title: "Novo Chamado", message: "TK-001: Não consigo acessar o sistema", time: "5 min", is_read: false },
  { id: "2", type: "ticket_reply" as const, title: "Nova Resposta", message: "Maria respondeu ao TK-002", time: "15 min", is_read: false },
  { id: "3", type: "ticket_resolved" as const, title: "Chamado Resolvido", message: "TK-004 marcado como resolvido", time: "1h", is_read: true },
];

const typeIcons = {
  new_ticket: { icon: AlertCircle, color: "text-blue-500" },
  ticket_reply: { icon: MessageSquare, color: "text-green-500" },
  ticket_resolved: { icon: CheckCircle2, color: "text-emerald-500" },
  system: { icon: AlertCircle, color: "text-gray-500" },
};

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDemo(localStorage.getItem("helpdesk_demo") === "true");
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = mockNotifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar chamados, clientes, artigos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Demo Badge */}
      {isDemo && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-medium text-purple-700">Demonstração</span>
        </div>
      )}

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notif) => {
                const { icon: Icon, color } = typeIcons[notif.type];
                return (
                  <div key={notif.id} className={cn(`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer`, !notif.is_read && "bg-blue-50/30")}>
                    <Icon className={cn(`w-4 h-4 mt-0.5 shrink-0`, color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-gray-100 text-center">
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todas as notificações</button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatDate, cn } from "@/lib/utils";
import { mockTickets, mockCustomers, mockAgents, mockEquipments } from "@/dashboard-mocks";
import { Ticket as TicketType } from "@/types";
import {
  PlusCircle,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabType = "all" | "open" | "in_progress" | "resolved" | "closed";

const tabLabels: Record<TabType, string> = {
  all: "Todos",
  open: "Novos",
  in_progress: "Em andamento",
  resolved: "Respondidos",
  closed: "Fechados",
};

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [tickets] = useState<TicketType[]>(mockTickets);
  const router = useRouter();

  const filteredTickets = tickets.filter((t) => {
    if (activeTab !== "all" && t.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie todos os chamados</p>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Chamado
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
          {(Object.keys(tabLabels) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar chamados..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">Nenhum chamado encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou crie um novo chamado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Assunto</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Prioridade</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Responsavel</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Atualizado</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-5 font-mono text-xs text-gray-500">{ticket.id}</td>
                      <td className="py-3 px-5">
                        <p className="font-medium text-gray-900 max-w-xs truncate">{ticket.subject}</p>
                        {ticket.ai_classification && (
                          <p className="text-xs text-purple-500 mt-0.5">IA: {ticket.ai_classification}</p>
                        )}
                      </td>
                      <td className="py-3 px-5"><Badge variant="status" value={ticket.status} /></td>
                      <td className="py-3 px-5"><Badge variant="priority" value={ticket.priority} /></td>
                      <td className="py-3 px-5 text-gray-600 text-xs">
                        {mockAgents.find((a) => a.id === ticket.assigned_to)?.name ?? "—"}
                      </td>
                      <td className="py-3 px-5 text-gray-500 text-xs whitespace-nowrap">{formatDate(ticket.updated_at)}</td>
                      <td className="py-3 px-5">
                        <Link
                          href={`/dashboard/chamados/${ticket.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} title="Novo Chamado">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowNewTicket(false);
            router.push("/dashboard/chamados");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Descreva o assunto do chamado" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Selecione um cliente</option>
              {mockCustomers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="low">Baixa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="technical">Tecnico</option>
                <option value="billing">Financeiro</option>
                <option value="sales">Vendas</option>
                <option value="feedback">Feedback</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Sem equipamento vinculado</option>
              {mockEquipments.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} — {eq.location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
            <textarea required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Descreva o problema ou solicitacao em detalhes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowNewTicket(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Criar Chamado</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import {
  Ticket,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import { mockStats, mockTickets } from "@/dashboard-mocks";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const COLORS = ["#3b82f6", "#eab308", "#22c55e", "#6b7280"];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral do seu atendimento</p>
          </div>
          <Link
            href="/dashboard/chamados?new=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Chamado
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Chamados" value={mockStats.totalTickets} icon={Ticket} trend={{ value: 12, positive: true }} color="blue" />
          <StatCard title="Em Andamento" value={mockStats.inProgressTickets} icon={Clock} trend={{ value: -5, positive: false }} color="orange" />
          <StatCard title="Resolvidos" value={mockStats.resolvedTickets} icon={CheckCircle2} trend={{ value: 8, positive: true }} color="green" />
          <StatCard title="Novos Hoje" value={mockStats.newTicketsToday} icon={TrendingUp} color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <BarChartCard title="Chamados - Últimos 7 dias" data={mockStats.ticketsByDay} />

          <PieChartCard title="Chamados por Status" data={mockStats.ticketsByStatus} colors={COLORS} />
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Chamados Recentes</h3>
            <Link href="/dashboard/chamados" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Assunto</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Prioridade</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockTickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-gray-500">{ticket.id}</td>
                    <td className="py-3 px-5 font-medium text-gray-900 max-w-xs truncate">{ticket.subject}</td>
                    <td className="py-3 px-5"><Badge variant="status" value={ticket.status} /></td>
                    <td className="py-3 px-5"><Badge variant="priority" value={ticket.priority} /></td>
                    <td className="py-3 px-5 text-gray-500 text-xs">{formatDate(ticket.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

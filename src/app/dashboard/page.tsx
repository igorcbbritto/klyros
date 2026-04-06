import { createClient } from "@/lib/supabase/server";
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
import Link from "next/link";
import { formatDate } from "@/lib/utils";

function getLast7DaysLabels(): string[] {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return labels;
}

const STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const COLORS = ["#3b82f6", "#eab308", "#22c55e", "#6b7280"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: tickets }, { count: total }] = await Promise.all([
    supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true }),
  ]);

  const allTickets = tickets || [];
  const totalTickets = total || 0;

  const openCount = allTickets.filter((t) => t.status === "open").length;
  const inProgressCount = allTickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = allTickets.filter((t) => t.status === "resolved").length;

  // Count today's tickets
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = allTickets.filter(
    (t) => new Date(t.created_at) >= today
  ).length;

  // Tickets by status for pie chart
  const ticketsByStatus = [
    { status: STATUS_LABELS["open"] || "Aberto", count: allTickets.filter((t) => t.status === "open").length },
    { status: STATUS_LABELS["in_progress"] || "Em andamento", count: allTickets.filter((t) => t.status === "in_progress").length },
    { status: STATUS_LABELS["resolved"] || "Resolvido", count: allTickets.filter((t) => t.status === "resolved").length },
    { status: STATUS_LABELS["closed"] || "Fechado", count: allTickets.filter((t) => t.status === "closed").length },
  ].filter((item) => item.count > 0);

  // Tickets by day for bar chart
  const last7Labels = getLast7DaysLabels();
  const ticketsByDay = last7Labels.map((date) => ({
    date,
    count: allTickets.filter((t) => {
      const d = new Date(t.created_at);
      const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dayStr === date;
    }).length,
  }));

  const recentTickets = allTickets.slice(0, 5);

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
          <StatCard title="Total de Chamados" value={totalTickets} icon={Ticket} trend={{ value: 0, positive: true }} color="blue" />
          <StatCard title="Em Andamento" value={inProgressCount} icon={Clock} trend={{ value: 0, positive: true }} color="orange" />
          <StatCard title="Resolvidos" value={resolvedCount} icon={CheckCircle2} trend={{ value: 0, positive: true }} color="green" />
          <StatCard title="Novos Hoje" value={todayCount} icon={TrendingUp} color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCard title="Chamados - Últimos 7 dias" data={ticketsByDay} />
          {ticketsByStatus.length > 0 ? (
            <PieChartCard title="Chamados por Status" data={ticketsByStatus} colors={COLORS} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-center min-h-[280px]">
              <p className="text-sm text-gray-400">Sem dados para exibir</p>
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Chamados Recentes</h3>
            <Link href="/dashboard/chamados" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todos →
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">Nenhum chamado encontrado</p>
              <p className="text-sm mt-1">Crie um chamado para começar</p>
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
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentTickets.map((ticket) => (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

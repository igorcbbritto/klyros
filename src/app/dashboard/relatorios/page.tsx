"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import { Ticket, User } from "@/types";
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  Timer,
  BarChart3,
  Calendar,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"];

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Técnico",
  billing: "Financeiro",
  sales: "Vendas",
  feedback: "Feedback",
  clinical: "Clínico",
  building: "Predial",
  other: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("30d");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const [ticketsRes, usersRes] = await Promise.all([
        supabase.from("tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("users").select("*"),
      ]);
      setTickets((ticketsRes.data as Ticket[]) || []);
      setUsers((usersRes.data as User[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    return { total, resolved, inProgress };
  }, [tickets]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      const label = CATEGORY_LABELS[t.category] || t.category;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const statusData = useMemo(() => {
    return [
      { status: STATUS_LABELS["open"] || "Aberto", count: tickets.filter((t) => t.status === "open").length },
      { status: STATUS_LABELS["in_progress"] || "Em andamento", count: tickets.filter((t) => t.status === "in_progress").length },
      { status: STATUS_LABELS["resolved"] || "Resolvido", count: tickets.filter((t) => t.status === "resolved").length },
      { status: STATUS_LABELS["closed"] || "Fechado", count: tickets.filter((t) => t.status === "closed").length },
    ].filter((s) => s.count > 0);
  }, [tickets]);

  const weeklyData = useMemo(() => {
    const weeks: { week: string; criados: number; resolvidos: number }[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const startOf = new Date(now);
      startOf.setDate(startOf.getDate() - (i + 1) * 7);
      const endOf = new Date(now);
      endOf.setDate(endOf.getDate() - i * 7);
      const criados = tickets.filter(
        (t) => new Date(t.created_at) >= startOf && new Date(t.created_at) < endOf
      ).length;
      const resolvidos = tickets.filter(
        (t) => t.resolved_at && new Date(t.resolved_at) >= startOf && new Date(t.resolved_at) < endOf
      ).length;
      weeks.push({ week: `Semana ${4 - i}`, criados, resolvidos });
    }
    return weeks;
  }, [tickets]);

  const trendData = useMemo(() => {
    const days = 7;
    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const count = tickets.filter((t) => {
        const td = new Date(t.created_at);
        const dayStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
        return dayStr === dateStr;
      }).length;
      result.push({ date: dateStr, count });
    }
    return result;
  }, [tickets]);

  const agentData = useMemo(() => {
    return users
      .filter((u) => u.is_agent)
      .map((u) => {
        const resolved = tickets.filter(
          (t) => t.assigned_to === u.id && (t.status === "resolved" || t.status === "closed")
        ).length;
        const open = tickets.filter(
          (t) => t.assigned_to === u.id && (t.status === "open" || t.status === "in_progress")
        ).length;
        return { name: u.name, resolved, open };
      })
      .filter((a) => a.resolved > 0 || a.open > 0);
  }, [tickets, users]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn flex items-center justify-center py-20">
          <p className="text-gray-400">Carregando relatórios...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (tickets.length === 0) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-1">Métricas e análises do atendimento</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16 text-gray-500">
            <p className="text-lg font-medium">Sem dados para relatórios</p>
            <p className="text-sm mt-1">Crie chamados para ver métricas aqui</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-1">Métricas e análises do atendimento</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Chamados" value={stats.total} icon={TicketIcon} trend={{ value: 0, positive: true }} color="blue" />
          <StatCard title="Resolvidos" value={stats.resolved} icon={CheckCircle2} trend={{ value: 0, positive: true }} color="green" />
          <StatCard title="Em Andamento" value={stats.inProgress} icon={Clock} color="orange" />
          <StatCard title="Tempo Médio de Resposta" value="—" icon={Timer} color="cyan" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Created vs Resolved */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-900">Criados vs Resolvidos</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="criados" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Criados" />
                <Bar dataKey="resolvidos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-semibold text-gray-900">Por Categoria</h3>
            </div>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {cat.name} ({cat.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">Sem dados</p>
            )}
          </div>

          {/* Trend Line */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h3 className="text-base font-semibold text-gray-900">Tendência de Chamados</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v: string) => {
                  const d = new Date(v + "T00:00:00");
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} labelFormatter={(label: string) => { const d = new Date(label + "T00:00:00"); return d.toLocaleDateString("pt-BR"); }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", strokeWidth: 2 }} activeDot={{ r: 5 }} name="Chamados" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-gray-900">Por Status</h3>
            </div>
            <div className="space-y-3">
              {statusData.map((item, i) => {
                const total = stats.total || 1;
                const pct = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.status}</span>
                      <span className="font-medium text-gray-900">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(Number(pct) * 5, 100)}%`, backgroundColor: COLORS[Math.min(i, COLORS.length - 1)] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent Performance Table */}
        {agentData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Desempenho por Atendente</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Atendente</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Resolvidos</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Abertos</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Eficiência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agentData.map((agent, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {agent.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-green-600 font-medium">{agent.resolved}</td>
                      <td className="py-3 px-5 text-orange-600">{agent.open}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${((agent.resolved / (agent.resolved + agent.open)) || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {(((agent.resolved / (agent.resolved + agent.open)) || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

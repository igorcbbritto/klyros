"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import { mockStats } from "@/dashboard-mocks";
import { formatDate } from "@/lib/utils";
import {
  Ticket,
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

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"];

const weeklyData = [
  { week: "Semana 1", criados: 45, resolvidos: 38 },
  { week: "Semana 2", criados: 52, resolvidos: 47 },
  { week: "Semana 3", criados: 38, resolvidos: 42 },
  { week: "Semana 4", criados: 61, resolvidos: 55 },
];

const categoryData = [
  { name: "Técnico", value: 420 },
  { name: "Financeiro", value: 210 },
  { name: "Vendas", value: 180 },
  { name: "Feedback", value: 95 },
  { name: "Outro", value: 42 },
];

const agentData = [
  { name: "Ana Silva", resolvidos: 156, abertos: 12, tempoMedio: "15min" },
  { name: "Bruno Costa", resolvidos: 142, abertos: 18, tempoMedio: "22min" },
  { name: "Carla Dias", resolvidos: 98, abertos: 8, tempoMedio: "12min" },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("30d");

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
          <StatCard title="Total de Chamados" value={mockStats.totalTickets} icon={Ticket} trend={{ value: 12, positive: true }} color="blue" />
          <StatCard title="Resolvidos" value={mockStats.resolvedTickets} icon={CheckCircle2} trend={{ value: 8, positive: true }} color="green" />
          <StatCard title="Em Andamento" value={mockStats.inProgressTickets} icon={Clock} color="orange" />
          <StatCard title="Tempo Médio de Resposta" value={`${mockStats.averageResponseTime}min`} icon={Timer} color="cyan" />
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
          </div>

          {/* Trend Line */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h3 className="text-base font-semibold text-gray-900">Tendência de Chamados</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockStats.ticketsByDay}>
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
              {mockStats.ticketsByStatus.map((item, i) => {
                const total = mockStats.totalTickets;
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
                        style={{ width: `${Math.min(Number(pct) * 5, 100)}%`, backgroundColor: COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent Performance Table */}
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
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Tempo Médio</th>
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
                    <td className="py-3 px-5 text-green-600 font-medium">{agent.resolvidos}</td>
                    <td className="py-3 px-5 text-orange-600">{agent.abertos}</td>
                    <td className="py-3 px-5 text-gray-500">{agent.tempoMedio}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${(agent.resolvidos / (agent.resolvidos + agent.abertos)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {((agent.resolvidos / (agent.resolvidos + agent.abertos)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
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

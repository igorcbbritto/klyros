"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { cn, formatDate } from "@/lib/utils";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Ban,
  Edit,
  Search,
  BarChart3,
  DollarSign,
  Clock,
} from "lucide-react";

const mockCompanies = [
  { id: "1", name: "Hospital Central", plan: "enterprise", expires_at: "2026-12-31", is_active: true, users: 25, tickets: 1240, revenue: 297 },
  { id: "2", name: "Clínica Vida", plan: "pro", expires_at: "2026-06-15", is_active: true, users: 8, tickets: 456, revenue: 97 },
  { id: "3", name: "Tech Solutions", plan: "starter", expires_at: "2026-05-01", is_active: true, users: 3, tickets: 120, revenue: 47 },
  { id: "4", name: "Empresa XYZ", plan: "free", expires_at: "2026-04-01", is_active: false, users: 1, tickets: 15, revenue: 0 },
  { id: "5", name: "Construtora ABC", plan: "pro", expires_at: "2026-08-20", is_active: true, users: 12, tickets: 890, revenue: 97 },
  { id: "6", name: "Lab Análises", plan: "starter", expires_at: "2026-04-10", is_active: true, users: 2, tickets: 45, revenue: 47 },
];

const planNames = {
  free: "Grátis",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const planPrices = {
  free: 0,
  starter: 47,
  pro: 97,
  enterprise: 297,
};

export default function SuperAdminPage() {
  const [companies] = useState(mockCompanies);
  const [searchQuery, setSearchQuery] = useState("");

  const totalMRR = companies.reduce((sum, c) => sum + planPrices[c.plan as keyof typeof planPrices], 0);
  const activeCompanies = companies.filter((c) => c.is_active).length;
  const expiredCount = companies.filter((c) => !c.is_active).length;

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel do Super Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as empresas e assinaturas</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Receita Mensal (MRR)" value={`R$ ${totalMRR},00`} icon={DollarSign} trend={{ value: 15, positive: true }} color="green" />
          <StatCard title="Empresas Ativas" value={activeCompanies} icon={Building2} color="blue" />
          <StatCard title="Expiradas / Suspensas" value={expiredCount} icon={AlertTriangle} color="red" />
          <StatCard title="Total de Usuários" value={companies.reduce((s, c) => s + c.users, 0)} icon={Users} color="purple" />
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar empresas..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Empresa</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Plano</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Expira em</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Usuários</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Chamados</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">MRR</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className={cn("hover:bg-gray-50 transition-colors", !company.is_active && "bg-red-50/30")}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {company.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={cn(
                        "px-2.5 py-0.5 text-xs font-semibold rounded-full",
                        company.plan === "enterprise" ? "bg-purple-100 text-purple-700" :
                        company.plan === "pro" ? "bg-blue-100 text-blue-700" :
                        company.plan === "starter" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {planNames[company.plan as keyof typeof planNames]}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      {company.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <XCircle className="w-3.5 h-3.5" />
                          Expirada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-gray-600 text-xs whitespace-nowrap">
                      {company.expires_at}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{company.users}</td>
                    <td className="py-3 px-5 text-gray-600">{company.tickets}</td>
                    <td className="py-3 px-5 font-medium text-gray-900">
                      R$ {planPrices[company.plan as keyof typeof planPrices]},00
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {company.is_active ? (
                          <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors" title="Suspender">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Reativar">
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-900">Receita por Plano</h3>
            </div>
            <div className="space-y-3">
              {(["enterprise", "pro", "starter", "free"] as const).map((plan) => {
                const count = companies.filter((c) => c.plan === plan).length;
                const revenue = count * planPrices[plan];
                const pct = totalMRR > 0 ? (revenue / (totalMRR || 1)) * 100 : 0;
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{planNames[plan]} ({count})</span>
                      <span className="font-medium">R$ {revenue},00 ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-gray-900">Próximas Expirações</h3>
            </div>
            <div className="space-y-3">
              {companies
                .filter((c) => c.is_active)
                .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
                .slice(0, 5)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">Plano: {planNames[c.plan as keyof typeof planNames]}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{c.expires_at}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { mockAgents } from "@/dashboard-mocks";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Shield,
  Mail,
  UserPlus,
  Settings,
  Trash2,
  Edit,
  Building2,
  CreditCard,
  Globe,
  Database,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");
  const [showNewUser, setShowNewUser] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie usuários e configurações</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Shield className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              activeTab === "settings"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>

        {activeTab === "users" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewUser(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Novo Usuário
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Usuário</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Permissão</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider">Chamados</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{agent.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {agent.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Badge variant="status" value={agent.role === "admin" ? "open" : "resolved"} />
                        </td>
                        <td className="py-3 px-5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium",
                            agent.status === "online" ? "text-green-600" : "text-gray-400"
                          )}>
                            <span className={cn("w-2 h-2 rounded-full", agent.status === "online" ? "bg-green-500" : "bg-gray-300")} />
                            {agent.status === "online" ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-gray-600">{agent.tickets}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-semibold text-gray-900">Empresa</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Empresa</label>
                  <input type="text" defaultValue="Minha Empresa" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">E-mail de Contato</label>
                  <input type="email" defaultValue="contato@empresa.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Plano Atual</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                      Pro
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full">
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* AI Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-semibold text-gray-900">Configurações de IA</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Classificação Automática</p>
                    <p className="text-xs text-gray-500">Classificar chamados automaticamente por categoria</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sugestão de Resposta</p>
                    <p className="text-xs text-gray-500">Sugerir respostas automáticas para agentes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Prioridade Automática</p>
                    <p className="text-xs text-gray-500">Sugerir prioridade baseada no conteúdo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>
            </div>

            {/* API Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-green-500" />
                <h3 className="text-base font-semibold text-gray-900">Plano e Pagamento</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-xs text-gray-500">Agentes ativos</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">∞</p>
                    <p className="text-xs text-gray-500">Chamados ilimitados</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Plano Pro — R$ 97,00/mês</p>
                  <p className="text-xs text-blue-600 mt-1">Próxima cobrança: 05/05/2026</p>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors w-full">
                  Gerenciar Assinatura
                </button>
              </div>
            </div>

            {/* Database Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Dados do Sistema</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Armazenamento usado</span>
                  <span className="font-medium text-gray-900">2.3 GB / 10 GB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: "23%" }} />
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    Exportar Dados
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors">
                    Resetar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New User Modal */}
      <Modal isOpen={showNewUser} onClose={() => setShowNewUser(false)} title="Novo Usuário">
        <form onSubmit={(e) => { e.preventDefault(); setShowNewUser(false); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissão</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="admin">Administrador</option>
              <option value="agent">Agente</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowNewUser(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Criar Usuário</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

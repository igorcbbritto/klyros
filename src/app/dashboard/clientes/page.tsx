"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import { Customer, Ticket } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Mail,
  Phone,
  Building2,
  Ticket as TicketIcon,
  MoreHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const [customersRes, ticketsRes] = await Promise.all([
        supabase.from("customers").select("*").order("name"),
        supabase.from("tickets").select("id, customer_id, subject, created_at"),
      ]);

      setCustomers((customersRes.data as Customer[]) || []);
      setTickets((ticketsRes.data as Ticket[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const customerTickets = useCallback(
    (customerId: string) => tickets.filter((t) => t.customer_id === customerId),
    [tickets]
  );

  const handleCreateCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    notes: string;
  }) => {
    const supabase = createClient();
    const { error } = await supabase.from("customers").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company_name: data.company_name || null,
      notes: data.notes || null,
      company_id: "00000000-0000-0000-0000-000000000001",
    });

    if (!error) {
      setShowNewCustomer(false);
      const { data: refreshed } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      setCustomers((refreshed as Customer[]) || []);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500 mt-1">
              {customers.length} clientes cadastrados
            </p>
          </div>
          <button
            onClick={() => setShowNewCustomer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer Cards */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex items-center justify-center">
            <p className="text-gray-400">Carregando clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16 text-gray-500">
            <p className="text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">Crie um novo cliente para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => {
              const tickets = customerTickets(customer.id);
              return (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {customer.name}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.company_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {customer.company_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <TicketIcon className="w-3.5 h-3.5" />
                      {tickets.length} chamado
                      {tickets.length !== 1 ? "s" : ""}
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      <Modal
        isOpen={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        title="Novo Cliente"
      >
        <NewCustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowNewCustomer(false)}
        />
      </Modal>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || ""}
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {selectedCustomer.email}
              </div>
              {selectedCustomer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedCustomer.phone}
                </div>
              )}
              {selectedCustomer.company_name && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {selectedCustomer.company_name}
                </div>
              )}
              {selectedCustomer.notes && (
                <p className="text-gray-500 text-sm italic mt-2">
                  {selectedCustomer.notes}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Chamados Recentes
              </h4>
              <div className="space-y-2">
                {customerTickets(selectedCustomer.id).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {t.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(t.created_at)}
                    </p>
                  </div>
                ))}
                {customerTickets(selectedCustomer.id).length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum chamado</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

function NewCustomerForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name, email, phone, company_name: companyName, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import { Equipment } from "@/types";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Cpu,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Settings,
  Monitor,
  Stethoscope,
  Building as BuildingIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const categoryIcons = {
  clinical: Stethoscope,
  building: BuildingIcon,
  it: Monitor,
  general: Cpu,
};

const categoryLabels = {
  clinical: "Clínico",
  building: "Predial",
  it: "TI",
  general: "Geral",
};

const statusConfig = {
  active: { label: "Ativo", color: "bg-green-100 text-green-700", icon: CheckCircle },
  maintenance: { label: "Manutenção", color: "bg-yellow-100 text-yellow-700", icon: Wrench },
  decommissioned: { label: "Desativado", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("equipments")
        .select("*")
        .order("name");
      setEquipments((data as Equipment[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredEquipments = equipments.filter((eq) => {
    if (filterCategory !== "all" && eq.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        eq.name.toLowerCase().includes(q) ||
        (eq.serial_number || "").toLowerCase().includes(q) ||
        (eq.location || "").toLowerCase().includes(q) ||
        (eq.brand || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateEquipment = async (data: {
    name: string;
    serial_number: string;
    brand: string;
    model: string;
    category: Equipment["category"];
    status: Equipment["status"];
    location: string;
    notes: string;
  }) => {
    const supabase = createClient();
    const { error } = await supabase.from("equipments").insert({
      name: data.name,
      serial_number: data.serial_number || null,
      brand: data.brand || null,
      model: data.model || null,
      category: data.category,
      status: data.status,
      location: data.location || null,
      notes: data.notes || null,
      company_id: "00000000-0000-0000-0000-000000000001",
    });

    if (!error) {
      setShowNewEquipment(false);
      const { data: refreshed } = await supabase
        .from("equipments")
        .select("*")
        .order("name");
      setEquipments((refreshed as Equipment[]) || []);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
            <p className="text-sm text-gray-500 mt-1">{equipments.length} equipamentos cadastrados</p>
          </div>
          <button
            onClick={() => setShowNewEquipment(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Equipamento
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, série, local..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors",
              filterCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Todos ({equipments.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const IconComp = categoryIcons[key as keyof typeof categoryIcons];
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors",
                  filterCategory === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {IconComp && <IconComp className="w-3.5 h-3.5" />}
                {label} ({equipments.filter((e) => e.category === key).length})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex items-center justify-center">
            <p className="text-gray-400">Carregando equipamentos...</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16 text-gray-500">
            <p className="text-lg font-medium">Nenhum equipamento encontrado</p>
            <p className="text-sm mt-1">Cadastre um novo equipamento para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipments.map((eq) => {
              const CatIcon = categoryIcons[eq.category] || Cpu;
              const statusConf = statusConfig[eq.status];
              return (
                <div key={eq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <CatIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{eq.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">{eq.serial_number}</p>
                    </div>
                    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full", statusConf.color)}>
                      <statusConf.icon className="w-3 h-3 mr-1" />
                      {statusConf.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    {eq.brand && eq.model && (
                      <div className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 shrink-0" />
                        {eq.brand} {eq.model}
                      </div>
                    )}
                    {eq.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {eq.location}
                      </div>
                    )}
                  </div>

                  {eq.notes && (
                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50 truncate">
                      {eq.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showNewEquipment} onClose={() => setShowNewEquipment(false)} title="Novo Equipamento">
        <NewEquipmentForm
          onSubmit={handleCreateEquipment}
          onCancel={() => setShowNewEquipment(false)}
        />
      </Modal>
    </DashboardLayout>
  );
}

function NewEquipmentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    name: string;
    serial_number: string;
    brand: string;
    model: string;
    category: Equipment["category"];
    status: Equipment["status"];
    location: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<Equipment["category"]>("general");
  const [status, setStatus] = useState<Equipment["status"]>("active");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      serial_number: serialNumber,
      brand,
      model,
      category,
      status,
      location,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Raio X Digital"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nº Série</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Equipment["category"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="clinical">Clínico</option>
            <option value="building">Predial</option>
            <option value="it">TI</option>
            <option value="general">Geral</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Equipment["status"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Ativo</option>
            <option value="maintenance">Manutenção</option>
            <option value="decommissioned">Desativado</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Ala A - Sala 101"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
        <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Salvar</button>
      </div>
    </form>
  );
}

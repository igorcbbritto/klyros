"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ComparisonBarChartProps {
  title: string;
  data: { week: string; criados: number; resolvidos: number }[];
}

export default function ComparisonBarChart({ title, data }: ComparisonBarChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
          <Bar dataKey="criados" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Criados" />
          <Bar dataKey="resolvidos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolvidos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

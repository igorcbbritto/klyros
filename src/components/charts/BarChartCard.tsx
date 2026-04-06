"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
  title: string;
  data: { date: string; count: number }[];
}

export default function BarChartCard({ title, data }: BarChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v: string) => {
            const d = new Date(v + "T00:00:00");
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }} />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
            formatter={(value: number) => [`${value} chamados`]}
            labelFormatter={(label: string) => {
              const d = new Date(label + "T00:00:00");
              return d.toLocaleDateString("pt-BR");
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

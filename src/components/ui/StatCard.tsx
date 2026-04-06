import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: string;
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    cyan: "from-cyan-500 to-cyan-600",
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1.5 font-medium", trend.positive ? "text-green-600" : "text-red-600")}>
              {trend.positive ? "↑" : "↓"} {trend.value}% vs período anterior
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-gradient-to-br text-white", colorMap[color] || colorMap.blue)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

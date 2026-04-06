import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "status" | "priority" | "default";
  value: string;
  className?: string;
}

const statusMap: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityMap: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const labelMap: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export default function Badge({ variant, value, className }: BadgeProps) {
  let colorClass = "bg-gray-100 text-gray-700";
  if (variant === "status") colorClass = statusMap[value] || colorClass;
  if (variant === "priority") colorClass = priorityMap[value] || colorClass;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colorClass, className)}>
      {labelMap[value] || value}
    </span>
  );
}

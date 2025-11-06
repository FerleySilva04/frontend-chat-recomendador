// src/components/atoms/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-udea.green text-white"
      : status === "training"
      ? "bg-yellow-500 text-white"
      : "bg-gray-300 text-gray-800";
  const label =
    status === "active"
      ? "Activo"
      : status === "training"
      ? "Entrenando"
      : "Inactivo";

  return <Badge className={`${color} px-3 py-1`}>{label}</Badge>;
}

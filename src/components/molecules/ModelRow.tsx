// src/components/molecules/ModelRow.tsx
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ModelIcon } from "@/components/atoms/ModelIcon";

interface ModelRowProps {
  id: number;
  name: string;
  type: string;
  status: string;
  onActivate: (id: number) => void;
}

export function ModelRow({ id, name, type, status, onActivate }: ModelRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-udea.gray/40 transition-colors">
      <td className="p-3 font-medium flex items-center gap-2">
        <ModelIcon type={type} /> {name}
      </td>
      <td className="p-3 text-center">
        <StatusBadge status={status} />
      </td>
      <td className="p-3 text-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onActivate(id)}
          className="border-udea.green text-udea.green hover:bg-udea.green hover:text-white"
        >
          Activar
        </Button>
      </td>
    </tr>
  );
}

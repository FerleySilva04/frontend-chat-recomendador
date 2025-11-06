// src/components/organisms/ModelsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModelRow } from "@/components/molecules/ModelRow";

interface Model {
  id: number;
  name: string;
  type: string;
  status: string;
}

export function ModelsTable({
  models,
  onActivate,
}: {
  models: Model[];
  onActivate: (id: number) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-udea.green text-white">
          <TableHead className="w-1/3 text-left">Modelo</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-center">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((m) => (
          <ModelRow key={m.id} {...m} onActivate={onActivate} />
        ))}
      </TableBody>
    </Table>
  );
}

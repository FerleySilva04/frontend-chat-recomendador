// src/pages/Models.tsx
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ModelsTable } from "@/components/organisms/ModelsTable";
import { UploadModelForm } from "@/components/molecules/UploadModelForm";

interface Model {
  id: number;
  name: string;
  type: string;
  status: string;
}

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);

  const fetchModels = async () => {
    const res = await api.get("/api/models/");
    setModels(res.data);
  };

  const activateModel = async (id: number) => {
    await api.post(`/api/models/${id}/activate`);
    fetchModels();
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-udea.green">
        Modelos Entrenados
      </h1>
      <UploadModelForm onUpload={fetchModels} />
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <ModelsTable models={models} onActivate={activateModel} />
      </div>
    </div>
  );
}

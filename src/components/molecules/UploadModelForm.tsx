// src/components/molecules/UploadModelForm.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

export function UploadModelForm({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo .pkl para subir");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/models/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload();
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error al subir el modelo");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center gap-3 bg-white border rounded-lg p-4 shadow-sm"
    >
      <Input
        type="file"
        accept=".pkl"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="cursor-pointer"
      />
      <Button
        type="submit"
        className="bg-udea.green hover:bg-udea.light text-white"
      >
        Subir Modelo
      </Button>
    </form>
  );
}

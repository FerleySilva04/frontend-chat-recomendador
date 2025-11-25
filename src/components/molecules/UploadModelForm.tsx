import { useState } from "react";
import api from "@/lib/axios";
import { AiOutlineUpload, AiOutlineFile } from "react-icons/ai"; // iconos react-icons

interface Props {
  onUpload: () => void;
}

export function UploadModelForm({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !tipo) {
      alert("Selecciona un tipo y un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);

    try {
      setIsUploading(true);
      setIsError(false);
      setStatus("Subiendo...");

      // POST al backend
      const res = await api.post("/api/models/", formData);

      setStatus(res.data.message);
      onUpload();
    } catch (err: any) {
      setIsError(true);
      setStatus(err.response?.data?.detail || "Error subiendo archivo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col md:flex-row items-center gap-4 p-6 rounded-2xl shadow-lg bg-udea-gray"
    >
      {/* Select tipo */}
      <div className="flex items-center gap-2">
        <AiOutlineFile className="text-udea-green text-xl" />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="p-2 rounded-lg border border-udea-green text-udea-text bg-white focus:outline-none focus:ring-2 focus:ring-udea-light"
        >
          <option value="">Selecciona tipo</option>
          <option value="embeddings">Embeddings</option>
          <option value="matriz">Matriz</option>
          <option value="cursos">Cursos</option>
          <option value="fechas">Fechas</option> {/* ✅ Nuevo campo */}
        </select>
      </div>

      {/* Input file */}
      <label
        className="flex items-center gap-2 px-4 py-2 bg-white border border-udea-green rounded-lg cursor-pointer hover:bg-udea-light transition"
      >
        <AiOutlineUpload className="text-udea-green text-xl" />
        {file ? file.name : "Seleccionar archivo"}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      {/* Botón subir */}
      <button
        type="submit"
        disabled={isUploading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow transition
          ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-udea-green hover:bg-udea-light"}
        `}
      >
        {isUploading ? "Subiendo..." : "Subir"}
      </button>

      {/* Estado */}
      {status && (
        <span className={`mt-2 md:mt-0 font-medium ${isError ? "text-red-500" : "text-udea-green"}`}>
          {status}
        </span>
      )}
    </form>
  );
}

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { UploadModelForm } from "@/components/molecules/UploadModelForm";

interface ModelStatus {
  embeddings: boolean;
  matriz: boolean;
  cursos: boolean;
}

const MODEL_ICONS: Record<string, string> = {
  embeddings: "📘",
  matriz: "📊",
  cursos: "📚",
};

export default function Models() {
  const [status, setStatus] = useState<ModelStatus>({
    embeddings: false,
    matriz: false,
    cursos: false,
  });

  const [loading, setLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/models/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Error al obtener estado de modelos:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadModel = async (tipo: string) => {
    try {
      setLoadingModel(tipo);
      const res = await api.post(`/api/models/${tipo}/load`);
      alert(res.data.message);
      fetchStatus();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error cargando modelo");
    } finally {
      setLoadingModel(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-10 p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold text-udea-green">
            Modelos del Sistema
          </h1>
          <p className="text-udea-text/70 mt-1">
            Administra el estado, carga y descarga de los modelos del sistema.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="
            px-4 py-2 rounded-lg
            bg-udea-green text-white 
            shadow hover:bg-udea-light 
            transition
          "
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Cargar modelos */}
      <UploadModelForm onUpload={fetchStatus} />

      {/* Card */}
      <div className="bg-white rounded-xl shadow border border-udea-gray p-6">
        <h2 className="text-xl font-medium text-udea-green mb-6">
          Estado de los Modelos
        </h2>

        {loading ? (
          <p className="text-gray-400 animate-pulse">Consultando estado...</p>
        ) : (
          <ul className="space-y-4">
            {(["embeddings", "matriz", "cursos"] as const).map((tipo) => (
              <li
                key={tipo}
                className="
                  flex justify-between items-center 
                  p-4 rounded-xl border 
                  bg-udea-gray 
                  hover:bg-udea-gray/80 transition
                "
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{MODEL_ICONS[tipo]}</span>

                  <div>
                    <p className="text-lg font-semibold text-udea-text capitalize">
                      {tipo}
                    </p>

                    <p
                      className={`text-sm font-medium ${
                        status[tipo] ? "text-udea-green" : "text-red-600"
                      }`}
                    >
                      {status[tipo] ? "Cargado" : "No cargado"}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                  {status[tipo] && (
                    <a
                      href={`/api/models/${tipo}/download`}
                      className="
                        px-3 py-1.5 rounded-lg 
                        bg-white 
                        border shadow-sm 
                        hover:bg-neutral-200 
                        transition
                      "
                    >
                      ⬇️ Descargar
                    </a>
                  )}

                  <button
                    onClick={() => loadModel(tipo)}
                    disabled={loadingModel === tipo}
                    className={`
                      px-3 py-1.5 rounded-lg text-white shadow 
                      transition 
                      ${
                        loadingModel === tipo
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-udea-green hover:bg-udea-light"
                      }
                    `}
                  >
                    {loadingModel === tipo ? "Procesando..." : "⚡ Cargar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

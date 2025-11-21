import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface Message {
  sender: "user" | "bot";
  content: string;
  created_at: string;
}

interface Conversation {
  id_conversation: number;
  last_message?: string;
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Cargar lista de conversaciones
  const loadConversations = async () => {
    try {
      const res = await api.get("/api/conversations?limit=20");
      setConversations(res.data);
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    }
  };

  // Ver historial de una conversación
  const viewConversation = async (id: number) => {
  try {
    const res = await api.get(`/api/conversations/${id}`);
    setSelectedHistory(res.data); // ← aquí
    setSelectedId(id);
  } catch (err) {
    console.error("Error al obtener historial:", err);
    alert("No se pudo obtener el historial de la conversación.");
  }
};


  // Eliminar conversación
  const deleteConversation = async (id: number) => {
    if (!confirm(`¿Eliminar conversación ${id}?`)) return;
    try {
      await api.delete(`/api/conversations/${id}`);
      alert("✅ Conversación eliminada correctamente");
      if (selectedId === id) setSelectedHistory([]);
      loadConversations();
    } catch (err) {
      console.error("Error eliminando conversación:", err);
      alert("❌ No se pudo eliminar la conversación.");
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-udea-green">Historial de Conversaciones</h1>

      {/* Lista de conversaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {conversations.map((conv) => (
          <div key={conv.id_conversation} className="border rounded p-3 shadow flex flex-col justify-between">
            <div>
              <strong>ID:</strong> {conv.id_conversation} <br />
              <small>Último mensaje: {conv.last_message || "N/A"}</small>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded"
                onClick={() => viewConversation(conv.id_conversation)}
              >
                Ver
              </button>
              <button
                className="px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => deleteConversation(conv.id_conversation)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historial seleccionado */}
      {selectedHistory.length > 0 && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Historial de conversación {selectedId}</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded ${msg.sender === "user" ? "bg-green-100" : "bg-white"} border`}
              >
                <strong>{msg.sender === "user" ? "Usuario" : "Bot"}:</strong> {msg.content}
                <div className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

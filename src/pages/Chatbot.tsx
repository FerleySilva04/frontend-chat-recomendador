import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/chatbot/message", {
        user_input: input,
      });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error al conectar con el servidor." },
      ]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* ===== Botón flotante ===== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#006E3A] hover:bg-[#00592D] text-white p-4 rounded-full shadow-lg transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* ===== Ventana del Chat ===== */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-300 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-[#006E3A] text-white p-3 flex justify-between items-center">
            <h2 className="text-sm font-semibold">
              Chatbot Recomendador de Cursos — UdeA
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFD700]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat window */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f3f4f6]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`p-2 rounded-xl max-w-[80%] text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#006E3A] text-white"
                      : "bg-white border border-gray-200 text-[#1F2937]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border-gray-300 text-sm"
            />
            <Button
              onClick={sendMessage}
              className="bg-[#006E3A] hover:bg-[#00592D] text-white text-sm px-4"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string | any;
  created_at?: string;
}

interface ApiResponse {
  reply: string | string[] | any[];
  id_conversation?: number | null;
  state?: Record<string, any> | null;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [botState, setBotState] = useState<Record<string, any> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const initialBotMessages: Message[] = [
    { sender: "bot", text: "👋 ¡Hola! Soy tu asistente para encontrar cursos perfectos para ti." },
    { sender: "bot", text: "Me encanta conectar a las personas con oportunidades de aprendizaje que realmente les sirvan." },
    { sender: "bot", text: "Para empezar, **¿sobre qué tema te gustaría aprender?**" },
    { sender: "bot", text: "_Puede ser cualquier cosa: programación, marketing, salud, arte, idiomas... ¡Tú dime!_ 🌟" },
  ];

  const shortenUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;

    if (url.includes('udea.edu.co')) {
      const match = url.match(/q=(\d+)/);
      if (match) {
        return `https://udea.edu.co/...?q=${match[1]}`;
      }
    }

    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - maxLength / 4);
    return `${start}...${end}`;
  };

  const linkifyText = (text: string) => {
    if (typeof text !== 'string') return text;

    const urlPattern = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlPattern);

    return parts.map((part, index) => {
      if (urlPattern.test(part)) {
        const displayUrl = shortenUrl(part);
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-udea-green underline font-medium hover:text-green-800 transition-colors break-all"
            title={part}
            onClick={(e) => e.stopPropagation()}
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

  const renderMessageContent = (content: string | any) => {
    if (typeof content === 'object' && content.type === 'course_detail') {
      return (
        <div className="space-y-2">
          <p>{content.message}</p>
          <p className="font-semibold text-gray-900 text-base">{content.course_name}</p>
          <p>
            <a
              href={content.course_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-udea-green underline font-medium hover:text-green-800 transition-colors break-all"
              title={content.course_url}
            >
              {content.display_text}
            </a>
          </p>
          {content.continue_message && (
            <p className="text-gray-600 mt-3">{content.continue_message}</p>
          )}
        </div>
      );
    }

    const text = typeof content === 'string' ? content : String(content);

    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);

    const processedParts = parts.map((part, index) => {
      if (urlPattern.test(part)) {
        const displayUrl = shortenUrl(part);
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-udea-green underline font-medium hover:text-green-800 transition-colors break-all"
            title={part}
            onClick={(e) => e.stopPropagation()}
          >
            {displayUrl}
          </a>
        );
      } else {
        const markdownParts = part.split(/(\*\*.*?\*\*|_.*?_)/g);
        return markdownParts.map((markdownPart, mdIndex) => {
          const uniqueKey = `${index}-${mdIndex}`;
          if (markdownPart.startsWith('**') && markdownPart.endsWith('**')) {
            return <strong key={uniqueKey} className="font-semibold">{markdownPart.slice(2, -2)}</strong>;
          }
          if (markdownPart.startsWith('_') && markdownPart.endsWith('_')) {
            return <em key={uniqueKey} className="italic">{markdownPart.slice(1, -1)}</em>;
          }
          return markdownPart;
        });
      }
    });

    return <div className="leading-relaxed break-all">{processedParts}</div>;
  };

  const handleOpenChat = () => {
    if (!isOpen && messages.length === 0) {
      setMessages([...initialBotMessages]);
    }
    setIsOpen(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    const payload = {
      message: input,
      id_conversation: conversationId,
      state: botState,
    };

    setInput("");

    try {
      const res = await axios.post<ApiResponse>(
        "http://127.0.0.1:8000/api/chatbot/message",
        payload
      );

      const data = res.data;

      if (typeof data.id_conversation === "number") setConversationId(data.id_conversation);
      if (data.state) setBotState(data.state);

      if (Array.isArray(data.reply)) {
        const botsMsgs: Message[] = data.reply.map((msg) => ({
          sender: "bot" as const,
          text: msg,
          created_at: new Date().toISOString(),
        }));
        setMessages((prev) => [...prev, ...botsMsgs]);
      } else {
        const botMsg: Message = {
          sender: "bot",
          text: data.reply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "😔 Lo siento, hubo un error al conectar con el servidor. ¿Podrías intentarlo de nuevo?",
          created_at: new Date().toISOString(),
        },
      ]);
      console.error("Error al enviar mensaje:", err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 bg-udea-green hover:bg-[#00592D] text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-105"
          aria-label="Abrir chat"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-300 overflow-hidden animate-fade-in z-50">
          <div className="bg-udea-green text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold">Chatbot de Cursos — UdeA</h2>
              <p className="text-xs text-green-100 opacity-90">Te ayudo a encontrar cursos perfectos</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-yellow-300 transition-colors p-1 rounded-full hover:bg-green-700"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-udea-gray">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[90%] text-sm shadow-sm transition-all break-all ${msg.sender === "user"
                      ? "bg-udea-green text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-udea-text rounded-bl-none"
                    }`}
                >
                  <div className={msg.sender === "user" ? "text-white break-all" : "text-gray-800 break-all"}>
                    {renderMessageContent(msg.text)}
                  </div>

                  {msg.created_at && (
                    <div className={`text-xs mt-2 ${msg.sender === "user" ? "text-green-200" : "text-gray-500"
                      }`}>
                      {formatTime(msg.created_at)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border-gray-300 focus:border-udea-green focus:ring-udea-green text-sm rounded-full px-4"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-udea-green hover:bg-[#00592D] text-white text-sm px-4 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

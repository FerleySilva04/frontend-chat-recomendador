import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, X, SendHorizonal } from "lucide-react";

// ----------- sonidos ----------
const userSound = new Audio("/sounds/send.mp3");
const botSound = new Audio("/sounds/receive.mp3");

interface Message {
  sender: "user" | "bot";
  text: string | any;
  created_at?: string;
  typing?: boolean;
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

  // NUEVO → evita que se muestren mensajes iniciales antes de tiempo
  const [initialLoading, setInitialLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ---- Initial bot messages (with typing) ----
  const initialBotMessagesText = [
    "👋 ¡Hola! Soy tu asistente para encontrar cursos perfectos para ti.",
    "Me encanta conectar a las personas con oportunidades de aprendizaje que realmente les sirvan.",
    "Para empezar, **¿sobre qué tema te gustaría aprender?**",
    "_Puede ser cualquier cosa: programación, marketing, salud, arte, idiomas... ¡Tú dime!_ 🌟",
  ];

  // -------- SHORT URL --------
  const shortenUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    if (url.includes("udea.edu.co")) {
      const match = url.match(/q=(\d+)/);
      if (match) return `https://udea.edu.co/...?q=${match[1]}`;
    }
    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - maxLength / 4);
    return `${start}...${end}`;
  };

  // -------- MESSAGE RENDER --------
  const renderMessageContent = (content: string | any) => {
    if (typeof content === "object" && content.type === "course_detail") {
      return (
        <div className="space-y-2">
          <p>{content.message}</p>
          <p className="font-semibold text-gray-900 text-base">
            {content.course_name}
          </p>

          <p>
            <a
              href={content.course_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-udea-green underline font-medium hover:text-green-800 transition-colors break-words whitespace-normal"
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

    const text = typeof content === "string" ? content : String(content);

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
            className="text-udea-green underline font-medium hover:text-green-800 transition-colors break-words whitespace-normal"
            title={part}
          >
            {displayUrl}
          </a>
        );
      } else {
        const markdownParts = part.split(/(\*\*.*?\*\*|_.*?_)/g);

        return markdownParts.map((markdownPart, mdIndex) => {
          const uniqueKey = `${index}-${mdIndex}`;

          if (markdownPart.startsWith("**") && markdownPart.endsWith("**")) {
            return (
              <strong key={uniqueKey} className="font-semibold">
                {markdownPart.slice(2, -2)}
              </strong>
            );
          }

          if (markdownPart.startsWith("_") && markdownPart.endsWith("_")) {
            return (
              <em key={uniqueKey} className="italic">
                {markdownPart.slice(1, -1)}
              </em>
            );
          }

          return markdownPart;
        });
      }
    });

    return (
      <div className="leading-relaxed break-words whitespace-normal">
        {processedParts}
      </div>
    );
  };

  // -------- TYPING EFFECT (10ms por letra) --------
  const typeMessage = async (fullText: string) => {
    return new Promise<string>((resolve) => {
      let current = "";
      let i = 0;

      const interval = setInterval(() => {
        current += fullText[i];
        i++;

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].text = current;
          return copy;
        });

        if (i >= fullText.length) {
          clearInterval(interval);
          resolve(fullText);
        }
      }, 10);
    });
  };

  // -------- Mostrar mensaje del bot con typing --------
  const addBotMessage = async (text: any) => {
    if (typeof text === "object" && text.type === "course_detail") {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text, created_at: new Date().toISOString() },
      ]);
      botSound.play();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "", typing: true, created_at: new Date().toISOString() },
    ]);

    botSound.play();
    await typeMessage(String(text));

    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1].typing = false;
      return copy;
    });
  };

  // -------- Inicialización con typing --------
  const handleOpenChat = async () => {
    if (!isOpen && messages.length === 0) {
      setInitialLoading(true);

      for (const msg of initialBotMessagesText) {
        await addBotMessage(msg);
        await new Promise((r) => setTimeout(r, 350));
      }

      setInitialLoading(false);
    }

    setIsOpen(true);
  };

  // -------- Enviar mensaje --------
  const sendMessage = async () => {
    if (!input.trim()) return;

    userSound.play();

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

      if (typeof data.id_conversation === "number")
        setConversationId(data.id_conversation);

      if (data.state) setBotState(data.state);

      if (Array.isArray(data.reply)) {
        for (const msg of data.reply) {
          await addBotMessage(msg);
          await new Promise((r) => setTimeout(r, 250));
        }
      } else {
        await addBotMessage(data.reply);
      }
    } catch (err) {
      await addBotMessage("😔 Lo siento, hubo un error al conectar con el servidor. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ------------- UI -------------
  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 bg-udea-green hover:bg-[#00592D] text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-300 overflow-hidden animate-fade-in z-50">
          <div className="bg-udea-green text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold">Chatbot de Cursos — UdeA</h2>
              <p className="text-xs text-green-100 opacity-90">
                Te ayudo a encontrar cursos perfectos
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-yellow-300 transition-colors p-1 rounded-full hover:bg-green-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-udea-gray">
            {!initialLoading &&
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[90%] text-sm shadow-sm transition-all break-words whitespace-normal ${
                      msg.sender === "user"
                        ? "bg-udea-green text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-udea-text rounded-bl-none"
                    }`}
                  >
                    <div
                      className={
                        msg.sender === "user"
                          ? "text-white break-words whitespace-normal"
                          : "text-gray-800 break-words whitespace-normal"
                      }
                    >
                      {renderMessageContent(msg.text)}
                    </div>

                    {msg.created_at && (
                      <div
                        className={`text-xs mt-2 ${
                          msg.sender === "user"
                            ? "text-green-200"
                            : "text-gray-500"
                        }`}
                      >
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
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

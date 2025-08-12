// src/app/comunicacao/suporte/ChatClient.tsx
"use client";
import { useState, useRef, useEffect } from "react";

const mockMessages = [
  {
    id: 1,
    autor: "admin",
    texto: "Bem-vindo ao chat do Fut7Pro! Precisa de ajuda?",
    data: "2025-07-17 10:01",
  },
  {
    id: 2,
    autor: "user",
    texto: "Olá! Tenho uma dúvida sobre o próximo racha.",
    data: "2025-07-17 10:03",
  },
  { id: 3, autor: "admin", texto: "Pode mandar sua dúvida!", data: "2025-07-17 10:05" },
];

export default function ChatClient() {
  const [messages, setMessages] = useState(mockMessages);
  const [valor, setValor] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  function sendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!valor.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        autor: "user",
        texto: valor,
        data: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setValor("");
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-2 bg-zinc-900 rounded-lg p-4 border-l-4 border-yellow-400 min-h-[360px] max-h-[440px] overflow-y-auto mb-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col mb-2 ${msg.autor === "admin" ? "items-start" : "items-end"}`}
        >
          <span
            className={`text-xs mb-1 ${msg.autor === "admin" ? "text-yellow-400" : "text-zinc-300"}`}
          >
            {msg.autor === "admin" ? "Admin" : "Você"}
          </span>
          <span
            className={`inline-block px-3 py-2 rounded-xl text-sm ${
              msg.autor === "admin" ? "bg-yellow-800 text-yellow-100" : "bg-zinc-700 text-zinc-100"
            }`}
          >
            {msg.texto}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">{msg.data}</span>
        </div>
      ))}
      <div ref={endRef} />
      <form onSubmit={sendMsg} className="flex mt-3 gap-2">
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="flex-1 rounded px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-100"
          maxLength={300}
          placeholder="Digite sua mensagem..."
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-zinc-900 rounded px-4 py-1 font-bold hover:bg-yellow-500 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

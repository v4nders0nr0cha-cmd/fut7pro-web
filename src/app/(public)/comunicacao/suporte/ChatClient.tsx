"use client";
import { useEffect, useRef, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type ChatMessage = {
  id: string;
  autor: "user" | "admin";
  texto: string;
  data: string;
};

function formatDate(value?: string | number | Date) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatClient() {
  const { tenantSlug } = useRacha();
  const { publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || "";
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      autor: "admin",
      texto: "Bem-vindo! Envie sua dúvida e retornaremos no e-mail informado.",
      data: formatDate(),
    },
  ]);
  const [valor, setValor] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function sendMsg(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    if (!valor.trim() || !nome.trim() || !email.trim()) {
      setErro("Informe nome, email e sua mensagem.");
      return;
    }

    setEnviando(true);
    try {
      const body = {
        name: nome.trim(),
        email: email.trim(),
        subject: "Suporte",
        message: valor.trim(),
        slug,
      };

      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Falha ao enviar. Tente novamente.");
      }

      const createdAt = data?.createdAt || new Date().toISOString();
      const texto = typeof data?.message === "string" ? data.message : valor.trim();
      const id = typeof data?.id === "string" ? data.id : `local-${Date.now()}`;

      setMessages((msgs) => [
        ...msgs,
        {
          id,
          autor: "user",
          texto,
          data: formatDate(createdAt),
        },
      ]);
      setValor("");
      setSucesso("Mensagem enviada! Vamos responder no seu e-mail.");
    } catch (error: any) {
      setErro(error?.message || "Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="flex flex-col gap-2 bg-zinc-900 rounded-lg p-4 border-l-4 border-brand min-h-[360px] max-h-[520px] overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col mb-2 ${msg.autor === "admin" ? "items-start" : "items-end"}`}
          >
            <span
              className={`text-xs mb-1 ${msg.autor === "admin" ? "text-brand" : "text-zinc-300"}`}
            >
              {msg.autor === "admin" ? "Admin" : "Você"}
            </span>
            <span
              className={`inline-block px-3 py-2 rounded-xl text-sm ${
                msg.autor === "admin"
                  ? "bg-brand-strong text-brand-soft"
                  : "bg-zinc-700 text-zinc-100"
              }`}
            >
              {msg.texto}
            </span>
            <span className="text-xs text-zinc-500 mt-0.5">{msg.data}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMsg} className="flex flex-col gap-2">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 rounded px-2 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100"
            maxLength={60}
            placeholder="Seu nome"
            autoComplete="name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded px-2 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100"
            maxLength={80}
            placeholder="Seu email"
            autoComplete="email"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex-1 rounded px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100"
            maxLength={300}
            placeholder="Digite sua mensagem..."
            autoComplete="off"
            disabled={enviando}
          />
          <button
            type="submit"
            className="bg-brand text-zinc-900 rounded px-4 py-2 font-bold hover:bg-brand-strong transition disabled:opacity-60"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
        {erro && <div className="text-sm text-red-400">{erro}</div>}
        {sucesso && !erro && (
          <div className="text-sm text-green-400" role="status">
            {sucesso}
          </div>
        )}
        <div className="text-xs text-zinc-400">
          Enviamos a resposta para o email informado. Sua mensagem fica registrada no painel admin.
        </div>
      </form>
    </>
  );
}

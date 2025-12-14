"use client";
import { useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

type SugestaoLocal = {
  id: string;
  mensagem: string;
  data: string;
  status: "Enviada";
};

function formatDate(value?: string | number | Date) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export default function SugestoesPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoLocal[]>([]);

  const enviarSugestao = async () => {
    setErro(null);
    setFeedback("");
    if (mensagem.trim().length < 6 || !nome.trim() || !email.trim()) {
      setErro("Preencha nome, email e uma sugestao com pelo menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const body = {
        name: nome.trim(),
        email: email.trim(),
        subject: "Sugestao",
        message: mensagem.trim(),
        slug,
      };

      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Falha ao enviar sugestao.");
      }

      const novaSugestao: SugestaoLocal = {
        id: typeof data?.id === "string" ? data.id : `local-${Date.now()}`,
        mensagem: typeof data?.message === "string" ? data.message : body.message,
        data: formatDate(data?.createdAt),
        status: "Enviada",
      };

      setSugestoes([novaSugestao, ...sugestoes]);
      setMensagem("");
      setFeedback("Sugestao enviada! O administrador recebera no painel.");
    } catch (error: any) {
      setErro(error?.message || "Erro ao enviar sugestao.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-xl mx-auto w-full px-4">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Sugestoes & Feedback</h1>

      <div className="mb-6 bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-yellow-300 font-bold mb-1">
          Envie suas ideias e sugestoes ao administrador do racha!
        </p>
        <p className="text-zinc-300 text-sm">
          Seu feedback ajuda a melhorar o sistema e o funcionamento do racha. Preencha seus dados e
          envie sua sugestao.
        </p>
      </div>

      <div className="mb-8 space-y-2">
        <input
          className="w-full p-3 rounded bg-zinc-900 text-gray-100 border border-yellow-400 outline-none"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={60}
          disabled={enviando}
        />
        <input
          className="w-full p-3 rounded bg-zinc-900 text-gray-100 border border-yellow-400 outline-none"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={80}
          disabled={enviando}
          type="email"
        />
        <textarea
          className="w-full p-3 rounded bg-zinc-900 text-gray-100 border border-yellow-400 min-h-[80px] outline-none"
          placeholder="Digite sua sugestao ou ideia (minimo 6 caracteres)..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={500}
          disabled={enviando}
        />
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded shadow disabled:bg-gray-500 transition"
          onClick={enviarSugestao}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar Sugestao"}
        </button>
        {feedback && <div className="mt-2 text-sm text-green-400">{feedback}</div>}
        {erro && <div className="mt-2 text-sm text-red-400">{erro}</div>}
        <div className="text-xs text-zinc-400">
          Enviaremos a resposta para o email informado. Sua mensagem fica registrada no painel
          admin.
        </div>
      </div>

      <h2 className="text-lg font-bold text-yellow-300 mb-3">Sugestoes enviadas nesta sessao</h2>
      <ul className="space-y-5">
        {sugestoes.length === 0 && (
          <li className="text-zinc-400">Nenhuma sugestao enviada ainda.</li>
        )}
        {sugestoes.map((s) => (
          <li key={s.id} className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-400">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-yellow-200">{s.data}</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-800 text-yellow-300">
                {s.status}
              </span>
            </div>
            <div className="text-gray-200 mb-1">{s.mensagem}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

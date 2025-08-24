"use client";
import { useState } from "react";

// Tipagem para sugestão individual
type Sugestao = {
  id: number;
  mensagem: string;
  data: string;
  status: "Aguardando" | "Respondida" | "Recusada";
  resposta?: string;
};

// Sugestões do atleta logado (mock - depois troca para API)
const MOCK_SUGESTOES: Sugestao[] = [
  {
    id: 1,
    mensagem: "O campo poderia ter placar digital.",
    data: "12/07/2025",
    status: "Aguardando",
  },
  {
    id: 2,
    mensagem: "Adicionar ranking de assistências no perfil.",
    data: "08/07/2025",
    status: "Respondida",
    resposta: "Obrigado! Essa funcionalidade já está em desenvolvimento.",
  },
  {
    id: 3,
    mensagem: "Criar aviso automático para aniversariantes.",
    data: "01/07/2025",
    status: "Recusada",
  },
];

export default function SugestoesPage() {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>(MOCK_SUGESTOES);
  const [nova, setNova] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState("");

  function enviarSugestao() {
    if (nova.trim().length < 6) {
      setFeedback("Digite uma sugestão mais detalhada.");
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setSugestoes([
        {
          id: Math.max(0, ...sugestoes.map((s) => s.id)) + 1,
          mensagem: nova,
          data: new Date().toLocaleDateString(),
          status: "Aguardando",
        },
        ...sugestoes,
      ]);
      setNova("");
      setFeedback("Sugestão enviada! Em breve será analisada pelo admin.");
      setEnviando(false);
    }, 900);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
      <h1 className="mb-4 text-xl font-bold text-zinc-100">
        Sugestões & Feedback
      </h1>

      <div className="mb-6 rounded-lg border-l-4 border-yellow-400 bg-zinc-800 p-4">
        <p className="mb-1 font-bold text-yellow-300">
          Envie suas ideias e sugestões ao administrador do racha!
        </p>
        <p className="text-sm text-zinc-300">
          Seu feedback ajuda a melhorar o sistema e o funcionamento do racha.
          Escreva sua sugestão abaixo:
        </p>
      </div>

      <div className="mb-8">
        <textarea
          className="mb-2 min-h-[60px] w-full rounded border border-yellow-400 bg-zinc-900 p-3 text-gray-100 outline-none"
          placeholder="Digite sua sugestão ou ideia (mínimo 6 caracteres)..."
          value={nova}
          onChange={(e) => {
            setNova(e.target.value);
            setFeedback("");
          }}
          maxLength={250}
          disabled={enviando}
        />
        <button
          className="rounded bg-yellow-400 px-4 py-2 font-bold text-black shadow transition hover:bg-yellow-500 disabled:bg-gray-500"
          onClick={enviarSugestao}
          disabled={enviando || nova.trim().length < 6}
        >
          {enviando ? "Enviando..." : "Enviar Sugestão"}
        </button>
        {feedback && (
          <div className="mt-2 text-sm text-green-400">{feedback}</div>
        )}
      </div>

      <h2 className="mb-3 text-lg font-bold text-yellow-300">
        Minhas Sugestões Enviadas
      </h2>
      <ul className="space-y-5">
        {sugestoes.length === 0 && (
          <li className="text-zinc-400">
            Você ainda não enviou nenhuma sugestão.
          </li>
        )}
        {sugestoes.map((s) => (
          <li
            key={s.id}
            className={`rounded-lg border-l-4 bg-zinc-800 p-4 ${
              s.status === "Respondida"
                ? "border-green-600"
                : s.status === "Aguardando"
                  ? "border-yellow-400"
                  : "border-red-400"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-bold text-yellow-200">{s.data}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  s.status === "Respondida"
                    ? "bg-green-800 text-green-300"
                    : s.status === "Aguardando"
                      ? "bg-yellow-800 text-yellow-300"
                      : "bg-red-800 text-red-300"
                }`}
              >
                {s.status === "Aguardando" && "Aguardando"}
                {s.status === "Respondida" && "Respondida"}
                {s.status === "Recusada" && "Recusada"}
              </span>
            </div>
            <div className="mb-1 text-gray-200">{s.mensagem}</div>
            {s.status === "Respondida" && s.resposta && (
              <div className="rounded bg-zinc-900 p-2 text-sm text-green-400">
                <b>Resposta do admin:</b> {s.resposta}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

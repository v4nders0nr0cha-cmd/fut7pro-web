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
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-xl mx-auto w-full px-4">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Sugestões & Feedback</h1>

      <div className="mb-6 bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-yellow-300 font-bold mb-1">
          Envie suas ideias e sugestões ao administrador do racha!
        </p>
        <p className="text-zinc-300 text-sm">
          Seu feedback ajuda a melhorar o sistema e o funcionamento do racha. Escreva sua sugestão
          abaixo:
        </p>
      </div>

      <div className="mb-8">
        <textarea
          className="w-full p-3 rounded bg-zinc-900 text-gray-100 border border-yellow-400 mb-2 min-h-[60px] outline-none"
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
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded shadow disabled:bg-gray-500 transition"
          onClick={enviarSugestao}
          disabled={enviando || nova.trim().length < 6}
        >
          {enviando ? "Enviando..." : "Enviar Sugestão"}
        </button>
        {feedback && <div className="mt-2 text-sm text-green-400">{feedback}</div>}
      </div>

      <h2 className="text-lg font-bold text-yellow-300 mb-3">Minhas Sugestões Enviadas</h2>
      <ul className="space-y-5">
        {sugestoes.length === 0 && (
          <li className="text-zinc-400">Você ainda não enviou nenhuma sugestão.</li>
        )}
        {sugestoes.map((s) => (
          <li
            key={s.id}
            className={`bg-zinc-800 rounded-lg p-4 border-l-4
            ${
              s.status === "Respondida"
                ? "border-green-600"
                : s.status === "Aguardando"
                  ? "border-yellow-400"
                  : "border-red-400"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-yellow-200">{s.data}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold
                ${
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
            <div className="text-gray-200 mb-1">{s.mensagem}</div>
            {s.status === "Respondida" && s.resposta && (
              <div className="bg-zinc-900 text-green-400 text-sm rounded p-2">
                <b>Resposta do admin:</b> {s.resposta}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaPoll } from "react-icons/fa";

type Notificacao = {
  id: number;
  type: "aviso" | "enquete" | "cobranca";
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  enqueteId?: number; // só quando type=enquete
};

const notificacoesMock: Notificacao[] = [
  {
    id: 1,
    type: "enquete",
    titulo: "Nova enquete disponível!",
    mensagem: "Participe: Qual melhor horário para o próximo racha?",
    data: "2025-07-18T12:01:00Z",
    lida: false,
    enqueteId: 2,
  },
  {
    id: 2,
    type: "aviso",
    titulo: "Próximo racha confirmado",
    mensagem: "Seu time do dia está disponível na área de jogos.",
    data: "2025-07-16T20:00:00Z",
    lida: false,
  },
  {
    id: 3,
    type: "cobranca",
    titulo: "Cobrança de mensalidade",
    mensagem: "Seu boleto está disponível para pagamento.",
    data: "2025-07-10T08:30:00Z",
    lida: true,
  },
];

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState(notificacoesMock);
  const router = useRouter();

  function handleClick(notif: Notificacao) {
    setNotificacoes((prev) => prev.map((n) => (n.id === notif.id ? { ...n, lida: true } : n)));
    // Redireciona se for enquete
    if (notif.type === "enquete" && notif.enqueteId) {
      router.push(`/comunicacao/enquetes/${notif.enqueteId}`);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-20 pb-24">
      <h1 className="text-2xl font-bold text-yellow-400 mb-5 flex items-center gap-2">
        <FaBell /> Notificações do Racha
      </h1>
      <div className="flex flex-col gap-5">
        {notificacoes.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-lg shadow-md p-4 border-l-4 transition cursor-pointer
                            ${
                              notif.lida
                                ? "bg-zinc-900 border-zinc-700 opacity-70"
                                : notif.type === "enquete"
                                  ? "bg-zinc-900 border-yellow-400 animate-pulse"
                                  : notif.type === "cobranca"
                                    ? "bg-zinc-900 border-red-400"
                                    : "bg-zinc-900 border-yellow-700"
                            }`}
            onClick={() => handleClick(notif)}
          >
            <div className="flex items-center gap-2 mb-2">
              {notif.type === "enquete" && <FaPoll className="text-yellow-400" />}
              <span className="font-bold text-yellow-300">{notif.titulo}</span>
              <span className="ml-auto text-xs text-gray-400">
                {new Date(notif.data).toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="text-gray-200">{notif.mensagem}</div>
            {!notif.lida && notif.type === "enquete" && (
              <button
                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded text-xs"
                onClick={() => handleClick(notif)}
              >
                Responder
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// MOCK local — substituir por dados reais no futuro
const mockNotificacoes = [
  {
    id: "1",
    tipo: "Jogadores",
    mensagem: "3 jogadores aguardando aprovação",
    status: "pendente",
  },
  {
    id: "2",
    tipo: "Configuração",
    mensagem: "Faltando personalizar o rodapé do racha",
    status: "pendente",
  },
  {
    id: "3",
    tipo: "Partidas",
    mensagem: "1 partida sem placar finalizado",
    status: "pendente",
  },
  {
    id: "4",
    tipo: "Jogadores",
    mensagem: "Atualizar a foto de perfil dos novos atletas",
    status: "pendente",
  },
];

export default function ListaNotificacoes() {
  const [notificacoes, setNotificacoes] = useState(mockNotificacoes);

  const marcarComoResolvido = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  if (notificacoes.length === 0) {
    return (
      <div className="rounded border border-green-700 bg-green-900 p-4 text-green-400 shadow">
        Nenhuma pendência encontrada. Tudo certo no seu racha! ✅
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {notificacoes.map((n) => (
        <li
          key={n.id}
          className="flex flex-col gap-3 rounded border-l-4 border-yellow-500 bg-[#1e1e1e] p-4 shadow sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-yellow-400">{n.tipo}</p>
            <p className="text-base text-white">{n.mensagem}</p>
          </div>
          <button
            onClick={() => marcarComoResolvido(n.id)}
            className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white transition hover:bg-green-500"
          >
            <FaCheckCircle /> Marcar como resolvido
          </button>
        </li>
      ))}
    </ul>
  );
}

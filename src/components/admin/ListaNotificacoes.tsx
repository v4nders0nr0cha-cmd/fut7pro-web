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
      <div className="text-green-400 bg-green-900 border border-green-700 p-4 rounded shadow">
        Nenhuma pendência encontrada. Tudo certo no seu racha! ✅
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {notificacoes.map((n) => (
        <li
          key={n.id}
          className="bg-[#1e1e1e] border-l-4 border-yellow-500 rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <p className="text-sm text-yellow-400 font-semibold">{n.tipo}</p>
            <p className="text-base text-white">{n.mensagem}</p>
          </div>
          <button
            onClick={() => marcarComoResolvido(n.id)}
            className="flex items-center gap-2 px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-500 text-white transition"
          >
            <FaCheckCircle /> Marcar como resolvido
          </button>
        </li>
      ))}
    </ul>
  );
}

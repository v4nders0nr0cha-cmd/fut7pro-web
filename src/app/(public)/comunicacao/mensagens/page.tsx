"use client";
import { useState } from "react";
import { FaCommentDots } from "react-icons/fa";

type Mensagem = {
  id: number;
  autor: string;
  mensagem: string;
  data: string;
};

const MENSAGENS_ADMIN: Mensagem[] = [
  {
    id: 1,
    autor: "Admin",
    mensagem:
      "Seu time para o próximo racha já está disponível! Confira os detalhes na área de jogos.",
    data: "2025-07-18T09:01:00Z",
  },
  {
    id: 2,
    autor: "Admin",
    mensagem: "O pagamento da sua mensalidade vence dia 10.",
    data: "2025-07-10T18:30:00Z",
  },
];

export default function MensagensPage() {
  const [mensagens] = useState(MENSAGENS_ADMIN);

  return (
    <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
      <h1 className="text-2xl font-bold text-yellow-400 mb-5 flex items-center gap-2">
        <FaCommentDots /> Mensagens do Admin
      </h1>
      <div className="flex flex-col gap-4">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className="bg-zinc-900 rounded-lg p-4 shadow border-l-4 border-yellow-400"
          >
            <div className="font-bold text-yellow-300 mb-1">{msg.autor}</div>
            <div className="text-gray-200">{msg.mensagem}</div>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(msg.data).toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

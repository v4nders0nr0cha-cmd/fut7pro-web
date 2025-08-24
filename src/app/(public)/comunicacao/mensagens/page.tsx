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
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-20">
      <h1 className="mb-5 flex items-center gap-2 text-2xl font-bold text-yellow-400">
        <FaCommentDots /> Mensagens do Admin
      </h1>
      <div className="flex flex-col gap-4">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg border-l-4 border-yellow-400 bg-zinc-900 p-4 shadow"
          >
            <div className="mb-1 font-bold text-yellow-300">{msg.autor}</div>
            <div className="text-gray-200">{msg.mensagem}</div>
            <div className="mt-2 text-xs text-gray-400">
              {new Date(msg.data).toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

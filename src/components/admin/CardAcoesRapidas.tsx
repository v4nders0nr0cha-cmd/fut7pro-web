"use client";

import Link from "next/link";
import {
  FaUserPlus,
  FaCalendarPlus,
  FaHandshake,
  FaBell,
} from "react-icons/fa";

type CardAcoesRapidasProps = {
  cadastrarJogador: string;
  criarPartida: string;
  adicionarPatrocinador: string;
  enviarNotificacao: string;
};

export default function CardAcoesRapidas({
  cadastrarJogador,
  criarPartida,
  adicionarPatrocinador,
  enviarNotificacao,
}: CardAcoesRapidasProps) {
  return (
    <section className="mt-2 flex w-full flex-col rounded-xl bg-[#23272F] p-5 shadow">
      <span className="mb-4 flex items-center gap-2 text-base font-bold text-[#ffdf38] md:text-lg">
        ⚡ Ações Rápidas
      </span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Link
          href={cadastrarJogador}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#282c34] bg-[#23272F] p-4 shadow transition hover:bg-[#22262c]"
          aria-label="Cadastrar Jogador"
        >
          <FaUserPlus className="h-7 w-7 text-[#00b8b8] transition group-hover:text-[#00e0e0]" />
          <span className="text-center text-sm font-semibold text-gray-100">
            Cadastrar Jogador
          </span>
        </Link>
        <Link
          href={criarPartida}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#282c34] bg-[#23272F] p-4 shadow transition hover:bg-[#22262c]"
          aria-label="Criar Partida"
        >
          <FaCalendarPlus className="h-7 w-7 text-[#ffdf38] transition group-hover:text-[#ffe96b]" />
          <span className="text-center text-sm font-semibold text-gray-100">
            Criar Partida
          </span>
        </Link>
        <Link
          href={adicionarPatrocinador}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#282c34] bg-[#23272F] p-4 shadow transition hover:bg-[#22262c]"
          aria-label="Adicionar Patrocinador"
        >
          <FaHandshake className="h-7 w-7 text-[#38d957] transition group-hover:text-[#66ff99]" />
          <span className="text-center text-sm font-semibold text-gray-100">
            Adicionar Patrocinador
          </span>
        </Link>
        <Link
          href={enviarNotificacao}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#282c34] bg-[#23272F] p-4 shadow transition hover:bg-[#22262c]"
          aria-label="Enviar Notificação"
        >
          <FaBell className="h-7 w-7 text-gray-300 transition group-hover:text-white" />
          <span className="text-center text-sm font-semibold text-gray-100">
            Enviar Notificação
          </span>
        </Link>
      </div>
    </section>
  );
}

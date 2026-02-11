"use client";

import Link from "next/link";
import { FaUserPlus, FaCalendarPlus, FaHandshake, FaBell } from "react-icons/fa";

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
    <section className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col w-full mt-2">
      <span className="text-base md:text-lg font-bold text-[#ffdf38] flex items-center gap-2 mb-4">
        ⚡ Ações Rápidas
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href={cadastrarJogador}
          className="flex flex-col items-center justify-center gap-2 bg-[#23272F] hover:bg-[#22262c] border border-[#282c34] rounded-xl p-4 transition shadow group"
          aria-label="Cadastrar Jogador"
          data-testid="admin-dashboard-quick-cadastrar-jogador"
        >
          <FaUserPlus className="text-[#00b8b8] w-7 h-7 group-hover:text-[#00e0e0] transition" />
          <span className="text-sm font-semibold text-gray-100 text-center">Cadastrar Jogador</span>
        </Link>
        <Link
          href={criarPartida}
          className="flex flex-col items-center justify-center gap-2 bg-[#23272F] hover:bg-[#22262c] border border-[#282c34] rounded-xl p-4 transition shadow group"
          aria-label="Criar Partida"
          data-testid="admin-dashboard-quick-criar-partida"
        >
          <FaCalendarPlus className="text-[#ffdf38] w-7 h-7 group-hover:text-[#ffe96b] transition" />
          <span className="text-sm font-semibold text-gray-100 text-center">Criar Partida</span>
        </Link>
        <Link
          href={adicionarPatrocinador}
          className="flex flex-col items-center justify-center gap-2 bg-[#23272F] hover:bg-[#22262c] border border-[#282c34] rounded-xl p-4 transition shadow group"
          aria-label="Adicionar Patrocinador"
          data-testid="admin-dashboard-quick-adicionar-patrocinador"
        >
          <FaHandshake className="text-[#38d957] w-7 h-7 group-hover:text-[#66ff99] transition" />
          <span className="text-sm font-semibold text-gray-100 text-center">
            Adicionar Patrocinador
          </span>
        </Link>
        <Link
          href={enviarNotificacao}
          className="flex flex-col items-center justify-center gap-2 bg-[#23272F] hover:bg-[#22262c] border border-[#282c34] rounded-xl p-4 transition shadow group"
          aria-label="Enviar Notificação"
          data-testid="admin-dashboard-quick-enviar-notificacao"
        >
          <FaBell className="text-gray-300 w-7 h-7 group-hover:text-white transition" />
          <span className="text-sm font-semibold text-gray-100 text-center">
            Enviar Notificação
          </span>
        </Link>
      </div>
    </section>
  );
}

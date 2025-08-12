"use client";

import Head from "next/head";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";

export default function PartidasPage() {
  return (
    <>
      <Head>
        <title>Partidas | Painel do Presidente - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie e edite as partidas do seu racha no painel Fut7Pro. Acesse o histórico completo e mantenha tudo atualizado."
        />
        <meta
          name="keywords"
          content="partidas fut7, histórico de jogos, editar racha, placar, fut7pro"
        />
      </Head>

      <div className="w-full flex flex-col items-center justify-center text-center p-4 pb-24 md:pb-8 min-h-[60vh]">
        <FaHistory className="text-yellow-400 text-5xl mb-4" />
        <h2 className="text-2xl md:text-3xl font-black mb-2 text-yellow-400">
          Gerencie as Partidas do seu Racha
        </h2>
        <p className="text-base text-gray-300 mb-8 max-w-xl">
          As partidas são criadas automaticamente após o sorteio dos times do dia. Para editar,
          corrigir ou excluir partidas já realizadas, acesse o histórico abaixo.
        </p>
        <Link
          href="/admin/partidas/historico"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-lg"
        >
          <FaHistory className="text-white text-xl" />
          Ir para o Histórico de Partidas
        </Link>
      </div>
    </>
  );
}

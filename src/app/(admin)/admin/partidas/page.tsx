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

      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4 pb-24 text-center md:pb-8">
        <FaHistory className="mb-4 text-5xl text-yellow-400" />
        <h2 className="mb-2 text-2xl font-black text-yellow-400 md:text-3xl">
          Gerencie as Partidas do seu Racha
        </h2>
        <p className="mb-8 max-w-xl text-base text-gray-300">
          As partidas são criadas automaticamente após o sorteio dos times do
          dia. Para editar, corrigir ou excluir partidas já realizadas, acesse o
          histórico abaixo.
        </p>
        <Link
          href="/admin/partidas/historico"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-lg font-bold text-white shadow transition hover:bg-cyan-700"
        >
          <FaHistory className="text-xl text-white" />
          Ir para o Histórico de Partidas
        </Link>
      </div>
    </>
  );
}

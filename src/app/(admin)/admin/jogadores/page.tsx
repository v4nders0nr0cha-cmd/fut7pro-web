"use client";

import Head from "next/head";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";

export default function JogadoresRootPage() {
  return (
    <>
      <Head>
        <title>Gerenciar Jogadores | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os jogadores do seu racha. Cadastre, edite e visualize atletas pelo painel administrativo do Fut7Pro."
        />
        <meta
          name="keywords"
          content="Fut7, gerenciamento de jogadores, cadastro de atletas, futebol 7, painel administrativo"
        />
      </Head>

      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 pb-24 pt-20 text-center md:pb-8 md:pt-6">
        <FaUsers className="mb-4 text-5xl text-yellow-400" />
        <h1 className="mb-2 text-2xl font-black text-yellow-400 md:text-3xl">
          Gerencie seus Jogadores
        </h1>
        <p className="mb-6 max-w-md text-gray-300">
          Acesse uma das subpáginas para cadastrar, editar ou visualizar dados
          dos atletas do seu racha.
        </p>
        <Link
          href="/admin/jogadores/listar-cadastrar"
          className="rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow transition hover:bg-cyan-700"
        >
          Ir para a Lista de Jogadores
        </Link>
      </main>
    </>
  );
}

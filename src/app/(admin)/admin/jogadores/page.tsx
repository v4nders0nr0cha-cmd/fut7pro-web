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

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FaUsers className="text-yellow-400 text-5xl mb-4" />
        <h1 className="text-2xl md:text-3xl font-black text-yellow-400 mb-2">
          Gerencie seus Jogadores
        </h1>
        <p className="text-gray-300 mb-6 max-w-md">
          Acesse uma das subpáginas para cadastrar, editar ou visualizar dados dos atletas do seu
          racha.
        </p>
        <Link
          href="/admin/jogadores/listar-cadastrar"
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-base"
        >
          Ir para a Lista de Jogadores
        </Link>
      </main>
    </>
  );
}

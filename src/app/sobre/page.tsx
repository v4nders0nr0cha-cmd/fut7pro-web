"use client";

import ClientLayout from "@/components/layout/ClientLayout";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Página em Construção | Fut7Pro</title>
        <meta
          name="description"
          content="Estamos preparando algo incrível para você no sistema Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, sistema de racha, plataforma, torneios, estatísticas, futebol amador"
        />
      </Head>

      <ClientLayout>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10 break-words">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
            Página em construção
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-md">
            Estamos preparando algo incrível para você! Volte em breve para acompanhar as novidades
            da plataforma Fut7Pro.
          </p>
        </div>
      </ClientLayout>
    </>
  );
}

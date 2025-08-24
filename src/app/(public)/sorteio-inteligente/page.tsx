"use client";

import Head from "next/head";
import SorteioInteligenteAdmin from "@/components/sorteio/SorteioInteligenteAdmin";

// MOCK de admin. Troque pelo seu método real depois!
function useIsAdmin() {
  // Exemplo: se já usa algum contexto, substitua aqui.
  // Exemplo next-auth: return session?.user?.role === "admin";
  // Mock: sempre true só para teste.
  return true;
}

export default function SorteioInteligentePage() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-fundo text-center">
        <div className="rounded-2xl bg-[#23272F] px-8 py-12 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">
            Acesso Restrito
          </h2>
          <p className="mb-2 text-gray-200">
            Apenas administradores podem acessar esta funcionalidade.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Sorteio Inteligente | Painel de Administração | Fut7Pro</title>
        <meta
          name="description"
          content="Monte times equilibrados no seu racha de futebol 7 com sorteio inteligente, ranking, posição e estrelas. Balanceamento automático/manual exclusivo para administradores do Fut7Pro."
        />
        <meta
          name="keywords"
          content="sorteio de times, fut7, futebol 7, racha, balanceamento, sistema de racha, times equilibrados, administrar racha, painel admin fut7pro"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="min-h-screen w-full bg-fundo pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mx-auto w-full max-w-5xl px-2">
          <SorteioInteligenteAdmin />
        </div>
      </main>
    </>
  );
}

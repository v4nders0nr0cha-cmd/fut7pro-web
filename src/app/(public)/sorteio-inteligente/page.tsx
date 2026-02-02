"use client";

import Head from "next/head";
import Link from "next/link";
import SorteioInteligenteAdmin from "@/components/sorteio/SorteioInteligenteAdmin";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function SorteioInteligentePage() {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();
  const isAdmin = isAuthenticated && hasPermission("RACHA_UPDATE");
  const { publicHref } = usePublicLinks();

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-fundo text-center">
        <div className="bg-[#23272F] px-8 py-12 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-brand mb-4">Carregando...</h2>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-fundo text-center">
        <div className="bg-[#23272F] px-8 py-12 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-brand mb-4">Acesso Restrito</h2>
          <p className="text-gray-200 mb-4">
            Apenas administradores podem acessar esta funcionalidade.
          </p>
          {!isAuthenticated && (
            <Link
              href={publicHref("/login")}
              className="inline-block bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
            >
              Fazer login
            </Link>
          )}
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
          content="Monte times equilibrados no seu racha de futebol 7 com sorteio inteligente, ranking, posição e estrelas."
        />
        <meta
          name="keywords"
          content="sorteio de times, fut7, futebol 7, racha, balanceamento, sistema de racha, times equilibrados"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="min-h-screen bg-fundo w-full pt-20 pb-24 md:pt-6 md:pb-8">
        <div className="w-full max-w-5xl mx-auto px-2">
          <SorteioInteligenteAdmin />
        </div>
      </main>
    </>
  );
}

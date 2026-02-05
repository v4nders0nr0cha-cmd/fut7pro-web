"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import EnquetesList from "@/components/public/EnquetesList";

export default function EnquetesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();

  if (authLoading) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Enquetes</h1>
          <p className="text-gray-300 mb-4">Entre para participar das enquetes do seu racha.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/entrar"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Enquetes | Fut7Pro</title>
        <meta name="description" content="Participe das enquetes do seu racha." />
      </Head>
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-3xl mx-auto w-full px-3">
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">Enquetes</h1>
        <p className="text-sm text-gray-300 mb-6">
          Vote, acompanhe resultados e ajude nas decisões do seu racha.
        </p>
        <EnquetesList enabled={isAuthenticated} />
      </main>
    </>
  );
}

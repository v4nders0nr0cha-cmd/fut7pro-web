"use client";
import Head from "next/head";
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { useFinanceiroPublic } from "@/hooks/useFinanceiroPublic";
import { notFound } from "next/navigation";
import ResumoFinanceiro from "@/components/financeiro/ResumoFinanceiro";
import TabelaLancamentos from "@/components/financeiro/TabelaLancamentos";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function PrestacaoDeContasPage() {
  const { tenantSlug } = useRachaContext();
  const { publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || "";
  const {
    resumo,
    lancamentos,
    isLoading: isLoadingFinanceiro,
    isError: isErrorFinanceiro,
    isNotFound,
    tenant,
  } = useFinanceiroPublic(slug);
  const tenantName = tenant?.name || rachaConfig.nome;

  // Se não estiver visível, retorna 404 do Next.js
  if (!isLoadingFinanceiro && isNotFound) {
    notFound();
  }

  if (isLoadingFinanceiro) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="mt-4 text-gray-300">Carregando prestação de contas...</p>
      </div>
    );
  }

  if (isErrorFinanceiro) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Erro ao carregar dados</h1>
        <p className="text-red-300">Não foi possível carregar a prestação de contas.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Prestação de Contas – {tenantName}</title>
        <meta
          name="description"
          content="Acompanhe o saldo, receitas e despesas do nosso racha com total transparência. Veja como os valores são usados em cada mês e acompanhe a gestão financeira do grupo."
        />
        <meta
          name="keywords"
          content="prestação de contas, futebol 7, racha, receitas, despesas, transparência, atletas"
        />
        <meta property="og:title" content={`Prestação de Contas – ${tenantName}`} />
        <meta
          property="og:description"
          content="Veja a movimentação financeira do racha mês a mês. Transparência para todos os atletas do grupo."
        />
      </Head>
      <main className="w-full pt-20 pb-10">
        <section className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-strong mb-2 break-words">
            Prestação de Contas
          </h1>
          <p className="mb-4 text-gray-400 text-xs sm:text-sm max-w-xl">
            Aqui você pode acompanhar todas as receitas e despesas do nosso racha, de forma
            transparente.
            <br />
            Nosso objetivo é mostrar a todos os atletas e patrocinadores como está o saldo, de onde
            vem o dinheiro e como ele é utilizado a cada mês para o benefício do racha.
            <br />
            Em caso de dúvida, procure a administração.
          </p>

          {resumo && <ResumoFinanceiro resumo={resumo} />}

          <TabelaLancamentos lancamentos={lancamentos} />
        </section>
      </main>
    </>
  );
}

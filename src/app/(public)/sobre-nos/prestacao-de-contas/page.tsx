"use client";
import Head from "next/head";
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { useFinanceiroPublic } from "@/hooks/useFinanceiroPublic";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import ResumoFinanceiro from "@/components/financeiro/ResumoFinanceiro";
import TabelaLancamentos from "@/components/financeiro/TabelaLancamentos";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function PrestacaoDeContasPage() {
  const { tenantSlug } = useRachaContext();
  const { publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || "";
  const { racha, isLoading: isLoadingRacha, isError: isErrorRacha } = useRachaPublic(slug);
  const shouldFetchFinanceiro =
    !!slug && !isLoadingRacha && (!!isErrorRacha || !!racha?.financeiroVisivel);
  const {
    resumo,
    lancamentos,
    isLoading: isLoadingFinanceiro,
    isError: isErrorFinanceiro,
    isNotFound,
    isSlugNotFound,
    isModuleDisabled,
    tenant,
  } = useFinanceiroPublic(slug, { enabled: shouldFetchFinanceiro });
  const tenantName = tenant?.name || racha?.nome || rachaConfig.nome;

  if (isLoadingRacha || isLoadingFinanceiro) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="mt-4 text-gray-300">Carregando prestação de contas...</p>
      </div>
    );
  }

  if (isSlugNotFound) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo text-center px-4">
        <h1 className="text-2xl font-bold text-brand-strong mb-3">Grupo não encontrado</h1>
        <p className="text-gray-300 max-w-2xl">
          Este endereço não corresponde a um grupo válido no Fut7Pro.
        </p>
      </div>
    );
  }

  if (isModuleDisabled) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo text-center px-4">
        <h1 className="text-2xl font-bold text-brand-strong mb-3">
          Prestação de contas não publicada
        </h1>
        <p className="text-gray-300 max-w-2xl">
          Nossa administração optou por não disponibilizar esta área publicamente.
        </p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo text-center px-4">
        <h1 className="text-2xl font-bold text-brand-strong mb-3">
          Prestação de contas indisponível
        </h1>
        <p className="text-gray-300 max-w-2xl">
          Ainda não publicamos lançamentos financeiros nesta área.
        </p>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Quando houver movimentações registradas e visíveis, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  if (isErrorFinanceiro) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo text-center px-4">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Prestação de contas temporariamente indisponível
        </h1>
        <p className="text-red-300 max-w-2xl">
          Não foi possível carregar os dados financeiros agora. Tente novamente em instantes.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Prestação de Contas – {tenantName}</title>
        <meta
          name="description"
          content="Acompanhe nosso saldo, receitas e despesas com transparência. Veja como os valores são usados a cada mês."
        />
        <meta
          name="keywords"
          content="prestação de contas, futebol 7, racha, receitas, despesas, transparência, atletas"
        />
        <meta property="og:title" content={`Prestação de Contas – ${tenantName}`} />
        <meta
          property="og:description"
          content="Veja nossa movimentação financeira mês a mês. Transparência para atletas e visitantes."
        />
      </Head>
      <main className="w-full pt-20 pb-10">
        <section className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-strong mb-2 break-words">
            Prestação de Contas
          </h1>
          <p className="mb-4 text-gray-400 text-xs sm:text-sm max-w-xl">
            Aqui você pode acompanhar nossas receitas e despesas de forma transparente.
            <br />
            Nosso objetivo é mostrar a todos os atletas e patrocinadores como está o saldo, de onde
            vem o dinheiro e como ele é utilizado a cada mês em nosso futebol.
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

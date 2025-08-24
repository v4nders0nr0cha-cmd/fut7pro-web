"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useFinanceiroPublic } from "@/hooks/useFinanceiroPublic";
import { notFound } from "next/navigation";
import ResumoFinanceiro from "@/components/financeiro/ResumoFinanceiro";
import TabelaLancamentos from "@/components/financeiro/TabelaLancamentos";
import type { LancamentoFinanceiro } from "@/hooks/useFinanceiroPublic";
import { rachaConfig } from "@/config/racha.config";

export default function PrestacaoDeContasPage() {
  // Pega rachaId do contexto global (multi-rachas)
  const { rachaId } = useRachaContext();
  const {
    racha,
    isLoading: isLoadingRacha,
    isError: isErrorRacha,
  } = useRachaPublic(rachaId);
  const {
    resumo,
    lancamentos,
    isLoading: isLoadingFinanceiro,
    isError: isErrorFinanceiro,
  } = useFinanceiroPublic(rachaId);

  // Estados para filtros
  const [periodo, setPeriodo] = useState<"mes" | "quadrimestre" | "ano">("ano");
  const [mes, setMes] = useState("07");
  const [ano, setAno] = useState("2025");
  const [todosAnos, setTodosAnos] = useState(false);

  // Se não estiver visível, retorna 404 do Next.js
  if (!isLoadingRacha && (!racha || !racha.financeiroVisivel)) {
    notFound();
  }

  // Função para filtrar por período
  function filtrarPorPeriodo(lancamentos: LancamentoFinanceiro[]) {
    if (todosAnos) return lancamentos;
    if (periodo === "mes")
      return lancamentos.filter((l) => l.data.startsWith(`${ano}-${mes}`));
    if (periodo === "ano")
      return lancamentos.filter((l) => l.data.startsWith(`${ano}`));
    if (periodo === "quadrimestre") {
      const mesNum = Number(mes);
      let de = "01",
        ate = "04";
      if (mesNum <= 4) {
        de = "01";
        ate = "04";
      } else if (mesNum <= 8) {
        de = "05";
        ate = "08";
      } else {
        de = "09";
        ate = "12";
      }
      return lancamentos.filter(
        (l) => l.data >= `${ano}-${de}` && l.data <= `${ano}-${ate}`,
      );
    }
    return lancamentos;
  }

  const lancamentosFiltrados = useMemo(() => {
    return filtrarPorPeriodo(lancamentos);
  }, [lancamentos, periodo, mes, ano, todosAnos]);

  if (isLoadingRacha || isLoadingFinanceiro) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-fundo py-10 pb-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-300">Carregando prestação de contas...</p>
      </div>
    );
  }

  if (isErrorRacha || isErrorFinanceiro) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-fundo py-10 pb-8">
        <h1 className="mb-4 text-2xl font-bold text-red-400">
          Erro ao carregar dados
        </h1>
        <p className="text-red-300">
          Não foi possível carregar a prestação de contas.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Prestação de Contas – {racha?.nome || rachaConfig.nome}</title>
        <meta
          name="description"
          content="Acompanhe o saldo, receitas e despesas do nosso racha com total transparência. Veja como os valores são usados em cada mês e acompanhe a gestão financeira do grupo."
        />
        <meta
          name="keywords"
          content="prestação de contas, futebol 7, racha, receitas, despesas, transparência, atletas"
        />
        <meta
          property="og:title"
          content={`Prestação de Contas – ${racha?.nome || rachaConfig.nome}`}
        />
        <meta
          property="og:description"
          content="Veja a movimentação financeira do racha mês a mês. Transparência para todos os atletas do grupo."
        />
      </Head>
      <main className="w-full pb-10 pt-20">
        <section className="mx-auto max-w-3xl px-4">
          <h1 className="mb-2 break-words text-2xl font-bold text-yellow-500 sm:text-3xl">
            Prestação de Contas
          </h1>
          <p className="mb-4 max-w-xl text-xs text-gray-400 sm:text-sm">
            Aqui você pode acompanhar todas as receitas e despesas do nosso
            racha, de forma transparente.
            <br />
            Nosso objetivo é mostrar a todos os atletas e patrocinadores como
            está o saldo, de onde vem o dinheiro e como ele é utilizado a cada
            mês para o benefício do racha.
            <br />
            Em caso de dúvida, procure a administração.
          </p>

          {resumo && <ResumoFinanceiro resumo={resumo} />}

          {/* Filtros */}
          <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800 p-4">
            <h3 className="mb-3 text-lg font-semibold text-yellow-400">
              Filtros
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm text-gray-300">
                  Período
                </label>
                <select
                  value={periodo}
                  onChange={(e) =>
                    setPeriodo(e.target.value as "mes" | "quadrimestre" | "ano")
                  }
                  className="w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white"
                >
                  <option value="mes">Mês</option>
                  <option value="quadrimestre">Quadrimestre</option>
                  <option value="ano">Ano</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Mês</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white"
                >
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={todosAnos}
                    onChange={(e) => setTodosAnos(e.target.checked)}
                    className="mr-2"
                  />
                  Todos os anos
                </label>
              </div>
            </div>
          </div>

          <TabelaLancamentos lancamentos={lancamentosFiltrados} />
        </section>
      </main>
    </>
  );
}

"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useFinanceiroPublic } from "@/hooks/useFinanceiroPublic";
import { notFound } from "next/navigation";
import ResumoFinanceiro from "@/components/financeiro/ResumoFinanceiro";
import TabelaLancamentos from "@/components/financeiro/TabelaLancamentos";
import type { LancamentoFinanceiro } from "@/components/financeiro/types";
import { rachaConfig } from "@/config/racha.config";

export default function PrestacaoDeContasPage() {
  // Pega rachaId do contexto global (multi-rachas)
  const { rachaId } = useRachaContext();
  const { racha, isLoading: isLoadingRacha, isError: isErrorRacha } = useRachaPublic(rachaId);
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
    if (periodo === "mes") return lancamentos.filter((l) => l.data.startsWith(`${ano}-${mes}`));
    if (periodo === "ano") return lancamentos.filter((l) => l.data.startsWith(`${ano}`));
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
      return lancamentos.filter((l) => l.data >= `${ano}-${de}` && l.data <= `${ano}-${ate}`);
    }
    return lancamentos;
  }

  const lancamentosFiltrados = useMemo(() => {
    return filtrarPorPeriodo(lancamentos);
  }, [lancamentos, periodo, mes, ano, todosAnos]);

  if (isLoadingRacha || isLoadingFinanceiro) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-300">Carregando prestação de contas...</p>
      </div>
    );
  }

  if (isErrorRacha || isErrorFinanceiro) {
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
      <main className="w-full pt-20 pb-10">
        <section className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-2 break-words">
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

          {/* Filtros */}
          <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Filtros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Período</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value as "mes" | "quadrimestre" | "ano")}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="mes">Mês</option>
                  <option value="quadrimestre">Quadrimestre</option>
                  <option value="ano">Ano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Mês</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm"
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
                <label className="block text-sm text-gray-300 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm"
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

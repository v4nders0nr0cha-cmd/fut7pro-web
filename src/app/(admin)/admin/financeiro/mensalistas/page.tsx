"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaInfoCircle, FaPiggyBank, FaUsers } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useJogadores } from "@/hooks/useJogadores";
import { rachaConfig } from "@/config/racha.config";
import TabelaMensalistas, { type MensalistaResumo } from "./components/TabelaMensalistas";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export default function MensalistasFinanceiroPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? rachaConfig.slug;
  const {
    jogadores,
    isLoading,
    isValidating,
    isError,
    error: jogadoresError,
  } = useJogadores(tenantSlug);

  const [valorMensalBase, setValorMensalBase] = useState<number>(80);

  const mensalistas = useMemo(
    () =>
      jogadores
        .filter((jogador) => jogador.isMember)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")),
    [jogadores]
  );

  const carregandoLista = (isLoading || isValidating) && jogadores.length === 0;

  const totalJogadores = jogadores.length;
  const totalMensalistas = mensalistas.length;
  const receitaMensalPrevista = valorMensalBase * totalMensalistas;
  const receitaAnualPrevista = receitaMensalPrevista * 12;

  const handleValorBaseChange = (valor: number) => {
    if (Number.isNaN(valor)) {
      setValorMensalBase(0);
      return;
    }
    setValorMensalBase(Math.max(0, Math.round(valor)));
  };

  // TODO(fut7pro-backend): expor ledger de mensalidades (ultimo pagamento, descontos individuais, dias fixos).
  const mensalistasResumo = useMemo<MensalistaResumo[]>(
    () =>
      mensalistas.map((jogador) => ({
        id: jogador.id,
        nome: jogador.name ?? "Sem nome",
        nickname: jogador.nickname ?? undefined,
        status: jogador.status ?? "Ativo",
        valorPrevisto: valorMensalBase,
        ultimoPagamento: null,
        observacao: null,
      })),
    [mensalistas, valorMensalBase]
  );

  return (
    <>
      <Head>
        <title>Financeiro • Mensalistas | Fut7Pro</title>
        <meta
          name="description"
          content="Projecoes e acompanhamento de mensalistas com base nos dados reais do racha."
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl text-yellow-400 font-bold text-center md:text-left">
            Mensalistas e Caixa Fixo
          </h1>
          <p className="text-sm text-gray-300 max-w-3xl">
            Use esta tela para projetar o caixa recorrente do racha e acompanhar os atletas
            cadastrados como mensalistas. Ajuste o valor-base da mensalidade para estimar a receita
            prevista enquanto conectamos os detalhes de cobranca ao backend.
          </p>
        </header>

        <section className="flex flex-col gap-4 bg-yellow-900/20 border border-yellow-600 rounded-xl p-4 text-sm text-yellow-100">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="mt-1" />
            <div>
              <strong className="block text-yellow-300">Dependencia do backend</strong>
              <p>
                Os dados de ultimo pagamento, descontos individuais e configuracoes por dia ainda
                dependem da API financeira. Assim que o backend expor o ledger de mensalidades,
                substituiremos os placeholders exibidos abaixo.
              </p>
            </div>
          </div>
          {isError && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-lg px-3 py-2">
              {jogadoresError ??
                "Nao foi possivel carregar os jogadores. Tente novamente em instantes."}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-[#1f1f1f] border border-yellow-700/40 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wide">
              <FaUsers />
              Mensalistas ativos
            </div>
            <div className="text-3xl font-bold text-yellow-300">{totalMensalistas}</div>
            <div className="text-xs text-gray-400">
              {totalJogadores} jogadores no total ({totalJogadores - totalMensalistas} diaristas).
            </div>
          </div>
          <div className="bg-[#1f1f1f] border border-green-700/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wide">
              <FaPiggyBank />
              Receita mensal prevista
            </div>
            <div className="text-3xl font-bold text-green-300">
              {currencyFormatter.format(receitaMensalPrevista)}
            </div>
            <div className="text-xs text-gray-400">
              Projecao anual: {currencyFormatter.format(receitaAnualPrevista)}
            </div>
          </div>
          <div className="bg-[#1f1f1f] border border-cyan-700/30 rounded-xl p-4 flex flex-col gap-2">
            <label className="text-sm text-gray-400 uppercase tracking-wide" htmlFor="valor-base">
              Valor-base da mensalidade
            </label>
            <input
              id="valor-base"
              type="number"
              min={0}
              step={10}
              value={valorMensalBase}
              onChange={(event) => handleValorBaseChange(Number(event.target.value))}
              className="bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-lg font-semibold text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <span className="text-xs text-gray-500">
              Ajuste para simular o ticket medio enquanto a cobranca automatizada e configurada.
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-yellow-300">{totalMensalistas}</span> atletas estao
            marcados como mensalistas via painel de jogadores.
          </div>
          <Link
            href="/admin/jogadores/mensalistas"
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg shadow text-sm transition"
          >
            Gerenciar Mensalistas
          </Link>
        </section>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <h2 className="text-xl font-semibold text-gray-100 mb-3">
            Lista de mensalistas (dados consolidados)
          </h2>
          {carregandoLista ? (
            <div className="text-gray-400 text-sm py-6 text-center">Carregando mensalistas...</div>
          ) : (
            <TabelaMensalistas mensalistas={mensalistasResumo} />
          )}
        </section>
      </main>
    </>
  );
}

"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { useAuth } from "@/hooks/useAuth";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import type { LancamentoFinanceiro } from "@/types/financeiro";
import CardResumoFinanceiro from "./components/CardResumoFinanceiro";
import TabelaLancamentos from "./components/TabelaLancamentos";
import ModalLancamento from "./components/ModalLancamento";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type PeriodoFiltro = "mes" | "quadrimestre" | "ano";

function gerarDadosGrafico(lancamentos: LancamentoFinanceiro[]) {
  const ordenados = [...lancamentos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  const pontos: { mes: string; saldo: number }[] = [];
  let saldo = 0;

  ordenados.forEach((lancamento) => {
    const valor = Math.abs(lancamento.valor ?? 0);
    saldo += lancamento.tipo === "entrada" ? valor : -valor;
    const mes = lancamento.data.slice(0, 7);
    const existente = pontos.find((item) => item.mes === mes);
    if (existente) {
      existente.saldo = saldo;
    } else {
      pontos.push({ mes, saldo });
    }
  });

  return pontos;
}

export default function PrestacaoDeContasAdmin() {
  const { rachaId } = useRacha();
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? rachaId ?? "";

  const {
    lancamentos,
    isLoading: isLoadingFinanceiro,
    addLancamento,
    updateLancamento,
  } = useFinanceiro();
  const { racha, mutate: mutateRacha } = useRachaPublic(tenantSlug);

  const [visivel, setVisivel] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<LancamentoFinanceiro | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("ano");
  const [mes, setMes] = useState("07");
  const [ano, setAno] = useState("2025");
  const [todosAnos, setTodosAnos] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (typeof racha?.financeiroVisivel === "boolean") {
      setVisivel(racha.financeiroVisivel);
    }
  }, [racha?.financeiroVisivel]);

  const sortedLancamentos = useMemo(() => {
    return [...lancamentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [lancamentos]);

  const filtrarPorPeriodo = (lista: LancamentoFinanceiro[]) => {
    if (todosAnos) return lista;
    if (periodo === "mes") {
      return lista.filter((l) => l.data.startsWith(`${ano}-${mes}`));
    }
    if (periodo === "ano") {
      return lista.filter((l) => l.data.startsWith(`${ano}`));
    }
    const mesNumero = Number(mes);
    let inicio = "01";
    let fim = "04";
    if (mesNumero >= 5 && mesNumero <= 8) {
      inicio = "05";
      fim = "08";
    } else if (mesNumero >= 9) {
      inicio = "09";
      fim = "12";
    }
    return lista.filter((l) => l.data >= `${ano}-${inicio}` && l.data <= `${ano}-${fim}`);
  };

  const lancamentosFiltrados = useMemo(
    () => filtrarPorPeriodo(sortedLancamentos),
    [sortedLancamentos, periodo, mes, ano, todosAnos]
  );

  const dadosGrafico = useMemo(
    () => gerarDadosGrafico(lancamentosFiltrados),
    [lancamentosFiltrados]
  );

  const limit = 6;
  const exibir = showAll ? lancamentosFiltrados : lancamentosFiltrados.slice(0, limit);

  async function handleToggle(valor: boolean) {
    if (!tenantSlug) return;

    setSavingVisibility(true);
    try {
      const response = await fetch(`/api/admin/rachas/${tenantSlug}?slug=${tenantSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financeiroVisivel: valor }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar visibilidade");
      }

      setVisivel(valor);
      mutateRacha?.();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Erro ao atualizar visibilidade:", error);
      }
      setVisivel((prev) => prev);
    } finally {
      setSavingVisibility(false);
    }
  }

  function handleNovo() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(item: LancamentoFinanceiro) {
    setEditData(item);
    setModalOpen(true);
  }

  async function handleSaveLancamento(data: Omit<LancamentoFinanceiro, "id"> & { id?: string }) {
    if (data.id) {
      await updateLancamento(data.id, data);
    } else {
      await addLancamento(data);
    }
  }

  const carregando = isLoadingFinanceiro;

  return (
    <>
      <Head>
        <title>Admin | Prestação de Contas</title>
        <meta
          name="description"
          content="Gerencie as receitas e despesas do seu racha de forma profissional e transparente."
        />
      </Head>
      <section className="w-full py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Prestação de Contas</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Gestão total das receitas e despesas do racha. Cadastre, filtre e acompanhe tudo em um
              só lugar.
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded transition disabled:opacity-60"
            onClick={handleNovo}
            disabled={carregando}
          >
            + Novo Lançamento
          </button>
        </div>

        <ToggleVisibilidadePublica visivel={visivel} onToggle={handleToggle} />
        {savingVisibility && (
          <div className="mb-2 text-xs text-yellow-400 animate-pulse">Salvando alteração...</div>
        )}
        {!visivel && (
          <div className="mb-4 bg-yellow-900/70 border border-yellow-700 rounded p-3 text-yellow-200 text-xs">
            Esta página está <b>oculta</b> no site público. Ative a transparência financeira para
            que atletas e visitantes acompanhem a prestação de contas.
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2 items-end">
          <label className="text-xs text-gray-300 font-bold">Período:</label>
          <select
            value={periodo}
            onChange={(event) => {
              setPeriodo(event.target.value as PeriodoFiltro);
              setShowAll(false);
            }}
            className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
            disabled={todosAnos}
          >
            <option value="mes">Mês</option>
            <option value="quadrimestre">Quadrimestre</option>
            <option value="ano">Ano</option>
          </select>
          {(periodo === "mes" || periodo === "quadrimestre") && (
            <select
              value={mes}
              onChange={(event) => setMes(event.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
              disabled={todosAnos}
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <option key={index} value={String(index + 1).padStart(2, "0")}>
                  {String(index + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          )}
          <select
            value={ano}
            onChange={(event) => setAno(event.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
            disabled={todosAnos}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button
            type="button"
            className={`ml-2 px-3 py-1 rounded text-xs font-bold border transition ${
              todosAnos
                ? "bg-yellow-500 text-black border-yellow-600"
                : "bg-neutral-700 text-white border-neutral-700 hover:bg-yellow-600 hover:text-black"
            }`}
            onClick={() => setTodosAnos((prev) => !prev)}
          >
            {todosAnos ? "Todos os Anos: Ativo" : "Todos os Anos"}
          </button>
        </div>

        {carregando ? (
          <div className="py-8 text-center text-gray-400 text-sm">Carregando lançamentos...</div>
        ) : (
          <>
            <CardResumoFinanceiro lancamentos={lancamentosFiltrados} />

            <div className="overflow-x-auto">
              <TabelaLancamentos lancamentos={exibir} onEdit={handleEdit} />
              {lancamentosFiltrados.length > limit && (
                <div className="w-full flex justify-center mt-2">
                  <button
                    className="text-sm px-4 py-1 rounded bg-neutral-700 hover:bg-yellow-500 hover:text-black font-bold transition"
                    onClick={() => setShowAll((prev) => !prev)}
                    type="button"
                  >
                    {showAll ? "Ver menos" : `Ver mais (${lancamentosFiltrados.length - limit})`}
                  </button>
                </div>
              )}
            </div>

            <div className="w-full mt-8 mb-4 bg-neutral-900 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-bold text-yellow-500 mb-2">Evolução Financeira</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="mes" stroke="#bbb" />
                  <YAxis stroke="#bbb" />
                  <Tooltip />
                  <Line type="monotone" dataKey="saldo" stroke="#FFD600" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <ModalLancamento
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveLancamento}
          initialData={editData ?? undefined}
          submitting={isLoadingFinanceiro}
        />
      </section>
    </>
  );
}

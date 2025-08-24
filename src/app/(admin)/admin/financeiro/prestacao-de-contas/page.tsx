"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRacha } from "@/context/RachaContext";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import {
  mockLancamentosFinanceiro,
  type Lancamento,
} from "./mocks/mockLancamentosFinanceiro";
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

// Utilitário para novo ID mock
function novoId() {
  return Math.random().toString(36).substring(2, 9) + Date.now();
}

// Gera dados para gráfico (saldo acumulado mês a mês)
function dadosGrafico(lancamentos: Lancamento[]) {
  const porMes: { mes: string; saldo: number }[] = [];
  let saldo = 0;
  lancamentos
    .sort((a, b) => a.data.localeCompare(b.data))
    .forEach((l) => {
      saldo += l.valor;
      const mes = l.data.slice(0, 7);
      const existente = porMes.find((m) => m.mes === mes);
      if (existente) {
        existente.saldo = saldo;
      } else {
        porMes.push({ mes, saldo });
      }
    });
  return porMes;
}

export default function PrestacaoDeContasAdmin() {
  const { rachaId } = useRacha();
  const [visivel, setVisivel] = useState(true);
  const [saving, setSaving] = useState(false);

  // Buscar dados do racha para obter financeiroVisivel atual
  const { racha, mutate: mutateRacha } = useRachaPublic(rachaId);

  // Atualizar visibilidade quando racha carregar
  useEffect(() => {
    if (racha?.financeiroVisivel !== undefined) {
      setVisivel(racha.financeiroVisivel);
    }
  }, [racha?.financeiroVisivel]);

  async function handleToggle(valor: boolean) {
    if (!rachaId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/rachas/${rachaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          financeiroVisivel: valor,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar visibilidade");
      }

      setVisivel(valor);
      // Atualizar cache do racha
      if (mutateRacha) {
        mutateRacha();
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao atualizar visibilidade:", error);
      }
      // Reverter estado em caso de erro
      setVisivel(!valor);
    } finally {
      setSaving(false);
    }
  }

  // CRUD mock
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(
    mockLancamentosFinanceiro,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Lancamento | null>(null);

  function handleNovo() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(item: Lancamento) {
    setEditData(item);
    setModalOpen(true);
  }

  function handleSaveLancamento(data: Lancamento) {
    setLancamentos((prev) => {
      if (prev.some((l) => l.id === data.id)) {
        return prev.map((l) => (l.id === data.id ? { ...data } : l));
      }
      return [{ ...data, id: novoId() }, ...prev];
    });
  }

  // Filtro de período (mês/quadrimestre/ano/todos)
  const [periodo, setPeriodo] = useState<"mes" | "quadrimestre" | "ano">("ano");
  const [mes, setMes] = useState("07");
  const [ano, setAno] = useState("2025");
  const [todosAnos, setTodosAnos] = useState(false);

  function filtrarPorPeriodo(lancamentos: Lancamento[]) {
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

  // Tabela: limita a 6 lançamentos e controla "ver mais"
  const [showAll, setShowAll] = useState(false);
  const limit = 6;
  const lancamentosFiltrados = filtrarPorPeriodo(lancamentos);
  const exibir = showAll
    ? lancamentosFiltrados
    : lancamentosFiltrados.slice(0, limit);

  return (
    <>
      <Head>
        <title>Prestação de Contas | Admin – Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie todas as receitas e despesas do racha, cadastre novos lançamentos e exporte relatórios financeiros."
        />
        <meta
          name="keywords"
          content="prestação de contas, financeiro, admin, racha, fut7pro, SaaS, receitas, despesas"
        />
      </Head>
      <section>
        <ToggleVisibilidadePublica visivel={visivel} onToggle={handleToggle} />
        {saving && (
          <div className="mb-4">
            <span className="animate-pulse text-xs text-yellow-400">
              Salvando alteração...
            </span>
          </div>
        )}
        {!visivel && (
          <div className="mb-4 rounded border border-yellow-700 bg-yellow-900/70 p-3 text-xs text-yellow-300">
            Esta página está <b>oculta no site público</b>.<br />
            Ative a transparência financeira para liberar o acesso aos atletas e
            visitantes.
            <br />
            Quando ativado, qualquer pessoa poderá visualizar a prestação de
            contas deste racha.
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-500 sm:text-3xl">
              Prestação de Contas
            </h1>
            <p className="text-xs text-gray-400 sm:text-sm">
              Gestão total das receitas e despesas do racha.
              <br />
              Cadastre, filtre, exporte e mantenha o controle financeiro 100%
              transparente.
            </p>
          </div>
          <button
            className="rounded bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700"
            onClick={handleNovo}
          >
            + Novo Lançamento
          </button>
        </div>

        {/* Filtro de período */}
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-gray-300">Período:</label>
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value as any);
              setShowAll(false);
            }}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white"
            disabled={todosAnos}
          >
            <option value="mes">Mês</option>
            <option value="quadrimestre">Quadrimestre</option>
            <option value="ano">Ano</option>
          </select>
          {(periodo === "mes" || periodo === "quadrimestre") && (
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white"
              disabled={todosAnos}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          )}
          <select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white"
            disabled={todosAnos}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button
            type="button"
            className={`ml-2 rounded border px-3 py-1 text-xs font-bold transition ${
              todosAnos
                ? "border-yellow-600 bg-yellow-500 text-black"
                : "border-neutral-700 bg-neutral-700 text-white hover:bg-yellow-600 hover:text-black"
            } `}
            onClick={() => setTodosAnos(!todosAnos)}
          >
            {todosAnos ? "Todos os Anos: Ativo" : "Todos os Anos"}
          </button>
        </div>

        <CardResumoFinanceiro lancamentos={lancamentosFiltrados} />

        {/* Tabela limitada + botão ver mais */}
        <div className="overflow-x-auto">
          <TabelaLancamentos lancamentos={exibir} onEdit={handleEdit} />
          {lancamentosFiltrados.length > limit && (
            <div className="mt-2 flex w-full justify-center">
              <button
                className="rounded bg-neutral-700 px-4 py-1 text-sm font-bold transition hover:bg-yellow-500 hover:text-black"
                onClick={() => setShowAll(!showAll)}
                type="button"
              >
                {showAll
                  ? "Ver menos"
                  : `Ver mais (${lancamentosFiltrados.length - limit})`}
              </button>
            </div>
          )}
        </div>

        {/* Gráfico evolução financeira */}
        <div className="mb-4 mt-8 w-full rounded-lg bg-neutral-900 p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-yellow-500">
            Evolução Financeira
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosGrafico(lancamentosFiltrados)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#FFD600"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Modal de lançamento */}
        <ModalLancamento
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveLancamento}
          initialData={editData}
        />
      </section>
    </>
  );
}

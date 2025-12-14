"use client";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
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

// Gera dados para grafico (saldo acumulado mes a mes) usando lancamentos reais
function dadosGrafico(lancamentos: LancamentoFinanceiro[]) {
  const porMes: { mes: string; saldo: number }[] = [];
  let saldo = 0;

  [...lancamentos]
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    .forEach((l) => {
      saldo += l.valor ?? 0;
      const mes = (l.data || "").slice(0, 7);
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
  const { racha, mutate: mutateRacha } = useRachaPublic(rachaId);
  const {
    lancamentos,
    isLoading: carregandoLancamentos,
    isError,
    addLancamento,
    updateLancamento,
  } = useFinanceiro();

  const [visivel, setVisivel] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<LancamentoFinanceiro | null>(null);
  const [erroLancamento, setErroLancamento] = useState<string | null>(null);
  const [salvandoLancamento, setSalvandoLancamento] = useState(false);

  const hoje = useMemo(() => new Date(), []);
  const [periodo, setPeriodo] = useState<"mes" | "quadrimestre" | "ano">("ano");
  const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, "0"));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [todosAnos, setTodosAnos] = useState(false);

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
      if (mutateRacha) {
        mutateRacha();
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao atualizar visibilidade:", error);
      }
      setVisivel(!valor);
    } finally {
      setSaving(false);
    }
  }

  function handleNovo() {
    setErroLancamento(null);
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(item: LancamentoFinanceiro) {
    const tipoNormalizado =
      item.tipo?.toLowerCase().includes("desp") || (item.valor ?? 0) < 0 ? "saida" : "entrada";
    setErroLancamento(null);
    setEditData({
      ...item,
      tipo: tipoNormalizado,
    });
    setModalOpen(true);
  }

  async function handleSaveLancamento(data: LancamentoFinanceiro) {
    setErroLancamento(null);
    setSalvandoLancamento(true);

    const payload: Partial<LancamentoFinanceiro> = {
      data: data.data,
      categoria: data.categoria,
      descricao: data.descricao,
      valor: data.valor,
      responsavel: data.responsavel || "Admin",
      tipo: (data.valor ?? 0) < 0 ? "saida" : "entrada",
      comprovanteUrl: data.comprovanteUrl,
    };

    try {
      const existe = data.id && lancamentos?.some((l) => l.id === data.id);
      if (existe && data.id) {
        await updateLancamento(data.id, payload);
      } else {
        await addLancamento(payload);
      }
      setEditData(null);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao salvar lancamento:", error);
      }
      setErroLancamento("Nao foi possivel salvar o lancamento. Tente novamente.");
      throw error;
    } finally {
      setSalvandoLancamento(false);
    }
  }

  const lancamentosFiltrados = useMemo(() => {
    const origem = lancamentos || [];
    if (todosAnos) return origem;
    if (periodo === "mes") return origem.filter((l) => l.data?.startsWith(`${ano}-${mes}`));
    if (periodo === "ano") return origem.filter((l) => l.data?.startsWith(`${ano}`));
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
      return origem.filter((l) => l.data && l.data >= `${ano}-${de}` && l.data <= `${ano}-${ate}`);
    }
    return origem;
  }, [ano, lancamentos, mes, periodo, todosAnos]);

  const dadosGraficoFiltrados = useMemo(
    () => dadosGrafico(lancamentosFiltrados || []),
    [lancamentosFiltrados]
  );

  const fecharModal = () => {
    setModalOpen(false);
    setEditData(null);
    setErroLancamento(null);
  };

  return (
    <>
      <Head>
        <title>Prestacao de Contas | Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie todas as receitas e despesas do racha, cadastre novos lancamentos e exporte relatorios financeiros."
        />
        <meta
          name="keywords"
          content="prestacao de contas, financeiro, admin, racha, fut7pro, SaaS, receitas, despesas"
        />
      </Head>
      <section>
        <ToggleVisibilidadePublica visivel={visivel} onToggle={handleToggle} />
        {saving && (
          <div className="mb-4">
            <span className="text-xs text-yellow-400 animate-pulse">Salvando alteracao...</span>
          </div>
        )}
        {!visivel && (
          <div className="mb-4 bg-yellow-900/70 border border-yellow-700 rounded p-3 text-yellow-300 text-xs">
            Esta pagina esta <b>oculta no site publico</b>.<br />
            Ative a transparencia financeira para liberar o acesso aos atletas e visitantes.
            <br />
            Quando ativado, qualquer pessoa podera visualizar a prestacao de contas deste racha.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Prestacao de Contas</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Gestao total das receitas e despesas do racha.
              <br />
              Cadastre, filtre, exporte e mantenha o controle financeiro 100% transparente.
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded transition disabled:opacity-60"
            onClick={handleNovo}
            disabled={salvandoLancamento}
          >
            + Novo Lancamento
          </button>
        </div>

        {/* Filtro de periodo */}
        <div className="mb-4 flex flex-wrap gap-2 items-end">
          <label className="text-xs text-gray-300 font-bold">Periodo:</label>
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value as "mes" | "quadrimestre" | "ano");
            }}
            className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
            disabled={todosAnos}
          >
            <option value="mes">Mes</option>
            <option value="quadrimestre">Quadrimestre</option>
            <option value="ano">Ano</option>
          </select>
          {(periodo === "mes" || periodo === "quadrimestre") && (
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
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
            className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
            disabled={todosAnos}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button
            type="button"
            className={`ml-2 px-3 py-1 rounded text-xs font-bold border transition
              ${
                todosAnos
                  ? "bg-yellow-500 text-black border-yellow-600"
                  : "bg-neutral-700 text-white border-neutral-700 hover:bg-yellow-600 hover:text-black"
              }
            `}
            onClick={() => setTodosAnos(!todosAnos)}
          >
            {todosAnos ? "Todos os Anos: Ativo" : "Todos os Anos"}
          </button>
        </div>

        {carregandoLancamentos && (
          <div className="text-xs text-gray-400 mb-2">Carregando lancamentos reais...</div>
        )}
        {isError && (
          <div className="text-xs text-red-400 mb-2">
            Nao foi possivel carregar os lancamentos do backend agora. Tente novamente em instantes.
          </div>
        )}

        <CardResumoFinanceiro lancamentos={lancamentosFiltrados} />

        {/* Tabela */}
        <div className="overflow-x-auto">
          <TabelaLancamentos lancamentos={lancamentosFiltrados} onEdit={handleEdit} />
        </div>

        {/* Grafico evolucao financeira */}
        <div className="w-full mt-8 mb-4 bg-neutral-900 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-bold text-yellow-500 mb-2">Evolucao Financeira</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosGraficoFiltrados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip />
              <Line type="monotone" dataKey="saldo" stroke="#FFD600" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Modal de lancamento */}
        <ModalLancamento
          open={modalOpen}
          onClose={fecharModal}
          onSave={handleSaveLancamento}
          initialData={editData}
          serverError={erroLancamento}
          isSaving={salvandoLancamento}
        />
        {erroLancamento && <div className="mt-2 text-xs text-red-400">{erroLancamento}</div>}
        {salvandoLancamento && (
          <div className="mt-1 text-xs text-yellow-400">
            Sincronizando lancamento com o backend...
          </div>
        )}
      </section>
    </>
  );
}

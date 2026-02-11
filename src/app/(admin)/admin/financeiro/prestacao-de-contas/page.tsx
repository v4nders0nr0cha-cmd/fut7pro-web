"use client";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useMe } from "@/hooks/useMe";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type TenantPayload = {
  id?: string;
  slug?: string;
  name?: string;
  financeiroVisivel?: boolean;
};

type Ordenacao =
  | "data-desc"
  | "data-asc"
  | "valor-desc"
  | "valor-asc"
  | "categoria-asc"
  | "categoria-desc";

const CHART_COLORS = [
  "#FACC15",
  "#22C55E",
  "#F97316",
  "#38BDF8",
  "#F472B6",
  "#10B981",
  "#EAB308",
  "#FB7185",
];

const tenantFetcher = async (url: string): Promise<TenantPayload> => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao carregar dados do racha");
  }
  return res.json();
};

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const resolveTipoLancamento = (lancamento: LancamentoFinanceiro) => {
  const rawTipo = (lancamento.tipo || "").toLowerCase();
  if (rawTipo.includes("saida") || rawTipo.includes("desp")) return "saida";
  if ((lancamento.valor ?? 0) < 0) return "saida";
  return "entrada";
};

const buildCategoriaSeries = (lancamentos: LancamentoFinanceiro[], tipo: "entrada" | "saida") => {
  const map = new Map<string, number>();
  lancamentos.forEach((item) => {
    const resolved = resolveTipoLancamento(item);
    if (resolved !== tipo) return;
    const categoria = (item.categoria || "Sem categoria").trim() || "Sem categoria";
    const valor = Math.abs(item.valor ?? 0);
    if (!valor) return;
    map.set(categoria, (map.get(categoria) ?? 0) + valor);
  });

  const entries = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (entries.length <= 6) return entries;
  const principais = entries.slice(0, 6);
  const restantes = entries.slice(6).reduce((acc, item) => acc + item.value, 0);
  if (restantes > 0) {
    principais.push({ name: "Outros", value: restantes });
  }
  return principais;
};

export default function PrestacaoDeContasAdmin() {
  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId ?? "";
  const { data: tenantData, mutate: mutateTenant } = useSWR<TenantPayload>(
    tenantId ? `/api/admin/rachas/${tenantId}` : null,
    tenantFetcher
  );
  const {
    lancamentos,
    isLoading: carregandoLancamentos,
    isError,
    addLancamento,
    updateLancamento,
    deleteLancamento,
  } = useFinanceiro();

  const [visivel, setVisivel] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<LancamentoFinanceiro | null>(null);
  const [erroLancamento, setErroLancamento] = useState<string | null>(null);
  const [salvandoLancamento, setSalvandoLancamento] = useState(false);
  const [deletandoLancamento, setDeletandoLancamento] = useState(false);

  const hoje = useMemo(() => new Date(), []);
  const [periodo, setPeriodo] = useState<"mes" | "quadrimestre" | "ano">("ano");
  const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, "0"));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [todosAnos, setTodosAnos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "entrada" | "saida">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("data-desc");

  const categoriasDisponiveis = useMemo(() => {
    const valores = new Set<string>();
    (lancamentos || []).forEach((l) => {
      const categoria = (l.categoria || "").trim();
      if (categoria) valores.add(categoria);
    });
    return Array.from(valores).sort((a, b) => a.localeCompare(b));
  }, [lancamentos]);

  const anosDisponiveis = useMemo(() => {
    const valores = new Set<number>();
    (lancamentos || []).forEach((l) => {
      const anoLancamento = Number(l.data?.slice(0, 4));
      if (!Number.isNaN(anoLancamento)) valores.add(anoLancamento);
    });
    valores.add(hoje.getFullYear());
    return Array.from(valores)
      .sort((a, b) => b - a)
      .map(String);
  }, [hoje, lancamentos]);

  useEffect(() => {
    if (tenantData?.financeiroVisivel !== undefined) {
      setVisivel(tenantData.financeiroVisivel);
    }
  }, [tenantData?.financeiroVisivel]);

  useEffect(() => {
    if (filtroCategoria && !categoriasDisponiveis.includes(filtroCategoria)) {
      setFiltroCategoria("");
    }
  }, [categoriasDisponiveis, filtroCategoria]);

  async function handleToggle(valor: boolean) {
    if (!tenantId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/rachas/${tenantId}`, {
        method: "PUT",
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
      if (mutateTenant) {
        mutateTenant();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar visibilidade financeira.";
      toast.error(message);
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
      categoria: data.categoria?.trim() || "",
      descricao: data.descricao?.trim() || "",
      valor: data.valor,
      responsavel: data.responsavel || "Admin",
      tipo: (data.valor ?? 0) < 0 ? "saida" : "entrada",
      comprovanteUrl: data.comprovanteUrl,
      observacoes: data.observacoes?.trim() || "",
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
      setErroLancamento("Não foi possível salvar o lançamento. Tente novamente.");
      throw error;
    } finally {
      setSalvandoLancamento(false);
    }
  }

  async function handleDeleteLancamento(id: string) {
    if (!id) return;
    setErroLancamento(null);
    setDeletandoLancamento(true);
    try {
      await deleteLancamento(id);
      toast.success("Lançamento excluído.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Não foi possível excluir o lançamento.";
      setErroLancamento(message);
      toast.error(message);
      throw error;
    } finally {
      setDeletandoLancamento(false);
    }
  }

  const lancamentosFiltrados = useMemo(() => {
    const origem = lancamentos || [];
    let filtrados = origem;

    if (!todosAnos) {
      if (periodo === "mes") {
        filtrados = filtrados.filter((l) => l.data?.startsWith(`${ano}-${mes}`));
      } else if (periodo === "ano") {
        filtrados = filtrados.filter((l) => l.data?.startsWith(`${ano}`));
      } else if (periodo === "quadrimestre") {
        const mesNum = Number(mes);
        let de = "01";
        let ate = "04";
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
        filtrados = filtrados.filter(
          (l) => l.data && l.data >= `${ano}-${de}` && l.data <= `${ano}-${ate}`
        );
      }
    }

    const termo = busca.trim().toLowerCase();
    if (termo) {
      filtrados = filtrados.filter((l) => {
        const descricao = (l.descricao || "").toLowerCase();
        const categoria = (l.categoria || "").toLowerCase();
        const observacoes = (l.observacoes || "").toLowerCase();
        return (
          descricao.includes(termo) || categoria.includes(termo) || observacoes.includes(termo)
        );
      });
    }

    if (filtroTipo !== "todos") {
      filtrados = filtrados.filter((l) => resolveTipoLancamento(l) === filtroTipo);
    }

    if (filtroCategoria) {
      filtrados = filtrados.filter((l) => (l.categoria || "").trim() === filtroCategoria);
    }

    const ordenados = [...filtrados].sort((a, b) => {
      switch (ordenacao) {
        case "data-asc":
          return (a.data || "").localeCompare(b.data || "");
        case "data-desc":
          return (b.data || "").localeCompare(a.data || "");
        case "valor-asc":
          return Math.abs(a.valor ?? 0) - Math.abs(b.valor ?? 0);
        case "valor-desc":
          return Math.abs(b.valor ?? 0) - Math.abs(a.valor ?? 0);
        case "categoria-asc":
          return (a.categoria || "").localeCompare(b.categoria || "", "pt-BR");
        case "categoria-desc":
          return (b.categoria || "").localeCompare(a.categoria || "", "pt-BR");
        default:
          return 0;
      }
    });

    return ordenados;
  }, [ano, lancamentos, mes, periodo, todosAnos, busca, filtroTipo, filtroCategoria, ordenacao]);

  const dadosGraficoFiltrados = useMemo(
    () => dadosGrafico(lancamentosFiltrados || []),
    [lancamentosFiltrados]
  );
  const receitasPorCategoria = useMemo(
    () => buildCategoriaSeries(lancamentosFiltrados || [], "entrada"),
    [lancamentosFiltrados]
  );
  const despesasPorCategoria = useMemo(
    () => buildCategoriaSeries(lancamentosFiltrados || [], "saida"),
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
        <title>Prestação de Contas | Admin - Fut7Pro</title>
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
            <span className="text-xs text-yellow-400 animate-pulse">Salvando alteração...</span>
          </div>
        )}
        {!visivel && (
          <div className="mb-4 bg-yellow-900/70 border border-yellow-700 rounded p-3 text-yellow-300 text-xs">
            Esta página está <b>oculta no site público</b>.<br />
            Ative a transparência financeira para liberar o acesso aos atletas e visitantes.
            <br />
            Quando ativado, qualquer pessoa poderá visualizar a prestação de contas deste racha.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Prestação de Contas</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Gestão total das receitas e despesas do racha.
              <br />
              Cadastre, filtre, exporte e mantenha o controle financeiro 100% transparente.
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded transition disabled:opacity-60"
            onClick={handleNovo}
            disabled={salvandoLancamento}
          >
            + Novo Lançamento
          </button>
        </div>

        {/* Filtro de periodo */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 font-bold mb-1">Período</label>
            <select
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value as "mes" | "quadrimestre" | "ano");
              }}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
              disabled={todosAnos}
            >
              <option value="mes">Mês</option>
              <option value="quadrimestre">Quadrimestre</option>
              <option value="ano">Ano</option>
            </select>
          </div>
          {(periodo === "mes" || periodo === "quadrimestre") && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-300 font-bold mb-1">Mês</label>
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
            </div>
          )}
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 font-bold mb-1">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
              disabled={todosAnos}
            >
              {anosDisponiveis.map((anoDisponivel) => (
                <option key={anoDisponivel} value={anoDisponivel}>
                  {anoDisponivel}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-300 font-bold mb-1">Todos os anos</span>
            <button
              type="button"
              className={`px-3 py-1 rounded text-xs font-bold border transition
                ${
                  todosAnos
                    ? "bg-yellow-500 text-black border-yellow-600"
                    : "bg-neutral-700 text-white border-neutral-700 hover:bg-yellow-600 hover:text-black"
                }
              `}
              onClick={() => setTodosAnos(!todosAnos)}
            >
              {todosAnos ? "Ativo" : "Ativar"}
            </button>
          </div>
        </div>

        {/* Busca e filtros */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="text-xs text-gray-300 font-bold mb-1 block">Buscar</label>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição ou observação"
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as "todos" | "entrada" | "saida")}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Receitas</option>
              <option value="saida">Despesas</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-2 text-sm"
            >
              <option value="">Todas</option>
              {categoriasDisponiveis.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Ordenar</label>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-2 text-sm"
            >
              <option value="data-desc">Data (mais recente)</option>
              <option value="data-asc">Data (mais antiga)</option>
              <option value="valor-desc">Valor (maior)</option>
              <option value="valor-asc">Valor (menor)</option>
              <option value="categoria-asc">Categoria (A-Z)</option>
              <option value="categoria-desc">Categoria (Z-A)</option>
            </select>
          </div>
        </div>

        {carregandoLancamentos && (
          <div className="text-xs text-gray-400 mb-2">Carregando lançamentos reais...</div>
        )}
        {isError && (
          <div className="text-xs text-red-400 mb-2">
            Não foi possível carregar os lançamentos do backend agora. Tente novamente em instantes.
          </div>
        )}

        <CardResumoFinanceiro lancamentos={lancamentosFiltrados} />

        {/* Tabela */}
        <div className="overflow-x-auto">
          <TabelaLancamentos lancamentos={lancamentosFiltrados} onEdit={handleEdit} />
        </div>

        {/* Grafico evolucao financeira */}
        <div className="w-full mt-8 mb-4 bg-neutral-900 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-bold text-yellow-500 mb-2">Evolução Financeira</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosGraficoFiltrados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="saldo" stroke="#FFD600" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-900 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">Receitas por categoria</h3>
            {receitasPorCategoria.length === 0 ? (
              <p className="text-xs text-gray-400">Sem receitas no período selecionado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={receitasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {receitasPorCategoria.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-neutral-900 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">Despesas por categoria</h3>
            {despesasPorCategoria.length === 0 ? (
              <p className="text-xs text-gray-400">Sem despesas no período selecionado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Modal de lancamento */}
        <ModalLancamento
          open={modalOpen}
          onClose={fecharModal}
          onSave={handleSaveLancamento}
          onDelete={handleDeleteLancamento}
          initialData={editData}
          serverError={erroLancamento}
          isSaving={salvandoLancamento}
          isDeleting={deletandoLancamento}
          categorias={categoriasDisponiveis}
        />
        {erroLancamento && <div className="mt-2 text-xs text-red-400">{erroLancamento}</div>}
        {salvandoLancamento && (
          <div className="mt-1 text-xs text-yellow-400">
            Sincronizando lançamento com o backend...
          </div>
        )}
      </section>
    </>
  );
}

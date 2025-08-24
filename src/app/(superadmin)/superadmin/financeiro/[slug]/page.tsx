"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  PagamentoFinanceiro,
  StatusPagamento,
  MetodoPagamento,
} from "@/components/financeiro/types";
import CardResumo from "@/components/financeiro/CardResumo";

// Cores para status e gráfico
const STATUS_COLORS: Record<StatusPagamento, string> = {
  Pago: "text-green-400",
  "Em aberto": "text-red-400",
  Trial: "text-yellow-400",
  Cancelado: "text-zinc-500",
};
const GRAFICO_COLORS = ["#32d657", "#ffbe30", "#ff7043", "#4c6fff"];

// Interface de detalhe do racha
interface RachaDetalhe {
  id: string;
  nome: string;
  presidente: string;
  plano: string;
  status: StatusPagamento;
  criadoEm: string;
  totalPago: number;
  inadimplente: boolean;
  pagamentos: PagamentoFinanceiro[];
  proximoVencimento?: string;
  valorProximo?: number;
  recorrencia?: string;
}

// Mock para demonstração (troque por fetch real!)
const MOCK_DETALHE: RachaDetalhe = {
  id: "1",
  nome: "Real Matismo",
  presidente: "Paulo Lima",
  plano: "Anual Essencial",
  status: "Pago",
  criadoEm: "2024-01-10",
  totalPago: 4500,
  inadimplente: false,
  pagamentos: [
    {
      data: "2024-01-12",
      valor: 1500,
      status: "Pago",
      referencia: "ANU-2024-001",
      metodo: "pix",
      descricao: "Renovação anual do sistema",
    },
    {
      data: "2023-01-12",
      valor: 1500,
      status: "Pago",
      referencia: "ANU-2023-001",
      metodo: "cartao",
      descricao: "Renovação anual",
    },
    {
      data: "2022-01-12",
      valor: 1500,
      status: "Em aberto",
      referencia: "ANU-2022-001",
      metodo: "boleto",
      descricao: "Fatura anual não paga",
    },
  ],
  proximoVencimento: "2025-01-12",
  valorProximo: 1500,
  recorrencia: "Anual",
};

export default function FinanceiroRachaDetalhePage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params?.slug[0]
        : "";

  const [detalhe, setDetalhe] = useState<RachaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  const [statusPagamento, setStatusPagamento] = useState<
    StatusPagamento | "all"
  >("all");
  const [metodoPagamento, setMetodoPagamento] = useState<
    MetodoPagamento | "all"
  >("all");

  const [modalPagamento, setModalPagamento] =
    useState<PagamentoFinanceiro | null>(null);
  const [modalNovo, setModalNovo] = useState(false);

  // Funções de ação dos botões (mock)
  function handleExportPDF() {
    alert("Exportação PDF mockada! (implemente integração backend)");
  }
  function handleBaixarFatura() {
    alert("Download da fatura mockado! (implemente integração backend)");
  }
  function handleMarcarInadimplente() {
    if (
      window.confirm(
        "Deseja realmente marcar como inadimplente? (ação mockada)",
      )
    ) {
      alert("Racha marcado como inadimplente! (mock)");
      // Aqui você faria update no backend depois
    }
  }

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDetalhe(MOCK_DETALHE);
      setLoading(false);
    }, 600);
    // Para integrar: fetch(`/api/financeiro/racha/${slug}`) ...
  }, [slug]);

  const pagamentosFiltrados = Array.isArray(detalhe?.pagamentos)
    ? detalhe.pagamentos.filter(
        (p) =>
          (statusPagamento === "all" || p.status === statusPagamento) &&
          (metodoPagamento === "all" || p.metodo === metodoPagamento),
      )
    : [];

  const graficoStatus = (() => {
    if (!detalhe?.pagamentos) return [];
    const count: Record<StatusPagamento, number> = {
      Pago: 0,
      "Em aberto": 0,
      Trial: 0,
      Cancelado: 0,
    };
    detalhe.pagamentos.forEach(
      (p) => (count[p.status] = (count[p.status] ?? 0) + 1),
    );
    return (Object.keys(count) as StatusPagamento[])
      .map((k, i) => ({
        name: k,
        value: count[k],
        color: GRAFICO_COLORS[i],
      }))
      .filter((item) => item.value > 0);
  })();

  function adicionarPagamentoMock(pag: PagamentoFinanceiro) {
    if (!detalhe) return;
    setDetalhe({
      ...detalhe,
      pagamentos: [pag, ...detalhe.pagamentos],
      totalPago:
        (detalhe.totalPago ?? 0) + (pag.status === "Pago" ? pag.valor : 0),
    });
    setModalNovo(false);
  }

  if (loading)
    return <div className="p-8 text-white">Carregando detalhes...</div>;
  if (!detalhe)
    return (
      <div className="p-8 text-red-400">Erro ao carregar dados do racha.</div>
    );

  return (
    <>
      <Head>
        <title>{detalhe.nome} - Detalhes Financeiros | Fut7Pro</title>
        <meta
          name="description"
          content={`Detalhes financeiros e histórico de pagamentos do racha ${detalhe.nome} na plataforma Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`racha, financeiro, detalhe, pagamentos, fut7pro, ${detalhe.nome}`}
        />
      </Head>
      <main className="min-h-screen bg-zinc-900 px-2 pb-12 pt-6 sm:px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-4">
            <Link
              href="/superadmin/financeiro"
              className="text-blue-400 hover:underline"
            >
              ← Voltar ao Financeiro
            </Link>
          </nav>

          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            {detalhe.nome ?? "--"}
          </h1>
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="rounded bg-zinc-800 px-3 py-1 text-white">
              {detalhe.plano ?? "--"}
            </span>
            <span
              className={`rounded px-3 py-1 font-bold ${STATUS_COLORS[detalhe.status] ?? "text-white"} bg-zinc-800`}
            >
              {detalhe.status}
            </span>
            <span className="rounded bg-zinc-800 px-3 py-1 text-white">
              Presidente: <b>{detalhe.presidente ?? "--"}</b>
            </span>
            <span className="rounded bg-zinc-800 px-3 py-1 text-white">
              Criado em:{" "}
              {typeof detalhe.criadoEm === "string" ? detalhe.criadoEm : "--"}
            </span>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <CardResumo
              titulo="Total Pago"
              valor={`R$ ${(detalhe.totalPago ?? 0).toLocaleString("pt-BR")}`}
              corTexto="text-green-400"
            />
            <CardResumo
              titulo="Inadimplente"
              valor={detalhe.inadimplente ? "Sim" : "Não"}
              corTexto={
                detalhe.inadimplente ? "text-red-400" : "text-green-400"
              }
            />
            <CardResumo
              titulo="Próx. Vencimento"
              valor={detalhe.proximoVencimento ?? "--"}
              corTexto="text-blue-400"
            />
            <CardResumo
              titulo="Valor Próxima"
              valor={`R$ ${(detalhe.valorProximo ?? 0).toLocaleString("pt-BR")}`}
              corTexto="text-yellow-400"
            />
          </div>

          <div className="mb-8 flex flex-col items-center rounded-2xl bg-zinc-800 p-4 shadow">
            <h3 className="mb-2 text-base font-semibold text-white">
              Distribuição dos Pagamentos
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={graficoStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {graficoStatus.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {graficoStatus.map((item) => (
                <span
                  key={item.name}
                  className="flex items-center gap-2 text-xs text-white"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: item.color }}
                  ></span>
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3 flex">
            <button
              className="rounded bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600"
              onClick={() => setModalNovo(true)}
            >
              + Novo Lançamento
            </button>
          </div>

          <div className="mb-2 flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-zinc-300">
              Status:&nbsp;
              <select
                value={statusPagamento}
                onChange={(e) =>
                  setStatusPagamento(e.target.value as StatusPagamento | "all")
                }
                className="rounded bg-zinc-800 px-2 py-1 text-white"
              >
                <option value="all">Todos</option>
                <option value="Pago">Pago</option>
                <option value="Em aberto">Em aberto</option>
                <option value="Trial">Trial</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-zinc-300">
              Método:&nbsp;
              <select
                value={metodoPagamento}
                onChange={(e) =>
                  setMetodoPagamento(e.target.value as MetodoPagamento | "all")
                }
                className="rounded bg-zinc-800 px-2 py-1 text-white"
              >
                <option value="all">Todos</option>
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
                <option value="outro">Outro</option>
              </select>
            </label>
          </div>

          <h2 className="mb-3 text-xl font-bold text-white">
            Histórico de Pagamentos
          </h2>
          <div className="mb-8 overflow-x-auto rounded-2xl bg-zinc-800 p-4 shadow">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Referência</th>
                  <th className="px-3 py-2">Método</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pagamentosFiltrados.length > 0 ? (
                  pagamentosFiltrados.map((pag, idx) => (
                    <tr key={idx} className="border-b border-zinc-700">
                      <td className="px-3 py-2">
                        {typeof pag.data === "string" ? pag.data : "--"}
                      </td>
                      <td className="px-3 py-2">
                        R${" "}
                        {(typeof pag.valor === "number"
                          ? pag.valor
                          : 0
                        ).toLocaleString("pt-BR")}
                      </td>
                      <td
                        className={`px-3 py-2 font-semibold ${STATUS_COLORS[pag.status] ?? "text-white"}`}
                      >
                        {pag.status ?? "--"}
                      </td>
                      <td className="px-3 py-2">{pag.referencia ?? "--"}</td>
                      <td className="px-3 py-2">{pag.metodo ?? "--"}</td>
                      <td className="px-3 py-2">
                        <button
                          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                          onClick={() => setModalPagamento(pag)}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-400">
                      Nenhum pagamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ações rápidas */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              className="rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500"
              onClick={handleExportPDF}
            >
              Exportar PDF
            </button>
            <button
              className="rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
              onClick={handleBaixarFatura}
            >
              Baixar Fatura
            </button>
            <button
              className="rounded bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
              onClick={handleMarcarInadimplente}
            >
              Marcar como Inadimplente
            </button>
          </div>

          {/* MODAL DE DETALHE DO PAGAMENTO */}
          {modalPagamento && (
            <Modal onClose={() => setModalPagamento(null)}>
              <div className="mx-auto w-full max-w-md rounded-2xl bg-zinc-900 p-6">
                <h3 className="mb-3 text-lg font-bold text-white">
                  Detalhes do Pagamento
                </h3>
                <div className="mb-2 text-white">
                  <b>Status:</b>{" "}
                  <span className={STATUS_COLORS[modalPagamento.status]}>
                    {modalPagamento.status}
                  </span>
                </div>
                <div className="mb-2 text-white">
                  <b>Data:</b> {modalPagamento.data ?? "--"}
                </div>
                <div className="mb-2 text-white">
                  <b>Valor:</b> R${" "}
                  {(typeof modalPagamento.valor === "number"
                    ? modalPagamento.valor
                    : 0
                  ).toLocaleString("pt-BR")}
                </div>
                <div className="mb-2 text-white">
                  <b>Método:</b> {modalPagamento.metodo}
                </div>
                <div className="mb-2 text-white">
                  <b>Referência:</b> {modalPagamento.referencia ?? "--"}
                </div>
                <div className="mb-2 text-white">
                  <b>Descrição:</b> {modalPagamento.descricao ?? "--"}
                </div>
                <button
                  onClick={() => setModalPagamento(null)}
                  className="mt-4 w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
                >
                  Fechar
                </button>
              </div>
            </Modal>
          )}

          {/* MODAL DE NOVO PAGAMENTO */}
          {modalNovo && (
            <Modal onClose={() => setModalNovo(false)}>
              <NovoPagamentoForm
                onSalvar={adicionarPagamentoMock}
                onCancel={() => setModalNovo(false)}
              />
            </Modal>
          )}
        </div>
      </main>
    </>
  );
}

// Modal genérico (acessível, dark, seguro)
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

// Formulário de novo pagamento
function NovoPagamentoForm({
  onSalvar,
  onCancel,
}: {
  onSalvar: (p: PagamentoFinanceiro) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState<StatusPagamento>("Pago");
  const [referencia, setReferencia] = useState("");
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [descricao, setDescricao] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor);
    if (!data || !valorNum || !referencia)
      return alert("Preencha todos os campos obrigatórios!");
    onSalvar({
      data,
      valor: valorNum,
      status,
      referencia,
      metodo,
      descricao,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl bg-zinc-900 p-6"
    >
      <h3 className="mb-2 text-lg font-bold text-white">Novo Lançamento</h3>
      <label className="text-sm text-white">
        Data*
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
          required
        />
      </label>
      <label className="text-sm text-white">
        Valor* (R$)
        <input
          type="number"
          value={valor}
          min={1}
          onChange={(e) => setValor(e.target.value)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
          required
        />
      </label>
      <label className="text-sm text-white">
        Status*
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusPagamento)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
        >
          <option value="Pago">Pago</option>
          <option value="Em aberto">Em aberto</option>
          <option value="Trial">Trial</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </label>
      <label className="text-sm text-white">
        Referência*
        <input
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
          required
        />
      </label>
      <label className="text-sm text-white">
        Método*
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value as MetodoPagamento)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
        >
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
          <option value="boleto">Boleto</option>
          <option value="outro">Outro</option>
        </select>
      </label>
      <label className="text-sm text-white">
        Descrição
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="mt-1 w-full rounded bg-zinc-800 px-2 py-1 text-white"
        />
      </label>
      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded bg-zinc-700 px-4 py-2 font-semibold text-white hover:bg-zinc-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer } from "recharts";
import type { StatusPagamento, MetodoPagamento } from "@/components/financeiro/types";
import CardResumo from "@/components/financeiro/CardResumo";
import { useBranding } from "@/hooks/useBranding";

const STATUS_COLORS: Record<StatusPagamento, string> = {
  Pago: "text-green-400",
  "Em aberto": "text-red-400",
  Trial: "text-yellow-400",
  Cancelado: "text-zinc-500",
};
const GRAFICO_COLORS = ["#32d657", "#ffbe30", "#ff7043", "#4c6fff"];
const PLAN_LABELS: Record<string, { label: string; interval: "mensal" | "anual" }> = {
  monthly_essential: { label: "Mensal Essencial", interval: "mensal" },
  monthly_marketing: { label: "Mensal + Marketing", interval: "mensal" },
  monthly_enterprise: { label: "Mensal Enterprise", interval: "mensal" },
  yearly_essential: { label: "Anual Essencial", interval: "anual" },
  yearly_marketing: { label: "Anual + Marketing", interval: "anual" },
  yearly_enterprise: { label: "Anual Enterprise", interval: "anual" },
  mensal_essencial: { label: "Mensal Essencial", interval: "mensal" },
  mensal_marketing: { label: "Mensal + Marketing", interval: "mensal" },
  mensal_enterprise: { label: "Mensal Enterprise", interval: "mensal" },
  anual_essencial: { label: "Anual Essencial", interval: "anual" },
  anual_marketing: { label: "Anual + Marketing", interval: "anual" },
  anual_enterprise: { label: "Anual Enterprise", interval: "anual" },
};

type TenantAdmin = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
};
type Invoice = {
  id: string;
  amount: number;
  status?: string | null;
  paidAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  mpPaymentId?: string | null;
  metadata?: Record<string, any> | null;
};
type Subscription = {
  status?: string | null;
  planKey?: string | null;
  amount?: number | null;
  interval?: string | null;
  currentPeriodEnd?: string | null;
  invoices?: Invoice[];
};
type Tenant = {
  id: string;
  name: string;
  slug: string;
  subscription?: Subscription | null;
  admins?: TenantAdmin[] | null;
  _count?: { users?: number; matches?: number };
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
};

function mapStatus(status?: string | null): StatusPagamento {
  const normalized = (status || "").toLowerCase();
  if (!status) return "Em aberto";
  if (normalized.includes("trial")) return "Trial";
  if (normalized.includes("past") || normalized.includes("due") || normalized.includes("paused")) {
    return "Em aberto";
  }
  if (normalized.includes("cancel") || normalized.includes("expired")) {
    return "Cancelado";
  }
  if (
    normalized.includes("active") ||
    normalized.includes("paid") ||
    normalized.includes("approved") ||
    normalized.includes("authoriz")
  ) {
    return "Pago";
  }
  return "Em aberto";
}

function centsToBrl(cents?: number | null) {
  if (!cents) return 0;
  return Number((cents / 100).toFixed(2));
}

function formatCurrency(value?: number | null) {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

function resolvePlan(planKey?: string | null) {
  const key = (planKey || "").toLowerCase().replace(/-/g, "_");
  if (PLAN_LABELS[key]) {
    return PLAN_LABELS[key];
  }

  const isYearly = key.includes("year") || key.includes("anual");
  const isMarketing = key.includes("marketing");
  const isEnterprise = key.includes("enterprise");
  const interval = isYearly ? "anual" : "mensal";
  const labelPrefix = isYearly ? "Anual" : "Mensal";

  if (isEnterprise) return { label: `${labelPrefix} Enterprise`, interval };
  if (isMarketing) return { label: `${labelPrefix} + Marketing`, interval };
  if (key) return { label: `${labelPrefix} Essencial`, interval };

  return { label: "Plano n/d", interval: "mensal" as const };
}

function resolveMetodo(metadata?: Record<string, any> | null): MetodoPagamento {
  const method =
    typeof metadata?.metodo === "string"
      ? metadata.metodo
      : typeof metadata?.method === "string"
        ? metadata.method
        : typeof metadata?.payment_method === "string"
          ? metadata.payment_method
          : typeof metadata?.paymentMethod === "string"
            ? metadata.paymentMethod
            : "";
  const normalized = method.toLowerCase();
  if (normalized.includes("pix")) return "pix";
  if (normalized.includes("card") || normalized.includes("cart")) return "cartao";
  if (normalized.includes("boleto")) return "boleto";
  return "outro";
}

export default function FinanceiroRachaDetalhePage() {
  const { brandText } = useBranding({ scope: "superadmin" });
  const brandLabel = brandText("Fut7Pro");
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params?.slug[0]
        : "";

  const {
    data: tenant,
    error,
    isLoading,
  } = useSWR<Tenant>(slug ? `/api/superadmin/tenants/${slug}` : null, fetcher);

  const subscription = tenant?.subscription;
  const statusPagamento = mapStatus(subscription?.status);
  const planInfo = resolvePlan(subscription?.planKey);
  const valorPlanoMensal =
    subscription?.interval === "year" || planInfo.interval === "anual"
      ? centsToBrl((subscription?.amount ?? 0) / 12)
      : centsToBrl(subscription?.amount ?? 0);

  const pagamentos = useMemo(() => {
    const invoices = subscription?.invoices ?? [];
    const mapped = invoices.map((inv) => ({
      data: formatDate(inv.paidAt ?? inv.periodStart ?? inv.createdAt),
      valor: centsToBrl(inv.amount),
      status: mapStatus(inv.status),
      referencia: inv.mpPaymentId ?? inv.id,
      metodo: resolveMetodo(inv.metadata),
      descricao:
        (typeof inv.metadata?.descricao === "string" && inv.metadata.descricao) ||
        (typeof inv.metadata?.description === "string" && inv.metadata.description) ||
        "",
      raw: inv,
    }));

    return mapped.sort((a, b) => {
      const da = new Date(a.raw.paidAt ?? a.raw.createdAt).getTime();
      const db = new Date(b.raw.paidAt ?? b.raw.createdAt).getTime();
      return db - da;
    });
  }, [subscription?.invoices]);

  const [modalPagamento, setModalPagamento] = useState<(typeof pagamentos)[number] | null>(null);

  const totalPago = pagamentos
    .filter((p) => p.status === "Pago")
    .reduce((acc, cur) => acc + (cur.valor ?? 0), 0);

  const invoiceCount = subscription?.invoices?.length ?? 0;
  const hasSubscription = Boolean(subscription);

  const graficoStatus = (() => {
    if (!pagamentos.length) return [];
    const count: Record<StatusPagamento, number> = {
      Pago: 0,
      "Em aberto": 0,
      Trial: 0,
      Cancelado: 0,
    };
    pagamentos.forEach((p) => {
      count[p.status] = (count[p.status] ?? 0) + 1;
    });
    return (Object.keys(count) as StatusPagamento[])
      .map((k, i) => ({
        name: k,
        value: count[k],
        color: GRAFICO_COLORS[i],
      }))
      .filter((item) => item.value > 0);
  })();

  if (!slug) {
    return <div className="text-red-400 p-8">Slug do racha invalido.</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 p-8">
        Erro ao carregar detalhes financeiros: {error.message || "erro desconhecido"}.
      </div>
    );
  }

  if (isLoading) return <div className="text-white p-8">Carregando detalhes...</div>;
  if (!tenant) return <div className="text-red-400 p-8">Racha nao encontrado.</div>;

  const tituloPagina = `${tenant.name} - ${brandText("Detalhes Financeiros")}`;

  return (
    <>
      <Head>
        <title>{tituloPagina}</title>
        <meta
          name="description"
          content={`Detalhes financeiros e histórico de pagamentos do racha ${tenant.name} na plataforma ${brandLabel}.`}
        />
        <meta
          name="keywords"
          content={`racha, financeiro, detalhe, pagamentos, ${brandLabel}, ${tenant.name}`}
        />
      </Head>
      <main className="bg-zinc-900 min-h-screen px-2 sm:px-4 md:px-8 pt-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <nav className="mb-4">
            <Link href="/superadmin/financeiro" className="text-blue-400 hover:underline">
              {"<- Voltar ao Financeiro"}
            </Link>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{tenant.name}</h1>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-zinc-800 text-white px-3 py-1 rounded">{planInfo.label}</span>
            {subscription?.planKey && (
              <span className="bg-zinc-800 text-white px-3 py-1 rounded">
                Chave: {subscription.planKey}
              </span>
            )}
            <span
              className={`font-bold px-3 py-1 rounded ${STATUS_COLORS[statusPagamento] ?? "text-white"} bg-zinc-800`}
            >
              {statusPagamento}
            </span>
            <span className="bg-zinc-800 text-white px-3 py-1 rounded">
              Presidente: <b>{tenant.admins?.[0]?.name ?? tenant.admins?.[0]?.email ?? "--"}</b>
            </span>
            <span className="bg-zinc-800 text-white px-3 py-1 rounded">
              ID: {tenant.id.slice(0, 8)}...
            </span>
          </div>

          {!hasSubscription && (
            <div className="mb-4 rounded-xl border border-yellow-500 bg-yellow-500/10 px-4 py-3 text-yellow-200">
              Nenhuma assinatura foi retornada para este racha. Verifique se o backend esta
              registrando subscription/planKey e invoices antes de liberar o acesso.
            </div>
          )}

          {hasSubscription && invoiceCount === 0 && (
            <div className="mb-4 rounded-xl border border-yellow-500 bg-yellow-500/10 px-4 py-3 text-yellow-200">
              Nenhuma fatura retornada pelo backend para este racha. Confirme invoices e status no
              painel SuperAdmin ou na API antes de marcar como pago/inadimplente.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <CardResumo
              titulo="Total Pago"
              valor={formatCurrency(totalPago)}
              corTexto="text-green-400"
            />
            <CardResumo
              titulo="Status"
              valor={statusPagamento}
              corTexto={STATUS_COLORS[statusPagamento] ?? "text-white"}
            />
            <CardResumo
              titulo="Prox. Vencimento"
              valor={formatDate(subscription?.currentPeriodEnd)}
              corTexto="text-blue-400"
            />
            <CardResumo
              titulo="Valor Proxima"
              valor={formatCurrency(valorPlanoMensal)}
              corTexto="text-yellow-400"
            />
            <CardResumo
              titulo="Faturas"
              valor={pagamentos.length.toString()}
              corTexto="text-purple-300"
            />
          </div>

          <div className="bg-zinc-800 rounded-2xl shadow p-4 mb-8 flex flex-col items-center">
            <h3 className="text-white font-semibold mb-2 text-base">Distribuicao dos Pagamentos</h3>
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
            <div className="flex justify-center mt-2 gap-3 flex-wrap">
              {graficoStatus.map((item) => (
                <span key={item.name} className="flex items-center gap-2 text-white text-xs">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  ></span>
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              className="bg-yellow-500/60 cursor-not-allowed text-black px-4 py-2 rounded font-semibold"
              title="Exportacao disponivel via painel financeiro principal"
              disabled
            >
              Exportar PDF (via painel)
            </button>
            <button
              className="bg-zinc-700 cursor-not-allowed text-white px-4 py-2 rounded font-semibold"
              disabled
              title="Baixar fatura ainda nao disponivel nesta tela"
            >
              Baixar Fatura
            </button>
            <button
              className="bg-zinc-700 cursor-not-allowed text-white px-4 py-2 rounded font-semibold"
              disabled
              title="Marcacao de inadimplencia controlada pelo backend"
            >
              Marcar como Inadimplente
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">Histórico de Pagamentos</h2>
          <div className="bg-zinc-800 rounded-2xl shadow p-4 overflow-x-auto mb-8">
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
                {pagamentos.length > 0 ? (
                  pagamentos.map((pag, idx) => (
                    <tr key={idx} className="border-b border-zinc-700">
                      <td className="px-3 py-2">{pag.data}</td>
                      <td className="px-3 py-2">{formatCurrency(pag.valor)}</td>
                      <td
                        className={`px-3 py-2 font-semibold ${STATUS_COLORS[pag.status] ?? "text-white"}`}
                      >
                        {pag.status}
                      </td>
                      <td className="px-3 py-2">{pag.referencia ?? "--"}</td>
                      <td className="px-3 py-2">{pag.metodo ?? "--"}</td>
                      <td className="px-3 py-2">
                        <button
                          className="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white"
                          onClick={() => setModalPagamento(pag)}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-zinc-400">
                      Nenhum pagamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {modalPagamento && (
            <Modal onClose={() => setModalPagamento(null)}>
              <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 mx-auto">
                <h3 className="text-lg font-bold text-white mb-3">Detalhes do Pagamento</h3>
                <div className="mb-2 text-white">
                  <b>Status:</b>{" "}
                  <span className={STATUS_COLORS[modalPagamento.status] ?? "text-white"}>
                    {modalPagamento.status}
                  </span>
                </div>
                <div className="mb-2 text-white">
                  <b>Data:</b> {modalPagamento.data ?? "--"}
                </div>
                <div className="mb-2 text-white">
                  <b>Valor:</b> {formatCurrency(modalPagamento.valor)}
                </div>
                <div className="mb-2 text-white">
                  <b>Método:</b> {modalPagamento.metodo}
                </div>
                <div className="mb-2 text-white">
                  <b>Referência:</b> {modalPagamento.referencia ?? "--"}
                </div>
                <div className="mb-2 text-white">
                  <b>Descrição:</b> {modalPagamento.descricao || "--"}
                </div>
                <button
                  onClick={() => setModalPagamento(null)}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"
                >
                  Fechar
                </button>
              </div>
            </Modal>
          )}
        </div>
      </main>
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/70">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

"use client";

import useSWR from "swr";

type AmbassadorStatus = "ATIVO" | "EM_ANALISE" | "BLOQUEADO";
type CouponStatus = "ATIVO" | "PAUSADO" | "EXPIRADO";
type ReferralStatus = "TESTE" | "PRIMEIRA_COMPRA" | "ATIVO" | "CANCELADO";
type CommissionType = "UNICA" | "RECORRENTE";
type CommissionStatus = "PENDENTE" | "PAGA" | "BLOQUEADA";

interface DashboardResponse {
  kpis: {
    totalAmbassadors: number;
    activeAmbassadors: number;
    validCoupons: number;
    totalReferrals: number;
    converted: number;
    conversionRate: number;
    pendingCents: number;
    paidCents: number;
  };
  ambassadors: Array<{
    id: string;
    name: string;
    cpfMasked: string;
    level: 1 | 2 | 3;
    status: AmbassadorStatus;
    sales: number;
    couponCode: string;
    city: string;
    state: string;
    pendingCents: number;
  }>;
  coupons: Array<{
    code: string;
    ambassadorName: string;
    createdAt: string;
    validUntil: string;
    status: CouponStatus;
    trialUsages: number;
    paidUsages: number;
  }>;
  referrals: Array<{
    id: string;
    rachaName: string;
    ambassadorId: string;
    ambassadorName: string;
    couponCode: string;
    city: string;
    status: ReferralStatus;
    trialStartedAt: string;
    firstPurchaseAt: string | null;
    valueCents: number;
  }>;
  commissions: Array<{
    id: string;
    ambassadorId: string;
    ambassadorName: string;
    type: CommissionType;
    competence: string;
    amountCents: number;
    status: CommissionStatus;
    scheduledFor: string;
    paidAt: string | null;
  }>;
  settings: {
    oneTimePayoutCents: number;
    recurringLevel2Cents: number;
    recurringLevel3Cents: number;
    qualificationWindowDays: number;
    payoutDay: number;
    minimumPayoutCents: number;
  };
}

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & Partial<DashboardResponse>;

  if (!response.ok) {
    throw new Error(body.error || "Nao foi possivel carregar os dados de embaixadores.");
  }

  return body as DashboardResponse;
};

function statusBadge(status: string): string {
  if (status === "ATIVO" || status === "PAGA") {
    return "border-emerald-500/40 bg-emerald-500/20 text-emerald-300";
  }
  if (status === "PENDENTE" || status === "PRIMEIRA_COMPRA" || status === "EM_ANALISE") {
    return "border-yellow-500/40 bg-yellow-500/20 text-yellow-300";
  }
  if (status === "TESTE") {
    return "border-sky-500/40 bg-sky-500/20 text-sky-300";
  }
  return "border-red-500/40 bg-red-500/20 text-red-300";
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

function formatDate(dateISO: string | null): string {
  if (!dateISO) return "-";
  const parsed = new Date(dateISO);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export default function EmbaixadoresClient() {
  const { data, error, isLoading } = useSWR<DashboardResponse>(
    "/api/superadmin/embaixadores",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
        <section className="rounded-xl bg-zinc-900/80 p-5 shadow-lg">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Programa de Embaixadores</h1>
          <p className="mt-2 text-zinc-400">Carregando dados reais do programa...</p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
        <section className="rounded-xl border border-red-500/40 bg-red-950/20 p-5 shadow-lg">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Programa de Embaixadores</h1>
          <p className="mt-2 text-red-200">
            {error instanceof Error
              ? error.message
              : "Nao foi possivel carregar os dados dos embaixadores."}
          </p>
        </section>
      </main>
    );
  }

  const { kpis, ambassadors, coupons, referrals, commissions, settings } = data;

  return (
    <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
      <section className="mb-6 rounded-xl bg-zinc-900/80 p-5 shadow-lg">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Programa de Embaixadores</h1>
        <p className="mt-1 text-zinc-400">
          Visao geral operacional do programa: conversoes, cupons, indicacoes, comissoes e
          configuracoes.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
        <article className="rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 p-4 text-black shadow-lg">
          <p className="text-xs font-semibold uppercase">Total</p>
          <p className="mt-1 text-2xl font-bold">{kpis.totalAmbassadors}</p>
          <p className="text-xs">Embaixadores</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Ativos</p>
          <p className="mt-1 text-2xl font-bold">{kpis.activeAmbassadors}</p>
          <p className="text-xs">Com status ativo</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-cyan-400 to-cyan-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Cupons</p>
          <p className="mt-1 text-2xl font-bold">{kpis.validCoupons}</p>
          <p className="text-xs">Validos</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-blue-400 to-blue-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Indicacoes</p>
          <p className="mt-1 text-2xl font-bold">{kpis.totalReferrals}</p>
          <p className="text-xs">Rachas rastreados</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-purple-400 to-purple-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Conversoes</p>
          <p className="mt-1 text-2xl font-bold">{kpis.converted}</p>
          <p className="text-xs">Teste para pago</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-fuchsia-400 to-fuchsia-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Taxa</p>
          <p className="mt-1 text-2xl font-bold">{Math.round(kpis.conversionRate)}%</p>
          <p className="text-xs">Conversao</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-orange-400 to-orange-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Pendente</p>
          <p className="mt-1 text-xl font-bold">{formatCurrency(kpis.pendingCents)}</p>
          <p className="text-xs">A pagar</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-lime-400 to-lime-600 p-4 text-black shadow-lg">
          <p className="text-xs font-semibold uppercase">Pago</p>
          <p className="mt-1 text-xl font-bold">{formatCurrency(kpis.paidCents)}</p>
          <p className="text-xs">Historico</p>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Embaixadores</h2>
            <span className="text-xs text-zinc-400">Total: {ambassadors.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-2 py-2 font-medium">ID</th>
                  <th className="px-2 py-2 font-medium">Nome</th>
                  <th className="px-2 py-2 font-medium">CPF</th>
                  <th className="px-2 py-2 font-medium">Nivel</th>
                  <th className="px-2 py-2 font-medium">Vendas</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ambassadors.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800">
                    <td className="px-2 py-2 text-zinc-300">{row.id}</td>
                    <td className="px-2 py-2 font-medium text-white">{row.name}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.cpfMasked}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.level}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.sales}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Cupons</h2>
            <span className="text-xs text-zinc-400">Ativos: {kpis.validCoupons}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-2 py-2 font-medium">Codigo</th>
                  <th className="px-2 py-2 font-medium">Embaixador</th>
                  <th className="px-2 py-2 font-medium">Criado</th>
                  <th className="px-2 py-2 font-medium">Validade</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((row) => (
                  <tr key={row.code} className="border-b border-zinc-800">
                    <td className="px-2 py-2 font-medium text-yellow-300">{row.code}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.ambassadorName}</td>
                    <td className="px-2 py-2 text-zinc-300">{formatDate(row.createdAt)}</td>
                    <td className="px-2 py-2 text-zinc-300">{formatDate(row.validUntil)}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Indicacoes</h2>
            <span className="text-xs text-zinc-400">Rastreamento por cupom aplicado</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-2 py-2 font-medium">Racha</th>
                  <th className="px-2 py-2 font-medium">Embaixador</th>
                  <th className="px-2 py-2 font-medium">Cupom</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800">
                    <td className="px-2 py-2 font-medium text-white">{row.rachaName}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.ambassadorName}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.couponCode}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-zinc-300">{formatDate(row.trialStartedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Comissoes</h2>
            <span className="text-xs text-zinc-400">Fechamento mensal e payout via Pix</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-2 py-2 font-medium">Embaixador</th>
                  <th className="px-2 py-2 font-medium">Tipo</th>
                  <th className="px-2 py-2 font-medium">Valor</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800">
                    <td className="px-2 py-2 text-zinc-300">{row.ambassadorName}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.type}</td>
                    <td className="px-2 py-2 font-medium text-yellow-300">
                      {formatCurrency(row.amountCents)}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-zinc-300">
                      {formatDate(row.paidAt || row.scheduledFor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-xl bg-zinc-900/80 p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white">Configuracoes do Programa</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Comissao nivel 1</p>
            <p className="mt-1 text-base font-semibold text-yellow-300">
              {formatCurrency(settings.oneTimePayoutCents)} por venda valida
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Comissao nivel 2</p>
            <p className="mt-1 text-base font-semibold text-yellow-300">
              {formatCurrency(settings.recurringLevel2Cents)} por racha/mês
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Comissao nivel 3</p>
            <p className="mt-1 text-base font-semibold text-yellow-300">
              {formatCurrency(settings.recurringLevel3Cents)} por racha/mês
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Janela antifraude</p>
            <p className="mt-1 text-base font-semibold text-zinc-200">
              {settings.qualificationWindowDays} dias
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Dia de pagamento</p>
            <p className="mt-1 text-base font-semibold text-zinc-200">
              Ate dia {settings.payoutDay}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Minimo de saque</p>
            <p className="mt-1 text-base font-semibold text-zinc-200">
              {formatCurrency(settings.minimumPayoutCents)}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

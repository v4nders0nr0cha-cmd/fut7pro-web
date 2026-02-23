"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type AmbassadorStatus = "ATIVO" | "EM_ANALISE" | "BLOQUEADO";
type CouponStatus = "ATIVO" | "PAUSADO" | "EXPIRADO";
type ReferralStatus = "TESTE" | "PRIMEIRA_COMPRA" | "ATIVO" | "CANCELADO";
type CommissionType = "UNICA" | "RECORRENTE";
type CommissionStatus = "PENDENTE" | "PAGA" | "BLOQUEADA";
type ApplicationStatus = "PENDENTE" | "EM_ANALISE" | "APROVADA" | "REJEITADA";

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
    pendingApplications: number;
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
  applications: Array<{
    id: string;
    fullName: string;
    documentMasked: string;
    email: string;
    whatsapp: string;
    city: string;
    state: string;
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
    facebookPage: string | null;
    couponRequested: string | null;
    niche: string | null;
    pixKeyMasked: string;
    photoUrl: string | null;
    status: ApplicationStatus;
    reviewNotes: string | null;
    reviewedAt: string | null;
    reviewedByAdminId: string | null;
    approvedInfluencerId: string | null;
    createdAt: string;
    updatedAt: string;
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
  if (status === "ATIVO" || status === "PAGA" || status === "APROVADA") {
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
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function statusLabel(status: ApplicationStatus): string {
  if (status === "EM_ANALISE") return "Em analise";
  if (status === "APROVADA") return "Aprovada";
  if (status === "REJEITADA") return "Rejeitada";
  return "Pendente";
}

function normalizeCouponInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export default function EmbaixadoresClient() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<DashboardResponse>(
    "/api/superadmin/embaixadores",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );

  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewCoupon, setReviewCoupon] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!data?.applications?.length) {
      setSelectedApplicationId("");
      return;
    }

    const hasSelected = data.applications.some((item) => item.id === selectedApplicationId);
    if (hasSelected) {
      return;
    }

    const prioritized =
      data.applications.find(
        (item) => item.status === "PENDENTE" || item.status === "EM_ANALISE"
      ) || data.applications[0];

    setSelectedApplicationId(prioritized.id);
    setReviewNote(prioritized.reviewNotes || "");
    setReviewCoupon(prioritized.couponRequested || "");
  }, [data, selectedApplicationId]);

  const selectedApplication = useMemo(
    () => data?.applications.find((item) => item.id === selectedApplicationId) || null,
    [data, selectedApplicationId]
  );

  useEffect(() => {
    if (!selectedApplication) return;
    setReviewNote(selectedApplication.reviewNotes || "");
    setReviewCoupon(selectedApplication.couponRequested || "");
  }, [selectedApplication]);

  const handleUpdateApplication = async (nextStatus: ApplicationStatus) => {
    if (!selectedApplication) {
      return;
    }

    setIsUpdatingStatus(true);
    setActionError("");
    setActionMessage("");

    try {
      const normalizedCoupon = normalizeCouponInput(reviewCoupon.trim());
      const response = await fetch(
        `/api/superadmin/embaixadores/applications/${encodeURIComponent(selectedApplication.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            note: reviewNote.trim() || undefined,
            coupon: nextStatus === "APROVADA" && normalizedCoupon ? normalizedCoupon : undefined,
          }),
        }
      );

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Falha ao atualizar status da solicitacao");
      }

      setActionMessage(`Solicitacao atualizada para ${statusLabel(nextStatus)}.`);
      await mutate();
    } catch (updateError) {
      setActionError(
        updateError instanceof Error ? updateError.message : "Falha ao atualizar solicitacao"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const { kpis, ambassadors, coupons, referrals, commissions, applications, settings } = data;

  return (
    <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
      <section className="mb-6 rounded-xl bg-zinc-900/80 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Programa de Embaixadores</h1>
            <p className="mt-1 text-zinc-400">
              Visao geral operacional do programa: solicitacoes, conversoes, cupons, indicacoes e
              comissoes.
            </p>
          </div>
          <span className="rounded-full border border-zinc-700 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
            {isValidating ? "Atualizando..." : "Dados em tempo real"}
          </span>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-9">
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
        <article className="rounded-xl bg-gradient-to-tr from-indigo-400 to-indigo-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Solicitacoes</p>
          <p className="mt-1 text-2xl font-bold">{kpis.pendingApplications ?? 0}</p>
          <p className="text-xs">Pendentes</p>
        </article>
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-[0.9fr_1.3fr]">
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Solicitacoes de Embaixador</h2>
            <span className="text-xs text-zinc-400">Total: {applications.length}</span>
          </div>

          {applications.length === 0 ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              Nenhuma solicitacao recebida ate o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => {
                const isSelected = application.id === selectedApplicationId;
                return (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedApplicationId(application.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? "border-yellow-500/60 bg-yellow-500/10"
                        : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{application.fullName}</p>
                        <p className="text-xs text-zinc-400">{application.documentMasked}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {application.city}/{application.state} •{" "}
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusBadge(application.status)}`}
                      >
                        {statusLabel(application.status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-white">Detalhes da Solicitacao</h2>
          {!selectedApplication ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              Selecione uma solicitacao para visualizar os dados.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">{selectedApplication.fullName}</p>
                  <p className="text-sm text-zinc-300">CPF: {selectedApplication.documentMasked}</p>
                  <p className="text-sm text-zinc-300">E-mail: {selectedApplication.email}</p>
                  <p className="text-sm text-zinc-300">WhatsApp: {selectedApplication.whatsapp}</p>
                  <p className="text-sm text-zinc-300">
                    Cidade/UF: {selectedApplication.city}/{selectedApplication.state}
                  </p>
                  <p className="text-sm text-zinc-300">Pix: {selectedApplication.pixKeyMasked}</p>
                  <p className="text-sm text-zinc-300">
                    Cupom solicitado:{" "}
                    <span className="font-semibold text-yellow-300">
                      {selectedApplication.couponRequested || "-"}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-300">Nicho: {selectedApplication.niche || "-"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusBadge(selectedApplication.status)}`}
                  >
                    {statusLabel(selectedApplication.status)}
                  </span>
                  {selectedApplication.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedApplication.photoUrl}
                      alt={`Foto de ${selectedApplication.fullName}`}
                      className="h-20 w-20 rounded-full border border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs text-zinc-400">
                      Sem foto
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-xs uppercase text-zinc-500">Instagram</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    {selectedApplication.instagram || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-xs uppercase text-zinc-500">TikTok</p>
                  <p className="mt-1 text-sm text-zinc-200">{selectedApplication.tiktok || "-"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-xs uppercase text-zinc-500">YouTube</p>
                  <p className="mt-1 text-sm text-zinc-200">{selectedApplication.youtube || "-"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-xs uppercase text-zinc-500">Pagina do Facebook</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    {selectedApplication.facebookPage || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-coupon"
                  className="mb-2 block text-xs uppercase tracking-wide text-zinc-500"
                >
                  Cupom para aprovacao
                </label>
                <input
                  id="review-coupon"
                  value={reviewCoupon}
                  onChange={(event) => setReviewCoupon(normalizeCouponInput(event.target.value))}
                  maxLength={14}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 text-sm text-zinc-100 outline-none focus:border-yellow-500"
                  placeholder="Ex: FUT7SOBRAL"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Por padrao usamos o cupom solicitado. Edite apenas se precisar ajustar antes da
                  aprovacao.
                </p>
              </div>

              <div>
                <label
                  htmlFor="review-note"
                  className="mb-2 block text-xs uppercase tracking-wide text-zinc-500"
                >
                  Observacao interna
                </label>
                <textarea
                  id="review-note"
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-500"
                  placeholder="Opcional: motivo da aprovacao/reprovacao, direcionamento comercial, etc"
                />
              </div>

              {selectedApplication.reviewedAt ? (
                <p className="text-xs text-zinc-400">
                  Ultima revisao: {formatDate(selectedApplication.reviewedAt)}
                  {selectedApplication.reviewedByAdminId
                    ? ` • admin ${selectedApplication.reviewedByAdminId}`
                    : ""}
                </p>
              ) : null}

              {actionError ? (
                <p className="rounded-md border border-red-500/40 bg-red-950/20 px-3 py-2 text-sm text-red-200">
                  {actionError}
                </p>
              ) : null}
              {actionMessage ? (
                <p className="rounded-md border border-emerald-500/40 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-200">
                  {actionMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateApplication("EM_ANALISE")}
                  className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marcar em analise
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateApplication("APROVADA")}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Aprovar e criar embaixador
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateApplication("REJEITADA")}
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Rejeitar solicitacao
                </button>
              </div>
            </div>
          )}
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
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Validade</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((row) => (
                  <tr key={row.code} className="border-b border-zinc-800">
                    <td className="px-2 py-2 font-medium text-yellow-300">{row.code}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.ambassadorName}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-zinc-300">{formatDate(row.validUntil)}</td>
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
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800">
                    <td className="px-2 py-2 font-medium text-white">{row.rachaName}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.ambassadorName}</td>
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
              {formatCurrency(settings.recurringLevel2Cents)} por racha/mes
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase text-zinc-500">Comissao nivel 3</p>
            <p className="mt-1 text-base font-semibold text-yellow-300">
              {formatCurrency(settings.recurringLevel3Cents)} por racha/mes
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

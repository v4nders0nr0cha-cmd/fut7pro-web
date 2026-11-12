"use client";

import Link from "next/link";
import { FaCalendarCheck, FaUserPlus } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";

const FINANCE_ROLES = new Set([
  "PRESIDENTE",
  "VICE_PRESIDENTE",
  "DIRETOR_FINANCEIRO",
  "ADMIN",
  "SUPERADMIN",
]);

function Count({ value, loading }: { value: number | null; loading: boolean }) {
  return (
    <span className="text-3xl font-semibold tabular-nums text-white" aria-live="polite">
      {loading ? "…" : value === null ? "—" : value}
    </span>
  );
}

function Status({ value, loading }: { value: number | null; loading: boolean }) {
  if (loading) return <p className="text-sm text-zinc-400">Consultando pendências...</p>;
  if (value === null) {
    return <p className="text-sm text-amber-200">Não foi possível consultar as pendências.</p>;
  }
  if (value === 0) return <p className="text-sm text-zinc-400">Nenhuma solicitação pendente.</p>;
  return (
    <p className="text-sm text-zinc-300">
      {value} pedido{value === 1 ? "" : "s"} aguardando análise.
    </p>
  );
}

export default function SolicitacoesPage() {
  const { tenantSlug } = useRacha();
  const { me } = useMe({ context: "admin", tenantSlug, enabled: Boolean(tenantSlug) });
  const { badges, entryPending, entryLoading, monthlyPending, monthlyLoading } = useAdminBadges();
  const canManageMonthly = FINANCE_ROLES.has(String(me?.membership?.role || "").toUpperCase());
  const totalLoading = entryLoading || monthlyLoading;

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-4 pb-24 pt-7 text-white sm:px-6 lg:pb-10">
      <header className="mb-7 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Solicitações</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Acompanhe e gerencie os pedidos recebidos pelo seu grupo.
          </p>
        </div>
        <div className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 sm:w-auto sm:min-w-40">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Total pendente
          </p>
          <div className="mt-1">
            <Count value={badges.solicitacoes} loading={totalLoading} />
          </div>
          {!totalLoading && badges.solicitacoes === null && tenantSlug ? (
            <p className="mt-1 text-xs text-amber-200">Total indisponível</p>
          ) : null}
        </div>
      </header>

      {!tenantSlug ? (
        <p className="rounded-xl border border-white/10 bg-zinc-900 p-5 text-sm text-zinc-300">
          Selecione um grupo para consultar as solicitações.
        </p>
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <section
            aria-labelledby="entry-requests-title"
            className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-lg bg-yellow-400/10 p-2.5 text-yellow-300">
                  <FaUserPlus aria-hidden="true" />
                </span>
                <h2 id="entry-requests-title" className="text-lg font-semibold">
                  Entrada de jogadores
                </h2>
              </div>
              <Count value={entryPending} loading={entryLoading} />
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Pedidos de jogadores para participar do grupo.
            </p>
            <div className="mt-3">
              <Status value={entryPending} loading={entryLoading} />
            </div>
            <Link
              href="/admin/jogadores/listar-cadastrar#solicitacoes"
              className="mt-6 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-yellow-400/35 px-4 py-2 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              Analisar solicitações de entrada
            </Link>
          </section>

          <section
            aria-labelledby="monthly-requests-title"
            className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-lg bg-emerald-400/10 p-2.5 text-emerald-300">
                  <FaCalendarCheck aria-hidden="true" />
                </span>
                <h2 id="monthly-requests-title" className="text-lg font-semibold">
                  Solicitações de mensalista
                </h2>
              </div>
              <Count value={monthlyPending} loading={monthlyLoading} />
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Pedidos de atletas do grupo para tornar-se mensalistas.
            </p>
            <div className="mt-3">
              <Status value={monthlyPending} loading={monthlyLoading} />
            </div>
            {canManageMonthly ? (
              <Link
                href="/admin/jogadores/mensalistas#solicitacoes-mensalista"
                className="mt-6 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-emerald-400/35 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                Analisar solicitações de mensalista
              </Link>
            ) : (
              <p className="mt-6 text-sm text-zinc-400">
                A análise é feita por quem possui permissão financeira no grupo.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

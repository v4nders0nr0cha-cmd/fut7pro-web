"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  RefreshCw,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRacha } from "@/context/RachaContext";
import { useMe } from "@/hooks/useMe";
import { useRecoveryItems } from "@/hooks/useRecoveryItems";
import { Fut7ConfirmDialog, Fut7InlineFeedback, Fut7SuccessDialog } from "@/components/ui/feedback";
import type {
  RecoveryApiError,
  RecoveryEntityType,
  RecoveryItem,
  RecoveryOperationType,
} from "@/types/recovery";

const PAGE_SIZE = 20;

const entityOptions: Array<{ value: RecoveryEntityType | ""; label: string }> = [
  { value: "", label: "Todos os registros" },
  { value: "ATHLETE", label: "Atletas" },
  { value: "TEAM", label: "Times" },
  { value: "COMUNICADO", label: "Comunicados" },
];

const operationOptions: Array<{ value: RecoveryOperationType | ""; label: string }> = [
  { value: "", label: "Todas" },
  { value: "ARCHIVE", label: "Arquivados" },
  { value: "DELETE", label: "Excluídos" },
];

const entityPresentation = {
  ATHLETE: {
    singular: "Atleta",
    icon: UserRound,
    destination: "/admin/jogadores/listar-cadastrar",
  },
  TEAM: { singular: "Time", icon: UsersRound, destination: "/admin/partidas/criar-times" },
  COMUNICADO: {
    singular: "Comunicado",
    icon: FileText,
    destination: "/admin/comunicacao/comunicados",
  },
} satisfies Record<
  RecoveryEntityType,
  { singular: string; icon: typeof UserRound; destination: string }
>;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function remainingTimeLabel(expiresAt: string) {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return "Prazo encerrado";
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (remainingHours < 24) return `${remainingHours}h restantes`;
  const remainingDays = Math.ceil(remainingHours / 24);
  return `${remainingDays} ${remainingDays === 1 ? "dia restante" : "dias restantes"}`;
}

function operationLabel(operation: RecoveryOperationType) {
  return operation === "ARCHIVE" ? "Arquivado" : "Excluído";
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body as { message?: string; error?: string } | null)?.message ||
      (body as { message?: string; error?: string } | null)?.error ||
      "Não foi possível concluir a operação.";
    const error = new Error(message) as RecoveryApiError;
    error.status = response.status;
    throw error;
  }
  return body as T;
}

function errorMessage(error: RecoveryApiError | null | undefined) {
  if (!error) return "";
  if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (error.status === 403) return "A Central de Recuperação é exclusiva do Presidente da pelada.";
  if (error.status === 404)
    return "O registro não foi encontrado ou não está disponível nesta pelada.";
  if (error.status === 409) return error.message || "A restauração conflita com dados atuais.";
  if (error.status === 410) return "O período de recuperação deste registro terminou.";
  if (error.status === 429) return "Muitas tentativas. Aguarde um momento e tente novamente.";
  return error.message || "Não foi possível acessar a Central de Recuperação agora.";
}

function RecoveryCard({
  item,
  loadingDetails,
  onRestore,
}: {
  item: RecoveryItem;
  loadingDetails: boolean;
  onRestore: (item: RecoveryItem) => void;
}) {
  const presentation = entityPresentation[item.entityType];
  const Icon = presentation.icon;
  const action = operationLabel(item.operationType);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#202124] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-2.5 text-yellow-300">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-white">{item.displayLabel}</h2>
              <p className="mt-1 text-sm font-medium text-yellow-200">
                {presentation.singular} <span aria-hidden="true">•</span> {action}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Responsável</dt>
              <dd className="mt-0.5">{item.performedBy?.name || "Não informado"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Data da operação</dt>
              <dd className="mt-0.5">{formatDateTime(item.performedAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Prazo final de recuperação
              </dt>
              <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                <span>{formatDateTime(item.expiresAt)}</span>
                <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                  {remainingTimeLabel(item.expiresAt)}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={() => onRestore(item)}
          disabled={loadingDetails}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#202124] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArchiveRestore size={18} aria-hidden="true" />
          {loadingDetails ? "Verificando..." : "Restaurar"}
        </button>
      </div>
    </article>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3" aria-label="Carregando registros" role="status">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

export default function RecoveryCenterClient() {
  const router = useRouter();
  const { tenantSlug, rachaId } = useRacha();
  const { me, isLoading: meLoading } = useMe({ context: "admin" });
  const [entityType, setEntityType] = useState<RecoveryEntityType | "">("");
  const [operationType, setOperationType] = useState<RecoveryOperationType | "">("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<RecoveryItem | null>(null);
  const [restoredItem, setRestoredItem] = useState<RecoveryItem | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [actionError, setActionError] = useState<RecoveryApiError | null>(null);
  const tenantScope = `${tenantSlug || "sem-slug"}:${rachaId || "sem-id"}`;
  const tenantScopeRef = useRef(tenantScope);
  const detailRequestRef = useRef<{ token: symbol; controller: AbortController } | null>(null);
  const restoreRequestRef = useRef<{ token: symbol; controller: AbortController } | null>(null);
  tenantScopeRef.current = tenantScope;
  const isPresident =
    String(me?.membership?.role || "").toUpperCase() === "PRESIDENTE" &&
    String(me?.membership?.status || "").toUpperCase() === "APROVADO";

  const { data, error, isLoading, isValidating, mutate } = useRecoveryItems({
    entityType: entityType || undefined,
    operationType: operationType || undefined,
    page,
    limit: PAGE_SIZE,
    tenantScope,
    enabled: !meLoading && isPresident,
  });

  useEffect(() => {
    detailRequestRef.current?.controller.abort();
    restoreRequestRef.current?.controller.abort();
    detailRequestRef.current = null;
    restoreRequestRef.current = null;
    setPage(1);
    setSelectedItem(null);
    setRestoredItem(null);
    setActionError(null);
    setDetailLoadingId(null);
    setRestoring(false);
  }, [tenantScope]);

  useEffect(
    () => () => {
      detailRequestRef.current?.controller.abort();
      restoreRequestRef.current?.controller.abort();
    },
    []
  );

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? PAGE_SIZE)));
  const listError = errorMessage(error);
  const actionErrorText = errorMessage(actionError);
  const selectedPresentation = selectedItem ? entityPresentation[selectedItem.entityType] : null;
  const restoredDestination = restoredItem
    ? entityPresentation[restoredItem.entityType].destination
    : "/admin/configuracoes/central-recuperacao";
  const hasItems = Boolean(data?.items.length);

  const openRestoreDialog = async (item: RecoveryItem) => {
    detailRequestRef.current?.controller.abort();
    const request = { token: Symbol(item.id), controller: new AbortController() };
    const requestTenantScope = tenantScope;
    detailRequestRef.current = request;
    setActionError(null);
    setDetailLoadingId(item.id);
    try {
      const response = await fetch(`/api/admin/recuperacao/${encodeURIComponent(item.id)}`, {
        cache: "no-store",
        signal: request.controller.signal,
      });
      const detail = await readApiResponse<RecoveryItem>(response);
      if (
        detailRequestRef.current?.token !== request.token ||
        tenantScopeRef.current !== requestTenantScope
      ) {
        return;
      }
      setSelectedItem(detail);
    } catch (cause) {
      if (
        request.controller.signal.aborted ||
        detailRequestRef.current?.token !== request.token ||
        tenantScopeRef.current !== requestTenantScope
      ) {
        return;
      }
      const recoveryError = cause as RecoveryApiError;
      setActionError(recoveryError);
      await mutate();
    } finally {
      if (detailRequestRef.current?.token === request.token) {
        detailRequestRef.current = null;
        setDetailLoadingId(null);
      }
    }
  };

  const restoreSelectedItem = async () => {
    if (!selectedItem || restoring) return;
    const request = { token: Symbol(selectedItem.id), controller: new AbortController() };
    const requestTenantScope = tenantScope;
    restoreRequestRef.current = request;
    setRestoring(true);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/admin/recuperacao/${encodeURIComponent(selectedItem.id)}/restaurar`,
        { method: "POST", cache: "no-store", signal: request.controller.signal }
      );
      const restored = await readApiResponse<RecoveryItem>(response);
      if (
        restoreRequestRef.current?.token !== request.token ||
        tenantScopeRef.current !== requestTenantScope
      ) {
        return;
      }
      setSelectedItem(null);
      setRestoredItem(restored);
      await mutate();
    } catch (cause) {
      if (
        request.controller.signal.aborted ||
        restoreRequestRef.current?.token !== request.token ||
        tenantScopeRef.current !== requestTenantScope
      ) {
        return;
      }
      setActionError(cause as RecoveryApiError);
    } finally {
      if (restoreRequestRef.current?.token === request.token) {
        restoreRequestRef.current = null;
        setRestoring(false);
      }
    }
  };

  if (meLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <LoadingList />
      </main>
    );
  }

  if (!isPresident) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="rounded-2xl border border-yellow-400/25 bg-[#202124] p-6 text-center sm:p-8">
          <ShieldCheck className="mx-auto text-yellow-300" size={38} aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold text-white">
            Acesso exclusivo do Presidente
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-300">
            Somente a Membership aprovada de Presidente da pelada ativa pode consultar e restaurar
            registros nesta Central.
          </p>
          <Link
            href="/admin/dashboard"
            className="mt-6 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-300"
          >
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
      <header className="mb-7">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-3 text-yellow-300">
            <ArchiveRestore size={28} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300/80">
              Configurações e segurança
            </p>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Central de Recuperação
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
          Excluiu ou arquivou algo por engano? Consulte os registros disponíveis e recupere suas
          informações com segurança.
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3 text-sm text-yellow-100">
          <Clock3 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          <span>
            Os itens elegíveis ficam disponíveis por até 15 dias. Esta Central não substitui um
            backup completo nem altera históricos oficiais.
          </span>
        </div>
      </header>

      <section
        className="mb-6 rounded-2xl border border-white/10 bg-[#202124] p-4 sm:p-5"
        aria-label="Filtros da Central de Recuperação"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-zinc-200">
            Categoria
            <select
              value={entityType}
              onChange={(event) => {
                setEntityType(event.target.value as RecoveryEntityType | "");
                setPage(1);
              }}
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#151618] px-3 text-sm text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            >
              {entityOptions.map((option) => (
                <option key={option.value || "ALL"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-zinc-200">
            Operação
            <select
              value={operationType}
              onChange={(event) => {
                setOperationType(event.target.value as RecoveryOperationType | "");
                setPage(1);
              }}
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#151618] px-3 text-sm text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            >
              {operationOptions.map((option) => (
                <option key={option.value || "ALL"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {actionErrorText ? (
        <Fut7InlineFeedback
          tone={actionError?.status === 409 || actionError?.status === 410 ? "warning" : "error"}
          title="Não foi possível restaurar"
          onDismiss={() => setActionError(null)}
          className="mb-5"
        >
          {actionErrorText}
        </Fut7InlineFeedback>
      ) : null}

      {isLoading ? <LoadingList /> : null}

      {!isLoading && listError ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
          <Fut7InlineFeedback tone="error" title="Falha ao carregar registros">
            {listError}
          </Fut7InlineFeedback>
          <button
            type="button"
            onClick={() => void mutate()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100 hover:bg-red-400/10"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!isLoading && !listError && !hasItems ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-12 text-center">
          <Trophy className="mx-auto text-zinc-500" size={34} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-zinc-100">
            Nenhum registro disponível para recuperação no momento.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Ajuste os filtros ou consulte novamente mais tarde.
          </p>
        </div>
      ) : null}

      {!isLoading && !listError && hasItems ? (
        <div className="space-y-3" aria-live="polite">
          {data?.items.map((item) => (
            <RecoveryCard
              key={item.id}
              item={item}
              loadingDetails={detailLoadingId === item.id}
              onRestore={(selected) => void openRestoreDialog(selected)}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !listError && (data?.total ?? 0) > PAGE_SIZE ? (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Paginação">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isValidating}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm font-bold text-zinc-200 hover:border-yellow-400/40 disabled:opacity-40"
          >
            <ChevronLeft size={17} aria-hidden="true" /> Anterior
          </button>
          <span className="text-sm text-zinc-400">
            Página <strong className="text-zinc-100">{page}</strong> de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || isValidating}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm font-bold text-zinc-200 hover:border-yellow-400/40 disabled:opacity-40"
          >
            Próxima <ChevronRight size={17} aria-hidden="true" />
          </button>
        </nav>
      ) : null}

      <div className="mt-8 text-center text-sm text-zinc-500">
        Precisa de diagnóstico operacional ou suporte assistido?{" "}
        <Link
          href="/admin/configuracoes/backup"
          className="font-semibold text-yellow-300 underline"
        >
          Acesse Backup &amp; Recuperação
        </Link>
        .
      </div>

      <Fut7ConfirmDialog
        open={Boolean(selectedItem)}
        title="Confirmar restauração"
        eyebrow="Central de Recuperação"
        description="O Fut7Pro validará novamente o prazo, o tenant e possíveis conflitos antes de concluir."
        confirmLabel="Confirmar restauração"
        cancelLabel="Cancelar"
        loading={restoring}
        onClose={() => {
          if (!restoring) setSelectedItem(null);
        }}
        onConfirm={() => void restoreSelectedItem()}
      >
        {selectedItem && selectedPresentation ? (
          <div className="space-y-3">
            {actionErrorText ? (
              <Fut7InlineFeedback
                tone={
                  actionError?.status === 409 || actionError?.status === 410 ? "warning" : "error"
                }
                title="Restauração não concluída"
              >
                {actionErrorText}
              </Fut7InlineFeedback>
            ) : null}
            <dl className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Registro</dt>
                <dd className="mt-1 font-bold text-white">{selectedItem.displayLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Tipo</dt>
                <dd className="mt-1 text-zinc-200">{selectedPresentation.singular}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Operação original</dt>
                <dd className="mt-1 text-zinc-200">{operationLabel(selectedItem.operationType)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Realizada em</dt>
                <dd className="mt-1 text-zinc-200">{formatDateTime(selectedItem.performedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Prazo restante</dt>
                <dd className="mt-1 text-yellow-200">
                  {remainingTimeLabel(selectedItem.expiresAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Fut7ConfirmDialog>

      <Fut7SuccessDialog
        open={Boolean(restoredItem)}
        title="Registro recuperado com sucesso!"
        description="A restauração foi confirmada pelo servidor. O estado anterior de arquivamento foi preservado quando aplicável."
        primaryLabel="Acessar módulo"
        secondaryLabel="Voltar à listagem"
        onPrimary={() => {
          router.push(restoredDestination);
        }}
        onSecondary={() => setRestoredItem(null)}
        onClose={() => setRestoredItem(null)}
      />
    </main>
  );
}

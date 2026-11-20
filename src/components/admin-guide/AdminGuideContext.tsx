"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, BookOpen, CheckCircle2, ChevronDown } from "lucide-react";
import { useAdminGuideController } from "./AdminGuideController";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import {
  contextualTask,
  contextOrdinal,
  contextProgress,
  contextSummary,
  GUIDE_CONTEXT,
  isRecruitingContext,
  recruitingEligibility,
  RECRUITING_CONTEXT,
} from "@/lib/admin-guide-context";
import {
  CONTEXT_LAYOUT,
  CONTEXT_READ_ERROR,
  CONTEXT_STATUSES,
  LAST_CONFIRMATION,
  contextSummaryReserves,
} from "@/lib/admin-guide-context-layout";

// O CSS mede estes textos na tipografia real. Não são conteúdo nem valores exibidos.
function Reserve({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-guide-reserve={text}
      className={`pointer-events-none invisible [grid-area:1/1] before:block before:content-[attr(data-guide-reserve)] ${className}`}
    />
  );
}
function TextSlot({
  samples,
  children,
  className = "",
}: {
  samples: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid min-w-0 ${className}`}>
      {[...new Set(samples)].map((text) => (
        <Reserve key={text} text={text} />
      ))}
      <div className="min-w-0 [grid-area:1/1]">{children}</div>
    </div>
  );
}
function Skeleton() {
  // Estático, inclusive com prefers-reduced-motion: reduce.
  return (
    <div aria-hidden="true" className="pointer-events-none relative h-0" data-guide-skeleton="true">
      <div className="absolute inset-x-0 top-1 space-y-1">
        <div className="h-1.5 w-full rounded bg-[#e8c682]/10" />
        <div className="h-1.5 w-4/5 rounded bg-[#e8c682]/10" />
      </div>
    </div>
  );
}
const DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
function ScheduleSummary({
  enabled,
  configured,
  fallback,
}: {
  enabled: boolean;
  configured: boolean;
  fallback: string | null;
}) {
  const { items, isLoading, isError } = useRachaAgenda({ enabled });
  const entries = items.filter(
    (item) =>
      Number.isInteger(item.weekday) &&
      item.weekday >= 0 &&
      item.weekday <= 6 &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)
  );
  if (!enabled || (isLoading && !entries.length)) return <Skeleton />;
  if (!configured) return fallback ? <p>{fallback}</p> : null;
  if (isError) return <p className="text-[#dfc9a7]">Consulte os horários na página abaixo.</p>;
  return entries.length ? (
    <ul
      aria-label="Horários cadastrados"
      className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-200"
    >
      {entries.map((item) => (
        <li key={item.id}>
          {DAYS[item.weekday]}, às {item.time}
        </li>
      ))}
    </ul>
  ) : null;
}
const actionClass =
  "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg border border-[#fff1cd]/70 bg-[#f8e5b7] px-3 py-2 text-[13px] font-semibold text-[#38270f] shadow-sm hover:bg-[#fff0ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8e5b7] sm:text-sm";
const hint = "Use os controles da página abaixo.";

export default function AdminGuideContext() {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const controller = useAdminGuideController();
  const state = controller?.state;
  const guide = state?.guide;
  const id = params?.get("guia") ?? "";
  const layout = Object.prototype.hasOwnProperty.call(CONTEXT_LAYOUT, id)
    ? CONTEXT_LAYOUT[id]
    : null;
  const task = guide ? contextualTask(guide, id, pathname) : null;
  const recruiting = guide ? isRecruitingContext(guide, id, pathname) : false;
  const denied = [401, 403, 404].includes(
    (state?.error as (Error & { status?: number }) | null)?.status ?? 0
  );
  // Sem resposta oficial, somente a estrutura neutra. A URL não concede ações
  // nem acesso a informações do grupo; a autorização continua nas funções acima.
  const initial = !guide && Boolean(state?.loading || state?.validating || state?.error);
  if (
    !controller?.scope ||
    !state ||
    !layout ||
    denied ||
    (guide ? !task && !recruiting : !initial || !layout.routes.includes(pathname))
  )
    return null;
  const checking = state.loading || state.validating;
  const failed = Boolean(state.error);
  const previous = Boolean(guide) && (checking || failed);
  const eligibility = recruiting && guide ? recruitingEligibility(guide) : null;
  const ready = Boolean(eligibility?.footballUnlocked);
  const completed = Boolean(task?.completed) && !checking && !failed;
  const progress = task && guide ? contextProgress(guide, task) : null;
  const label = recruiting || task?.completed ? "Continuar no Guia Interativo" : "Voltar ao guia";
  const title = recruiting ? RECRUITING_CONTEXT.title : (task?.title ?? layout.title);
  const description = guide
    ? recruiting
      ? RECRUITING_CONTEXT.summary
      : contextSummary(guide, task!)
    : null;
  const details =
    id === "FOOTBALL_PLAYERS" ? RECRUITING_CONTEXT.details : GUIDE_CONTEXT[id].details;
  const returnContent = (
    <>
      <BookOpen aria-hidden="true" size={16} className="shrink-0" />
      <span className="min-w-0">{label}</span>
    </>
  );
  return (
    <aside
      aria-label="Orientação do guia"
      aria-busy={checking}
      data-guide-context={id}
      data-guide-data-state={
        failed ? "error" : initial ? "initial" : checking ? "refreshing" : "current"
      }
      className="relative mb-5 mt-3 min-w-0 rounded-2xl border border-[#d8ad62]/35 bg-[linear-gradient(115deg,#392b1c_0%,#2c231a_55%,#352719_100%)] p-4 pt-5 text-[#fff7e9] shadow-[0_6px_24px_-16px_rgba(212,153,52,0.45)] sm:px-5"
    >
      <div className="flex min-h-4 items-center justify-between gap-2 text-[11px]">
        <span className="absolute -top-3 left-3 inline-flex items-center gap-2 rounded-lg rounded-br-2xl border border-[#ffe5a5]/60 bg-[#e8c682] px-2.5 py-1 text-[11px] font-semibold text-[#38270f] shadow-sm sm:left-5 sm:px-3">
          <BookOpen aria-hidden="true" size={16} className="shrink-0" />
          Guia Interativo Fut7Pro
        </span>
        <TextSlot samples={[LAST_CONFIRMATION]} className="text-[#dfc9a7]">
          {previous && <span>{LAST_CONFIRMATION}</span>}
        </TextSlot>
        <span className="text-[#dfc9a7]">
          {id === "FOOTBALL_PLAYERS" ? "Apoio à Fase 2" : contextOrdinal(id)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <TextSlot samples={[layout.title, title]} className="text-base font-semibold">
          {guide ? (
            <h2>{title}</h2>
          ) : (
            <div aria-hidden="true" className="mt-1 h-3 w-4/5 rounded bg-[#e8c682]/10" />
          )}
        </TextSlot>
        <span className="grid max-w-full text-xs">
          {CONTEXT_STATUSES.map((text) => (
            <Reserve key={text} text={text} className="px-2 py-0.5" />
          ))}
          <span
            role="status"
            aria-live="polite"
            className={`inline-flex max-w-full items-center gap-1.5 justify-self-start rounded-full px-2 py-0.5 [grid-area:1/1] ${completed || (ready && !checking && !failed) ? "bg-emerald-950/50 text-emerald-200 ring-1 ring-inset ring-emerald-300/25" : "bg-black/15 text-[#e5cfac]"}`}
          >
            {(completed || (ready && !checking && !failed)) && (
              <CheckCircle2 size={14} aria-hidden="true" className="shrink-0" />
            )}
            {checking
              ? "Verificando progresso..."
              : failed
                ? "Não foi possível verificar o progresso"
                : recruiting
                  ? ready
                    ? "Requisito atendido"
                    : "Reunindo jogadores"
                  : completed
                    ? "Etapa concluída!"
                    : "Em andamento"}
          </span>
        </span>
      </div>
      <TextSlot
        samples={contextSummaryReserves(id)}
        className="mt-2 max-w-3xl text-sm leading-relaxed text-[#eadac3]"
      >
        {description ? (
          <p>{description}</p>
        ) : failed ? (
          <p>{CONTEXT_READ_ERROR}</p>
        ) : (
          <>
            <span className="sr-only">Aguarde a confirmação dos dados salvos no grupo.</span>
            <Skeleton />
          </>
        )}
      </TextSlot>
      {layout.progress && (
        <TextSlot
          samples={[layout.progress, ...(progress ? [progress] : [])]}
          className="mt-2 text-sm text-[#f5e8d2]"
        >
          {id === "SCHEDULE" ? (
            <ScheduleSummary
              enabled={Boolean(guide)}
              configured={guide?.operationalState.agendaConfigured === true}
              fallback={progress}
            />
          ) : !guide ? (
            <Skeleton />
          ) : progress ? (
            <p>{progress}</p>
          ) : (
            <p className="text-[#dfc9a7]">O progresso detalhado não está disponível.</p>
          )}
        </TextSlot>
      )}
      {id === "FOOTBALL_PLAYERS" && (
        <section
          aria-label="Requisito de atletas da Fase 2"
          className="mt-3 max-w-md rounded-lg border border-[#d8ad62]/25 px-3 py-2"
        >
          <TextSlot
            samples={["Mínimo de atletas elegíveis atingido", "Faltam atletas para liberar"]}
            className="text-xs text-[#f5e8d2]"
          >
            {eligibility ? (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span>
                  {eligibility.missingPlayers === 0
                    ? "Mínimo de atletas elegíveis atingido"
                    : `${eligibility.missingPlayers === 1 ? "Falta 1 atleta" : `Faltam ${eligibility.missingPlayers} atletas`} para liberar`}
                </span>
                <span className="tabular-nums">
                  {eligibility.eligiblePlayers} / {eligibility.minimumPlayers}
                </span>
              </div>
            ) : guide ? (
              <p>
                A contagem de atletas elegíveis não está disponível. Tente atualizar o progresso.
              </p>
            ) : (
              <Skeleton />
            )}
          </TextSlot>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
            {...(eligibility
              ? {
                  role: "progressbar",
                  "aria-label": "Atletas elegíveis para a Fase 2",
                  "aria-valuemin": 0,
                  "aria-valuemax": eligibility.minimumPlayers,
                  "aria-valuenow": Math.min(
                    eligibility.eligiblePlayers,
                    eligibility.minimumPlayers
                  ),
                  "aria-valuetext": `${previous ? LAST_CONFIRMATION : ""}${eligibility.eligiblePlayers} de ${eligibility.minimumPlayers} atletas elegíveis`,
                }
              : { "aria-hidden": true as const })}
          >
            {eligibility && (
              <div
                className="h-full rounded-full bg-[#e8c682]"
                style={{
                  width: `${Math.min(100, (100 * eligibility.eligiblePlayers) / eligibility.minimumPlayers)}%`,
                }}
              />
            )}
          </div>
        </section>
      )}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-5 gap-y-1">
        <div className="group min-w-0 flex-1 basis-56 text-sm">
          {guide ? (
            <details className="group" key={`${controller.scope}:${id}:${pathname}`}>
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[#d8bd94] hover:text-[#fff7e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f8e5b7]">
                Ver instruções detalhadas
                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <ol className="mt-1 list-decimal space-y-2 pl-5 text-[#eadac3]">
                {details.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            </details>
          ) : (
            <div aria-hidden="true" className="flex min-h-11 items-center">
              <div className="h-2 w-40 rounded bg-[#e8c682]/10" />
            </div>
          )}
        </div>
        <div className="grid max-w-full">
          <div
            aria-hidden="true"
            className="pointer-events-none invisible flex min-h-11 max-w-full items-center gap-2 [grid-area:1/1]"
          >
            <span className={`${actionClass} min-w-0 flex-1`}>
              <BookOpen size={16} className="shrink-0" />
              <Reserve text="Continuar no Guia Interativo" />
            </span>
            <span className="w-min text-xs">Tentar novamente</span>
          </div>
          <div className="flex min-h-11 min-w-0 max-w-full items-center gap-2 [grid-area:1/1]">
            {guide ? (
              params?.get("guiaOrigem") === "pagina" ? (
                <Link
                  className={`${actionClass} ${failed ? "min-w-0 flex-1" : ""}`}
                  href="/admin/guia-fut7pro"
                >
                  {returnContent}
                </Link>
              ) : (
                <button
                  type="button"
                  className={`${actionClass} ${failed ? "min-w-0 flex-1" : ""}`}
                  onClick={controller.openGuide}
                >
                  {returnContent}
                </button>
              )
            ) : (
              <div aria-hidden="true" className="min-h-11 w-48 rounded-lg bg-[#e8c682]/10" />
            )}
            {failed && (
              <button
                type="button"
                className="min-h-11 w-min shrink-0 text-xs text-yellow-200 underline"
                onClick={() => void state.retry().catch(() => undefined)}
              >
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 grid text-xs leading-relaxed text-[#d8bd94]">
        <div
          aria-hidden="true"
          className="pointer-events-none invisible flex items-start gap-2 border-t border-[#d8ad62]/15 pt-2 [grid-area:1/1]"
        >
          <ArrowDown size={14} className="mt-0.5 shrink-0" />
          <span data-guide-reserve={hint} className="before:content-[attr(data-guide-reserve)]" />
        </div>
        {guide && (recruiting ? !ready : !task!.completed) && (
          <p className="flex items-start gap-2 border-t border-[#d8ad62]/15 pt-2 [grid-area:1/1]">
            <ArrowDown aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
            {hint}
          </p>
        )}
      </div>
    </aside>
  );
}

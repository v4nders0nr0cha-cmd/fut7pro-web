"use client";
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
const DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
function ScheduleSummary({ visible }: { visible: boolean }) {
  // A mesma chave da página compartilha a leitura, isolada por administrador e grupo.
  const { items, isLoading, isError } = useRachaAgenda();
  if (!visible || isLoading || isError) return null;
  const entries = items.filter(
    (item) =>
      Number.isInteger(item.weekday) &&
      item.weekday >= 0 &&
      item.weekday <= 6 &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)
  );
  if (!entries.length) return null;
  return (
    <ul
      aria-label="Horários cadastrados"
      className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-200"
    >
      {entries.map((item) => (
        <li key={item.id}>
          {DAYS[item.weekday]}, às {item.time}
        </li>
      ))}
    </ul>
  );
}
export default function AdminGuideContext() {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const controller = useAdminGuideController();
  const state = controller?.state;
  const guide = state?.guide;
  const task = guide ? contextualTask(guide, params?.get("guia") ?? null, pathname) : null;
  const recruiting = guide
    ? isRecruitingContext(guide, params?.get("guia") ?? null, pathname)
    : false;
  if (!controller?.scope || !guide || !state || (!task && !recruiting)) return null;
  const checking = state.loading || state.validating;
  const failed = Boolean(state.error);
  const eligibility = recruiting && !checking && !failed ? recruitingEligibility(guide) : null;
  const recruitingReady = Boolean(eligibility?.footballUnlocked);
  const completed = !recruiting && task!.completed && !checking && !failed;
  const contextKey = recruiting ? "FOOTBALL_PLAYERS" : task!.id;
  const details = recruiting ? RECRUITING_CONTEXT.details : GUIDE_CONTEXT[task!.id].details;
  const progress = !recruiting && !checking && !failed ? contextProgress(guide, task!) : null;
  const label = recruiting || completed ? "Continuar no Guia Interativo" : "Voltar ao guia";
  const actionClass =
    "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg border border-[#fff1cd]/70 bg-[#f8e5b7] px-3 py-2 text-[13px] font-semibold text-[#38270f] shadow-sm hover:bg-[#fff0ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8e5b7] sm:text-sm";
  return (
    <aside
      aria-label="Orientação do guia"
      className="relative mb-5 mt-3 min-w-0 rounded-2xl border border-[#d8ad62]/35 bg-[linear-gradient(115deg,#392b1c_0%,#2c231a_55%,#352719_100%)] p-4 pt-5 text-[#fff7e9] shadow-[0_6px_24px_-16px_rgba(212,153,52,0.45)] sm:px-5"
    >
      <div className="flex min-h-4 items-center justify-end text-[11px]">
        <span className="absolute -top-3 left-3 inline-flex items-center gap-2 rounded-lg rounded-br-2xl border border-[#ffe5a5]/60 bg-[#e8c682] px-2.5 py-1 text-[11px] font-semibold text-[#38270f] shadow-sm sm:left-5 sm:px-3">
          <BookOpen aria-hidden="true" size={16} className="shrink-0" />
          Guia Interativo Fut7Pro
        </span>
        <span className="text-[#dfc9a7]">
          {recruiting ? "Apoio à Fase 2" : contextOrdinal(task!.id)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold">
          {recruiting ? RECRUITING_CONTEXT.title : task!.title}
        </h2>
        <span
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${completed || recruitingReady ? "bg-emerald-950/50 text-emerald-200 ring-1 ring-inset ring-emerald-300/25" : "bg-black/15 text-[#e5cfac]"}`}
        >
          {(completed || recruitingReady) && <CheckCircle2 size={14} aria-hidden="true" />}
          {checking
            ? "Verificando progresso..."
            : failed
              ? "Não foi possível verificar o progresso"
              : recruiting
                ? recruitingReady
                  ? "Requisito atendido"
                  : "Reunindo jogadores"
                : completed
                  ? "Etapa concluída!"
                  : "Em andamento"}
        </span>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#eadac3]">
        {checking
          ? "Aguarde a confirmação dos dados salvos no grupo."
          : failed
            ? "Tente novamente para conferir o progresso. Você pode continuar utilizando esta página."
            : recruiting
              ? RECRUITING_CONTEXT.summary
              : contextSummary(guide, task!)}
      </p>
      {progress && <p className="mt-2 text-sm text-[#f5e8d2]">{progress}</p>}
      {recruiting &&
        !checking &&
        !failed &&
        (eligibility ? (
          <section
            aria-label="Requisito de atletas da Fase 2"
            className="mt-3 max-w-md rounded-lg border border-[#d8ad62]/25 px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#f5e8d2]">
              <span>
                {eligibility.missingPlayers === 0
                  ? "Mínimo de atletas elegíveis atingido"
                  : `${eligibility.missingPlayers === 1 ? "Falta 1 atleta" : `Faltam ${eligibility.missingPlayers} atletas`} para liberar`}
              </span>
              <span className="tabular-nums">
                {eligibility.eligiblePlayers} / {eligibility.minimumPlayers}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Atletas elegíveis para a Fase 2"
              aria-valuemin={0}
              aria-valuemax={eligibility.minimumPlayers}
              aria-valuenow={Math.min(eligibility.eligiblePlayers, eligibility.minimumPlayers)}
              aria-valuetext={`${eligibility.eligiblePlayers} de ${eligibility.minimumPlayers} atletas elegíveis`}
              className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-[#e8c682]"
                style={{
                  width: `${Math.min(100, (100 * eligibility.eligiblePlayers) / eligibility.minimumPlayers)}%`,
                }}
              />
            </div>
          </section>
        ) : (
          <p role="status" className="mt-2 text-xs text-[#dfc9a7]">
            A contagem de atletas elegíveis não está disponível. Tente atualizar o progresso.
          </p>
        ))}
      {task?.id === "SCHEDULE" && (
        <ScheduleSummary
          visible={!checking && !failed && guide.operationalState.agendaConfigured === true}
        />
      )}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-5 gap-y-1">
        <details
          key={`${controller.scope}:${contextKey}:${pathname}`}
          className="group min-w-0 flex-1 basis-56 text-sm"
        >
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[#d8bd94] hover:text-[#fff7e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f8e5b7]">
            Ver instruções detalhadas
            <ChevronDown
              aria-hidden="true"
              size={14}
              className="transition-transform group-open:rotate-180"
            />
          </summary>
          <ol className="mt-1 list-decimal space-y-2 pl-5 text-[#eadac3]">
            {details.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </details>
        <div className="flex flex-wrap items-center gap-4">
          {failed && (
            <button
              type="button"
              className="min-h-11 text-sm text-yellow-200 underline"
              onClick={() => void state.retry().catch(() => undefined)}
            >
              Tentar novamente
            </button>
          )}
          {params?.get("guiaOrigem") === "pagina" ? (
            <Link className={actionClass} href="/admin/guia-fut7pro">
              <BookOpen aria-hidden="true" size={16} className="shrink-0" />
              {label}
            </Link>
          ) : (
            <button type="button" className={actionClass} onClick={controller.openGuide}>
              <BookOpen aria-hidden="true" size={16} className="shrink-0" />
              {label}
            </button>
          )}
        </div>
      </div>
      {(recruiting ? !recruitingReady : !task!.completed) && !checking && !failed && (
        <p className="mt-2 flex items-start gap-2 border-t border-[#d8ad62]/15 pt-2 text-xs leading-relaxed text-[#d8bd94]">
          <ArrowDown aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          Use os controles da página abaixo.
        </p>
      )}
    </aside>
  );
}

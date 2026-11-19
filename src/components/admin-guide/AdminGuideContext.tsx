"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, ChevronDown } from "lucide-react";
import { useAdminGuideController } from "./AdminGuideController";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import {
  contextualTask,
  contextOrdinal,
  contextProgress,
  contextSummary,
  GUIDE_CONTEXT,
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
  if (!controller?.scope || !guide || !state || !task) return null;
  const checking = state.loading || state.validating;
  const failed = Boolean(state.error);
  const completed = task.completed && !checking && !failed;
  const progress = !checking && !failed ? contextProgress(guide, task) : null;
  const label = completed ? "Continuar no Guia Interativo" : "Voltar ao guia";
  const actionClass = completed
    ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
    : "inline-flex min-h-11 items-center text-sm font-medium text-yellow-200 underline decoration-yellow-200/30 underline-offset-4 hover:decoration-yellow-200";
  return (
    <aside
      aria-label="Orientação do guia"
      className="mb-5 min-w-0 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-[#202228] p-4 text-zinc-100 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-2 font-semibold text-yellow-200">
          <BookOpen aria-hidden="true" size={17} />
          Guia Interativo Fut7Pro
        </span>
        <span className="text-zinc-400">{contextOrdinal(task.id)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold">{task.title}</h2>
        <span
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 text-xs ${completed ? "text-emerald-300" : "text-zinc-400"}`}
        >
          {completed && <CheckCircle2 size={14} aria-hidden="true" />}
          {checking
            ? "Verificando progresso..."
            : failed
              ? "Não foi possível verificar o progresso"
              : completed
                ? "Etapa concluída!"
                : "Em andamento"}
        </span>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
        {checking
          ? "Aguarde a confirmação dos dados salvos no grupo."
          : failed
            ? "Tente novamente para conferir o progresso. Você pode continuar utilizando esta página."
            : contextSummary(guide, task)}
      </p>
      {progress && <p className="mt-2 text-sm text-zinc-200">{progress}</p>}
      {task.id === "SCHEDULE" && (
        <ScheduleSummary
          visible={!checking && !failed && guide.operationalState.agendaConfigured === true}
        />
      )}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
        <details
          key={`${controller.scope}:${task.id}:${pathname}`}
          className="group min-w-0 flex-1 basis-56 text-sm"
        >
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-zinc-400 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">
            Ver instruções detalhadas
            <ChevronDown
              aria-hidden="true"
              size={14}
              className="transition-transform group-open:rotate-180"
            />
          </summary>
          <ol className="mt-1 list-decimal space-y-2 pl-5 text-zinc-300">
            {GUIDE_CONTEXT[task.id].details.map((instruction) => (
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
              {label}
            </Link>
          ) : (
            <button type="button" className={actionClass} onClick={controller.openGuide}>
              {label}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

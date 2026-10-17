"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Circle, LockKeyhole, Sparkles } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import AdminGuidePreparationSection from "@/components/admin-guide/AdminGuidePreparationSection";
import AdminGuideFirstMatchSection from "@/components/admin-guide/AdminGuideFirstMatchSection";
import { guideDestination, nextGuideDestination } from "@/lib/admin-guide-navigation";
import type { AdminGuideTask } from "@/types/admin-guide";

const PREPARATION_IDS = new Set([
  "PUBLIC_SITE",
  "IDENTITY",
  "SCHEDULE",
  "ACTIVE_PLAYERS",
  "OFFICIAL_TEAMS",
]);

const FIRST_MATCH_IDS = new Set(["ATHLETE_LEVELS", "MONTHLY_MODEL", "FIRST_MATCHDAY"]);
const FOLLOWING_INITIAL_IDS = new Set(["RESULTS_RECORDED", "CHAMPION_PUBLISHED"]);

const REQUIREMENT_LABEL: Record<AdminGuideTask["requirement"], string> = {
  REQUIRED: "Etapa da ativação",
  RECOMMENDED: "Recomendado",
  OPTIONAL: "Opcional",
  CONDITIONAL: "Conforme sua escolha",
};

function TaskList({
  title,
  tasks,
  guide,
  onPublicSiteOpen,
}: {
  title: string;
  tasks: AdminGuideTask[];
  guide: NonNullable<ReturnType<typeof useAdminGuide>["guide"]>;
  onPublicSiteOpen: () => void;
}) {
  if (!tasks.length) return null;
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <ul className="grid gap-3">
        {tasks.map((task) => {
          const destination = guideDestination(guide, task);
          const Icon = task.completed ? CheckCircle2 : task.canAct ? Circle : LockKeyhole;
          const status = task.completed
            ? "Concluído"
            : task.canAct
              ? "Pendente"
              : "Sem permissão para executar";
          return (
            <li
              key={task.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Icon
                  size={21}
                  className={task.completed ? "text-yellow-300" : "text-zinc-400"}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="mt-1 text-sm text-zinc-300">
                    {status} · {REQUIREMENT_LABEL[task.requirement]}
                  </p>
                </div>
              </div>
              {destination && !task.completed && (
                <Link
                  href={destination}
                  target={task.id === "PUBLIC_SITE" ? "_blank" : undefined}
                  rel={task.id === "PUBLIC_SITE" ? "noopener noreferrer" : undefined}
                  onClick={task.id === "PUBLIC_SITE" ? onPublicSiteOpen : undefined}
                  className="rounded-lg border border-yellow-400/50 px-3 py-2 text-center text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                >
                  Acessar funcionalidade
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function AdminGuideClient() {
  const { guide, loading, error, actionError, updating, retry, update } = useAdminGuide();

  return (
    <main className="w-full min-w-0 px-4 pb-24 pt-20 text-white md:px-6 md:pb-10 md:pt-7">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="flex items-start gap-3">
          <BookOpen className="mt-1 shrink-0 text-yellow-300" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Guia Fut7Pro</h1>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">
              Acompanhe a preparação da pelada e encontre o próximo passo para sua função.
            </p>
          </div>
        </header>

        {loading && !guide ? (
          <p role="status" className="rounded-xl bg-[#23272F] p-5 text-zinc-300">
            Carregando seu Guia...
          </p>
        ) : !guide ? (
          <section className="rounded-xl border border-white/10 bg-[#23272F] p-5">
            <p>
              {error?.status === 403
                ? "O Guia está disponível somente para administradores aprovados desta pelada."
                : error?.status === 401
                  ? "Sua sessão expirou. Entre novamente para acessar o Guia."
                  : "Não foi possível carregar o Guia Fut7Pro agora."}
            </p>
            {error?.status === 401 ? (
              <Link href="/admin/login" className="mt-3 inline-block text-yellow-300 underline">
                Entrar novamente
              </Link>
            ) : error?.status !== 403 ? (
              <button
                type="button"
                onClick={() => void retry()}
                className="mt-3 rounded-lg border border-yellow-400/50 px-3 py-2 text-yellow-200 hover:bg-yellow-400/10"
              >
                Tentar novamente
              </button>
            ) : null}
          </section>
        ) : (
          <>
            {error && (
              <section
                className="rounded-xl border border-yellow-400/20 bg-[#23272F] p-4 text-sm text-zinc-300"
                role="status"
              >
                <p>
                  Não foi possível atualizar o Guia Fut7Pro. As informações anteriores continuam
                  disponíveis.
                </p>
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="mt-2 font-semibold text-yellow-200 underline"
                >
                  Tentar novamente
                </button>
              </section>
            )}
            {!guide.pedagogicalState.welcomeSeenAt && (
              <section className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-5">
                <h2 className="text-lg font-bold text-yellow-200">Bem-vindo ao Guia Fut7Pro!</h2>
                <p className="mt-2 text-sm text-zinc-200">
                  {guide.activationProgress.complete
                    ? "Sua pelada já concluiu a jornada inicial. Consulte as etapas e conheça os recursos da sua função."
                    : "Vamos acompanhar os primeiros jogos e mostrar os recursos úteis para sua função."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => void update({ action: "WELCOME_SEEN" })}
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
                  >
                    Começar
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => void update({ action: "WELCOME_SEEN" })}
                    className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
                  >
                    Agora não
                  </button>
                </div>
              </section>
            )}
            {actionError && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/30 p-3 text-sm text-red-200"
              >
                {actionError.status === 409
                  ? "O Guia mudou em outra sessão. Confira o estado atualizado e tente novamente."
                  : "Não foi possível salvar sua escolha. Tente novamente."}
              </p>
            )}
            <section className="rounded-xl border border-yellow-400/25 bg-[#23272F] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Sua jornada</h2>
                  <p className="mt-1 text-sm text-zinc-300">
                    {guide.activationProgress.completed} de {guide.activationProgress.total} etapas
                    concluídas.
                  </p>
                </div>
                <span className="text-2xl font-bold text-yellow-300">
                  {guide.activationProgress.percentage}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Progresso da ativação inicial"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={guide.activationProgress.percentage}
                className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-700"
              >
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: `${Math.max(0, Math.min(100, guide.activationProgress.percentage))}%`,
                  }}
                />
              </div>
              {guide.activationProgress.complete && (
                <p className="mt-3 text-sm text-yellow-200">
                  A ativação inicial está concluída. As orientações adicionais continuam
                  disponíveis.
                </p>
              )}
            </section>
            <section className="rounded-xl border border-white/10 bg-[#23272F] p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 shrink-0 text-yellow-300" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold">Próximo passo</h2>
                  <p className="mt-2 text-zinc-200">
                    {guide.nextAction?.title ||
                      (guide.activationProgress.complete
                        ? "Sua jornada inicial está concluída. Você pode consultar o Guia quando quiser."
                        : "Nenhuma ação disponível para sua função no momento.")}
                  </p>
                  {nextGuideDestination(guide) && (
                    <Link
                      href={nextGuideDestination(guide)!}
                      target={guide.nextAction?.taskId === "PUBLIC_SITE" ? "_blank" : undefined}
                      rel={
                        guide.nextAction?.taskId === "PUBLIC_SITE"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      onClick={
                        guide.nextAction?.taskId === "PUBLIC_SITE"
                          ? () => void update({ action: "PUBLIC_SITE_OPENED" })
                          : undefined
                      }
                      className="mt-4 inline-block rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
                    >
                      Continuar
                    </Link>
                  )}
                </div>
              </div>
            </section>
            <AdminGuidePreparationSection
              guide={guide}
              onPublicSiteOpen={() => void update({ action: "PUBLIC_SITE_OPENED" })}
            />
            <AdminGuideFirstMatchSection guide={guide} updating={updating} update={update} />
            <TaskList
              title="Próximas etapas da ativação"
              tasks={guide.tasks.filter((task) => FOLLOWING_INITIAL_IDS.has(task.id))}
              guide={guide}
              onPublicSiteOpen={() => void update({ action: "PUBLIC_SITE_OPENED" })}
            />
            <TaskList
              title="Orientações adicionais"
              tasks={guide.tasks.filter(
                (task) =>
                  !PREPARATION_IDS.has(task.id) &&
                  !FIRST_MATCH_IDS.has(task.id) &&
                  !FOLLOWING_INITIAL_IDS.has(task.id) &&
                  task.applicable
              )}
              guide={guide}
              onPublicSiteOpen={() => void update({ action: "PUBLIC_SITE_OPENED" })}
            />
            <section className="rounded-xl border border-white/10 bg-[#23272F] p-5">
              <h2 className="text-xl font-bold">Outros recursos</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Depois da jornada inicial, você poderá explorar outros recursos disponíveis para sua
                função. Essas sugestões não alteram o progresso da ativação.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

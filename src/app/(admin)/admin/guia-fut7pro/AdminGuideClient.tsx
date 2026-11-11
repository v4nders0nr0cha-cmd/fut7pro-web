"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, ChevronDown, Circle, LockKeyhole, Sparkles } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import AdminGuidePreparationSection from "@/components/admin-guide/AdminGuidePreparationSection";
import AdminGuideFirstMatchSection from "@/components/admin-guide/AdminGuideFirstMatchSection";
import AdminGuidePostMatchSection from "@/components/admin-guide/AdminGuidePostMatchSection";
import AdminGuideResourcesSection from "@/components/admin-guide/AdminGuideResourcesSection";
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
const POST_MATCH_IDS = new Set(["RESULTS_RECORDED", "MATCHES_FINISHED", "CHAMPION_PUBLISHED"]);

type GuideTopic = "preparation" | "games" | "post-match" | "resources";

const GUIDE_TOPICS: Array<{ key: GuideTopic; label: string; description: string }> = [
  {
    key: "preparation",
    label: "Preparação do grupo",
    description: "Jogadores, times e recomendações",
  },
  { key: "games", label: "Jogos", description: "Modalidades e organização das partidas" },
  {
    key: "post-match",
    label: "Depois do jogo",
    description: "Resultados e reconhecimento dos atletas",
  },
  { key: "resources", label: "Outros recursos", description: "Recursos opcionais para explorar" },
];

function GuideTopicPanel({
  topic,
  complete,
  expanded,
  onToggle,
  children,
}: {
  topic: (typeof GUIDE_TOPICS)[number];
  complete: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const id = `guide-${topic.key}`;
  if (!complete)
    return (
      <div id={id} className="scroll-mt-24">
        {children}
      </div>
    );

  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-xl border bg-[#23272F] ${expanded ? "border-yellow-400/30 shadow-lg shadow-black/10" : "border-white/10"}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        onClick={onToggle}
        className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-white hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 ${expanded ? "rounded-t-xl" : "rounded-xl"}`}
      >
        <span>
          <strong className="block text-base">{topic.label}</strong>
          <span className="block text-xs text-zinc-300">{topic.description}</span>
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`shrink-0 text-yellow-300 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={`${id}-content`}
        className={
          expanded ? "space-y-6 rounded-b-xl border-t border-white/15 bg-[#2B313B] p-4 sm:p-5" : ""
        }
      >
        {expanded && children}
      </div>
    </section>
  );
}

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
  const [expandedTopics, setExpandedTopics] = useState<Record<GuideTopic, boolean>>({
    preparation: false,
    games: false,
    "post-match": false,
    resources: false,
  });
  const openTopic = (key: GuideTopic) =>
    setExpandedTopics((current) => ({ ...current, [key]: true }));
  const toggleTopic = (key: GuideTopic) =>
    setExpandedTopics((current) => ({ ...current, [key]: !current[key] }));
  const started = Boolean(guide?.pedagogicalState.welcomeSeenAt);
  const updateAfterStart = (action: Parameters<typeof update>[0]) =>
    started ? update(action) : Promise.resolve(false);
  const canRecordVisit = () => {
    if (started) void update({ action: "PUBLIC_SITE_OPENED" });
  };

  return (
    <main className="w-full min-w-0 px-4 pb-24 pt-20 text-white md:px-6 md:pb-10 md:pt-7">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="flex items-start gap-3">
          <BookOpen className="mt-1 shrink-0 text-yellow-300" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Guia Fut7Pro</h1>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">
              Acompanhe a preparação do grupo e encontre o próximo passo para sua função.
            </p>
          </div>
        </header>

        {guide && (
          <nav aria-label="Assuntos do Guia" className="flex flex-wrap gap-2 text-sm">
            {GUIDE_TOPICS.map((topic) => (
              <a
                key={topic.key}
                href={`#guide-${topic.key}`}
                onClick={() => openTopic(topic.key)}
                className="rounded-full border border-white/20 px-3 py-2 text-zinc-200 hover:border-yellow-400/60 hover:text-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                {topic.label}
              </a>
            ))}
          </nav>
        )}

        {loading && !guide ? (
          <p role="status" className="rounded-xl bg-[#23272F] p-5 text-zinc-300">
            Carregando seu Guia...
          </p>
        ) : !guide ? (
          <section className="rounded-xl border border-white/10 bg-[#23272F] p-5">
            <p>
              {error?.status === 403
                ? "O Guia está disponível somente para administradores aprovados deste grupo."
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
                    ? "Seu grupo já concluiu o primeiro ciclo. Consulte as etapas e conheça os recursos da sua função."
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
                  <Link
                    href="/admin/dashboard"
                    className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Agora não
                  </Link>
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
            {!guide.activationProgress.complete &&
              !guide.pedagogicalState.dashboardInviteDismissedAt && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => void update({ action: "DASHBOARD_INVITE_DISMISSED" })}
                    className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60"
                  >
                    Ocultar guia da Dashboard
                  </button>
                </div>
              )}
            <section className="rounded-xl border border-yellow-400/25 bg-[#23272F] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Primeiro ciclo do grupo</h2>
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
                aria-label="Progresso do primeiro ciclo do grupo"
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
                <div className="mt-3 text-sm text-yellow-200">
                  <p className="font-semibold">Seu primeiro ciclo está concluído!</p>
                  <p className="mt-1 text-zinc-200">
                    As 5 etapas essenciais foram concluídas. Continue organizando os próximos jogos
                    e acompanhando as partidas atuais.
                  </p>
                </div>
              )}
            </section>
            {guide.activationProgress.complete && (
              <div className="flex flex-wrap gap-2">
                {guide.capabilities.manageMatchesAndResults && (
                  <Link
                    href="/admin/partidas/criar"
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
                  >
                    Organizar próximo jogo
                  </Link>
                )}
                <Link
                  href="/admin/partidas/historico"
                  className="rounded-lg border border-yellow-400/50 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10"
                >
                  Ver partidas e resultados
                </Link>
              </div>
            )}
            {!guide.activationProgress.complete && guide.nextAction && (
              <section className="rounded-xl border border-white/10 bg-[#23272F] p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 shrink-0 text-yellow-300" aria-hidden="true" />
                  <div>
                    <h2 className="text-xl font-bold">Próximo passo</h2>
                    <p className="mt-2 text-zinc-200">{guide.nextAction.title}</p>
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
            )}
            {!guide.activationProgress.complete && !guide.nextAction && (
              <p className="rounded-xl border border-white/10 bg-[#23272F] p-4 text-sm text-zinc-300">
                Os próximos marcos dependem de administradores autorizados do grupo. Você pode
                acompanhar o progresso e consultar as orientações abaixo.
              </p>
            )}
            <GuideTopicPanel
              topic={GUIDE_TOPICS[0]}
              complete={guide.activationProgress.complete}
              expanded={expandedTopics.preparation}
              onToggle={() => toggleTopic("preparation")}
            >
              <AdminGuidePreparationSection guide={guide} onPublicSiteOpen={canRecordVisit} />
            </GuideTopicPanel>
            <GuideTopicPanel
              topic={GUIDE_TOPICS[1]}
              complete={guide.activationProgress.complete}
              expanded={expandedTopics.games}
              onToggle={() => toggleTopic("games")}
            >
              <AdminGuideFirstMatchSection
                guide={guide}
                updating={updating || !started}
                update={update}
              />
            </GuideTopicPanel>
            <GuideTopicPanel
              topic={GUIDE_TOPICS[2]}
              complete={guide.activationProgress.complete}
              expanded={expandedTopics["post-match"]}
              onToggle={() => toggleTopic("post-match")}
            >
              <AdminGuidePostMatchSection guide={guide} />
            </GuideTopicPanel>
            <GuideTopicPanel
              topic={GUIDE_TOPICS[3]}
              complete={guide.activationProgress.complete}
              expanded={expandedTopics.resources}
              onToggle={() => toggleTopic("resources")}
            >
              <TaskList
                title="Orientações adicionais"
                tasks={guide.tasks.filter(
                  (task) =>
                    !PREPARATION_IDS.has(task.id) &&
                    !FIRST_MATCH_IDS.has(task.id) &&
                    !POST_MATCH_IDS.has(task.id) &&
                    task.applicable
                )}
                guide={guide}
                onPublicSiteOpen={canRecordVisit}
              />
              <AdminGuideResourcesSection
                guide={guide}
                updating={updating || !started}
                update={updateAfterStart}
              />
            </GuideTopicPanel>
          </>
        )}
      </div>
    </main>
  );
}

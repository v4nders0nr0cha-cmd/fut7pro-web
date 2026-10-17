"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Globe2, Palette, UsersRound, Users2 } from "lucide-react";
import { guideDestination } from "@/lib/admin-guide-navigation";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const PREPARATION = [
  {
    id: "PUBLIC_SITE",
    description:
      "Sua pelada já possui um site próprio no Fut7Pro. Conheça o espaço onde os jogadores poderão acompanhar as informações do grupo.",
    action: "Ver meu site",
    details: "Esta visita é opcional e não impede a preparação das partidas.",
    icon: Globe2,
  },
  {
    id: "IDENTITY",
    description:
      "Deixe o site com a identidade da sua pelada, utilizando seu logotipo e as opções de personalização disponíveis.",
    action: "Personalizar identidade",
    details: "A identidade é reconhecida quando há um logotipo ou um tema personalizado.",
    icon: Palette,
  },
  {
    id: "SCHEDULE",
    description:
      "Informe quando a pelada costuma acontecer para facilitar a organização dos próximos encontros.",
    action: "Configurar horários",
    details: "A agenda habitual ajuda na organização, mas não é obrigatória para criar partidas.",
    icon: CalendarDays,
  },
  {
    id: "ACTIVE_PLAYERS",
    description:
      "Cadastre os jogadores da sua pelada ou oriente seus amigos a criar uma conta e solicitar entrada no grupo.",
    action: "Gerenciar jogadores",
    details:
      "Você pode cadastrar jogadores manualmente ou aprovar solicitações de entrada na página de jogadores, conforme suas permissões. Solicitações pendentes não contam como jogadores ativos.",
    icon: UsersRound,
  },
  {
    id: "OFFICIAL_TEAMS",
    description:
      "Cadastre pelo menos dois times para organizar as partidas da sua pelada. Eles serão utilizados na criação dos jogos e nos sorteios.",
    action: "Gerenciar Times",
    details:
      "Times oficiais são cadastrados em Gerenciar Times. Os times do dia são as equipes e os jogadores organizados para cada encontro ou sorteio.",
    icon: Users2,
  },
] as const;

const REQUIREMENT_LABEL: Record<AdminGuideTask["requirement"], string> = {
  REQUIRED: "Necessário para preparar jogos",
  RECOMMENDED: "Recomendado",
  OPTIONAL: "Opcional",
  CONDITIONAL: "Conforme sua escolha",
};

function operationalCount(guide: AdminGuideData, key: string): number | null {
  const value = guide.operationalState[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function currentState(guide: AdminGuideData, task: AdminGuideTask): string {
  if (task.id === "ACTIVE_PLAYERS") {
    const count = operationalCount(guide, "activeHumanPlayers");
    if (count === 0) return "Você ainda não possui jogadores ativos cadastrados nesta pelada.";
    if (count !== null)
      return `${count} ${count === 1 ? "jogador ativo" : "jogadores ativos"} nesta pelada. Você pode continuar cadastrando outros quando precisar.`;
  }
  if (task.id === "OFFICIAL_TEAMS") {
    const count = operationalCount(guide, "activeOfficialTeams");
    if (count !== null)
      return `${count} ${count === 1 ? "time oficial ativo" : "times oficiais ativos"} nesta pelada. São necessários pelo menos dois para criar partidas.`;
  }
  if (task.id === "PUBLIC_SITE")
    return task.completed
      ? "Você já conheceu o site desta pelada."
      : "Você ainda não visitou o site desta pelada pelo Guia.";
  if (task.id === "IDENTITY")
    return task.completed
      ? "A identidade visual já foi personalizada."
      : "A identidade visual ainda usa a configuração padrão.";
  if (task.id === "SCHEDULE")
    return task.completed
      ? "A agenda habitual já está cadastrada."
      : "A agenda habitual ainda não foi cadastrada.";
  return task.completed ? "Concluído." : "Pendente.";
}

function destination(guide: AdminGuideData, task: AdminGuideTask) {
  if (task.id === "IDENTITY") {
    if (guide.capabilities.configureIdentity)
      return { href: "/admin/personalizacao/identidade-visual", label: "Personalizar identidade" };
    if (guide.capabilities.configureTheme)
      return { href: "/admin/personalizacao/visual-temas", label: "Personalizar tema" };
    return null;
  }
  if (!task.canAct) return null;
  const href = guideDestination(guide, task);
  const entry = PREPARATION.find((item) => item.id === task.id);
  return href && entry ? { href, label: entry.action } : null;
}

export default function AdminGuidePreparationSection({
  guide,
  onPublicSiteOpen,
}: {
  guide: AdminGuideData;
  onPublicSiteOpen: () => void;
}) {
  const entries = PREPARATION.flatMap((entry) => {
    const task = guide.tasks.find((item) => item.id === entry.id);
    return task ? [{ entry, task }] : [];
  });

  return (
    <section aria-labelledby="guide-preparation-title" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">Momento 1/2</p>
        <h2 id="guide-preparation-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">
          Prepare sua pelada
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Organize as informações da sua pelada, cadastre os jogadores e prepare os times para
          começar.
        </p>
      </div>
      <ol className="grid gap-3 md:grid-cols-2">
        {entries.map(({ entry, task }) => {
          const Icon = entry.icon;
          const link = destination(guide, task);
          return (
            <li
              key={task.id}
              className="min-w-0 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-yellow-300" size={21} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {REQUIREMENT_LABEL[task.requirement]}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-200">{entry.description}</p>
              <p className="mt-3 flex items-start gap-2 text-sm text-zinc-300">
                {task.completed ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-yellow-300"
                    size={17}
                  />
                ) : null}
                <span>
                  <strong className="text-white">
                    {task.completed ? "Concluído." : "Situação atual:"}
                  </strong>{" "}
                  {currentState(guide, task)}
                </span>
              </p>
              {link ? (
                <Link
                  href={link.href}
                  target={task.id === "PUBLIC_SITE" ? "_blank" : undefined}
                  rel={task.id === "PUBLIC_SITE" ? "noopener noreferrer" : undefined}
                  onClick={task.id === "PUBLIC_SITE" ? onPublicSiteOpen : undefined}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-yellow-400/50 px-4 py-2 text-center text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                >
                  {link.label}
                </Link>
              ) : !task.completed ? (
                <p className="mt-4 text-sm text-zinc-400">
                  Sua função não permite realizar esta configuração.
                </p>
              ) : null}
              <details className="mt-3 text-sm text-zinc-300">
                <summary className="cursor-pointer text-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
                  Saiba mais
                </summary>
                <p className="mt-2">{entry.details}</p>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

"use client";

import Link from "next/link";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { guideDestination } from "@/lib/admin-guide-navigation";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const HISTORY_ROUTE = "/admin/partidas/historico";

function isTrue(guide: AdminGuideData, key: string): boolean {
  return guide.operationalState[key] === true;
}

function step({
  title,
  description,
  status,
  completed,
  recommended = false,
  href,
  action,
  details,
}: {
  title: string;
  description: string;
  status: string;
  completed?: boolean;
  recommended?: boolean;
  href?: string | null;
  action?: string;
  details?: string;
}) {
  const Icon = completed ? CheckCircle2 : Circle;
  return (
    <li className="min-w-0 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          size={20}
          className={`mt-0.5 shrink-0 ${completed ? "text-yellow-300" : "text-zinc-400"}`}
        />
        <div className="min-w-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-300">{description}</p>
          <p className="mt-2 text-sm font-medium text-yellow-200">
            {recommended ? "Recomendado · " : ""}
            {status}
          </p>
          {details && (
            <details className="mt-3 text-sm text-zinc-300">
              <summary className="cursor-pointer text-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
                Saiba mais
              </summary>
              <p className="mt-2">{details}</p>
            </details>
          )}
          {href && action && (
            <Link
              href={href}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-yellow-400/50 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              {action}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

export default function AdminGuidePostMatchSection({ guide }: { guide: AdminGuideData }) {
  const task = (id: string): AdminGuideTask | undefined =>
    guide.tasks.find((item) => item.id === id);
  const match = task("FIRST_MATCHDAY");
  const results = task("RESULTS_RECORDED");
  const finished = task("MATCHES_FINISHED");
  const champion = task("CHAMPION_PUBLISHED");
  const validMatchCount = guide.operationalState.validMatchCount;
  const hasMatches =
    match?.completed === true && typeof validMatchCount === "number" && validMatchCount > 0;
  const hasResults = results?.completed === true && isTrue(guide, "hasMatchdayWithAllResults");
  const hasFinished =
    finished?.completed === true && isTrue(guide, "hasOfficiallyFinishedMatchday");
  const hasChampion = champion?.completed === true && isTrue(guide, "championPublished");
  const needsReview = isTrue(guide, "championAwaitingReview");
  const canManageMatches = guide.capabilities.manageMatchesAndResults === true;
  const canPublishChampion = guide.capabilities.publishChampion === true;
  const resultsDestination = results ? guideDestination(guide, results) : null;
  const finishedDestination = finished ? guideDestination(guide, finished) : null;
  const championDestination = champion ? guideDestination(guide, champion) : null;

  return (
    <section aria-labelledby="guide-post-match-title" className="space-y-4">
      <div>
        <h2 id="guide-post-match-title" className="text-xl font-bold text-white sm:text-2xl">
          Depois do jogo
        </h2>
        <p className="mt-1 text-sm font-semibold text-yellow-200">
          Resultados, Histórico e Campeão do Dia
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          Depois das partidas, registre os placares, acompanhe o histórico dos jogos e publique o
          Time Campeão do Dia.
        </p>
      </div>

      {needsReview && (
        <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-4" role="status">
          <div className="flex items-start gap-3">
            <RotateCcw aria-hidden="true" className="mt-0.5 shrink-0 text-yellow-300" size={20} />
            <div>
              <h3 className="font-semibold text-white">Revise o Campeão do Dia</h3>
              <p className="mt-1 text-sm text-zinc-200">
                Os resultados de uma data de jogos foram alterados após a publicação do campeão.
                Confira a publicação para mantê-la atualizada.
              </p>
              <p className="mt-2 text-sm text-zinc-200">
                No Histórico, localize a rodada com o aviso &quot;Publicação desatualizada&quot; e
                clique em &quot;Revisar publicação&quot;.
              </p>
              {championDestination && canPublishChampion && (
                <Link
                  href={HISTORY_ROUTE}
                  className="mt-3 inline-block text-sm font-semibold text-yellow-200 underline"
                >
                  Localizar publicação para revisão
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <ol className="grid gap-3 md:grid-cols-2">
        {step({
          title: "Registre os resultados",
          description:
            "Depois dos jogos, registre os placares para manter os resultados, as estatísticas e o histórico da pelada atualizados.",
          status: hasResults
            ? "Você já registrou todos os placares de pelo menos uma data de jogos."
            : !hasMatches
              ? "Você ainda precisa criar uma partida antes de registrar os resultados."
              : "Você já possui partidas registradas. Acesse Resultados do Dia para preencher os placares.",
          completed: hasResults,
          href: !hasMatches && match ? guideDestination(guide, match) : resultsDestination,
          action: !hasMatches ? "Preparar primeiro jogo" : "Abrir Resultados do Dia",
          details:
            "Um placar de 0 × 0 também é um resultado registrado. Registrar o placar não finaliza oficialmente a partida.",
        })}
        {step({
          title: "Acompanhe o histórico da pelada",
          description:
            "Consulte as partidas registradas e acompanhe os resultados e as informações disponíveis de cada jogo.",
          status: hasMatches
            ? "As partidas cadastradas podem ser consultadas no Histórico."
            : "O Histórico ficará mais útil à medida que os jogos forem cadastrados.",
          href:
            hasMatches && canManageMatches && results?.canAct && results.applicable
              ? HISTORY_ROUTE
              : null,
          action: "Ver Histórico",
          details: "Consultar o Histórico não é obrigatório para concluir a jornada inicial.",
        })}
        {step({
          title: "Finalize oficialmente as partidas",
          description:
            "Quando necessário, utilize a finalização oficial para encerrar os jogos no sistema, conforme as opções disponíveis em Resultados do Dia.",
          status: hasFinished
            ? "Você já possui uma data de jogos com partidas oficialmente finalizadas."
            : "A finalização oficial é recomendada, mas não impede a conclusão da jornada inicial.",
          completed: hasFinished,
          recommended: true,
          href: finishedDestination,
          action: "Acessar Resultados do Dia",
          details:
            "A finalização oficial é diferente do registro dos placares e não impede a publicação do campeão.",
        })}
        {step({
          title: "Publique o Time Campeão do Dia",
          description:
            "Depois de registrar os resultados, utilize o recurso Time Campeão do Dia para destacar a equipe campeã da pelada.",
          status: hasChampion
            ? "Sua pelada já possui um Time Campeão do Dia publicado com resultados completos."
            : !hasResults
              ? "Registre todos os placares de uma data de jogos antes de concluir a publicação do campeão."
              : "Os resultados já foram registrados. Agora você pode acessar o Time Campeão do Dia.",
          completed: hasChampion,
          href: championDestination,
          action: "Gerenciar Campeão do Dia",
        })}
      </ol>
    </section>
  );
}

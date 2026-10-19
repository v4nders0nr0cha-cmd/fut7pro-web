"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { guideDestination } from "@/lib/admin-guide-navigation";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";

type MatchMode = "INTELLIGENT_DRAW" | "CLASSIC_MATCH";

const MODES: Array<{ mode: MatchMode; title: string; description: string; detail: string }> = [
  {
    mode: "INTELLIGENT_DRAW",
    title: "Sorteio Inteligente",
    description:
      "Organize os jogadores em equipes para o dia da pelada utilizando os recursos de sorteio do Fut7Pro.",
    detail:
      "As avaliações dos atletas podem ajudar na organização dos times, conforme o tipo de sorteio utilizado.",
  },
  {
    mode: "CLASSIC_MATCH",
    title: "Partida Clássica",
    description:
      "Crie confrontos diretamente entre os times oficiais do seu grupo, sem precisar sortear os jogadores.",
    detail: "A escolha dos times e a criação do confronto acontecem na página de partidas.",
  },
];

const MONTHLY_CHOICES = [
  { value: "HAS_MONTHLY_PLAYERS", label: "Sim, temos mensalistas" },
  { value: "CASUAL_ONLY", label: "Não trabalhamos com mensalistas" },
  { value: "DECIDE_LATER", label: "Decidir depois" },
] as const;

function count(guide: AdminGuideData, key: string): number | null {
  const value = guide.operationalState[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export default function AdminGuideFirstMatchSection({
  guide,
  updating,
  update,
}: {
  guide: AdminGuideData;
  updating: boolean;
  update: (action: AdminGuidePatch) => Promise<boolean>;
}) {
  const mode = guide.pedagogicalState.firstMatchMode;
  const monthlyModel = guide.pedagogicalState.monthlyModel;
  const matchTask = guide.tasks.find((task) => task.id === "FIRST_MATCHDAY");
  const levelTask = guide.tasks.find((task) => task.id === "ATHLETE_LEVELS");
  const monthlyTask = guide.tasks.find((task) => task.id === "MONTHLY_MODEL");
  const teamTask = guide.tasks.find((task) => task.id === "OFFICIAL_TEAMS");
  const players = count(guide, "activeHumanPlayers");
  const teams = count(guide, "activeOfficialTeams");
  const levelCoverage = count(guide, "athleteLevelCoverage");
  const matchDestination = matchTask ? guideDestination(guide, matchTask) : null;
  const canChooseMode = Boolean(
    matchTask?.applicable && matchTask.canAct && guide.capabilities.manageMatchesAndResults
  );
  const teamDestination = teamTask ? guideDestination(guide, teamTask) : null;
  const levelDestination = levelTask ? guideDestination(guide, levelTask) : null;
  const monthlyDestination = monthlyTask ? guideDestination(guide, monthlyTask) : null;

  return (
    <section aria-labelledby="guide-first-match-title" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">Momento 2/2</p>
        <h2 id="guide-first-match-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">
          Prepare seu primeiro jogo
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Escolha como deseja organizar os jogos e conheça os recursos disponíveis antes de entrar
          em campo.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {MODES.map((option) => {
          const selected = mode === option.mode;
          return (
            <article
              key={option.mode}
              className={`min-w-0 rounded-xl border bg-[#23272F] p-4 sm:p-5 ${selected ? "border-yellow-400/70" : "border-white/10"}`}
            >
              <h3 className="flex items-center gap-2 font-semibold text-white">
                {selected ? (
                  <CheckCircle2 aria-hidden="true" size={18} className="text-yellow-300" />
                ) : (
                  <Circle aria-hidden="true" size={18} className="text-zinc-400" />
                )}
                {option.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-200">{option.description}</p>
              <details className="mt-3 text-sm text-zinc-300">
                <summary className="cursor-pointer text-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
                  Saiba mais
                </summary>
                <p className="mt-2">{option.detail}</p>
              </details>
              <button
                type="button"
                aria-pressed={selected}
                disabled={updating || selected || !canChooseMode}
                onClick={() =>
                  void update({ action: "FIRST_MATCH_MODE_SELECTED", mode: option.mode })
                }
                className="mt-4 min-h-11 rounded-lg border border-yellow-400/50 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60"
              >
                {selected ? "Modalidade escolhida" : `Escolher ${option.title}`}
              </button>
            </article>
          );
        })}
      </div>
      <p className="text-sm text-zinc-300">
        Escolher uma modalidade não cria uma partida. Você poderá mudar essa preferência sem alterar
        os jogos já cadastrados.
      </p>

      <div className="rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
        <h3 className="font-semibold text-white">Jogadores e times disponíveis</h3>
        <p className="mt-2 text-sm text-zinc-300">
          {players === null
            ? "Consulte a lista de jogadores para conferir quem pode participar."
            : `${players} ${players === 1 ? "jogador ativo" : "jogadores ativos"} neste grupo.`}{" "}
          {teams === null
            ? "Consulte os times oficiais cadastrados."
            : `${teams} ${teams === 1 ? "time oficial ativo" : "times oficiais ativos"} neste grupo.`}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Esses números representam o cadastro do grupo, não a presença confirmada no dia do jogo.
          A quantidade necessária depende da organização de cada partida.
        </p>
        {teams !== null && teams < 2 && teamDestination && (
          <Link
            href={teamDestination}
            className="mt-3 inline-block text-sm font-semibold text-yellow-200 underline"
          >
            Gerenciar Times
          </Link>
        )}
      </div>

      {mode === "INTELLIGENT_DRAW" && levelTask?.applicable && (
        <div className="rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
          <h3 className="font-semibold text-white">Avalie o nível dos atletas</h3>
          <p className="mt-2 text-sm text-zinc-300">
            As avaliações ajudam o Fut7Pro a considerar o nível dos jogadores na organização dos
            times, conforme o tipo de sorteio utilizado.
          </p>
          {levelCoverage !== null && (
            <p className="mt-2 text-sm text-zinc-300">
              {levelCoverage}% dos jogadores ativos possuem avaliação completa.
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-400">
            Essa orientação não impede a criação de partidas quando o fluxo permitir prosseguir.
          </p>
          {levelDestination && (
            <Link
              href={levelDestination}
              className="mt-3 inline-block text-sm font-semibold text-yellow-200 underline"
            >
              Avaliar jogadores
            </Link>
          )}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
        <h3 className="font-semibold text-white">Seu grupo trabalha com mensalistas?</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Se o grupo possui jogadores que contribuem mensalmente, o Fut7Pro oferece recursos para
          organizar essas cobranças. Essa escolha é opcional e não altera cobranças.
        </p>
        {monthlyTask?.applicable ? (
          <>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Modelo de mensalistas"
            >
              {MONTHLY_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  aria-pressed={monthlyModel === choice.value}
                  disabled={updating || monthlyModel === choice.value}
                  onClick={() =>
                    void update({ action: "MONTHLY_MODEL_SELECTED", monthlyModel: choice.value })
                  }
                  className="min-h-11 rounded-lg border border-yellow-400/40 px-3 py-2 text-sm text-yellow-100 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60"
                >
                  {choice.label}
                </button>
              ))}
            </div>
            {monthlyModel === "HAS_MONTHLY_PLAYERS" && monthlyDestination && (
              <Link
                href={monthlyDestination}
                className="mt-3 inline-block text-sm font-semibold text-yellow-200 underline"
              >
                Gerenciar mensalistas
              </Link>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">
            A gestão de mensalistas fica disponível aos responsáveis autorizados do grupo.
          </p>
        )}
      </div>

      {matchTask && (
        <div className="rounded-xl border border-yellow-400/25 bg-[#23272F] p-4 sm:p-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Trophy aria-hidden="true" size={19} className="text-yellow-300" />
            Primeiro jogo preparado
          </h3>
          <p className="mt-2 text-sm text-zinc-200">
            {matchTask.completed
              ? "Seu grupo já possui partidas registradas. Você pode continuar organizando os próximos jogos."
              : "Você ainda não possui uma partida registrada. Escolha como deseja organizar o jogo para começar."}
          </p>
          {matchDestination && (
            <Link
              href={matchDestination}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              {mode === "INTELLIGENT_DRAW"
                ? "Abrir Sorteio Inteligente"
                : mode === "CLASSIC_MATCH"
                  ? "Criar Partida Clássica"
                  : "Escolher como criar a partida"}
            </Link>
          )}
          {!matchTask.canAct && !matchTask.completed && (
            <p className="mt-3 text-sm text-zinc-400">
              Sua função permite acompanhar esta etapa, mas não criar partidas.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

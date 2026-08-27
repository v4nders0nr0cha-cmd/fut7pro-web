"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import ConfiguracoesRacha from "./ConfiguracoesRacha";
import SelecionarTimesDia from "./SelecionarTimesDia";
import ParticipantesRacha from "./ParticipantesRacha";
import TimesGerados from "./TimesGerados";
import BotaoPublicarTimes from "./BotaoPublicarTimes";
import {
  sortearTimesInteligente,
  gerarTabelaJogos,
  SORTEIO_ALGORITHM_VERSION,
  isFaseInicialCalibracao,
} from "@/utils/sorteioUtils";
import TabelaJogosRacha from "./TabelaJogosRacha";
import type {
  Participante,
  ConfiguracaoRacha,
  TimeSorteado,
  SorteioHistoricoItem,
} from "@/types/sorteio";
import type { Time, JogoConfronto } from "@/utils/sorteioUtils";
import { useRacha } from "@/context/RachaContext";
import { useTimes } from "@/hooks/useTimes";
import { useSorteioHistorico } from "@/hooks/useSorteioHistorico";
import { useCriticalSessionRefresh } from "@/hooks/useCriticalSessionRefresh";
import { logoPadrao } from "@/config/teamLogoMap";
import EditorTabelaConfrontos, {
  validarTabelaConfrontos,
} from "@/components/sorteio/EditorTabelaConfrontos";

const SORTEIO_DRAFT_STORAGE_PREFIX = "fut7pro_admin_sorteio_draft_v1";

type SorteioDraftStep = "CONFIG" | "PARTICIPANTES" | "SORTEADO";

type SorteioDraft = {
  version: 1;
  updatedAt: string;
  step: SorteioDraftStep;
  currentStep?: SorteioStep;
  resultadoFingerprint?: string | null;
  config: ConfiguracaoRacha | null;
  participantes: Participante[];
  timesSelecionados: string[];
  times: TimeSorteado[];
  tabelaJogos: JogoConfronto[];
  tabelaPersonalizada?: boolean;
  configConfirmada: boolean;
  publicado: boolean;
  partidasTotaisSorteio: number;
  sorteioAvisos: string[];
  sorteioReservas: Participante[];
};

type SorteioMetricasTemporada = {
  maiorPontuacaoDaTemporada: number | null;
  maiorNumeroCampeoesDaTemporada: number | null;
  rankingCarregado: boolean;
  campeoesCarregado: boolean;
};

const buildDraftStorageKey = (scope: string) => `${SORTEIO_DRAFT_STORAGE_PREFIX}:${scope}`;

function normalizeSecondaryForFingerprint(participante: Participante) {
  const secundaria = participante.posicaoSecundaria;
  if (!secundaria || secundaria === "GOL" || secundaria === participante.posicao) return null;
  if (participante.posicao === "GOL") return null;
  return secundaria;
}

function buildHistoricoFingerprint(historico: SorteioHistoricoItem[]) {
  return historico.map((item, index) => ({
    index,
    id: item.id,
    createdAt: item.createdAt,
    dataPartida: item.dataPartida ?? null,
    horaPartida: item.horaPartida ?? null,
    times: item.times
      .map((time) => ({
        id: time.id ?? null,
        jogadoresIds: [...(time.jogadoresIds ?? [])].sort(),
      }))
      .sort((a, b) => String(a.id || "").localeCompare(String(b.id || ""))),
  }));
}

export const buildSorteioInputsFingerprint = ({
  config,
  timesSelecionados,
  timesDoDia,
  participantes,
  totalTemporada,
  metricasTemporada,
  historico,
}: {
  config: ConfiguracaoRacha | null;
  timesSelecionados: string[];
  timesDoDia?: Array<{
    id: string;
    nome?: string | null;
    name?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
  }>;
  participantes: Participante[];
  totalTemporada?: number | null;
  metricasTemporada?: SorteioMetricasTemporada;
  historico?: SorteioHistoricoItem[];
}) => {
  if (!config) return null;
  return JSON.stringify({
    config: {
      sorteioAlgorithmVersion: SORTEIO_ALGORITHM_VERSION,
      numTimes: config.numTimes,
      jogadoresPorTime: config.jogadoresPorTime,
      duracaoRachaMin: config.duracaoRachaMin,
      duracaoPartidaMin: config.duracaoPartidaMin,
      dataPartida: config.dataPartida ?? "",
      horaPartida: config.horaPartida ?? "",
    },
    timesSelecionados: [...timesSelecionados].sort(),
    timesDoDiaOrdem: (timesDoDia ?? []).map((time) => ({
      id: time.id,
      nome: time.nome ?? time.name ?? "",
      logo: time.logo ?? time.logoUrl ?? "",
    })),
    participantesOrdem: participantes.map((participante) => participante.id),
    participantes: [...participantes]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((participante) => ({
        id: participante.id,
        posicaoPrincipal: participante.posicao,
        posicaoSecundaria: normalizeSecondaryForFingerprint(participante),
        isBot: Boolean(participante.isBot),
        nivelFinal: participante.estrelas?.nivelFinal ?? participante.estrelas?.estrelas ?? 0,
        rankingPontos: participante.rankingPontos || 0,
        campeoesDoDia: participante.campeoesDoDia || 0,
      })),
    totalTemporada: totalTemporada ?? null,
    metricasTemporada: {
      maiorPontuacaoDaTemporada: metricasTemporada?.maiorPontuacaoDaTemporada ?? null,
      maiorNumeroCampeoesDaTemporada: metricasTemporada?.maiorNumeroCampeoesDaTemporada ?? null,
    },
    historicoAntiPanelinha: buildHistoricoFingerprint(historico ?? []),
  });
};

const parseDraft = (raw: string | null): SorteioDraft | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SorteioDraft;
    if (parsed?.version !== 1) return null;
    if (!Array.isArray(parsed.participantes)) return null;
    if (!Array.isArray(parsed.timesSelecionados)) return null;
    if (!Array.isArray(parsed.times)) return null;
    if (!Array.isArray(parsed.tabelaJogos)) return null;
    return parsed;
  } catch {
    return null;
  }
};

function SorteioLoadingModal({ calibracao }: { calibracao: boolean }) {
  const etapas = useMemo(
    () =>
      calibracao
        ? [
            "Validando configuração do sorteio",
            "Usando o nível dos atletas na fase de calibração",
            "Conferindo equilíbrio por posição",
            "Organizando goleiros e jogadores de linha",
            "Distribuindo atletas entre os times",
            "Aplicando histórico recente de combinações",
            "Ajustando equilíbrio final",
            "Montando a tabela dos times sorteados",
          ]
        : [
            "Validando configuração do sorteio",
            "Analisando nível dos atletas",
            "Considerando Ranking Geral da temporada",
            "Considerando Campeões do Dia",
            "Conferindo equilíbrio por posição",
            "Distribuindo atletas entre os times",
            "Aplicando histórico recente de combinações",
            "Ajustando equilíbrio final",
          ],
    [calibracao]
  );
  const [etapaAtual, setEtapaAtual] = useState(0);

  useEffect(() => {
    setEtapaAtual(0);
    const interval = window.setInterval(() => {
      setEtapaAtual((current) => Math.min(current + 1, etapas.length - 1));
    }, 620);
    return () => window.clearInterval(interval);
  }, [etapas.length]);

  const progresso = ((etapaAtual + 1) / etapas.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-lg rounded-2xl border border-yellow-400/40 bg-[#111214] p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-400/10">
            <div className="absolute h-14 w-14 animate-ping rounded-full border border-yellow-400/30" />
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-yellow-300">Montando os times</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              O Fut7Pro está conferindo as regras do sorteio e organizando a melhor composição
              possível.
            </p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-yellow-400 transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="mt-5 space-y-2">
          {etapas.map((etapa, index) => {
            const ativa = index === etapaAtual;
            const concluida = index < etapaAtual;
            return (
              <div
                key={etapa}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  ativa
                    ? "bg-yellow-400/10 text-yellow-200"
                    : concluida
                      ? "text-emerald-300"
                      : "text-zinc-500"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
                    ativa
                      ? "border-yellow-400 text-yellow-300"
                      : concluida
                        ? "border-emerald-400 bg-emerald-400 text-black"
                        : "border-zinc-700"
                  }`}
                >
                  {concluida ? "✓" : index + 1}
                </span>
                <span>{etapa}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type VisualStepStatus = "complete" | "active" | "pending";
type SorteioStep = "CONFIGURACAO" | "TIMES" | "PARTICIPANTES" | "TIMES_SORTEADOS" | "PUBLICACAO";

const SORTEIO_STEPS: Array<{
  id: SorteioStep;
  numero: number;
  titulo: string;
  subtitulo: string;
}> = [
  {
    id: "CONFIGURACAO",
    numero: 1,
    titulo: "Configuração",
    subtitulo: "Defina a configuração do sorteio",
  },
  {
    id: "TIMES",
    numero: 2,
    titulo: "Times do Dia",
    subtitulo: "Escolha os times do dia",
  },
  {
    id: "PARTICIPANTES",
    numero: 3,
    titulo: "Participantes",
    subtitulo: "Selecione os participantes",
  },
  {
    id: "TIMES_SORTEADOS",
    numero: 4,
    titulo: "Times Sorteados",
    subtitulo: "Revise os times sorteados",
  },
  {
    id: "PUBLICACAO",
    numero: 5,
    titulo: "Publicação",
    subtitulo: "Revise os confrontos e publique",
  },
];

function SorteioStepper({
  currentStep,
  statuses,
  onStepClick,
}: {
  currentStep: SorteioStep;
  statuses: Record<SorteioStep, VisualStepStatus>;
  onStepClick: (step: SorteioStep) => void;
}) {
  return (
    <nav aria-label="Etapas do Sorteio Inteligente" className="w-full overflow-x-auto pb-2">
      <ol className="grid min-w-[560px] grid-cols-5 items-start gap-0 md:min-w-0">
        {SORTEIO_STEPS.map((step, index) => {
          const status = statuses[step.id];
          const isComplete = status === "complete";
          const isActive = currentStep === step.id;
          const canClick = isComplete || isActive;

          return (
            <li key={step.id} className="relative flex flex-col items-center gap-2 text-center">
              {index > 0 && (
                <span
                  className={`absolute left-0 top-4 h-0.5 w-1/2 ${
                    status === "pending" ? "bg-zinc-700" : "bg-yellow-400"
                  }`}
                  aria-hidden
                />
              )}
              {index < SORTEIO_STEPS.length - 1 && (
                <span
                  className={`absolute right-0 top-4 h-0.5 w-1/2 ${
                    isComplete ? "bg-yellow-400" : "bg-zinc-700"
                  }`}
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => canClick && onStepClick(step.id)}
                disabled={!canClick}
                aria-current={isActive ? "step" : undefined}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold md:h-9 md:w-9 ${
                  isComplete
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : isActive
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-zinc-600 bg-[#161616] text-zinc-300"
                } ${canClick ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                {isComplete ? "✓" : step.numero}
              </button>
              <span
                className={`max-w-[104px] text-[11px] font-semibold leading-tight md:max-w-none md:text-sm ${
                  isActive ? "text-yellow-300" : isComplete ? "text-zinc-100" : "text-zinc-400"
                }`}
              >
                {step.titulo}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepPanel({
  step,
  currentStep,
  children,
}: {
  step: SorteioStep;
  currentStep: SorteioStep;
  children: ReactNode;
}) {
  const isVisible = currentStep === step;

  return (
    <section className={isVisible ? "block" : "hidden"} aria-hidden={!isVisible}>
      {children}
    </section>
  );
}

function EtapaSorteio({ status, children }: { status: VisualStepStatus; children: ReactNode }) {
  const isActive = status === "active";

  return (
    <section
      className={`rounded-xl border p-4 md:p-6 shadow-sm transition-all ${
        isActive
          ? "border-yellow-400 bg-[#202020]"
          : status === "complete"
            ? "border-emerald-500/40 bg-[#1b211d]"
            : "border-zinc-800 bg-[#181818]"
      }`}
    >
      {children}
    </section>
  );
}

export default function SorteioInteligenteAdmin() {
  const { rachaId, tenantSlug } = useRacha();
  const resolvedSlug = tenantSlug?.trim() || "";
  const { times: timesDisponiveis, isLoading: loadingTimes } = useTimes(resolvedSlug || undefined);
  const {
    historico,
    totalTemporada,
    anoTemporada,
    isLoading: loadingHistorico,
    isError: erroHistorico,
  } = useSorteioHistorico(5);
  const [config, setConfig] = useState<ConfiguracaoRacha | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [times, setTimes] = useState<TimeSorteado[]>([]);
  const [publicado, setPublicado] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [configConfirmada, setConfigConfirmada] = useState(false);

  // Estado dos times selecionados
  const [timesSelecionados, setTimesSelecionados] = useState<string[]>([]);

  // Estado para a tabela de jogos
  const [tabelaJogos, setTabelaJogos] = useState<JogoConfronto[]>([]);
  const [tabelaPersonalizada, setTabelaPersonalizada] = useState(false);

  // Shake no aviso se tentar confirmar sem estar correto
  const [avisoTimesShake, setAvisoTimesShake] = useState(false);

  // Loading do sorteio inteligente
  const [loadingSorteio, setLoadingSorteio] = useState(false);
  const [partidasTotaisSorteio, setPartidasTotaisSorteio] = useState(0);
  const [sorteioAvisos, setSorteioAvisos] = useState<string[]>([]);
  const [sorteioReservas, setSorteioReservas] = useState<Participante[]>([]);
  const [sorteioErro, setSorteioErro] = useState<string | null>(null);
  const [edicaoTimes, setEdicaoTimes] = useState({ editando: false, invalido: false });
  const [edicaoTabela, setEdicaoTabela] = useState(false);
  const [metricasTemporada, setMetricasTemporada] = useState<SorteioMetricasTemporada>({
    maiorPontuacaoDaTemporada: null,
    maiorNumeroCampeoesDaTemporada: null,
    rankingCarregado: false,
    campeoesCarregado: false,
  });
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftRestoredAtLabel, setDraftRestoredAtLabel] = useState<string | null>(null);
  const [resultadoFingerprint, setResultadoFingerprint] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<SorteioStep>("CONFIGURACAO");
  const sorteioTopRef = useRef<HTMLDivElement | null>(null);
  const persistDraftTimerRef = useRef<number | null>(null);
  const lastDraftJsonRef = useRef<string>("");
  const draftStorageKey = useMemo(
    () => buildDraftStorageKey(resolvedSlug || rachaId?.trim() || "global"),
    [resolvedSlug, rachaId]
  );
  const { ensureFreshSession } = useCriticalSessionRefresh({ minIntervalMs: 10_000 });

  // Quantidade máxima de times do config
  const maxTimes = config?.numTimes || 2;
  const participantesNecessarios = maxTimes * (config?.jogadoresPorTime || 0);
  const selectedStep = SORTEIO_STEPS.find((step) => step.id === currentStep) ?? SORTEIO_STEPS[0];
  const currentStepIndex = SORTEIO_STEPS.findIndex((step) => step.id === currentStep);
  const timesSelecionadosDetalhes = useMemo(
    () => timesDisponiveis.filter((time) => timesSelecionados.includes(time.id)),
    [timesDisponiveis, timesSelecionados]
  );
  const timesSelecionadosParaTabela = useMemo(
    () =>
      timesSelecionadosDetalhes.map((time) => ({
        id: time.id,
        nome: time.nome,
        logo: time.logo || logoPadrao,
      })),
    [timesSelecionadosDetalhes]
  );
  const limiteTimesConfirmacao = maxTimes;
  const faltamTimesCadastrados = !loadingTimes && timesDisponiveis.length < maxTimes;
  const timesFaltantes = Math.max(0, maxTimes - timesDisponiveis.length);
  const timesDoDiaValidos =
    Boolean(config) && !faltamTimesCadastrados && timesSelecionados.length === maxTimes;
  const goleirosSelecionadosTotal = participantes.filter((p) => p.posicao === "GOL").length;
  const linhaNecessarios = Math.max(0, participantesNecessarios - maxTimes);
  const linhaSelecionadosTotal = participantes.filter((p) => p.posicao !== "GOL").length;
  const vagasRestantesParticipantes = Math.max(0, participantesNecessarios - participantes.length);
  const faltamGoleiros = Math.max(0, maxTimes - goleirosSelecionadosTotal);
  const sobramGoleiros = Math.max(0, goleirosSelecionadosTotal - maxTimes);
  const faltamLinha = Math.max(0, linhaNecessarios - linhaSelecionadosTotal);
  const sobramLinha = Math.max(0, linhaSelecionadosTotal - linhaNecessarios);
  const participantesCompletos =
    Boolean(config) &&
    participantes.length === participantesNecessarios &&
    goleirosSelecionadosTotal === maxTimes &&
    linhaSelecionadosTotal === linhaNecessarios;
  const rankingEmCalibracao = isFaseInicialCalibracao(totalTemporada);
  const metricasOficiaisProntas =
    rankingEmCalibracao ||
    (metricasTemporada.rankingCarregado && metricasTemporada.campeoesCarregado);
  const pendenciasParticipantes = [
    participantes.length !== participantesNecessarios
      ? participantes.length < participantesNecessarios
        ? `Selecione mais ${vagasRestantesParticipantes} participante${vagasRestantesParticipantes === 1 ? "" : "s"}.`
        : `Remova ${participantes.length - participantesNecessarios} participante${participantes.length - participantesNecessarios === 1 ? "" : "s"} para respeitar o limite.`
      : null,
    faltamGoleiros > 0
      ? `Preencha mais ${faltamGoleiros} slot${faltamGoleiros === 1 ? "" : "s"} de goleiro com goleiro real ou BOT.`
      : null,
    sobramGoleiros > 0
      ? `Remova ${sobramGoleiros} goleiro${sobramGoleiros === 1 ? "" : "s"} excedente${sobramGoleiros === 1 ? "" : "s"}.`
      : null,
    faltamLinha > 0
      ? `Preencha mais ${faltamLinha} vaga${faltamLinha === 1 ? "" : "s"} de jogador de linha.`
      : null,
    sobramLinha > 0
      ? `Remova ${sobramLinha} jogador${sobramLinha === 1 ? "" : "es"} de linha excedente${sobramLinha === 1 ? "" : "s"}.`
      : null,
    !metricasOficiaisProntas
      ? "Aguarde carregar Ranking Geral e Campeões do Dia da temporada antes de sortear."
      : null,
  ].filter(Boolean) as string[];
  const sorteioInputsFingerprint = useMemo(
    () =>
      buildSorteioInputsFingerprint({
        config,
        timesSelecionados,
        timesDoDia: timesSelecionadosDetalhes,
        participantes,
        totalTemporada,
        metricasTemporada,
        historico,
      }),
    [
      config,
      historico,
      metricasTemporada,
      participantes,
      timesSelecionados,
      timesSelecionadosDetalhes,
      totalTemporada,
    ]
  );
  const draftStep: SorteioDraftStep =
    times.length > 0 ? "SORTEADO" : configConfirmada ? "PARTICIPANTES" : "CONFIG";
  const hasDirtyDraftState = Boolean(
    configConfirmada ||
      Boolean(config) ||
      participantes.length > 0 ||
      timesSelecionados.length > 0 ||
      times.length > 0 ||
      tabelaJogos.length > 0
  );
  const stepStatuses = useMemo<Record<SorteioStep, VisualStepStatus>>(() => {
    return SORTEIO_STEPS.reduce(
      (acc, step, index) => {
        acc[step.id] =
          index < currentStepIndex ? "complete" : step.id === currentStep ? "active" : "pending";
        return acc;
      },
      {} as Record<SorteioStep, VisualStepStatus>
    );
  }, [currentStep, currentStepIndex]);

  const limparFeedbackSorteio = useCallback(() => {
    setSorteioErro(null);
    setSorteioAvisos([]);
    setSorteioReservas([]);
  }, []);

  const mudarEtapa = useCallback(
    (step: SorteioStep, options?: { limparFeedback?: boolean }) => {
      if (options?.limparFeedback) {
        limparFeedbackSorteio();
      }
      setCurrentStep(step);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          if (typeof sorteioTopRef.current?.scrollIntoView === "function") {
            sorteioTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    },
    [limparFeedbackSorteio]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__FUT7PRO_ADMIN_FLOW_DIRTY__ = hasDirtyDraftState;
    window.dispatchEvent(
      new CustomEvent("fut7pro:admin-flow-dirty", {
        detail: { dirty: hasDirtyDraftState, source: "sorteio-inteligente" },
      })
    );
    return () => {
      (window as any).__FUT7PRO_ADMIN_FLOW_DIRTY__ = false;
      window.dispatchEvent(
        new CustomEvent("fut7pro:admin-flow-dirty", {
          detail: { dirty: false, source: "sorteio-inteligente" },
        })
      );
    };
  }, [hasDirtyDraftState]);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(draftStorageKey);
      lastDraftJsonRef.current = "";
    } catch {
      // ignore
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = parseDraft(window.sessionStorage.getItem(draftStorageKey));
    if (!draft) {
      setDraftHydrated(true);
      setDraftRestoredAtLabel(null);
      return;
    }

    setConfig(draft.config ?? null);
    setParticipantes(draft.participantes ?? []);
    setTimesSelecionados(draft.timesSelecionados ?? []);
    const draftFingerprint = draft.resultadoFingerprint ?? null;
    const canRestoreResultado = Boolean(draftFingerprint) && (draft.times ?? []).length > 0;
    setTimes(canRestoreResultado ? (draft.times ?? []) : []);
    setTabelaJogos(canRestoreResultado ? (draft.tabelaJogos ?? []) : []);
    setTabelaPersonalizada(canRestoreResultado ? Boolean(draft.tabelaPersonalizada) : false);
    setConfigConfirmada(Boolean(draft.configConfirmada));
    setPublicado(canRestoreResultado ? Boolean(draft.publicado) : false);
    setPartidasTotaisSorteio(Number(draft.partidasTotaisSorteio || 0));
    setSorteioAvisos(canRestoreResultado ? (draft.sorteioAvisos ?? []) : []);
    setSorteioReservas(canRestoreResultado ? (draft.sorteioReservas ?? []) : []);
    setResultadoFingerprint(canRestoreResultado ? draftFingerprint : null);
    if (canRestoreResultado) {
      setCurrentStep(draft.currentStep === "PUBLICACAO" ? "PUBLICACAO" : "TIMES_SORTEADOS");
    } else if (draft.configConfirmada) {
      setCurrentStep("PARTICIPANTES");
    } else {
      setCurrentStep("CONFIGURACAO");
    }
    setDraftRestoredAtLabel(
      draft.updatedAt ? new Date(draft.updatedAt).toLocaleString("pt-BR") : null
    );
    setDraftHydrated(true);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftHydrated || typeof window === "undefined") return;

    if (persistDraftTimerRef.current) {
      window.clearTimeout(persistDraftTimerRef.current);
      persistDraftTimerRef.current = null;
    }

    if (!hasDirtyDraftState) {
      clearDraft();
      return;
    }

    const payload: SorteioDraft = {
      version: 1,
      updatedAt: new Date().toISOString(),
      step: draftStep,
      currentStep,
      resultadoFingerprint: times.length > 0 ? resultadoFingerprint : null,
      config,
      participantes,
      timesSelecionados,
      times,
      tabelaJogos,
      tabelaPersonalizada,
      configConfirmada,
      publicado,
      partidasTotaisSorteio,
      sorteioAvisos,
      sorteioReservas,
    };

    const nextJson = JSON.stringify(payload);
    if (nextJson === lastDraftJsonRef.current) return;

    persistDraftTimerRef.current = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(draftStorageKey, nextJson);
        lastDraftJsonRef.current = nextJson;
      } catch {
        // ignore quota or storage errors
      }
    }, 280);

    return () => {
      if (persistDraftTimerRef.current) {
        window.clearTimeout(persistDraftTimerRef.current);
        persistDraftTimerRef.current = null;
      }
    };
  }, [
    config,
    configConfirmada,
    clearDraft,
    currentStep,
    draftHydrated,
    draftStep,
    draftStorageKey,
    hasDirtyDraftState,
    participantes,
    partidasTotaisSorteio,
    publicado,
    resultadoFingerprint,
    sorteioAvisos,
    sorteioReservas,
    tabelaJogos,
    tabelaPersonalizada,
    times,
    timesSelecionados,
  ]);

  useEffect(() => {
    if (!draftHydrated || times.length === 0) return;
    if (loadingHistorico) return;
    if (resultadoFingerprint && resultadoFingerprint === sorteioInputsFingerprint) return;

    setTimes([]);
    setTabelaJogos([]);
    setTabelaPersonalizada(false);
    setSorteioAvisos([]);
    setSorteioReservas([]);
    setSorteioErro(null);
    setPublicado(false);
    setResultadoFingerprint(null);

    if (currentStep === "TIMES_SORTEADOS" || currentStep === "PUBLICACAO") {
      mudarEtapa(configConfirmada ? "PARTICIPANTES" : "CONFIGURACAO");
    }
  }, [
    configConfirmada,
    currentStep,
    draftHydrated,
    loadingHistorico,
    mudarEtapa,
    resultadoFingerprint,
    sorteioInputsFingerprint,
    times.length,
  ]);

  useEffect(() => {
    if (loadingTimes) return;
    if (!timesDisponiveis || timesDisponiveis.length === 0) {
      if (timesSelecionados.length) {
        setTimesSelecionados([]);
      }
      return;
    }

    const disponiveisIds = new Set(timesDisponiveis.map((t) => t.id));
    const proximos = timesSelecionados.filter((id) => disponiveisIds.has(id)).slice(0, maxTimes);
    const mudou =
      proximos.length !== timesSelecionados.length ||
      proximos.some((id, idx) => id !== timesSelecionados[idx]);

    if (mudou) {
      setTimesSelecionados(proximos);
    }
  }, [loadingTimes, timesDisponiveis, maxTimes, timesSelecionados]);

  useEffect(() => {
    if (!draftHydrated || loadingSorteio) return;
    if (
      currentStep === "CONFIGURACAO" ||
      currentStep === "TIMES" ||
      currentStep === "PARTICIPANTES"
    ) {
      limparFeedbackSorteio();
    }
  }, [
    config?.duracaoPartidaMin,
    config?.duracaoRachaMin,
    config?.horaPartida,
    config?.dataPartida,
    config?.jogadoresPorTime,
    config?.numTimes,
    currentStep,
    draftHydrated,
    limparFeedbackSorteio,
    loadingSorteio,
    participantes,
    timesSelecionados,
  ]);

  function handleConfirmarConfig() {
    if (faltamTimesCadastrados || timesSelecionados.length !== limiteTimesConfirmacao) {
      setAvisoTimesShake(true);
      setTimeout(() => setAvisoTimesShake(false), 500);
      return false;
    }
    setConfigConfirmada(true);
    return true;
  }

  // NOVO: Função para somar o total de partidas já jogadas pelos participantes
  function calcularPartidasTotais(participantes: Participante[]): number {
    // Soma o campo "partidas" de cada participante (fallback para 0 se não existir)
    return participantes.reduce((acc, p) => acc + (p.partidas || 0), 0);
  }

  const normalizarTime = (time: any): Time => ({
    id: time.id,
    nome: time.nome || (time as any).name || "Time",
    logo: time.logo || (time as any).logoUrl || logoPadrao,
  });

  async function handleSortearTimes() {
    if (!config || !timesDoDiaValidos || !participantesCompletos || !metricasOficiaisProntas) {
      setSorteioErro(
        pendenciasParticipantes.length
          ? pendenciasParticipantes.join(" ")
          : "Complete os times do dia antes de sortear."
      );
      return;
    }

    const timesParaSorteio = timesDisponiveis.filter((t) => timesSelecionados.includes(t.id));
    if (timesParaSorteio.length !== maxTimes) {
      setSorteioErro("A quantidade de times selecionados precisa ser igual à configuração.");
      return;
    }
    const timesNormalizados = timesParaSorteio.map((time) => ({
      id: time.id,
      nome: time.nome || (time as any).name || "Time",
      logo: time.logo || (time as any).logoUrl || logoPadrao,
    }));

    setLoadingSorteio(true);
    setSorteioErro(null);
    setSorteioAvisos([]);
    setSorteioReservas([]);

    // Calcula o total de partidas do racha (pode usar s¢ participantes selecionados do dia)
    const partidasTotais = calcularPartidasTotais(participantes);
    setPartidasTotaisSorteio(partidasTotais);

    const sorteiosPublicados = typeof totalTemporada === "number" ? totalTemporada : undefined;

    // Balanceamento "pesado" e delay m¡nimo de 5s (user experience PRO)
    const balanceamentoPromise = new Promise<TimeSorteado[]>((resolve) => {
      setTimeout(() => {
        try {
          const resultado = sortearTimesInteligente(participantes, timesNormalizados, {
            partidasTotais,
            sorteiosPublicadosNaTemporada: sorteiosPublicados,
            maiorPontuacaoDaTemporada: metricasTemporada.maiorPontuacaoDaTemporada ?? undefined,
            maiorNumeroCampeoesDaTemporada:
              metricasTemporada.maiorNumeroCampeoesDaTemporada ?? undefined,
            historico,
            jogadoresPorTime: config.jogadoresPorTime,
          });
          setSorteioAvisos(resultado.avisos);
          setSorteioReservas(resultado.reservas);
          resolve(resultado.times);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Falha ao sortear os times.";
          setSorteioErro(message);
          resolve([]);
        }
      }, 150); // pequeno delay para simular "thread" JS
    });
    const delayMinimo = new Promise((resolve) => setTimeout(resolve, 5000));

    const [timesGerados] = await Promise.all([balanceamentoPromise, delayMinimo]);

    const fingerprint = buildSorteioInputsFingerprint({
      config,
      timesSelecionados,
      timesDoDia: timesNormalizados,
      participantes,
      totalTemporada,
      metricasTemporada,
      historico,
    });
    setResultadoFingerprint(fingerprint);
    setTimes(timesGerados);
    setPublicado(false);
    setTabelaPersonalizada(false);

    // GERA A TABELA DE JOGOS conforme times selecionados
    if (timesNormalizados.length >= 2 && timesGerados.length > 0) {
      const jogos = gerarTabelaJogos({
        times: timesNormalizados,
        duracaoRachaMin: config.duracaoRachaMin,
        duracaoPartidaMin: config.duracaoPartidaMin,
      });
      setTabelaJogos(jogos);
    } else {
      setTabelaJogos([]);
    }

    if (timesGerados.length > 0) {
      mudarEtapa("TIMES_SORTEADOS");
    }

    setLoadingSorteio(false);
  }

  function voltarParaConfiguracao() {
    setConfigConfirmada(false);
    mudarEtapa("CONFIGURACAO", { limparFeedback: true });
  }

  function voltarParaTimesDia() {
    setConfigConfirmada(false);
    mudarEtapa("TIMES", { limparFeedback: true });
  }

  function continuarParaParticipantes() {
    if (handleConfirmarConfig()) {
      mudarEtapa("PARTICIPANTES", { limparFeedback: true });
    }
  }

  function handleStepperClick(step: SorteioStep) {
    if (step === currentStep) return;
    if (step === "CONFIGURACAO") {
      voltarParaConfiguracao();
      return;
    }
    if (step === "TIMES" && currentStepIndex > 1) {
      voltarParaTimesDia();
      return;
    }
    if (step === "PARTICIPANTES" && currentStepIndex > 2 && configConfirmada) {
      mudarEtapa("PARTICIPANTES", { limparFeedback: true });
      return;
    }
    if (step === "TIMES_SORTEADOS" && times.length > 0) {
      mudarEtapa("TIMES_SORTEADOS");
      return;
    }
    if (step === "PUBLICACAO" && times.length > 0) {
      entrarPublicacaoComTabelaAutomatica();
    }
  }

  function gerarTabelaAutomaticaAtual(duracaoPartidaMin?: number) {
    if (!config) return [];
    return gerarTabelaJogos({
      times: timesSelecionadosParaTabela,
      duracaoRachaMin: config.duracaoRachaMin,
      duracaoPartidaMin: duracaoPartidaMin ?? config.duracaoPartidaMin,
    });
  }

  function entrarPublicacaoComTabelaAutomatica() {
    if (!config || times.length === 0) return;
    setTabelaJogos(gerarTabelaAutomaticaAtual());
    setTabelaPersonalizada(false);
    setEdicaoTabela(false);
    setPublicado(false);
    mudarEtapa("PUBLICACAO", { limparFeedback: true });
  }

  function handleDuracaoConfrontosChange(duracao: number) {
    if (!Number.isFinite(duracao) || duracao <= 0) return;
    setConfig((current) => {
      if (!current) return current;
      const nextConfig = { ...current, duracaoPartidaMin: duracao };
      if (times.length > 0) {
        setResultadoFingerprint(
          buildSorteioInputsFingerprint({
            config: nextConfig,
            timesSelecionados,
            timesDoDia: timesSelecionadosDetalhes,
            participantes,
            totalTemporada,
            metricasTemporada,
            historico,
          })
        );
      }
      return nextConfig;
    });
    setTabelaJogos((current) => current.map((jogo) => ({ ...jogo, tempo: duracao })));
  }

  function handleRestaurarTabelaAutomatica(duracaoPartidaMin?: number) {
    if (!config) return;
    if (duracaoPartidaMin && duracaoPartidaMin !== config.duracaoPartidaMin) {
      handleDuracaoConfrontosChange(duracaoPartidaMin);
    }
    setTabelaJogos(gerarTabelaAutomaticaAtual(duracaoPartidaMin));
    setTabelaPersonalizada(false);
    setEdicaoTabela(false);
  }

  function handleSalvarTabelaPersonalizada(jogos: JogoConfronto[], duracaoPartidaMin: number) {
    setTabelaJogos(jogos.map((jogo) => ({ ...jogo, tempo: duracaoPartidaMin })));
    setTabelaPersonalizada(true);
  }

  async function handlePublicarTimes() {
    if (!config || times.length === 0 || !resolvedSlug) return;
    if (edicaoTabela) {
      setSorteioErro("Salve ou cancele a edição da tabela antes de publicar.");
      return;
    }

    const dataPartida = config.dataPartida?.trim();
    const horaPartida = config.horaPartida?.trim();
    if (!dataPartida || !horaPartida) {
      setSorteioErro("Defina a data e o horário da partida antes de publicar.");
      return;
    }
    const validacaoTabela = validarTabelaConfrontos(tabelaJogos, timesSelecionadosParaTabela, {
      duracaoRachaMin: config.duracaoRachaMin,
    });
    if (validacaoTabela.erros.length > 0) {
      setSorteioErro(validacaoTabela.erros.join(" "));
      return;
    }

    setSorteioErro(null);
    setPublicando(true);
    try {
      await ensureFreshSession();
      const res = await fetch("/api/sorteio/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: resolvedSlug,
          rachaId,
          configuracao: config,
          participantes,
          times,
          tabelaJogos,
          dataPartida,
          horaPartida,
        }),
      });

      if (!res.ok) {
        const responseText = await res.text();
        let message = "Falha ao publicar times do dia.";
        try {
          const parsed = JSON.parse(responseText) as {
            message?: string;
            error?: string;
            requestId?: string | null;
          };
          const backendMessage = String(parsed?.message || parsed?.error || "").trim();
          if (backendMessage) {
            message = backendMessage;
          }
          if (parsed?.requestId) {
            message = `${message} (requestId: ${parsed.requestId})`;
          }
        } catch {
          const raw = responseText.trim();
          if (raw) {
            message = raw;
          }
        }
        throw new Error(message);
      }

      setPublicado(true);
      setSorteioErro(null);
      clearDraft();
    } catch (error) {
      console.error("Falha ao publicar sorteio", error);
      const message =
        error instanceof Error && error.message ? error.message : "Falha ao publicar times do dia.";
      setSorteioErro(
        `Não foi possível publicar os Times do Dia. Seus dados foram preservados. Tente novamente.${message ? ` Detalhe: ${message}` : ""}`
      );
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div
      ref={sorteioTopRef}
      className="mx-auto max-w-7xl bg-fundo px-3 pb-32 pt-4 md:px-6 md:pb-10"
    >
      {loadingSorteio && <SorteioLoadingModal calibracao={rankingEmCalibracao} />}

      <div className="mb-5 text-center md:text-left">
        <h1 className="text-3xl font-bold text-yellow-400 md:text-4xl">Sorteio Inteligente</h1>
        <p className="mt-1 text-sm text-zinc-300 md:text-base">
          Etapa {selectedStep.numero} de 5 - {selectedStep.subtitulo}
        </p>
      </div>
      {draftRestoredAtLabel && (
        <div className="text-center text-xs text-emerald-300 mb-2">
          Rascunho restaurado automaticamente ({draftRestoredAtLabel}).
        </div>
      )}
      <div className="mb-5">
        <SorteioStepper
          currentStep={currentStep}
          statuses={stepStatuses}
          onStepClick={handleStepperClick}
        />
      </div>

      <div className="space-y-4 md:space-y-5">
        <StepPanel step="CONFIGURACAO" currentStep={currentStep}>
          <EtapaSorteio status={stepStatuses.CONFIGURACAO}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div
                className={
                  configConfirmada
                    ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
                    : "transition-all duration-300"
                }
              >
                <ConfiguracoesRacha
                  onSubmit={(nextConfig) => {
                    setConfig(nextConfig);
                    limparFeedbackSorteio();
                  }}
                  disabled={configConfirmada}
                  initialConfig={config}
                />
              </div>

              <aside className="rounded-lg border border-zinc-700 bg-[#181818] p-4">
                <h2 className="mb-3 text-lg font-bold text-yellow-300">Resumo esperado</h2>
                <div className="space-y-3 text-sm text-zinc-200">
                  <div className="flex items-center justify-between rounded border border-zinc-700 bg-black/20 px-3 py-2">
                    <span>Times</span>
                    <strong className="text-yellow-300">{maxTimes}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded border border-zinc-700 bg-black/20 px-3 py-2">
                    <span>Participantes necessários</span>
                    <strong className="text-yellow-300">{participantesNecessarios}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded border border-zinc-700 bg-black/20 px-3 py-2">
                    <span>Partida</span>
                    <strong className="text-right text-yellow-300">
                      {config?.dataPartida || "--"} {config?.horaPartida || ""}
                    </strong>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-700 bg-black/20 p-3">
              <button
                className="text-left text-sm font-semibold text-yellow-300 underline-offset-4 hover:underline"
                onClick={() => setShowTip((v) => !v)}
                type="button"
              >
                Como funciona o Sorteio Inteligente?
              </button>
              {showTip && (
                <div className="mt-3 text-sm leading-relaxed text-gray-100">
                  <b>Como garantir um sorteio realmente equilibrado?</b>
                  <br />
                  <br />O sorteio inteligente combina nível do atleta (habilidade 1-5 + físico 1-3),
                  ranking do racha, posição e histórico recente de sorteios (anti-panelinha) para
                  montar times equilibrados.
                  <br />
                  <br />
                  <b>PRIMEIROS 8 SORTEIOS / INÍCIO DE TEMPORADA:</b> Nos primeiros 8 sorteios
                  publicados do sistema (ou no início de cada ano/temporada, quando os rankings
                  reiniciam), o balanceamento usa{" "}
                  <b>somente as estrelas definidas pelo administrador</b>. A contagem começa após a
                  publicação do sorteio. Rankings e estatísticas continuam sendo registrados, apenas
                  não pesam no balanceamento.
                  <br />
                  <br />
                  <b>APÓS O 8º SORTEIO:</b> O algoritmo passa a usar ranking, estrelas e posição, e
                  aplica o anti-panelinha com base no histórico recente para evitar repetição de
                  jogadores no mesmo time. O equilíbrio melhora a cada racha conforme o histórico
                  cresce.
                  <br />
                  <br />
                  <b>GOLEIROS:</b> Sempre 1 goleiro por time. Se faltar goleiro real, use o Goleiro
                  Reserva (BOT) para completar o sorteio.
                  <br />
                  <br />
                  <b>CONFIGURAÇÕES INICIAIS:</b> Número de times, tempo de partida e jogadores por
                  time <b>não influenciam no balanceamento</b>. Servem para organizar os times e
                  gerar a tabela de confrontos.
                  <br />
                  <br />
                  <b>TABELA DE CONFRONTOS:</b> A tabela é calculada conforme o tempo total do racha,
                  reservando 15 minutos para organização e imprevistos. Exemplo: se o racha tem 60
                  minutos, a tabela será criada para 45 minutos de jogos. O modelo e o tempo
                  sugerido podem ser ajustados pelo administrador conforme a realidade do grupo.
                  <br />
                  <br />
                  <b>ESTRELAS (NÍVEL DO ATLETA):</b> Defina habilidade e físico na página Nível dos
                  Atletas. O nível final é calculado automaticamente e usado no sorteio. Ajuste
                  sempre que perceber evolução ou queda de desempenho.
                  <br />
                  <br />
                  <b>Dica:</b> Se notar desequilíbrio, ajuste manualmente os times enquanto o
                  histórico ainda está curto. Isso garante jogos mais disputados até a calibração
                  completa.
                  <br />
                  <br />
                  Com o tempo, o sistema aprende e o sorteio fica cada vez mais preciso, justo e
                  divertido!
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                className="w-full rounded bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-500 disabled:pointer-events-none disabled:opacity-60 md:w-auto"
                onClick={() => mudarEtapa("TIMES", { limparFeedback: true })}
                disabled={!config}
              >
                Continuar para Times do Dia
              </button>
            </div>
          </EtapaSorteio>
        </StepPanel>

        <StepPanel step="TIMES" currentStep={currentStep}>
          <EtapaSorteio status={stepStatuses.TIMES}>
            <div className="mb-4 grid gap-3 rounded-lg border border-zinc-700 bg-[#181818] p-4 text-sm text-zinc-200 md:grid-cols-4">
              <div>
                <span className="block text-zinc-400">Duração</span>
                <strong>{config?.duracaoRachaMin ?? "--"} min</strong>
              </div>
              <div>
                <span className="block text-zinc-400">Partida</span>
                <strong>{config?.duracaoPartidaMin ?? "--"} min</strong>
              </div>
              <div>
                <span className="block text-zinc-400">Times</span>
                <strong>{maxTimes}</strong>
              </div>
              <div>
                <span className="block text-zinc-400">Data e horário</span>
                <strong>
                  {config?.dataPartida || "--"} {config?.horaPartida || ""}
                </strong>
              </div>
            </div>

            <div
              className={
                configConfirmada
                  ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
                  : "transition-all duration-300"
              }
            >
              <SelecionarTimesDia
                timesDisponiveis={timesDisponiveis}
                loading={loadingTimes}
                timesSelecionados={timesSelecionados}
                onChange={setTimesSelecionados}
                disabled={configConfirmada}
                maxTimes={maxTimes}
                shake={avisoTimesShake}
              />
            </div>

            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${
                timesDoDiaValidos
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/40 bg-red-500/10 text-red-200"
              }`}
            >
              {faltamTimesCadastrados ? (
                <>
                  Você configurou {maxTimes} times, mas existem apenas {timesDisponiveis.length}{" "}
                  disponíveis. Cadastre mais {timesFaltantes} time{timesFaltantes > 1 ? "s" : ""}{" "}
                  para continuar.
                </>
              ) : (
                <>
                  {timesSelecionados.length} de {limiteTimesConfirmacao} times selecionados.
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button
                className="w-full rounded border border-zinc-600 px-6 py-3 text-base font-bold text-zinc-100 transition hover:border-yellow-400 hover:text-yellow-300 md:w-auto"
                onClick={voltarParaConfiguracao}
              >
                Voltar para Configuração
              </button>
              <button
                className="w-full rounded bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-500 disabled:pointer-events-none disabled:opacity-60 md:w-auto"
                onClick={continuarParaParticipantes}
                disabled={!timesDoDiaValidos}
              >
                Continuar para Participantes
              </button>
            </div>
          </EtapaSorteio>
        </StepPanel>

        <StepPanel step="PARTICIPANTES" currentStep={currentStep}>
          <EtapaSorteio status={stepStatuses.PARTICIPANTES}>
            <div className="mb-4 grid gap-3 rounded-lg border border-zinc-700 bg-[#181818] p-4 text-sm text-zinc-200 md:grid-cols-4">
              <div>
                <span className="block text-zinc-400">Selecionados</span>
                <strong>
                  {participantes.length} / {participantesNecessarios}
                </strong>
              </div>
              <div>
                <span className="block text-zinc-400">Goleiros</span>
                <strong>
                  {goleirosSelecionadosTotal} / {maxTimes}
                </strong>
              </div>
              <div>
                <span className="block text-zinc-400">Vagas restantes</span>
                <strong>{vagasRestantesParticipantes}</strong>
              </div>
              <div>
                <span className="block text-zinc-400">Times escolhidos</span>
                <strong>
                  {timesSelecionadosDetalhes
                    .map((time) => time.nome || (time as any).name)
                    .join(", ") || "--"}
                </strong>
              </div>
            </div>

            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                participantesCompletos
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
              }`}
            >
              <strong className="block">
                {participantesCompletos
                  ? "Tudo pronto para sortear."
                  : "Pendências antes do sorteio"}
              </strong>
              {participantesCompletos ? (
                <span>Quantidade de participantes e goleiros conferida.</span>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {pendenciasParticipantes.map((pendencia) => (
                    <li key={pendencia}>{pendencia}</li>
                  ))}
                </ul>
              )}
            </div>

            <ParticipantesRacha
              rachaId={rachaId}
              config={config}
              participantes={participantes}
              setParticipantes={setParticipantes}
              onMetricasTemporadaChange={setMetricasTemporada}
            />

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button
                className="w-full rounded border border-zinc-600 px-6 py-3 text-base font-bold text-zinc-100 transition hover:border-yellow-400 hover:text-yellow-300 md:w-auto"
                onClick={voltarParaTimesDia}
              >
                Voltar para Times do Dia
              </button>
              <button
                className="w-full rounded bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-500 disabled:pointer-events-none disabled:opacity-60 md:w-auto"
                onClick={handleSortearTimes}
                disabled={
                  loadingTimes ||
                  !timesDoDiaValidos ||
                  !participantesCompletos ||
                  !metricasOficiaisProntas
                }
              >
                Sortear Times
              </button>
              {times.length > 0 && timesDoDiaValidos && participantesCompletos && (
                <button
                  className="w-full rounded border border-yellow-400 px-6 py-3 text-base font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black md:w-auto"
                  onClick={() => mudarEtapa("TIMES_SORTEADOS")}
                >
                  Continuar para Times Sorteados
                </button>
              )}
            </div>

            {(loadingHistorico || erroHistorico || typeof totalTemporada === "number") && (
              <div className="text-xs text-center text-yellow-200 mt-3">
                {loadingHistorico && "Carregando histórico de sorteios..."}
                {erroHistorico && "Falha ao carregar histórico. Balanceamento parcial ativo."}
                {typeof totalTemporada === "number" && (
                  <>
                    {!loadingHistorico && !erroHistorico && (
                      <>
                        Temporada {anoTemporada ?? ""}: {totalTemporada} sorteios publicados.{" "}
                        {isFaseInicialCalibracao(totalTemporada)
                          ? "Fase de calibração: nos primeiros 8 sorteios publicados, o balanceamento usa apenas o nível final definido pelo admin."
                          : "Nível final, ranking, Campeões do Dia e anti-panelinha ativos no balanceamento."}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {sorteioErro && currentStep !== "PUBLICACAO" && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg text-center mt-3">
                {sorteioErro}
              </div>
            )}
            {sorteioAvisos.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-lg text-center mt-3">
                {sorteioAvisos.map((aviso) => (
                  <div key={aviso}>{aviso}</div>
                ))}
              </div>
            )}
            {sorteioReservas.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 text-gray-200 px-4 py-3 rounded-lg text-center mt-3">
                Reservas: {sorteioReservas.map((j) => j.nome).join(", ")}
              </div>
            )}
          </EtapaSorteio>
        </StepPanel>

        <StepPanel step="TIMES_SORTEADOS" currentStep={currentStep}>
          <EtapaSorteio status={stepStatuses.TIMES_SORTEADOS}>
            {times.length > 0 ? (
              <>
                <div className="mb-4 grid gap-3 rounded-lg border border-zinc-700 bg-[#181818] p-4 text-sm text-zinc-200 md:grid-cols-4">
                  <div>
                    <span className="block text-zinc-400">Times</span>
                    <strong>{times.length}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400">Participantes</span>
                    <strong>{participantes.length}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400">Data</span>
                    <strong>{config?.dataPartida || "--"}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400">Horário</span>
                    <strong>{config?.horaPartida || "--"}</strong>
                  </div>
                </div>
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Times sorteados. Revise antes de continuar.
                </div>
                <TimesGerados
                  times={times}
                  onSaveEdit={setTimes}
                  jogadoresPorTime={config?.jogadoresPorTime}
                  coeficienteContext={{
                    partidasTotais: partidasTotaisSorteio,
                    sorteiosPublicadosNaTemporada:
                      typeof totalTemporada === "number" ? totalTemporada : undefined,
                    maiorPontuacaoDaTemporada:
                      metricasTemporada.maiorPontuacaoDaTemporada ?? undefined,
                    maiorNumeroCampeoesDaTemporada:
                      metricasTemporada.maiorNumeroCampeoesDaTemporada ?? undefined,
                  }}
                  rankingEmCalibracao={rankingEmCalibracao}
                  sorteiosPublicadosNaTemporada={
                    typeof totalTemporada === "number" ? totalTemporada : undefined
                  }
                  onEditingStateChange={setEdicaoTimes}
                />
                <div className="mt-5 flex flex-col gap-3 md:grid md:grid-cols-3">
                  <button
                    className="w-full rounded border border-zinc-600 px-6 py-3 text-base font-bold text-zinc-100 transition hover:border-yellow-400 hover:text-yellow-300"
                    onClick={() => mudarEtapa("PARTICIPANTES", { limparFeedback: true })}
                  >
                    Voltar para Participantes
                  </button>
                  <button
                    className="w-full rounded border border-yellow-400 px-6 py-3 text-base font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                    onClick={handleSortearTimes}
                    disabled={
                      loadingTimes ||
                      !timesDoDiaValidos ||
                      !participantesCompletos ||
                      !metricasOficiaisProntas ||
                      edicaoTimes.editando ||
                      edicaoTimes.invalido
                    }
                  >
                    Sortear Novamente
                  </button>
                  <button
                    className="w-full rounded bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-500"
                    onClick={entrarPublicacaoComTabelaAutomatica}
                    disabled={edicaoTimes.editando || edicaoTimes.invalido}
                  >
                    Continuar para Publicação
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-400 text-center">
                Os times sorteados aparecerão aqui após o sorteio.
              </div>
            )}
          </EtapaSorteio>
        </StepPanel>

        <StepPanel step="PUBLICACAO" currentStep={currentStep}>
          <EtapaSorteio status={stepStatuses.PUBLICACAO}>
            {times.length > 0 ? (
              <>
                <div className="mb-4 rounded-lg border border-zinc-700 bg-[#181818] p-4">
                  <h2 className="mb-3 text-lg font-bold text-yellow-300">Resumo da Publicação</h2>
                  <div className="grid gap-3 text-sm text-zinc-200 md:grid-cols-4">
                    <div>
                      <span className="block text-zinc-400">Times</span>
                      <strong>{times.length}</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Participantes</span>
                      <strong>{participantes.length}</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Data</span>
                      <strong>{config?.dataPartida || "--"}</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Horário</span>
                      <strong>{config?.horaPartida || "--"}</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-zinc-700 bg-[#181818] p-4">
                  <h3 className="mb-3 text-base font-bold text-yellow-300">Checklist final</h3>
                  <div className="space-y-2 text-sm text-zinc-200">
                    {[
                      ["Configuração concluída", Boolean(config)],
                      ["Times do dia definidos", timesDoDiaValidos],
                      ["Participantes completos", participantesCompletos],
                      ["Times sorteados", times.length > 0],
                      ["Confrontos gerados", tabelaJogos.length > 0],
                      [
                        publicado ? "Publicação realizada" : "Publicação ainda não realizada",
                        publicado,
                      ],
                    ].map(([label, done]) => (
                      <div key={String(label)} className="flex items-center justify-between gap-3">
                        <span>{label}</span>
                        <span className={done ? "text-emerald-300" : "text-yellow-300"}>
                          {done ? "Concluído" : "Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {sorteioErro && (
                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {sorteioErro}
                  </div>
                )}

                {tabelaJogos.length > 0 && (
                  <div className="mb-5 rounded-lg border border-zinc-700 bg-[#181818] p-4">
                    <h3 className="mb-3 text-base font-bold text-yellow-300 md:text-lg">
                      Tabela de Confrontos
                    </h3>
                    <TabelaJogosRacha jogos={tabelaJogos} />
                    <EditorTabelaConfrontos
                      jogos={tabelaJogos}
                      timesDisponiveis={timesSelecionadosParaTabela}
                      duracaoGlobal={config?.duracaoPartidaMin ?? 6}
                      duracaoRachaMin={config?.duracaoRachaMin ?? 0}
                      tabelaPersonalizada={tabelaPersonalizada}
                      onDuracaoGlobalChange={handleDuracaoConfrontosChange}
                      onSave={handleSalvarTabelaPersonalizada}
                      onRestoreAutomatic={handleRestaurarTabelaAutomatica}
                      onEditingStateChange={setEdicaoTabela}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    className="w-full rounded border border-zinc-600 px-6 py-3 text-base font-bold text-zinc-100 transition hover:border-yellow-400 hover:text-yellow-300 md:w-auto"
                    onClick={() => mudarEtapa("TIMES_SORTEADOS")}
                  >
                    Voltar para Times Sorteados
                  </button>
                  <div className="w-full md:w-auto">
                    <BotaoPublicarTimes
                      publicado={publicado}
                      loading={publicando}
                      onClick={handlePublicarTimes}
                    />
                  </div>
                </div>

                {publicado && (
                  <div className="mt-3 text-center">
                    <Link
                      href="/admin/partidas/times-do-dia"
                      className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 underline"
                    >
                      Veja como os atletas veem no site público.
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-zinc-400 text-center">
                A publicação será liberada depois que os times forem sorteados.
              </div>
            )}
          </EtapaSorteio>
        </StepPanel>
      </div>
    </div>
  );
}

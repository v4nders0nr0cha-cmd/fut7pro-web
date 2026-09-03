"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePartidas } from "@/hooks/usePartidas";
import { useAdminDestaquesRodadas } from "@/hooks/useAdminDestaquesRodadas";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import BannerUpload from "@/components/admin/BannerUpload";
import { buildDestaquesDoDia, getTimeCampeao, type JogadorDestaque } from "@/utils/destaquesDoDia";
import type { DestaqueDiaFaltou, DestaqueDiaResponse } from "@/types/destaques";

type SaveDestaquePayload = Partial<DestaqueDiaResponse> & {
  timeCampeaoTeamId?: string | null;
  timeCampeaoSource?: "manual" | "calculated";
  timeCampeaoStatus?: "draft" | "published";
};
type RoleKey = "atacante" | "meia" | "goleiro" | "zagueiro";
type PresenceStatus = "TITULAR" | "SUBSTITUTO" | "AUSENTE";

function isValidDateKey(value?: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function resolveMatchDateKey(match: any) {
  const raw = match?.date ?? match?.data ?? match?.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "yyyy-MM-dd");
}

function formatDatePtBr(value?: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function findOriginalPresenceStatus(partidas: any[], dateKey: string, athleteId: string) {
  for (const partida of partidas) {
    if (resolveMatchDateKey(partida) !== dateKey) continue;
    const presence = (partida?.presences ?? []).find(
      (item: any) =>
        item?.athleteId === athleteId &&
        (item?.status === "TITULAR" || item?.status === "SUBSTITUTO")
    );
    if (presence?.status === "SUBSTITUTO") return "SUBSTITUTO";
    if (presence?.status === "TITULAR") return "TITULAR";
  }
  return "TITULAR";
}

function updatePresenceStatusForAthlete(
  partidas: any[] | undefined,
  dateKey: string,
  athleteId: string,
  status: PresenceStatus
) {
  if (!Array.isArray(partidas)) return partidas;
  return partidas.map((partida) => {
    if (resolveMatchDateKey(partida) !== dateKey || !Array.isArray(partida?.presences)) {
      return partida;
    }
    return {
      ...partida,
      presences: partida.presences.map((presence: any) =>
        presence?.athleteId === athleteId ? { ...presence, status } : presence
      ),
    };
  });
}

function getPersistedAusenciaTargets(faltou?: DestaqueDiaFaltou | null) {
  const roles: RoleKey[] = ["atacante", "meia", "goleiro", "zagueiro"];
  return roles.reduce(
    (acc, role) => {
      const target = faltou?.targets?.[role];
      if (faltou?.[role] && target?.athleteId) {
        acc[role] = target.athleteId;
      }
      return acc;
    },
    {} as Partial<Record<RoleKey, string>>
  );
}

function getPersistedPresenceStatusBeforeAbsence(faltou?: DestaqueDiaFaltou | null) {
  const roles: RoleKey[] = ["atacante", "meia", "goleiro", "zagueiro"];
  return roles.reduce(
    (acc, role) => {
      const target = faltou?.targets?.[role];
      if (
        faltou?.[role] &&
        target?.athleteId &&
        (target.presenceStatus === "TITULAR" || target.presenceStatus === "SUBSTITUTO")
      ) {
        acc[role] = { athleteId: target.athleteId, status: target.presenceStatus };
      }
      return acc;
    },
    {} as Partial<
      Record<RoleKey, { athleteId: string; status: Exclude<PresenceStatus, "AUSENTE"> }>
    >
  );
}

function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Campeão do Dia" },
    { id: 2, label: "Destaques" },
    { id: 3, label: "Publicação" },
  ] as const;

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2">
        {steps.map((step) => {
          const active = step.id === currentStep;
          const done = step.id < currentStep;
          return (
            <div
              key={step.id}
              className={`rounded-xl px-2 py-2.5 transition sm:px-4 ${
                active
                  ? "bg-yellow-400 text-black"
                  : done
                    ? "bg-green-400/12 text-green-100"
                    : "text-zinc-400"
              }`}
            >
              <div className="flex min-w-0 items-center justify-center gap-2 sm:justify-start">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${
                    done
                      ? "bg-green-400 text-black"
                      : active
                        ? "bg-black text-yellow-300"
                        : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {done ? "✓" : step.id}
                </span>
                <span className="truncate text-[11px] font-semibold sm:text-sm">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AthleteChampionCard({ jogador }: { jogador: JogadorDestaque }) {
  const positionLabel = jogador.pos || "POS";
  const showHint =
    jogador.posicaoEfetiva &&
    jogador.posicaoPrincipal &&
    jogador.posicaoEfetiva !== jogador.posicaoPrincipal;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"
      title={
        showHint
          ? `Posição principal: ${jogador.posicaoPrincipal}. Atuou como ${jogador.posicaoEfetiva} nesta rodada.`
          : undefined
      }
    >
      <img
        src={jogador.foto || "/images/jogadores/jogador_padrao_01.jpg"}
        alt={jogador.nome}
        className="h-11 w-11 rounded-full border border-yellow-400/50 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {jogador.apelido || jogador.nome}
        </div>
        {jogador.apelido && (
          <div className="line-clamp-2 text-xs leading-snug text-zinc-400">{jogador.nome}</div>
        )}
      </div>
      <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-bold text-yellow-200">
        {positionLabel}
      </span>
    </div>
  );
}

export default function TimeCampeaoDoDiaPage() {
  const { partidas, isLoading, isError, error, mutate } = usePartidas();
  const {
    queue,
    isLoading: isLoadingQueue,
    isError: isQueueError,
    error: queueError,
  } = useAdminDestaquesRodadas();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDateParam = searchParams?.get("data") ?? searchParams?.get("date") ?? "";
  const [destaqueDia, setDestaqueDia] = useState<DestaqueDiaResponse | null>(null);
  const [destaqueDiaDateKey, setDestaqueDiaDateKey] = useState<string | null>(null);
  const [isFetchingDestaque, setIsFetchingDestaque] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [ausenciaTargets, setAusenciaTargets] = useState<Partial<Record<RoleKey, string>>>({});
  const [presenceStatusBeforeAbsence, setPresenceStatusBeforeAbsence] = useState<
    Partial<Record<RoleKey, { athleteId: string; status: Exclude<PresenceStatus, "AUSENTE"> }>>
  >({});

  const selectedDateKey = useMemo(() => {
    const aguardando = queue.rodadasAguardandoCampeao;
    const registradas = queue.rodadasRegistradas;
    const rodadaExplicitamenteSelecionada = [...aguardando, ...registradas].find(
      (round) => round.date === selectedDateParam
    );
    if (isValidDateKey(selectedDateParam) && rodadaExplicitamenteSelecionada) {
      return rodadaExplicitamenteSelecionada.date;
    }
    return "";
  }, [queue.rodadasAguardandoCampeao, queue.rodadasRegistradas, selectedDateParam]);
  const selectedRound = useMemo(
    () =>
      [...queue.rodadasAguardandoCampeao, ...queue.rodadasRegistradas].find(
        (round) => round.date === selectedDateKey
      ) ?? null,
    [queue.rodadasAguardandoCampeao, queue.rodadasRegistradas, selectedDateKey]
  );
  const currentPublicSpotlightDateKey = useMemo(() => {
    if (!queue.currentPublicSpotlightDate) return null;
    const date = new Date(queue.currentPublicSpotlightDate);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "yyyy-MM-dd");
  }, [queue.currentPublicSpotlightDate]);
  const scopedPartidas = useMemo(() => {
    if (!selectedDateKey) return partidas;
    return (partidas as any[]).filter(
      (partida) => resolveMatchDateKey(partida) === selectedDateKey
    );
  }, [partidas, selectedDateKey]);

  const { confrontos, times } = useMemo(
    () => buildDestaquesDoDia(scopedPartidas as any),
    [scopedPartidas]
  );

  const hasDados = confrontos.length > 0 && times.length > 0;
  const dataKey = selectedRound?.date ?? null;
  const isHistoricalRound =
    Boolean(dataKey && currentPublicSpotlightDateKey) &&
    (currentPublicSpotlightDateKey as string) > (dataKey as string);

  const destaqueDiaAtual = destaqueDiaDateKey === dataKey ? destaqueDia : null;
  const persistedAusenciaTargets = useMemo(
    () => getPersistedAusenciaTargets(destaqueDiaAtual?.faltou),
    [destaqueDiaAtual?.faltou]
  );
  const persistedPresenceStatusBeforeAbsence = useMemo(
    () => getPersistedPresenceStatusBeforeAbsence(destaqueDiaAtual?.faltou),
    [destaqueDiaAtual?.faltou]
  );
  const effectiveAusenciaTargets = useMemo(
    () => ({ ...persistedAusenciaTargets, ...ausenciaTargets }),
    [persistedAusenciaTargets, ausenciaTargets]
  );
  const effectivePresenceStatusBeforeAbsence = useMemo(
    () => ({ ...persistedPresenceStatusBeforeAbsence, ...presenceStatusBeforeAbsence }),
    [persistedPresenceStatusBeforeAbsence, presenceStatusBeforeAbsence]
  );
  const bannerUrl = destaqueDiaAtual?.bannerUrl ?? null;
  const destaqueAtualizadoEm = destaqueDiaAtual?.updatedAt
    ? new Date(destaqueDiaAtual.updatedAt).toLocaleString("pt-BR")
    : null;
  const campeaoInfo = useMemo(() => getTimeCampeao(confrontos, times), [confrontos, times]);
  const timeCampeao = campeaoInfo?.time ?? null;
  const elencoCampeao = timeCampeao?.jogadores ?? [];
  const desempenhoCampeao = useMemo(() => {
    if (!campeaoInfo) return { vitorias: 0, empates: 0, derrotas: 0 };
    return confrontos.reduce(
      (acc, confronto) => {
        const placar = confronto.resultadoIda?.placar;
        if (!placar) return acc;
        const isA = confronto.ida.a === campeaoInfo.index;
        const isB = confronto.ida.b === campeaoInfo.index;
        if (!isA && !isB) return acc;
        const golsPro = isA ? placar.a : placar.b;
        const golsContra = isA ? placar.b : placar.a;
        if (golsPro > golsContra) acc.vitorias += 1;
        else if (golsPro === golsContra) acc.empates += 1;
        else acc.derrotas += 1;
        return acc;
      },
      { vitorias: 0, empates: 0, derrotas: 0 }
    );
  }, [campeaoInfo, confrontos]);
  const zagueirosDoDia = elencoCampeao.filter((jogador) => jogador.pos === "ZAG");
  const canGoDestaques = Boolean(timeCampeao && elencoCampeao.length > 0);
  const canGoPublicacao =
    canGoDestaques && (!zagueirosDoDia.length || Boolean(destaqueDiaAtual?.zagueiroId));

  useEffect(() => {
    if (!dataKey) {
      setDestaqueDia(null);
      setDestaqueDiaDateKey(null);
      setIsFetchingDestaque(false);
      return;
    }

    let active = true;
    setDestaqueDia(null);
    setDestaqueDiaDateKey(null);
    setIsFetchingDestaque(true);
    setActionError(null);

    fetch(`/api/admin/destaques-do-dia?date=${dataKey}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error || "Falha ao carregar destaques do dia.");
        }
        return body as DestaqueDiaResponse | null;
      })
      .then((body) => {
        if (!active) return;
        setDestaqueDia(body);
        setDestaqueDiaDateKey(dataKey);
      })
      .catch((err) => {
        if (!active) return;
        setActionError(err instanceof Error ? err.message : "Falha ao carregar destaques.");
      })
      .finally(() => {
        if (!active) return;
        setIsFetchingDestaque(false);
      });

    return () => {
      active = false;
    };
  }, [dataKey]);

  useEffect(() => {
    setPublishFeedback(null);
    setPublishError(null);
    setCurrentStep(1);
    setAusenciaTargets({});
    setPresenceStatusBeforeAbsence({});
  }, [dataKey, selectedDateKey]);

  const handleRoundSelect = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("data", value);
    params.delete("date");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const parseBody = (text: string) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const resolveErrorMessage = (text: string, fallback: string) => {
    const body = parseBody(text);
    if (body?.error) return body.error;
    if (body?.message) return body.message;
    return text || fallback;
  };

  const saveDestaque = async (payload: SaveDestaquePayload) => {
    if (!dataKey) return null;
    setIsSaving(true);
    setActionError(null);
    try {
      const response = await fetch("/api/admin/destaques-do-dia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dataKey, ...payload }),
      });
      const bodyText = await response.text().catch(() => "");
      const body = parseBody(bodyText);
      if (!response.ok) {
        throw new Error(resolveErrorMessage(bodyText, "Falha ao salvar destaques."));
      }
      setDestaqueDia(body);
      setDestaqueDiaDateKey(dataKey);
      return body as DestaqueDiaResponse;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao salvar destaques.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!dataKey) return false;
    setIsSaving(true);
    setActionError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/destaques-do-dia/upload", {
        method: "POST",
        body: formData,
      });
      const bodyText = await response.text().catch(() => "");
      const body = parseBody(bodyText);
      if (!response.ok || !body?.url) {
        throw new Error(resolveErrorMessage(bodyText, "Falha ao enviar banner."));
      }
      const saved = await saveDestaque({ bannerUrl: body.url });
      return Boolean(saved);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao enviar banner.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerRemove = async () => {
    await saveDestaque({ bannerUrl: null });
  };

  const handleZagueiroChange = async (athleteId: string) => {
    await saveDestaque({ zagueiroId: athleteId || null });
  };

  const handleAusencia = async (role: RoleKey, athleteId: string, ausente: boolean) => {
    const targetAthleteId = ausente ? athleteId : effectiveAusenciaTargets[role];
    if (!dataKey || !targetAthleteId) return;
    const statusToRestore =
      effectivePresenceStatusBeforeAbsence[role]?.athleteId === targetAthleteId
        ? effectivePresenceStatusBeforeAbsence[role]?.status
        : "TITULAR";
    setIsSaving(true);
    setActionError(null);
    try {
      const originalStatus = findOriginalPresenceStatus(
        partidas as any[],
        dataKey,
        targetAthleteId
      );
      const response = await fetch("/api/admin/destaques-do-dia/ausencia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dataKey, athleteId: targetAthleteId, role, ausente }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || "Falha ao atualizar ausência.");
      }
      if (ausente) {
        setAusenciaTargets((prev) => ({ ...prev, [role]: targetAthleteId }));
        setPresenceStatusBeforeAbsence((prev) => ({
          ...prev,
          [role]: { athleteId: targetAthleteId, status: originalStatus },
        }));
      } else {
        setAusenciaTargets((prev) => {
          const next = { ...prev };
          delete next[role];
          return next;
        });
        setPresenceStatusBeforeAbsence((prev) => {
          const next = { ...prev };
          delete next[role];
          return next;
        });
      }
      if (body?.destaque) {
        setDestaqueDia(body.destaque as DestaqueDiaResponse);
        setDestaqueDiaDateKey(dataKey);
      }
      await mutate(
        (current: any[] | undefined) =>
          updatePresenceStatusForAthlete(
            current,
            dataKey,
            targetAthleteId,
            ausente ? "AUSENTE" : statusToRestore
          ),
        { revalidate: false }
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao atualizar ausência.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!dataKey) return;
    setIsPublishing(true);
    setPublishError(null);
    setPublishFeedback(null);
    try {
      const publishResponse = await fetch("/api/admin/destaques-do-dia/time-campeao/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dataKey }),
      });
      const publishBodyText = await publishResponse.text().catch(() => "");
      const saved = parseBody(publishBodyText) as DestaqueDiaResponse | null;

      if (!publishResponse.ok) {
        throw new Error(
          resolveErrorMessage(publishBodyText, "Falha ao oficializar Time Campeão do Dia.")
        );
      }

      if (!saved?.timeCampeaoDoDia || saved.timeCampeaoDoDia.status !== "published") {
        throw new Error("Time Campeão do Dia não foi oficializado no backend.");
      }

      setDestaqueDia(saved);
      setDestaqueDiaDateKey(dataKey);

      if (saved?.publication?.shouldUpdatePublicSpotlight !== false) {
        const response = await fetch("/api/admin/destaques-do-dia/publicar", {
          method: "POST",
        });
        const bodyText = await response.text().catch(() => "");
        if (!response.ok) {
          throw new Error(resolveErrorMessage(bodyText, "Falha ao publicar no site."));
        }
      }
      setPublishFeedback(
        saved?.publication?.shouldUpdatePublicSpotlight === false
          ? {
              title: "Campeão registrado com sucesso",
              body: `A rodada de ${formatDatePtBr(
                dataKey
              )} foi registrada no histórico e será considerada nos rankings e perfis dos atletas. A página inicial não foi alterada porque já existe uma publicação mais recente${
                currentPublicSpotlightDateKey
                  ? `, de ${formatDatePtBr(currentPublicSpotlightDateKey)}`
                  : ""
              }.`,
            }
          : {
              title: "Publicado no site com sucesso",
              body: "O Time Campeão, o banner e os Destaques do Dia desta rodada agora estão disponíveis na página pública do seu grupo.",
            }
      );
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Falha ao publicar no site.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Time Campeão do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o Time Campeão do Dia e os destaques gerados automaticamente a partir das partidas reais do racha."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campeão do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-zinc-900 flex flex-col items-center">
        {publishFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">{publishFeedback.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{publishFeedback.body}</p>
              <button
                type="button"
                onClick={() => setPublishFeedback(null)}
                className="mt-5 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
        <div className="w-full max-w-5xl">
          <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-yellow-300 sm:text-3xl">
                Time Campeão do Dia
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-zinc-300 sm:text-base">
                Confira o campeão da rodada, revise os destaques e publique no site do seu grupo.
              </p>
              {destaqueAtualizadoEm && (
                <p className="mt-2 text-xs text-zinc-500">
                  Dados salvos atualizados em {destaqueAtualizadoEm}
                </p>
              )}
            </div>
          </div>

          {selectedRound && hasDados && <Stepper currentStep={currentStep} />}
          {showModalRegras && <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />}
        </div>

        {isFetchingDestaque && (
          <div className="text-xs text-yellow-300 mb-3">Carregando dados salvos do dia...</div>
        )}
        {actionError && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center mb-6">
            <p className="font-semibold mb-1">Não foi possível concluir a ação.</p>
            <p className="text-sm">{actionError}</p>
          </div>
        )}

        {(isLoading || isLoadingQueue) && (
          <div className="text-gray-300 py-10 text-center">
            Carregando rodadas prontas para registrar...
          </div>
        )}

        {(isError || isQueueError) && !isLoading && !isLoadingQueue && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center">
            <p className="font-semibold mb-1">Erro ao carregar partidas do dia.</p>
            {(error || queueError) && <p className="text-sm">{String(error || queueError)}</p>}
          </div>
        )}

        {!isLoading && !isLoadingQueue && !isError && !isQueueError && !selectedRound && (
          <div className="mt-6 w-full max-w-4xl space-y-4">
            {queue.rodadasAguardandoCampeao.length > 0 ? (
              <section className="rounded-2xl border border-yellow-400/30 bg-zinc-950 p-5 shadow-xl sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                      Pendência de pós-jogo
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {queue.rodadasAguardandoCampeao.length === 1
                        ? "Você tem uma rodada concluída aguardando o Time Campeão"
                        : `${queue.rodadasAguardandoCampeao.length} rodadas aguardando o Time Campeão`}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                      Todos os resultados já foram registrados. Escolha uma rodada para finalizar o
                      Time Campeão do Dia e os destaques.
                    </p>
                    {queue.rodadasAguardandoCampeao.length === 1 && (
                      <p className="mt-3 text-sm font-semibold text-zinc-200">
                        {formatDatePtBr(queue.rodadasAguardandoCampeao[0].date)} ·{" "}
                        {queue.rodadasAguardandoCampeao[0].completedMatches} de{" "}
                        {queue.rodadasAguardandoCampeao[0].totalMatches} partidas finalizadas
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoundSelect(queue.rodadasAguardandoCampeao[0].date)}
                    className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300"
                  >
                    Registrar agora
                  </button>
                </div>

                {queue.rodadasAguardandoCampeao.length > 1 && (
                  <div className="mt-5 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/60">
                    {queue.rodadasAguardandoCampeao.map((round) => (
                      <div
                        key={round.date}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white">{formatDatePtBr(round.date)}</p>
                          <p className="text-xs text-zinc-400">
                            {round.completedMatches} de {round.totalMatches} partidas finalizadas
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRoundSelect(round.date)}
                          className="self-start rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 sm:self-auto"
                        >
                          Registrar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
                <h2 className="text-xl font-bold text-white">Nenhuma rodada aguardando registro</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
                  Quando todos os resultados de uma nova rodada forem concluídos, o Time Campeão e
                  os Destaques do Dia aparecerão aqui para você revisar.
                </p>
              </section>
            )}

            {queue.rodadasIncompletas.length > 0 && (
              <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {queue.rodadasIncompletas.length}{" "}
                      {queue.rodadasIncompletas.length === 1
                        ? "rodada ainda possui resultados pendentes"
                        : "rodadas ainda possuem resultados pendentes"}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-zinc-400">
                      Essas rodadas ainda não podem gerar Time Campeão do Dia. Finalize os
                      confrontos pendentes para liberá-las.
                    </p>
                  </div>
                  <Link
                    href="/admin/partidas/historico"
                    className="rounded-xl border border-yellow-400/50 px-4 py-2 text-sm font-bold text-yellow-200 hover:bg-yellow-400/10"
                  >
                    Ver resultados pendentes
                  </Link>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {queue.rodadasIncompletas.slice(0, 6).map((round) => (
                    <div
                      key={round.date}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200"
                    >
                      <span className="font-semibold">{formatDatePtBr(round.date)}</span>
                      <span className="text-zinc-500"> — </span>
                      <span className="text-zinc-400">
                        {round.completedMatches} de {round.totalMatches}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!isLoading &&
          !isLoadingQueue &&
          !isError &&
          !isQueueError &&
          selectedRound &&
          !hasDados && (
            <div className="text-gray-300 py-10 text-center">
              Não foi possível montar os dados da rodada selecionada. Revise os resultados no
              histórico.
            </div>
          )}

        {!isLoading &&
          !isLoadingQueue &&
          !isError &&
          !isQueueError &&
          selectedRound &&
          hasDados && (
            <div className="mt-5 flex w-full max-w-5xl flex-col items-center gap-5">
              {currentStep === 1 && (
                <section className="w-full space-y-5">
                  <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                    <div className="rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-zinc-950 to-zinc-900 p-5 shadow-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={timeCampeao?.logoUrl || "/images/logos/logo_fut7pro.png"}
                          alt={timeCampeao?.nome || "Time Campeão do Dia"}
                          className="h-16 w-16 rounded-2xl border border-yellow-400/50 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold uppercase text-yellow-300">
                            Time Campeão do Dia
                          </p>
                          <h3 className="text-2xl font-extrabold text-white">
                            {timeCampeao?.nome || "A definir"}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-zinc-900 p-3">
                          <div className="text-2xl font-bold text-yellow-300">
                            {campeaoInfo?.pontos ?? 0}
                          </div>
                          <div className="text-zinc-400">pontos</div>
                        </div>
                        <div className="rounded-xl bg-zinc-900 p-3">
                          <div className="text-2xl font-bold text-white">
                            {desempenhoCampeao.vitorias}
                          </div>
                          <div className="text-zinc-400">vitórias</div>
                        </div>
                        <div className="rounded-xl bg-zinc-900 p-3">
                          <div className="text-2xl font-bold text-white">
                            {desempenhoCampeao.empates}
                          </div>
                          <div className="text-zinc-400">empates</div>
                        </div>
                        <div className="rounded-xl bg-zinc-900 p-3">
                          <div className="text-2xl font-bold text-white">
                            {desempenhoCampeao.derrotas}
                          </div>
                          <div className="text-zinc-400">derrotas</div>
                        </div>
                      </div>
                      {dataKey && (
                        <div className="mt-4 text-sm text-zinc-400">
                          Rodada de {formatDatePtBr(dataKey)}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            Elenco Campeão — {elencoCampeao.length} atletas
                          </h3>
                          <p className="text-sm text-zinc-400">
                            Atletas confirmados no time campeão. Ausentes e BOTs não recebem
                            crédito.
                          </p>
                        </div>
                        <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-200">
                          {canGoDestaques ? "Concluído" : "Pendente"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {elencoCampeao.map((jogador) => (
                          <AthleteChampionCard key={jogador.id || jogador.nome} jogador={jogador} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="self-start text-sm font-semibold text-yellow-200 hover:text-yellow-100"
                      onClick={() => setShowModalRegras(true)}
                    >
                      Como funcionam os destaques?
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-50"
                      disabled={!canGoDestaques}
                      onClick={() => setCurrentStep(2)}
                    >
                      Continuar para Destaques
                    </button>
                  </div>
                </section>
              )}

              {currentStep === 2 && (
                <section className="w-full space-y-5">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                      Destaques
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                      Revise os destaques individuais
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                      Atacante, Meia, Goleiro, Artilheiro e Maestro são automáticos. Escolha
                      manualmente o Zagueiro do Dia quando houver opção.
                    </p>
                  </div>

                  <CardsDestaquesDiaV2
                    confrontos={confrontos}
                    times={times}
                    zagueiroId={destaqueDiaAtual?.zagueiroId ?? null}
                    faltou={destaqueDiaAtual?.faltou ?? null}
                    ausenciaTargets={effectiveAusenciaTargets}
                    onSelectZagueiro={handleZagueiroChange}
                    onToggleAusencia={handleAusencia}
                  />

                  {!canGoPublicacao && (
                    <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
                      Escolha o Zagueiro do Dia para continuar. Se não houver atleta que atuou como
                      zagueiro, a etapa de publicação fica liberada automaticamente.
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
                      onClick={() => setCurrentStep(1)}
                    >
                      Voltar para Campeão
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-50"
                      disabled={!canGoPublicacao}
                      onClick={() => setCurrentStep(3)}
                    >
                      Continuar para Publicação
                    </button>
                  </div>
                </section>
              )}

              {currentStep === 3 && (
                <section className="w-full space-y-5">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                      Revisão final
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Publicação</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                      Revise o resumo, envie o banner se quiser e publique o resultado no site do
                      grupo.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    {isHistoricalRound ? (
                      <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
                        <h3 className="text-lg font-bold text-white">
                          Banner não disponível para esta rodada
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                          Esta rodada é anterior à publicação atualmente exibida no site. Os dados
                          esportivos serão registrados normalmente, mas o banner e os Destaques do
                          Dia da página inicial continuarão sendo os da publicação mais recente.
                        </p>
                        {currentPublicSpotlightDateKey && (
                          <p className="mt-4 text-sm font-semibold text-yellow-200">
                            Publicação atual: {formatDatePtBr(currentPublicSpotlightDateKey)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <BannerUpload
                        bannerUrl={bannerUrl}
                        isSaving={isSaving}
                        onUpload={handleBannerUpload}
                        onRemove={handleBannerRemove}
                      />
                    )}

                    <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
                      <h3 className="text-lg font-bold text-white">Checklist</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-green-200">
                          ✓ Time Campeão definido
                        </div>
                        <div className="flex items-center gap-2 text-green-200">
                          ✓ {elencoCampeao.length} atletas campeões
                        </div>
                        <div className="flex items-center gap-2 text-green-200">
                          ✓ Destaques revisados
                        </div>
                        <div
                          className={
                            canGoPublicacao
                              ? "flex items-center gap-2 text-green-200"
                              : "flex items-center gap-2 text-yellow-200"
                          }
                        >
                          {canGoPublicacao ? "✓" : "○"} Zagueiro do Dia escolhido
                        </div>
                        <div
                          className={
                            bannerUrl
                              ? "flex items-center gap-2 text-green-200"
                              : "flex items-center gap-2 text-zinc-400"
                          }
                        >
                          {isHistoricalRound
                            ? "○ Banner não altera a vitrine"
                            : `${bannerUrl ? "✓" : "○"} Banner ${
                                bannerUrl ? "enviado" : "opcional"
                              }`}
                        </div>
                      </div>
                      <div className="mt-5 rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300">
                        <div className="font-semibold text-white">{timeCampeao?.nome}</div>
                        <div>{elencoCampeao.length} campeões do dia</div>
                        <div>{campeaoInfo?.pontos ?? 0} pontos na rodada</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/40 bg-zinc-950 p-5">
                    {destaqueDiaAtual?.timeCampeaoDoDia?.status === "published" && (
                      <div className="mb-3 text-sm text-green-300">
                        Time Campeão oficial salvo:{" "}
                        {destaqueDiaAtual.timeCampeaoDoDia.team?.name ||
                          destaqueDiaAtual.timeCampeaoDoDia.teamId}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
                        onClick={() => setCurrentStep(2)}
                      >
                        Voltar para Destaques
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black shadow disabled:opacity-60"
                        onClick={handlePublish}
                        disabled={isSaving || isPublishing || !canGoPublicacao}
                      >
                        {isPublishing
                          ? isHistoricalRound
                            ? "Registrando..."
                            : "Publicando no site..."
                          : isHistoricalRound
                            ? "Registrar Time Campeão"
                            : "Salvar e Publicar no Site"}
                      </button>
                    </div>
                    {publishError && (
                      <div className="mt-3 text-sm text-red-200">{publishError}</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
      </main>
    </>
  );
}

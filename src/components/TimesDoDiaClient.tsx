"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CardTimeDoDia from "@/components/cards/CardTimeDoDia";
import ConfrontosDoDia from "@/components/lists/ConfrontosDoDia";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { useTimesDoDiaPublicado } from "@/hooks/useTimesDoDiaPublicado";
import { useAboutPublic } from "@/hooks/useAbout";
import { useFooterConfigAdmin, useFooterConfigPublic } from "@/hooks/useFooterConfig";
import type { PublicMatch, TimeDoDia } from "@/types/partida";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";
const DEFAULT_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_COLOR = "#facc15";

type Confronto = {
  id: string;
  timeA: string;
  timeB: string;
  hora?: string;
  ordem?: number;
  tempo?: number;
  turno?: "ida" | "volta";
};

type TimesDoDiaClientProps = {
  slug?: string;
  source?: "public" | "admin";
};

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function mapStatus(status?: string | null): TimeDoDia["jogadores"][number]["status"] {
  switch (status) {
    case "SUBSTITUTO":
      return "substituto";
    case "AUSENTE":
      return "ausente";
    default:
      return "titular";
  }
}

function mapPosicao(position?: string | null): TimeDoDia["jogadores"][number]["posicao"] {
  if (!position) return "Meia";
  const normalized = position.toLowerCase();
  if (normalized.includes("gol")) return "Goleiro";
  if (normalized.includes("zag")) return "Zagueiro";
  if (normalized.includes("ata")) return "Atacante";
  return "Meia";
}

function buildTimesDoDia(matches: PublicMatch[]) {
  const dated = matches
    .map((match) => ({ match, date: parseDate(match.date) }))
    .filter((item): item is { match: PublicMatch; date: Date } => item.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (!dated.length) {
    return { times: [] as TimeDoDia[], confrontos: [] as Confronto[], dataReferencia: null };
  }

  const dataReferencia = dated[0].date;
  const matchesDoDia = dated
    .filter((item) => isSameDay(item.date, dataReferencia))
    .map((item) => item.match);

  const timesMap = new Map<
    string,
    TimeDoDia & { stats: { pontos: number; saldo: number; gols: number } }
  >();
  const confrontos: Confronto[] = [];

  const ensureTime = (team: PublicMatch["teamA"], fallbackId: string) => {
    const teamId = (team.id || fallbackId || team.name || `time-${timesMap.size + 1}`).toString();
    if (!timesMap.has(teamId)) {
      timesMap.set(teamId, {
        id: teamId,
        nome: team.name || "Time",
        logo: team.logoUrl || DEFAULT_LOGO,
        cor: team.color || DEFAULT_COLOR,
        jogadores: [],
        stats: { pontos: 0, saldo: 0, gols: 0 },
      });
    }
    return timesMap.get(teamId)!;
  };

  matchesDoDia.forEach((match) => {
    const hora = parseDate(match.date)?.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const timeA = ensureTime(match.teamA, `${match.id}-a`);
    const timeB = ensureTime(match.teamB, `${match.id}-b`);
    confrontos.push({
      id: match.id,
      timeA: timeA.nome,
      timeB: timeB.nome,
      hora: hora || undefined,
    });

    const scoreA = Number.isFinite(match.score?.teamA)
      ? Number(match.score.teamA)
      : Number(match.scoreA ?? 0);
    const scoreB = Number.isFinite(match.score?.teamB)
      ? Number(match.score.teamB)
      : Number(match.scoreB ?? 0);

    timeA.stats.gols += scoreA;
    timeB.stats.gols += scoreB;
    timeA.stats.saldo += scoreA - scoreB;
    timeB.stats.saldo += scoreB - scoreA;

    if (scoreA > scoreB) {
      timeA.stats.pontos += 3;
    } else if (scoreB > scoreA) {
      timeB.stats.pontos += 3;
    } else {
      timeA.stats.pontos += 1;
      timeB.stats.pontos += 1;
    }

    match.presences.forEach((presence) => {
      const alvo =
        (presence.teamId && timesMap.get(presence.teamId)) ||
        timesMap.get(presence.team?.id || "") ||
        null;
      if (!alvo) return;

      const athlete = presence.athlete;
      const jogadorId = athlete?.id || `${presence.id}-${alvo.id}`;
      const jaExiste = alvo.jogadores.some((j) => j.id === jogadorId);
      if (jaExiste) return;

      alvo.jogadores.push({
        id: jogadorId,
        nome: athlete?.name || "Jogador",
        apelido: athlete?.nickname || "",
        foto: athlete?.photoUrl || DEFAULT_PLAYER,
        posicao: mapPosicao(athlete?.position),
        status: mapStatus(presence.status),
      });
    });
  });

  const campeao = Array.from(timesMap.values()).sort((a, b) => {
    if (b.stats.pontos !== a.stats.pontos) return b.stats.pontos - a.stats.pontos;
    if (b.stats.saldo !== a.stats.saldo) return b.stats.saldo - a.stats.saldo;
    return b.stats.gols - a.stats.gols;
  })[0];

  if (campeao) {
    campeao.ehTimeCampeao = true;
  }

  return {
    times: Array.from(timesMap.values()).map((time) => ({
      id: time.id,
      nome: time.nome,
      logo: time.logo,
      cor: time.cor,
      ehTimeCampeao: time.ehTimeCampeao,
      jogadores: time.jogadores,
    })),
    confrontos,
    dataReferencia: dataReferencia.toISOString(),
  };
}

function buildConfrontosPublicados(
  confrontos: Array<{
    id: string;
    ordem?: number;
    tempo?: number;
    turno?: "ida" | "volta";
    timeA: string;
    timeB: string;
  }>,
  publicadoEm?: string | null,
  duracaoPartidaMin?: number
) {
  if (!confrontos.length) return [];
  const base = publicadoEm ? new Date(publicadoEm) : null;
  return confrontos.map((confronto, index) => {
    const ordem = confronto.ordem ?? index + 1;
    const tempo = confronto.tempo ?? duracaoPartidaMin ?? 0;
    let hora: string | undefined;
    if (base && tempo > 0) {
      const inicio = new Date(base.getTime() + (ordem - 1) * tempo * 60000);
      hora = inicio.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return {
      ...confronto,
      ordem,
      tempo,
      hora,
    };
  });
}

export default function TimesDoDiaClient({ slug, source = "public" }: TimesDoDiaClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isAdmin = source === "admin";
  const sorteioPublicado = useTimesDoDiaPublicado({ slug, source, enabled: true });
  const publicado = Boolean(sorteioPublicado.data?.times?.length);
  const publicData = usePublicMatches({
    slug,
    scope: "recent",
    limit: 20,
    enabled: !isAdmin && !publicado,
  });
  const adminData = useAdminMatches({ enabled: isAdmin && !publicado });
  const { about } = useAboutPublic(slug);
  const { footer: footerPublic } = useFooterConfigPublic(slug, { enabled: !isAdmin });
  const { footer: footerAdmin } = useFooterConfigAdmin({ enabled: isAdmin });
  const footer = isAdmin ? footerAdmin : footerPublic;

  const matches = isAdmin ? adminData.matches : publicData.matches;
  const fallbackError = isAdmin ? adminData.error : publicData.error;
  const fallbackLoading = isAdmin ? adminData.isLoading : publicData.isLoading;

  const sorteioTimes = sorteioPublicado.data?.times ?? [];
  const publishedAt = sorteioPublicado.data?.publicadoEm ?? null;
  const confrontosPublicados = useMemo(
    () =>
      buildConfrontosPublicados(
        sorteioPublicado.data?.confrontos ?? [],
        publishedAt,
        sorteioPublicado.data?.configuracao?.duracaoPartidaMin
      ),
    [publishedAt, sorteioPublicado.data?.confrontos, sorteioPublicado.data?.configuracao]
  );

  const fallback = useMemo(() => buildTimesDoDia(matches), [matches]);
  const times = publicado ? sorteioTimes : fallback.times;
  const confrontos = publicado ? confrontosPublicados : fallback.confrontos;
  const dataReferencia = publicado ? publishedAt : fallback.dataReferencia;

  const hasFallbackData = !publicado && fallback.times.length > 0;
  const error = hasFallbackData ? null : sorteioPublicado.error || fallbackError;
  const isLoading = sorteioPublicado.isLoading || (!publicado && fallbackLoading);
  const isError = Boolean(error);

  const campoOficial = useMemo(() => {
    if (about?.campoAtual) return about.campoAtual;
    if (about?.camposHistoricos?.length) return about.camposHistoricos[0];
    return null;
  }, [about]);

  const localInfo = useMemo(() => {
    const localPublicacao = sorteioPublicado.data?.local;
    const campoNome = footer?.campo?.nome || localPublicacao?.nome || campoOficial?.nome;
    const campoEndereco =
      footer?.campo?.endereco || localPublicacao?.endereco || campoOficial?.endereco;
    const campoMapa = footer?.campo?.mapa || localPublicacao?.mapa || campoOficial?.mapa;
    const hasFooterCampo = Boolean(
      footer?.campo?.nome || footer?.campo?.endereco || footer?.campo?.mapa
    );
    const observacoes =
      localPublicacao?.observacoes || (hasFooterCampo ? undefined : campoOficial?.descricao);
    if (!campoNome && !campoEndereco && !campoMapa && !observacoes) return null;
    return {
      nome: campoNome,
      endereco: campoEndereco,
      mapa: campoMapa,
      observacoes,
    };
  }, [campoOficial, footer, sorteioPublicado.data?.local]);

  const [curtidas, setCurtidas] = useState<number>(0);
  const [curtido, setCurtido] = useState(false);
  const [curtindo, setCurtindo] = useState(false);
  const publicacaoId = sorteioPublicado.data?.id;
  const likeKey = source === "public" && publicacaoId ? `fut7pro-like-${publicacaoId}` : null;

  useEffect(() => {
    if (source !== "public") return;
    setCurtidas(sorteioPublicado.data?.curtidas ?? 0);
  }, [source, sorteioPublicado.data?.curtidas]);

  useEffect(() => {
    if (source !== "public" || !likeKey || typeof window === "undefined") return;
    setCurtido(window.localStorage.getItem(likeKey) === "1");
  }, [likeKey, source]);

  const confrontosDetalhados = useMemo(() => {
    if (!confrontos.length) return [];
    const timeLogoMap = new Map<string, string>();
    times.forEach((time) => {
      const key = time?.nome?.trim().toLowerCase();
      if (key) {
        timeLogoMap.set(key, time.logo || DEFAULT_LOGO);
      }
    });
    return confrontos.map((confronto) => {
      const keyA = confronto.timeA?.trim().toLowerCase();
      const keyB = confronto.timeB?.trim().toLowerCase();
      return {
        ...confronto,
        logoA: (keyA && timeLogoMap.get(keyA)) || DEFAULT_LOGO,
        logoB: (keyB && timeLogoMap.get(keyB)) || DEFAULT_LOGO,
      };
    });
  }, [confrontos, times]);

  if (isLoading) {
    return <div className="text-center text-neutral-300">Carregando times publicados...</div>;
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg text-center">
        Falha ao carregar os times publicados.{" "}
        {error instanceof Error ? error.message : "Tente novamente em instantes."}
      </div>
    );
  }

  if (!times.length) {
    return (
      <div className="text-center text-neutral-300">
        Nenhum Time do Dia publicado ainda. Publique o sorteio no painel para exibir aqui.
      </div>
    );
  }

  const dataLabel = dataReferencia ? new Date(dataReferencia).toLocaleDateString("pt-BR") : null;
  const dataLabelPrefix = publicado ? "Publicado em" : "Referencia";
  const observacoes = localInfo?.observacoes ?? null;

  return (
    <>
      {(dataLabel || localInfo || observacoes) && (
        <div className="mb-6 rounded-lg border border-yellow-500/20 bg-[#1c1c1c] px-4 py-3 text-sm text-neutral-200">
          {dataLabel && (
            <div className="mb-1">
              {dataLabelPrefix}: <span className="text-yellow-300">{dataLabel}</span>
            </div>
          )}
          {localInfo?.nome && (
            <div className="mb-1">
              Local: <span className="text-neutral-100">{localInfo.nome}</span>
            </div>
          )}
          {localInfo?.endereco && (
            <div className="mb-1 text-neutral-300">Endereco: {localInfo.endereco}</div>
          )}
          {observacoes && <div className="text-neutral-300">Obs: {observacoes}</div>}
        </div>
      )}
      <div ref={gridRef}>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {times.map((time) => (
            <CardTimeDoDia key={time.id} time={time} />
          ))}
        </section>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3 text-center">
          Confrontos do dia
        </h3>
        <ConfrontosDoDia confrontos={confrontosDetalhados} />
      </div>
      {source === "public" && publicacaoId && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (!slug || curtindo || curtido) return;
              setCurtindo(true);
              try {
                const res = await fetch(`/api/public/${slug}/times-do-dia/like`, {
                  method: "POST",
                });
                if (!res.ok) {
                  throw new Error(await res.text());
                }
                const body = await res.json();
                const next = Number.isFinite(body?.curtidas) ? Number(body.curtidas) : curtidas + 1;
                setCurtidas(next);
                setCurtido(true);
                if (likeKey && typeof window !== "undefined") {
                  window.localStorage.setItem(likeKey, "1");
                }
              } catch {
                // silencioso
              } finally {
                setCurtindo(false);
              }
            }}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              curtido ? "bg-green-500 text-white" : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
            disabled={curtindo || curtido}
          >
            {curtindo ? "Salvando..." : curtido ? "Curtido" : "Curtir"}
          </button>
          <span className="text-xs text-neutral-400">{curtidas} curtidas</span>
        </div>
      )}
    </>
  );
}

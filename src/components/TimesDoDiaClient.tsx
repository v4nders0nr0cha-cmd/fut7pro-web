"use client";

import { useMemo, useRef } from "react";
import CardTimeDoDia from "@/components/cards/CardTimeDoDia";
import ConfrontosDoDia from "@/components/lists/ConfrontosDoDia";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import type { PublicMatch, TimeDoDia } from "@/types/partida";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";
const DEFAULT_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_COLOR = "#facc15";

type Confronto = { id: string; timeA: string; timeB: string; hora?: string };

type TimesDoDiaClientProps = {
  slug?: string;
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

export default function TimesDoDiaClient({ slug }: TimesDoDiaClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { matches, isLoading, isError, error } = usePublicMatches({
    slug,
    scope: "recent",
    limit: 20,
  });

  const { times, confrontos, dataReferencia } = useMemo(() => buildTimesDoDia(matches), [matches]);

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

  return (
    <>
      {dataLabel && (
        <p className="text-center text-neutral-400 text-sm mb-4">
          Referencia: {dataLabel} (dados em tempo real)
        </p>
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
        <ConfrontosDoDia confrontos={confrontos} />
      </div>
    </>
  );
}

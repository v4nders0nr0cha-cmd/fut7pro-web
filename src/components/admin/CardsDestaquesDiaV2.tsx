"use client";

import { useMemo } from "react";
import type { Match, MatchPresence } from "@/types/partida";
import type { DerivedTimeDoDia, DerivedPlayer } from "@/utils/match-adapters";

type HighlightCardProps = {
  titulo: string;
  nome?: string | null;
  apelido?: string | null;
  posicao?: string | null;
  infoExtra?: string | null;
  foto?: string | null;
};

type Props = {
  matches: Match[];
  times: DerivedTimeDoDia[];
  championTeamId: string | null;
};

const FALLBACK_PLAYER_PHOTO = "/images/jogadores/jogador_padrao_01.jpg";
const FALLBACK_TEAM_LOGO = "/images/logos/logo_fut7pro.png";

const POSITION_PRIORITY: DerivedPlayer["posicao"][] = ["Atacante", "Meia", "Zagueiro", "Goleiro"];

function normalizePosition(raw?: string | null): DerivedPlayer["posicao"] {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("gol")) return "Goleiro";
  if (value.includes("zag") || value.includes("def")) return "Zagueiro";
  if (value.includes("mei") || value.includes("mid")) return "Meia";
  return "Atacante";
}

type PlayerStats = {
  id: string;
  nome: string;
  apelido?: string | null;
  posicao: DerivedPlayer["posicao"];
  timeId: string | null;
  timeNome: string | null;
  foto: string;
  gols: number;
  assistencias: number;
};

function createStatsForPresence(
  presence: MatchPresence,
  derived: { player: DerivedPlayer; teamId: string; timeNome: string } | undefined,
): PlayerStats {
  const athlete = presence.athlete;
  const baseName = athlete?.name ?? "Atleta";
  const photo = athlete?.photoUrl ?? presence.team?.logoUrl ?? FALLBACK_PLAYER_PHOTO;

  if (derived) {
    return {
      id: derived.player.id,
      nome: derived.player.nome || baseName,
      apelido: derived.player.apelido ?? athlete?.nickname ?? null,
      posicao: derived.player.posicao,
      timeId: derived.teamId,
      timeNome: derived.timeNome,
      foto: derived.player.foto || photo,
      gols: presence.goals ?? 0,
      assistencias: presence.assists ?? 0,
    };
  }

  const teamId = presence.team?.id ?? presence.teamId ?? null;
  return {
    id: athlete?.id ?? `${presence.id}`,
    nome: baseName,
    apelido: athlete?.nickname ?? null,
    posicao: normalizePosition(athlete?.position),
    timeId: teamId,
    timeNome: presence.team?.name ?? null,
    foto: photo,
    gols: presence.goals ?? 0,
    assistencias: presence.assists ?? 0,
  };
}

function HighlightCard({ titulo, nome, apelido, posicao, infoExtra, foto }: HighlightCardProps) {
  const safePhoto = foto && foto.length > 0 ? foto : FALLBACK_PLAYER_PHOTO;

  return (
    <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[200px] max-w-xs min-h-[240px] justify-between">
      <div className="flex flex-col items-center gap-2">
        <div className="text-yellow-400 font-bold text-sm text-center uppercase tracking-wide">
          {titulo}
        </div>
        {nome ? (
          <>
            <img
              src={safePhoto}
              alt={nome}
              className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400"
            />
            <div className="text-white text-lg font-bold text-center">{nome}</div>
            {apelido && (
              <div className="text-yellow-200 text-xs text-center uppercase">{apelido}</div>
            )}
            {posicao && (
              <div className="text-xs text-zinc-300 font-semibold uppercase">{posicao}</div>
            )}
            {infoExtra && (
              <div className="mt-1 text-yellow-300 text-sm font-bold text-center">{infoExtra}</div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-zinc-900 border-4 border-zinc-700" />
            <div className="text-zinc-400 text-sm text-center">Sem destaque registrado</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CardsDestaquesDiaV2({ matches, times, championTeamId }: Props) {
  const derivedMaps = useMemo(() => {
    const byId = new Map<string, { player: DerivedPlayer; teamId: string; timeNome: string }>();
    const byName = new Map<string, { player: DerivedPlayer; teamId: string; timeNome: string }>();

    times.forEach((time) => {
      time.jogadores.forEach((player) => {
        const record = { player, teamId: time.id, timeNome: time.nome };
        byId.set(player.id, record);
        byName.set(player.nome.toLowerCase(), record);
      });
    });

    return { byId, byName };
  }, [times]);

  const statsByPlayer = useMemo(() => {
    const stats = new Map<string, PlayerStats>();

    matches.forEach((match) => {
      match.presences.forEach((presence) => {
        const athleteId = presence.athlete?.id;
        const lookup =
          (athleteId && derivedMaps.byId.get(athleteId)) ||
          (presence.athlete?.name &&
            derivedMaps.byName.get(presence.athlete.name.toLowerCase())) ||
          undefined;

        const statsKey = athleteId ?? lookup?.player.id ?? presence.id;
        const previous = stats.get(statsKey);

        if (previous) {
          previous.gols += presence.goals ?? 0;
          previous.assistencias += presence.assists ?? 0;
          stats.set(statsKey, previous);
        } else {
          const computed = createStatsForPresence(presence, lookup);
          stats.set(statsKey, computed);
        }
      });
    });

    return Array.from(stats.values());
  }, [matches, derivedMaps.byId, derivedMaps.byName]);

  const championTeam = useMemo(
    () => (championTeamId ? times.find((time) => time.id === championTeamId) ?? null : null),
    [times, championTeamId],
  );

  const atacanteDoDia = useMemo(() => {
    const atacantes = statsByPlayer.filter((p) => p.posicao === "Atacante");
    return atacantes.sort((a, b) => b.gols - a.gols || b.assistencias - a.assistencias)[0] ?? null;
  }, [statsByPlayer]);

  const meiaDoDia = useMemo(() => {
    const meias = statsByPlayer.filter((p) => p.posicao === "Meia");
    return meias.sort((a, b) => b.assistencias - a.assistencias || b.gols - a.gols)[0] ?? null;
  }, [statsByPlayer]);

  const artilheiroGeral = useMemo(
    () => statsByPlayer.sort((a, b) => b.gols - a.gols || b.assistencias - a.assistencias)[0] ?? null,
    [statsByPlayer],
  );

  const maestroGeral = useMemo(
    () =>
      statsByPlayer.sort((a, b) => b.assistencias - a.assistencias || b.gols - a.gols)[0] ?? null,
    [statsByPlayer],
  );

  const goleiroCampeao = useMemo(() => {
    if (!championTeam) return null;
    const candidate = championTeam.jogadores.find((p) => p.posicao === "Goleiro");
    if (!candidate) return null;
    const stats = statsByPlayer.find((p) => p.id === candidate.id) ?? null;
    return (
      stats ?? {
        id: candidate.id,
        nome: candidate.nome,
        apelido: candidate.apelido ?? null,
        posicao: candidate.posicao,
        timeId: championTeam.id,
        timeNome: championTeam.nome,
        foto: candidate.foto,
        gols: 0,
        assistencias: 0,
      }
    );
  }, [championTeam, statsByPlayer]);

  const zagueiroCampeao = useMemo(() => {
    if (!championTeam) return null;
    const defenders = championTeam.jogadores.filter((p) => p.posicao === "Zagueiro");
    if (defenders.length === 0) return null;

    const best = defenders
      .map((player) => {
        const stats = statsByPlayer.find((p) => p.id === player.id);
        return (
          stats ?? {
            id: player.id,
            nome: player.nome,
            apelido: player.apelido ?? null,
            posicao: player.posicao,
            timeId: championTeam.id,
            timeNome: championTeam.nome,
            foto: player.foto,
            gols: 0,
            assistencias: 0,
          }
        );
      })
      .sort((a, b) => POSITION_PRIORITY.indexOf(a.posicao) - POSITION_PRIORITY.indexOf(b.posicao))[0];

    return best ?? null;
  }, [championTeam, statsByPlayer]);

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex flex-wrap gap-5 justify-center">
        <HighlightCard
          titulo="Atacante do Dia"
          nome={atacanteDoDia?.nome}
          apelido={atacanteDoDia?.apelido}
          posicao={atacanteDoDia?.posicao}
          infoExtra={atacanteDoDia ? `${atacanteDoDia.gols} gol(s)` : null}
          foto={atacanteDoDia?.foto}
        />
        <HighlightCard
          titulo="Meia do Dia"
          nome={meiaDoDia?.nome}
          apelido={meiaDoDia?.apelido}
          posicao={meiaDoDia?.posicao}
          infoExtra={meiaDoDia ? `${meiaDoDia.assistencias} assistencia(s)` : null}
          foto={meiaDoDia?.foto}
        />
        <HighlightCard
          titulo="Zagueiro do Dia"
          nome={zagueiroCampeao?.nome}
          apelido={zagueiroCampeao?.apelido}
          posicao={zagueiroCampeao?.posicao}
          foto={zagueiroCampeao?.foto}
        />
        <HighlightCard
          titulo="Goleiro do Dia"
          nome={goleiroCampeao?.nome}
          apelido={goleiroCampeao?.apelido}
          posicao={goleiroCampeao?.posicao}
          foto={goleiroCampeao?.foto}
        />
      </div>
      <div className="flex flex-wrap gap-5 justify-center mt-2">
        <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[200px] max-w-xs min-h-[240px] justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="text-yellow-400 font-bold text-sm text-center uppercase tracking-wide">
              Time Campeao do Dia
            </div>
            {championTeam ? (
              <>
                <img
                  src={championTeam.logo || FALLBACK_TEAM_LOGO}
                  alt={championTeam.nome}
                  className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400"
                />
                <div className="text-white text-lg font-bold text-center">{championTeam.nome}</div>
                <div className="text-yellow-200 text-xs text-center uppercase">
                  {championTeam.ehTimeCampeao ? "Destaque confirmado" : "Pontuacao diaria"}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-zinc-900 border-4 border-zinc-700" />
                <div className="text-zinc-400 text-sm text-center">Sem campeao definido</div>
              </>
            )}
          </div>
        </div>
        <HighlightCard
          titulo="Artilheiro do Dia"
          nome={artilheiroGeral?.nome}
          apelido={artilheiroGeral?.apelido}
          posicao={artilheiroGeral?.posicao}
          infoExtra={artilheiroGeral ? `${artilheiroGeral.gols} gol(s)` : null}
          foto={artilheiroGeral?.foto}
        />
        <HighlightCard
          titulo="Maestro do Dia"
          nome={maestroGeral?.nome}
          apelido={maestroGeral?.apelido}
          posicao={maestroGeral?.posicao}
          infoExtra={maestroGeral ? `${maestroGeral.assistencias} assistencia(s)` : null}
          foto={maestroGeral?.foto}
        />
      </div>
    </div>
  );
}

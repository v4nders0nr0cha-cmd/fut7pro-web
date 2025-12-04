"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import BannerUpload from "@/components/admin/BannerUpload";

type JogadorV2 = { nome: string; apelido: string; pos: string };
type TimeV2 = { nome: string; jogadores: JogadorV2[] };
type EventoGolV2 = { time: "a" | "b"; jogador: string; assistencia: string };
type ResultadoPartidaV2 = { placar: { a: number; b: number }; eventos: EventoGolV2[] };
type ConfrontoV2 = {
  ida: { a: number; b: number };
  volta: { a: number; b: number };
  resultadoIda?: ResultadoPartidaV2 | null;
  resultadoVolta?: ResultadoPartidaV2 | null;
};

interface BackendTeam {
  id?: string;
  name?: string | null;
  logoUrl?: string | null;
  color?: string | null;
}

interface BackendAthlete {
  id?: string;
  name?: string;
  nickname?: string | null;
  position?: string | null;
  photoUrl?: string | null;
}

interface BackendPresence {
  id?: string;
  teamId?: string | null;
  team?: BackendTeam | null;
  athlete?: BackendAthlete | null;
  goals?: number | null;
  assists?: number | null;
}

interface BackendMatch {
  id?: string;
  date?: string;
  data?: string;
  scoreA?: number | null;
  golsTimeA?: number | null;
  scoreB?: number | null;
  golsTimeB?: number | null;
  teamAId?: string | null;
  teamBId?: string | null;
  teamA?: BackendTeam | null;
  teamB?: BackendTeam | null;
  presences?: BackendPresence[] | null;
}

function mapPosicao(pos?: string | null): string {
  if (!pos) return "";
  const p = pos.toLowerCase();
  if (p.includes("gol")) return "GOL";
  if (p.includes("zag")) return "ZAG";
  if (p.includes("ata")) return "ATA";
  if (p.includes("mei")) return "MEIA";
  return "";
}

function parseMatchDate(match: BackendMatch): Date | null {
  const raw = match.date ?? match.data;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildDestaquesDoDia(partidas: unknown[] | undefined) {
  const matches = (Array.isArray(partidas) ? partidas : []) as BackendMatch[];
  if (!matches.length) {
    return {
      confrontos: [] as ConfrontoV2[],
      times: [] as TimeV2[],
      dataReferencia: null as string | null,
    };
  }

  const datedMatches = matches
    .map((m) => ({ raw: m, date: parseMatchDate(m) }))
    .filter((m) => m.date !== null) as { raw: BackendMatch; date: Date }[];

  if (!datedMatches.length) {
    return {
      confrontos: [] as ConfrontoV2[],
      times: [] as TimeV2[],
      dataReferencia: null as string | null,
    };
  }

  const latestDate = datedMatches
    .map((m) => m.date)
    .sort((a, b) => b.getTime() - a.getTime())[0] as Date;

  const matchesDoDia = datedMatches.filter((m) => isSameDay(m.date, latestDate)).map((m) => m.raw);

  if (!matchesDoDia.length) {
    return {
      confrontos: [] as ConfrontoV2[],
      times: [] as TimeV2[],
      dataReferencia: null as string | null,
    };
  }

  const teamMap = new Map<
    string,
    { index: number; nome: string; jogadores: Map<string, JogadorV2> }
  >();

  const ensureTeam = (team: BackendTeam | null | undefined, fallbackId?: string | null) => {
    const id = (team?.id ?? fallbackId ?? "").toString();
    if (!id) return null;
    const nome = team?.name ?? "Time";
    const existing = teamMap.get(id);
    if (existing) {
      if (existing.nome === "Time" && nome) {
        existing.nome = nome;
      }
      return existing;
    }
    const created = { index: teamMap.size, nome, jogadores: new Map<string, JogadorV2>() };
    teamMap.set(id, created);
    return created;
  };

  matchesDoDia.forEach((match) => {
    ensureTeam(match.teamA ?? null, match.teamAId ?? null);
    ensureTeam(match.teamB ?? null, match.teamBId ?? null);
  });

  matchesDoDia.forEach((match) => {
    (match.presences ?? []).forEach((presence) => {
      const teamId = (presence.team?.id ?? presence.teamId ?? "").toString();
      if (!teamId) return;
      const teamEntry = teamMap.get(teamId);
      if (!teamEntry) return;
      const athlete = presence.athlete;
      if (!athlete || !athlete.name) return;
      const jogadorId = (athlete.id ?? `${athlete.name}-${teamId}`).toString();
      if (teamEntry.jogadores.has(jogadorId)) return;
      teamEntry.jogadores.set(jogadorId, {
        nome: athlete.name,
        apelido: athlete.nickname ?? "",
        pos: mapPosicao(athlete.position),
      });
    });
  });

  const orderedTeams = Array.from(teamMap.values()).sort((a, b) => a.index - b.index);

  const times: TimeV2[] = orderedTeams.map((team) => ({
    nome: team.nome,
    jogadores: Array.from(team.jogadores.values()),
  }));

  const confrontos: ConfrontoV2[] = matchesDoDia.map((match) => {
    const teamAId = (match.teamA?.id ?? match.teamAId ?? "").toString();
    const teamBId = (match.teamB?.id ?? match.teamBId ?? "").toString();
    const indexA = teamAId && teamMap.get(teamAId) ? (teamMap.get(teamAId) as any).index : 0;
    const indexB = teamBId && teamMap.get(teamBId) ? (teamMap.get(teamBId) as any).index : 0;

    const golsA =
      typeof match.scoreA === "number"
        ? match.scoreA
        : typeof match.golsTimeA === "number"
          ? match.golsTimeA
          : 0;
    const golsB =
      typeof match.scoreB === "number"
        ? match.scoreB
        : typeof match.golsTimeB === "number"
          ? match.golsTimeB
          : 0;

    const eventos: EventoGolV2[] = [];
    (match.presences ?? []).forEach((presence) => {
      const athleteName = presence.athlete?.name ?? "";
      const presTeamId = (presence.team?.id ?? presence.teamId ?? "").toString();
      const timeLabel: "a" | "b" = presTeamId && presTeamId === teamAId ? "a" : "b";

      const gols = presence.goals ?? 0;
      const assists = presence.assists ?? 0;

      for (let i = 0; i < gols; i += 1) {
        eventos.push({
          time: timeLabel,
          jogador: athleteName || "Gol",
          assistencia: "faltou",
        });
      }

      for (let i = 0; i < assists; i += 1) {
        eventos.push({
          time: timeLabel,
          jogador: "faltou",
          assistencia: athleteName || "Assist�ncia",
        });
      }
    });

    const resultadoIda: ResultadoPartidaV2 = {
      placar: { a: Number(golsA) || 0, b: Number(golsB) || 0 },
      eventos,
    };

    return {
      ida: { a: indexA, b: indexB },
      volta: { a: indexA, b: indexB },
      resultadoIda,
      resultadoVolta: undefined,
    };
  });

  return {
    confrontos,
    times,
    dataReferencia: latestDate.toISOString(),
  };
}

export default function TimeCampeaoDoDiaPage() {
  const { partidas, isLoading, isError, error } = usePartidas();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);

  const { confrontos, times, dataReferencia } = useMemo(
    () => buildDestaquesDoDia(partidas),
    [partidas]
  );

  const hasDados = confrontos.length > 0 && times.length > 0;
  const dataLabel =
    dataReferencia != null ? new Date(dataReferencia).toLocaleDateString("pt-BR") : null;

  return (
    <>
      <Head>
        <title>Time Campe�o do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o Time Campe�o do Dia e os destaques gerados automaticamente a partir das partidas reais do racha."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campe�o do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-zinc-900 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 text-center drop-shadow">
          Time Campe�o do Dia
        </h1>
        <p className="text-gray-300 mb-6 text-center text-lg max-w-2xl">
          Os dados abaixo s�o calculados a partir das partidas finalizadas do dia{" "}
          {dataLabel ?? "mais recente"}. O <b>Time Campe�o</b> � definido por vit�rias e pontos, e
          os destaques individuais consideram gols e assist�ncias registrados nas presen�as.
        </p>

        {isLoading && (
          <div className="text-gray-300 py-10 text-center">
            Carregando partidas para calcular o Time Campe�o do Dia...
          </div>
        )}

        {isError && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center">
            <p className="font-semibold mb-1">Erro ao carregar partidas do dia.</p>
            {error && <p className="text-sm">{String(error)}</p>}
          </div>
        )}

        {!isLoading && !isError && !hasDados && (
          <div className="text-gray-300 py-10 text-center">
            Nenhuma partida finalizada encontrada para o dia selecionado. Registre partidas no
            painel para habilitar o c�lculo do Time Campe�o do Dia.
          </div>
        )}

        {!isLoading && !isError && hasDados && (
          <>
            <div className="w-full flex flex-col items-center mt-6 mb-3">
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-1">Destaques do Dia</h2>
              <button
                className="text-sm underline text-yellow-300 hover:text-yellow-500 mb-2 transition"
                onClick={() => setShowModalRegras(true)}
                tabIndex={0}
              >
                clique aqui e saiba as regras
              </button>
            </div>

            {showModalRegras && <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />}

            <div className="w-full flex flex-col items-center gap-12 mt-4 max-w-5xl">
              <CardsDestaquesDiaV2 confrontos={confrontos} times={times} />

              <BannerUpload bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} timeCampeao={null} />
            </div>
          </>
        )}
      </main>
    </>
  );
}

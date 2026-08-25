import type { PublicMatch } from "@/types/partida";
import type { DestaqueDiaResponse } from "@/types/destaques";

const FORTALEZA_TZ = "America/Fortaleza";

export type RankingCampeaoDoDiaItem = {
  athleteId: string;
  nome: string;
  apelido?: string | null;
  foto?: string | null;
  campeoesDoDia: number;
};

export type RankingCampeoesPeriodo = "mes" | "quadrimestre" | "ano" | "todos";

export function formatDateYMD(date: Date, timeZone = FORTALEZA_TZ) {
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function resolveCampeoesPeriodoRange(periodo: RankingCampeoesPeriodo, now = new Date()) {
  const year = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: FORTALEZA_TZ, year: "numeric" }).format(now)
  );
  const month = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: FORTALEZA_TZ, month: "numeric" }).format(now)
  );
  const quadrimestreInicio = Math.floor((month - 1) / 4) * 4 + 1;
  const lastDayOfMonth = (yearValue: number, monthValue: number) =>
    new Date(Date.UTC(yearValue, monthValue, 0)).getUTCDate();
  const formatCalendarDate = (yearValue: number, monthValue: number, dayValue: number) =>
    `${yearValue}-${String(monthValue).padStart(2, "0")}-${String(dayValue).padStart(2, "0")}`;

  if (periodo === "todos") {
    return { from: "2000-01-01", to: formatDateYMD(now), year };
  }

  if (periodo === "mes") {
    const from = formatCalendarDate(year, month, 1);
    const to = formatCalendarDate(year, month, lastDayOfMonth(year, month));
    return { from, to, year };
  }

  if (periodo === "quadrimestre") {
    const quadrimestreFim = quadrimestreInicio + 3;
    const from = formatCalendarDate(year, quadrimestreInicio, 1);
    const to = formatCalendarDate(year, quadrimestreFim, lastDayOfMonth(year, quadrimestreFim));
    return { from, to, year };
  }

  return { from: `${year}-01-01`, to: `${year}-12-31`, year };
}

function resolveTeamKey(value?: string | null) {
  return String(value || "").trim();
}

function isBotPresence(presence: PublicMatch["presences"][number]) {
  const athlete = presence.athlete as any;
  return Boolean(athlete?.isBot || athlete?.bot || athlete?.tipo === "BOT");
}

export function buildRankingCampeoesDoDia(
  matches: PublicMatch[],
  destaquesPorData: Record<string, DestaqueDiaResponse | null | undefined>
): RankingCampeaoDoDiaItem[] {
  const matchesByDate = new Map<string, PublicMatch[]>();
  matches.forEach((match) => {
    const key = formatDateYMD(new Date(match.date));
    if (!key) return;
    const list = matchesByDate.get(key) ?? [];
    list.push(match);
    matchesByDate.set(key, list);
  });

  const counts = new Map<string, RankingCampeaoDoDiaItem>();

  matchesByDate.forEach((dayMatches, dateKey) => {
    const destaque = destaquesPorData[dateKey];
    const timeCampeao = destaque?.timeCampeaoDoDia;
    if (!timeCampeao || timeCampeao.status !== "published") return;
    const championTeamId = resolveTeamKey(timeCampeao.teamId || timeCampeao.team?.id);
    if (!championTeamId) return;

    const countedInDay = new Set<string>();
    dayMatches.forEach((match) => {
      (match.presences ?? []).forEach((presence) => {
        if (presence.status === "AUSENTE") return;
        if (isBotPresence(presence)) return;
        if (resolveTeamKey(presence.teamId || presence.team?.id) !== championTeamId) return;
        const athleteId = resolveTeamKey(presence.athleteId || presence.athlete?.id);
        if (!athleteId || countedInDay.has(athleteId)) return;
        countedInDay.add(athleteId);

        const current = counts.get(athleteId);
        counts.set(athleteId, {
          athleteId,
          nome: presence.athlete?.name || current?.nome || "Atleta",
          apelido: presence.athlete?.nickname ?? current?.apelido ?? null,
          foto: presence.athlete?.avatarUrl || presence.athlete?.photoUrl || current?.foto || null,
          campeoesDoDia: (current?.campeoesDoDia ?? 0) + 1,
        });
      });
    });
  });

  return Array.from(counts.values()).sort((a, b) => {
    if (b.campeoesDoDia !== a.campeoesDoDia) return b.campeoesDoDia - a.campeoesDoDia;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

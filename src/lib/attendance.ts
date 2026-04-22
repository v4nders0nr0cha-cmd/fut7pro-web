export type AttendancePeriod = "mes" | "quadrimestre" | "ano" | "todos";

type PresenceLike = {
  status?: string | null;
  match?: {
    date?: string | Date | null;
    data?: string | Date | null;
  } | null;
};

type PlayerLike = {
  id: string;
  nome?: string | null;
  name?: string | null;
  presences?: PresenceLike[] | null;
  presencas?: number | null;
  partidas?: number | null;
};

const VALID_ATTENDANCE_STATUSES = new Set(["TITULAR", "SUBSTITUTO"]);

function getQuadrimester(date: Date) {
  return Math.floor(date.getMonth() / 4) + 1;
}

function parsePresenceDate(presence: PresenceLike) {
  const rawDate = presence.match?.date ?? presence.match?.data ?? null;
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidAttendancePresence(presence: PresenceLike) {
  const status = String(presence.status || "").toUpperCase();
  return VALID_ATTENDANCE_STATUSES.has(status);
}

export function countValidAttendance(
  presences: PresenceLike[] | null | undefined,
  period: AttendancePeriod,
  now = new Date()
) {
  if (!Array.isArray(presences) || presences.length === 0) return 0;

  const currentYear = now.getFullYear();
  const currentQuadrimester = getQuadrimester(now);

  return presences.filter((presence) => {
    if (!isValidAttendancePresence(presence)) return false;
    if (period === "todos") return true;

    const matchDate = parsePresenceDate(presence);
    if (!matchDate) return false;

    if (period === "mes") {
      return matchDate.getMonth() === now.getMonth() && matchDate.getFullYear() === currentYear;
    }

    if (period === "ano") {
      return matchDate.getFullYear() === currentYear;
    }

    return (
      matchDate.getFullYear() === currentYear && getQuadrimester(matchDate) === currentQuadrimester
    );
  }).length;
}

function getFallbackAttendance(player: PlayerLike, period: AttendancePeriod) {
  if (period !== "todos") return 0;
  if (typeof player.presencas === "number") return player.presencas;
  if (typeof player.partidas === "number") return player.partidas;
  return 0;
}

export function buildAttendanceRanking<T extends PlayerLike>(
  players: T[] | null | undefined,
  period: AttendancePeriod,
  now = new Date()
) {
  if (!Array.isArray(players)) return [];

  return players
    .map((player) => {
      const hasPresenceList = Array.isArray(player.presences) && player.presences.length > 0;
      const counted = countValidAttendance(player.presences, period, now);
      const jogos = hasPresenceList ? counted : getFallbackAttendance(player, period);
      return { player, jogos };
    })
    .sort((a, b) => {
      if (b.jogos !== a.jogos) return b.jogos - a.jogos;
      const aName = String(a.player.nome || a.player.name || "");
      const bName = String(b.player.nome || b.player.name || "");
      return aName.localeCompare(bName, "pt-BR");
    });
}

export function formatAttendanceCount(jogos: number) {
  return `${jogos} ${jogos === 1 ? "jogo" : "jogos"}`;
}

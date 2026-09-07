import type {
  LiveEvent,
  LiveMatch,
  MatchdayLiveResponse,
  PublicMatch,
  PublicMatchesResponse,
  TimeDoDia,
} from "@/types/partida";
import type { PublicDestaquesDoDiaResponse } from "@/types/destaques";
import type { PublicAthleteResponse } from "@/types/public-athlete";
import type { RankingAtleta } from "@/types/estatisticas";
import type { Torneio } from "@/types/torneio";

export const VITRINE_SLUG = "vitrine";
export const VITRINE_CHAMPION_BANNER = "/images/Timecampeao.jpg";
export const VITRINE_DEMO_DAY = "2026-08-29";
export const VITRINE_DEMO_DATE = "2026-08-29T19:00:00.000Z";
export const VITRINE_DEMO_PUBLICATION_DATE = "2026-08-29T22:30:00.000Z";

const TENANT_ID = "vitrine-tenant";
const LOCAL = "Arena Fut7Pro";
const DEFAULT_PLAYER_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";

type DemoPosition = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

type DemoAthlete = {
  id: string;
  slug: string;
  nome: string;
  apelido: string;
  posicao: DemoPosition;
  foto: string;
};

type DemoTeam = {
  id: string;
  slug: string;
  nome: string;
  logo: string;
  cor: string;
};

type DemoMatchConfig = {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  lineupA: string[];
  lineupB: string[];
  goals: Record<string, number>;
  assists: Record<string, number>;
};

const teams: DemoTeam[] = [
  {
    id: "vitrine-team-vanguarda",
    slug: "vanguarda",
    nome: "Vanguarda",
    logo: "/images/times/time_padrao_01.png",
    cor: "#22c55e",
  },
  {
    id: "vitrine-team-leoes-do-norte",
    slug: "leoes-do-norte",
    nome: "Leoes do Norte",
    logo: "/images/times/time_padrao_02.png",
    cor: "#f59e0b",
  },
  {
    id: "vitrine-team-trovao-7",
    slug: "trovao-7",
    nome: "Trovao 7",
    logo: "/images/times/time_padrao_03.png",
    cor: "#38bdf8",
  },
  {
    id: "vitrine-team-rota-7",
    slug: "rota-7",
    nome: "Rota 7",
    logo: "/images/times/time_padrao_04.png",
    cor: "#a78bfa",
  },
  {
    id: "vitrine-team-bravos-do-sul",
    slug: "bravos-do-sul",
    nome: "Bravos do Sul",
    logo: "/images/times/time_padrao_05.png",
    cor: "#ef4444",
  },
  {
    id: "vitrine-team-estrelas-do-campo",
    slug: "estrelas-do-campo",
    nome: "Estrelas do Campo",
    logo: "/images/times/time_padrao_06.png",
    cor: "#eab308",
  },
  {
    id: "vitrine-team-imperio-7",
    slug: "imperio-7",
    nome: "Imperio 7",
    logo: "/images/times/time_padrao_07.png",
    cor: "#fb7185",
  },
  {
    id: "vitrine-team-central-7",
    slug: "central-7",
    nome: "Central 7",
    logo: "/images/times/time_padrao_08.png",
    cor: "#14b8a6",
  },
];

const athletes: DemoAthlete[] = [
  athlete("vitrine-athlete-02", "bruno-muralha", "Bruno", "Muralha", "Goleiro"),
  athlete("vitrine-athlete-07", "guilherme-balao", "Guilherme", "Balao", "Zagueiro"),
  athlete("vitrine-athlete-08", "henrique-robo", "Henrique", "Robo", "Zagueiro"),
  athlete("vitrine-athlete-15", "otavio-motor", "Otavio", "Motor", "Meia"),
  athlete("vitrine-athlete-16", "paulo-chavinho", "Paulo", "Chavinho", "Meia"),
  athlete("vitrine-athlete-23", "yago-artilheiro", "Yago", "Artilheiro", "Atacante"),
  athlete("vitrine-athlete-24", "zeca-zizou", "Zeca", "Zizou", "Atacante"),
  athlete("vitrine-athlete-01", "andre-dede", "Andre", "Dede", "Goleiro"),
  athlete("vitrine-athlete-10", "joao-capitao", "Joao", "Capitao", "Zagueiro"),
  athlete("vitrine-athlete-14", "nicolas-cerebro", "Nicolas", "Cerebro", "Meia"),
  athlete("vitrine-athlete-21", "willian-foguete", "Willian", "Foguete", "Atacante"),
  athlete("vitrine-athlete-22", "xavier-x9", "Xavier", "X9", "Atacante"),
  athlete("vitrine-athlete-25", "alan-pistola", "Alan", "Pistola", "Atacante"),
  athlete("vitrine-athlete-26", "breno-bomba", "Breno", "Bomba", "Atacante"),
  athlete("vitrine-athlete-03", "carlos-paredao", "Carlos", "Paredao", "Goleiro"),
  athlete("vitrine-athlete-11", "kaique-ferro", "Kaique", "Ferro", "Zagueiro"),
  athlete("vitrine-athlete-13", "mateus-maestro", "Mateus", "Maestro", "Meia"),
  athlete("vitrine-athlete-17", "rafael-canhoto", "Rafael", "Canhoto", "Meia"),
  athlete("vitrine-athlete-27", "caio-raio", "Caio", "Raio", "Atacante"),
  athlete("vitrine-athlete-28", "danilo-furacao", "Danilo", "Furacao", "Atacante"),
];

const championTeamId = "vitrine-team-vanguarda";
const championRosterIds = [
  "vitrine-athlete-02",
  "vitrine-athlete-07",
  "vitrine-athlete-08",
  "vitrine-athlete-15",
  "vitrine-athlete-16",
  "vitrine-athlete-23",
  "vitrine-athlete-24",
];

const demoMatches: DemoMatchConfig[] = [
  {
    id: "vitrine-match-demo-001",
    date: "2026-08-29T19:00:00.000Z",
    teamA: "vitrine-team-vanguarda",
    teamB: "vitrine-team-leoes-do-norte",
    scoreA: 6,
    scoreB: 3,
    lineupA: championRosterIds,
    lineupB: [
      "vitrine-athlete-01",
      "vitrine-athlete-10",
      "vitrine-athlete-14",
      "vitrine-athlete-21",
      "vitrine-athlete-22",
    ],
    goals: {
      "vitrine-athlete-23": 4,
      "vitrine-athlete-24": 1,
      "vitrine-athlete-15": 1,
      "vitrine-athlete-21": 2,
      "vitrine-athlete-22": 1,
    },
    assists: {
      "vitrine-athlete-16": 4,
      "vitrine-athlete-15": 1,
      "vitrine-athlete-24": 1,
      "vitrine-athlete-14": 2,
      "vitrine-athlete-10": 1,
    },
  },
  {
    id: "vitrine-match-demo-002",
    date: "2026-08-29T20:20:00.000Z",
    teamA: "vitrine-team-trovao-7",
    teamB: "vitrine-team-rota-7",
    scoreA: 4,
    scoreB: 4,
    lineupA: [
      "vitrine-athlete-03",
      "vitrine-athlete-11",
      "vitrine-athlete-13",
      "vitrine-athlete-25",
      "vitrine-athlete-26",
    ],
    lineupB: [
      "vitrine-athlete-02",
      "vitrine-athlete-08",
      "vitrine-athlete-17",
      "vitrine-athlete-27",
      "vitrine-athlete-28",
    ],
    goals: {
      "vitrine-athlete-25": 2,
      "vitrine-athlete-26": 1,
      "vitrine-athlete-13": 1,
      "vitrine-athlete-27": 2,
      "vitrine-athlete-28": 2,
    },
    assists: {
      "vitrine-athlete-13": 2,
      "vitrine-athlete-11": 1,
      "vitrine-athlete-26": 1,
      "vitrine-athlete-17": 3,
      "vitrine-athlete-28": 1,
    },
  },
  {
    id: "vitrine-match-demo-003",
    date: "2026-08-29T21:40:00.000Z",
    teamA: "vitrine-team-bravos-do-sul",
    teamB: "vitrine-team-estrelas-do-campo",
    scoreA: 2,
    scoreB: 1,
    lineupA: [
      "vitrine-athlete-01",
      "vitrine-athlete-07",
      "vitrine-athlete-14",
      "vitrine-athlete-21",
      "vitrine-athlete-25",
    ],
    lineupB: [
      "vitrine-athlete-03",
      "vitrine-athlete-10",
      "vitrine-athlete-15",
      "vitrine-athlete-22",
      "vitrine-athlete-26",
    ],
    goals: {
      "vitrine-athlete-21": 1,
      "vitrine-athlete-25": 1,
      "vitrine-athlete-22": 1,
    },
    assists: {
      "vitrine-athlete-14": 1,
      "vitrine-athlete-07": 1,
      "vitrine-athlete-15": 1,
    },
  },
  {
    id: "vitrine-match-demo-004",
    date: "2026-08-22T19:00:00.000Z",
    teamA: "vitrine-team-vanguarda",
    teamB: "vitrine-team-trovao-7",
    scoreA: 4,
    scoreB: 2,
    lineupA: championRosterIds,
    lineupB: [
      "vitrine-athlete-03",
      "vitrine-athlete-11",
      "vitrine-athlete-13",
      "vitrine-athlete-25",
      "vitrine-athlete-26",
    ],
    goals: {
      "vitrine-athlete-23": 2,
      "vitrine-athlete-24": 1,
      "vitrine-athlete-16": 1,
      "vitrine-athlete-25": 1,
      "vitrine-athlete-26": 1,
    },
    assists: {
      "vitrine-athlete-16": 2,
      "vitrine-athlete-15": 1,
      "vitrine-athlete-07": 1,
      "vitrine-athlete-13": 2,
    },
  },
  {
    id: "vitrine-match-demo-005",
    date: "2026-08-15T19:00:00.000Z",
    teamA: "vitrine-team-leoes-do-norte",
    teamB: "vitrine-team-bravos-do-sul",
    scoreA: 3,
    scoreB: 2,
    lineupA: [
      "vitrine-athlete-01",
      "vitrine-athlete-10",
      "vitrine-athlete-14",
      "vitrine-athlete-21",
      "vitrine-athlete-22",
    ],
    lineupB: [
      "vitrine-athlete-02",
      "vitrine-athlete-07",
      "vitrine-athlete-15",
      "vitrine-athlete-24",
      "vitrine-athlete-25",
    ],
    goals: {
      "vitrine-athlete-21": 2,
      "vitrine-athlete-22": 1,
      "vitrine-athlete-24": 1,
      "vitrine-athlete-25": 1,
    },
    assists: {
      "vitrine-athlete-14": 2,
      "vitrine-athlete-10": 1,
      "vitrine-athlete-15": 1,
      "vitrine-athlete-07": 1,
    },
  },
  {
    id: "vitrine-match-demo-006",
    date: "2026-08-08T19:00:00.000Z",
    teamA: "vitrine-team-imperio-7",
    teamB: "vitrine-team-central-7",
    scoreA: 2,
    scoreB: 2,
    lineupA: [
      "vitrine-athlete-03",
      "vitrine-athlete-11",
      "vitrine-athlete-13",
      "vitrine-athlete-27",
      "vitrine-athlete-28",
    ],
    lineupB: [
      "vitrine-athlete-01",
      "vitrine-athlete-10",
      "vitrine-athlete-17",
      "vitrine-athlete-21",
      "vitrine-athlete-26",
    ],
    goals: {
      "vitrine-athlete-27": 1,
      "vitrine-athlete-28": 1,
      "vitrine-athlete-21": 1,
      "vitrine-athlete-26": 1,
    },
    assists: {
      "vitrine-athlete-13": 1,
      "vitrine-athlete-11": 1,
      "vitrine-athlete-17": 1,
      "vitrine-athlete-10": 1,
    },
  },
];

function athlete(
  id: string,
  slug: string,
  nome: string,
  apelido: string,
  posicao: DemoPosition
): DemoAthlete {
  return { id, slug, nome, apelido, posicao, foto: DEFAULT_PLAYER_IMAGE };
}

function byId<T extends { id: string }>(items: T[], id: string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Fixture da Vitrine invalida: ${id} nao encontrado`);
  return item;
}

function toPublicTeam(teamId: string) {
  const team = byId(teams, teamId);
  return {
    id: team.id,
    name: team.nome,
    logoUrl: team.logo,
    color: team.cor,
  };
}

function toPublicPresence(match: DemoMatchConfig, athleteId: string, teamId: string) {
  const player = byId(athletes, athleteId);
  const team = toPublicTeam(teamId);
  return {
    id: `${match.id}-${athleteId}`,
    matchId: match.id,
    tenantId: TENANT_ID,
    athleteId,
    teamId,
    effectivePosition: player.posicao,
    posicaoEfetivaSorteio: player.posicao,
    status: "TITULAR" as const,
    goals: match.goals[athleteId] ?? 0,
    assists: match.assists[athleteId] ?? 0,
    yellowCards: 0,
    redCards: 0,
    createdAt: match.date,
    updatedAt: match.date,
    athlete: {
      id: player.id,
      name: player.nome,
      nickname: player.apelido,
      position: player.posicao,
      positionSecondary: null,
      photoUrl: player.foto,
      avatarUrl: player.foto,
      isBot: false,
    },
    team,
  };
}

function toPublicMatch(match: DemoMatchConfig): PublicMatch {
  return {
    id: match.id,
    date: match.date,
    location: LOCAL,
    status: "finished",
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    score: { teamA: match.scoreA, teamB: match.scoreB },
    teamA: toPublicTeam(match.teamA),
    teamB: toPublicTeam(match.teamB),
    presences: [
      ...match.lineupA.map((athleteId) => toPublicPresence(match, athleteId, match.teamA)),
      ...match.lineupB.map((athleteId) => toPublicPresence(match, athleteId, match.teamB)),
    ],
  };
}

function applyLimit<T>(items: T[], searchParams?: URLSearchParams | null) {
  const limit = Number(searchParams?.get("limit"));
  return Number.isFinite(limit) && limit > 0 ? items.slice(0, limit) : items;
}

function sameDemoDay(value?: string | null) {
  return Boolean(value && value.slice(0, 10) === VITRINE_DEMO_DAY);
}

function selectMatches(searchParams?: URLSearchParams | null) {
  const scope = searchParams?.get("scope");
  const date = searchParams?.get("date");
  const from = searchParams?.get("from");
  const to = searchParams?.get("to");
  let results = demoMatches.map(toPublicMatch).sort((a, b) => b.date.localeCompare(a.date));

  if (date) {
    results = sameDemoDay(date) ? results.filter((match) => sameDemoDay(match.date)) : [];
  } else if (from || to) {
    results = results.filter((match) => {
      const day = match.date.slice(0, 10);
      return (!from || day >= from.slice(0, 10)) && (!to || day <= to.slice(0, 10));
    });
  } else if (scope === "today") {
    results = results.filter((match) => sameDemoDay(match.date));
  } else if (scope === "upcoming") {
    results = [];
  }

  return applyLimit(results, searchParams);
}

function buildPlayerTotals() {
  const totals = new Map<
    string,
    {
      jogos: number;
      vitorias: number;
      empates: number;
      derrotas: number;
      gols: number;
      assistencias: number;
    }
  >();

  demoMatches.forEach((match) => {
    const add = (athleteId: string, result: "vitoria" | "empate" | "derrota") => {
      const current = totals.get(athleteId) ?? {
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      };
      current.jogos += 1;
      current.gols += match.goals[athleteId] ?? 0;
      current.assistencias += match.assists[athleteId] ?? 0;
      if (result === "vitoria") current.vitorias += 1;
      if (result === "empate") current.empates += 1;
      if (result === "derrota") current.derrotas += 1;
      totals.set(athleteId, current);
    };

    const resultA =
      match.scoreA === match.scoreB
        ? "empate"
        : match.scoreA > match.scoreB
          ? "vitoria"
          : "derrota";
    const resultB =
      match.scoreA === match.scoreB
        ? "empate"
        : match.scoreB > match.scoreA
          ? "vitoria"
          : "derrota";
    match.lineupA.forEach((athleteId) => add(athleteId, resultA));
    match.lineupB.forEach((athleteId) => add(athleteId, resultB));
  });

  return totals;
}

function buildTeamTotals() {
  const totals = new Map<
    string,
    {
      jogos: number;
      vitorias: number;
      empates: number;
      derrotas: number;
      golsPro: number;
      golsContra: number;
      pontos: number;
    }
  >();
  const add = (teamId: string, golsPro: number, golsContra: number) => {
    const current = totals.get(teamId) ?? {
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      pontos: 0,
    };
    current.jogos += 1;
    current.golsPro += golsPro;
    current.golsContra += golsContra;
    if (golsPro > golsContra) {
      current.vitorias += 1;
      current.pontos += 3;
    } else if (golsPro === golsContra) {
      current.empates += 1;
      current.pontos += 1;
    } else {
      current.derrotas += 1;
    }
    totals.set(teamId, current);
  };

  demoMatches.forEach((match) => {
    add(match.teamA, match.scoreA, match.scoreB);
    add(match.teamB, match.scoreB, match.scoreA);
  });

  return totals;
}

function periodPayload() {
  return {
    mode: "demo",
    day: VITRINE_DEMO_DAY,
    from: "2026-08-08",
    to: VITRINE_DEMO_DAY,
  };
}

export function isPublicVitrineSlug(slug?: string | null) {
  return slug?.trim().toLowerCase() === VITRINE_SLUG;
}

export function getVitrineTenantResponse() {
  return {
    slug: VITRINE_SLUG,
    result: {
      id: TENANT_ID,
      slug: VITRINE_SLUG,
      nome: "Racha Vitrine Fut7Pro",
      name: "Racha Vitrine Fut7Pro",
      descricao: "Demonstracao oficial de uma pelada usando o Fut7Pro.",
      logoUrl: "/images/logo-fut7pro.png",
      bannerUrl: VITRINE_CHAMPION_BANNER,
      isVitrine: true,
      status: "ACTIVE",
    },
  };
}

export function getVitrineTeamsResponse() {
  const results = teams.map((team) => ({
    id: team.id,
    nome: team.nome,
    name: team.nome,
    slug: team.slug,
    logo: team.logo,
    logoUrl: team.logo,
    cor: team.cor,
    color: team.cor,
    tenantId: TENANT_ID,
    tenantSlug: VITRINE_SLUG,
    createdAt: VITRINE_DEMO_PUBLICATION_DATE,
    updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
  }));

  return {
    slug: VITRINE_SLUG,
    results,
    total: results.length,
    updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
  };
}

export function getVitrineAthletesResponse() {
  const results = athletes.map((player) => ({
    id: player.id,
    slug: player.slug,
    nome: player.nome,
    name: player.nome,
    apelido: player.apelido,
    nickname: player.apelido,
    posicao: player.posicao,
    position: player.posicao,
    foto: player.foto,
    photoUrl: player.foto,
    avatarUrl: player.foto,
    status: "ATIVO",
    mensalista: true,
  }));

  return {
    slug: VITRINE_SLUG,
    results,
    total: results.length,
    updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
  };
}

export function getVitrineAthleteResponse(athleteSlug: string): PublicAthleteResponse {
  const player =
    athletes.find((entry) => entry.slug === athleteSlug || entry.id === athleteSlug) ?? null;

  return {
    slug: VITRINE_SLUG,
    athlete: player
      ? {
          id: player.id,
          slug: player.slug,
          firstName: player.nome,
          nickname: player.apelido,
          position: player.posicao,
          positionSecondary: null,
          avatarUrl: player.foto,
          status: "ATIVO",
          mensalista: true,
          championOfDayCurrent: championRosterIds.includes(player.id) ? 1 : 0,
          championOfDayAll: championRosterIds.includes(player.id) ? 2 : 0,
        }
      : null,
    conquistas: {
      titulosGrandesTorneios:
        player?.id === "vitrine-athlete-23"
          ? [{ descricao: "MVP Copa Vitrine", ano: 2026, icone: "trofeu" }]
          : [],
      titulosAnuais:
        player?.id === "vitrine-athlete-16"
          ? [{ descricao: "Maestro do Ano", ano: 2026, icone: "alvo" }]
          : [],
      titulosQuadrimestrais: championRosterIds.includes(player?.id ?? "")
        ? [{ descricao: "Time Campeao do Dia", ano: 2026, icone: "estrela" }]
        : [],
    },
  };
}

export function getVitrineMatchesResponse(
  searchParams?: URLSearchParams | null
): PublicMatchesResponse {
  const results = selectMatches(searchParams);
  return { slug: VITRINE_SLUG, total: results.length, results };
}

export function getVitrineMatchResponse(id: string) {
  const match = demoMatches.find((entry) => entry.id === id);
  return { slug: VITRINE_SLUG, result: match ? toPublicMatch(match) : null };
}

export function getVitrineDestaquesDoDiaResponse(
  date?: string | null
): PublicDestaquesDoDiaResponse {
  if (date && !sameDemoDay(date)) {
    return { slug: VITRINE_SLUG, destaque: null };
  }

  const championTeam = byId(teams, championTeamId);
  const roster = championRosterIds.map((athleteId) => {
    const player = byId(athletes, athleteId);
    return {
      id: `vitrine-champion-${athleteId}`,
      athleteId,
      positionPrincipal: player.posicao,
      positionEfetiva: player.posicao,
      presenceStatus: "TITULAR" as const,
      athlete: {
        id: player.id,
        name: player.nome,
        nickname: player.apelido,
        photoUrl: player.foto,
        position: player.posicao,
      },
    };
  });

  return {
    slug: VITRINE_SLUG,
    destaque: {
      id: "vitrine-destaque-2026-08-29",
      date: VITRINE_DEMO_DATE,
      bannerUrl: VITRINE_CHAMPION_BANNER,
      zagueiroId: "vitrine-athlete-08",
      faltou: null,
      timeCampeaoDoDia: {
        id: "vitrine-time-campeao-2026-08-29",
        teamId: championTeam.id,
        source: "manual",
        status: "published",
        updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
        team: {
          id: championTeam.id,
          name: championTeam.nome,
          color: championTeam.cor,
          logoUrl: championTeam.logo,
        },
        atletas: roster,
      },
      publication: {
        scope: "public_spotlight",
        shouldUpdatePublicSpotlight: false,
        latestCompletedMatchDate: VITRINE_DEMO_DATE,
        message: "Publicacao demonstrativa estavel da Vitrine.",
      },
      updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
    },
  };
}

export function getVitrineTimesDoDiaResponse() {
  const makePlayer = (athleteId: string, status: "titular" | "substituto" = "titular") => {
    const player = byId(athletes, athleteId);
    return {
      id: player.id,
      nome: player.nome,
      apelido: player.apelido,
      foto: player.foto,
      posicao: player.posicao,
      status,
    };
  };

  const publishedTeams: TimeDoDia[] = [
    {
      id: "vitrine-team-vanguarda",
      nome: "Vanguarda",
      logo: "/images/times/time_padrao_01.png",
      cor: "#22c55e",
      ehTimeCampeao: true,
      jogadores: championRosterIds.map((id) => makePlayer(id)),
    },
    {
      id: "vitrine-team-leoes-do-norte",
      nome: "Leoes do Norte",
      logo: "/images/times/time_padrao_02.png",
      cor: "#f59e0b",
      jogadores: [
        "vitrine-athlete-01",
        "vitrine-athlete-10",
        "vitrine-athlete-14",
        "vitrine-athlete-21",
        "vitrine-athlete-22",
      ].map((id) => makePlayer(id)),
    },
    {
      id: "vitrine-team-trovao-7",
      nome: "Trovao 7",
      logo: "/images/times/time_padrao_03.png",
      cor: "#38bdf8",
      jogadores: [
        "vitrine-athlete-03",
        "vitrine-athlete-11",
        "vitrine-athlete-13",
        "vitrine-athlete-25",
        "vitrine-athlete-26",
      ].map((id) => makePlayer(id)),
    },
    {
      id: "vitrine-team-rota-7",
      nome: "Rota 7",
      logo: "/images/times/time_padrao_04.png",
      cor: "#a78bfa",
      jogadores: [
        "vitrine-athlete-02",
        "vitrine-athlete-08",
        "vitrine-athlete-17",
        "vitrine-athlete-27",
        "vitrine-athlete-28",
      ].map((id) => makePlayer(id)),
    },
  ];

  return {
    id: "vitrine-times-do-dia-2026-08-29",
    publicado: true,
    publicadoEm: VITRINE_DEMO_PUBLICATION_DATE,
    dataPartida: VITRINE_DEMO_DAY,
    horaPartida: "19:00",
    configuracao: {
      duracaoRachaMin: 180,
      duracaoPartidaMin: 18,
      numTimes: 4,
      jogadoresPorTime: 7,
    },
    times: publishedTeams,
    confrontos: [
      {
        id: "vitrine-confronto-001",
        ordem: 1,
        tempo: 18,
        turno: "ida",
        timeA: "Vanguarda",
        timeB: "Leoes do Norte",
      },
      {
        id: "vitrine-confronto-002",
        ordem: 2,
        tempo: 18,
        turno: "ida",
        timeA: "Trovao 7",
        timeB: "Rota 7",
      },
      {
        id: "vitrine-confronto-003",
        ordem: 3,
        tempo: 18,
        turno: "ida",
        timeA: "Vanguarda",
        timeB: "Trovao 7",
      },
      {
        id: "vitrine-confronto-004",
        ordem: 4,
        tempo: 18,
        turno: "ida",
        timeA: "Leoes do Norte",
        timeB: "Rota 7",
      },
    ],
    curtidas: 37,
    local: {
      nome: LOCAL,
      endereco: "Av. Demonstracao, 700 - Fortaleza, CE",
      observacoes: "Rodada demonstrativa oficial da Vitrine Fut7Pro.",
    },
  };
}

export function getVitrineTeamRankingsResponse() {
  const totals = buildTeamTotals();
  const results = Array.from(totals.entries())
    .map(([teamId, stats]) => {
      const team = byId(teams, teamId);
      const aproveitamento = Math.round((stats.pontos / (stats.jogos * 3)) * 100);
      return {
        id: team.id,
        rankingId: `vitrine-ranking-${team.id}`,
        nome: team.nome,
        logo: team.logo,
        cor: team.cor,
        pontos: stats.pontos,
        jogos: stats.jogos,
        vitorias: stats.vitorias,
        empates: stats.empates,
        derrotas: stats.derrotas,
        golsPro: stats.golsPro,
        golsContra: stats.golsContra,
        saldoGols: stats.golsPro - stats.golsContra,
        aproveitamento,
        updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
      };
    })
    .sort((a, b) => b.pontos - a.pontos || b.saldoGols - a.saldoGols || b.golsPro - a.golsPro)
    .map((entry, index) => ({ ...entry, posicao: index + 1 }));

  return {
    slug: VITRINE_SLUG,
    results,
    updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
    availableYears: [2026],
  };
}

export function getVitrinePlayerRankingsResponse(searchParams?: URLSearchParams | null) {
  const type = searchParams?.get("type") || "geral";
  const position = searchParams?.get("position")?.toLowerCase();
  const totals = buildPlayerTotals();
  let results: RankingAtleta[] = Array.from(totals.entries()).map(([athleteId, stats]) => {
    const player = byId(athletes, athleteId);
    return {
      id: player.id,
      nome: player.nome,
      slug: player.slug,
      foto: player.foto,
      avatarUrl: player.foto,
      posicao: player.posicao,
      position: player.posicao.toLowerCase(),
      pontos: stats.vitorias * 3 + stats.empates + stats.gols * 2 + stats.assistencias,
      jogos: stats.jogos,
      vitorias: stats.vitorias,
      empates: stats.empates,
      derrotas: stats.derrotas,
      gols: stats.gols,
      assistencias: stats.assistencias,
    };
  });

  if (position) {
    results = results.filter(
      (entry) => entry.position === position || entry.posicao?.toLowerCase() === position
    );
  }

  results = results.sort((a, b) => {
    if (type === "artilheiros") return b.gols - a.gols || b.assistencias - a.assistencias;
    if (type === "assistencias") return b.assistencias - a.assistencias || b.gols - a.gols;
    return b.pontos - a.pontos || b.gols - a.gols || b.assistencias - a.assistencias;
  });

  const limited = applyLimit(results, searchParams);

  return {
    slug: VITRINE_SLUG,
    type,
    results: limited,
    total: limited.length,
    availableYears: [2026],
    appliedPeriod: periodPayload(),
  };
}

export function getVitrineTorneiosResponse() {
  const torneios = getVitrineTorneios();
  return { results: torneios, total: torneios.length, page: 1, limit: torneios.length };
}

export function getVitrineTorneioResponse(slug: string) {
  return getVitrineTorneios().find((entry) => entry.slug === slug) ?? null;
}

function getVitrineTorneios(): Torneio[] {
  return [
    {
      id: "vitrine-torneio-copa-integracao-2026",
      nome: "Copa Integracao Fut7Pro",
      slug: "copa-integracao-fut7pro-2026",
      ano: 2026,
      campeao: "Vanguarda",
      campeaoId: championTeamId,
      viceCampeao: "Leoes do Norte",
      terceiroLugar: "Trovao 7",
      mvp: "Yago",
      melhorGoleiro: "Bruno",
      banner: VITRINE_CHAMPION_BANNER,
      logo: "/images/times/time_padrao_01.png",
      bannerUrl: VITRINE_CHAMPION_BANNER,
      logoUrl: "/images/times/time_padrao_01.png",
      rachaId: TENANT_ID,
      tenantId: TENANT_ID,
      tenantSlug: VITRINE_SLUG,
      dataInicio: "2026-08-08",
      dataFim: VITRINE_DEMO_DAY,
      descricao: "Torneio demonstrativo com campanha campea da Vanguarda.",
      descricaoResumida: "Vanguarda campea, Yago artilheiro e Paulo maestro da decisao.",
      status: "publicado",
      destacarNoSite: true,
      publicadoEm: VITRINE_DEMO_PUBLICATION_DATE,
      jogadoresCampeoes: championRosterIds.map((athleteId) => {
        const player = byId(athletes, athleteId);
        return {
          athleteId: player.id,
          athleteSlug: player.slug,
          nome: player.nome,
          posicao: player.posicao,
          fotoUrl: player.foto,
        };
      }),
      criadoEm: VITRINE_DEMO_PUBLICATION_DATE,
      atualizadoEm: VITRINE_DEMO_PUBLICATION_DATE,
      premioTotal: 700,
      inscritos: 8,
      capacidade: 8,
    },
  ];
}

export function getVitrineMatchdayLiveResponse(): MatchdayLiveResponse {
  const matches = selectMatches(new URLSearchParams(`date=${VITRINE_DEMO_DAY}`));
  const liveMatches: LiveMatch[] = matches.map((match) => ({
    id: match.id,
    date: match.date,
    location: match.location,
    status: "finished",
    teamA: match.teamA,
    teamB: match.teamB,
    scoreA: match.scoreA ?? 0,
    scoreB: match.scoreB ?? 0,
    goals: buildLiveEvents(match),
  }));
  const timeline = liveMatches.flatMap((match) => match.goals);
  const teamRows = getVitrineTeamRankingsResponse()
    .results.filter((row) =>
      [
        "Vanguarda",
        "Leoes do Norte",
        "Trovao 7",
        "Rota 7",
        "Bravos do Sul",
        "Estrelas do Campo",
      ].includes(row.nome)
    )
    .map((row) => ({
      teamId: row.id,
      team: row.nome,
      logoUrl: row.logo,
      color: row.cor,
      pts: row.pontos,
      j: row.jogos,
      v: row.vitorias,
      e: row.empates,
      d: row.derrotas,
      gp: row.golsPro,
      gc: row.golsContra,
      sg: row.saldoGols,
    }));
  const playerRankings = getVitrinePlayerRankingsResponse().results;
  const byPosition = (position: string) =>
    playerRankings.find((entry) => entry.position === position) ?? null;
  const artilheiro = getVitrinePlayerRankingsResponse(new URLSearchParams("type=artilheiros"))
    .results[0];
  const maestro = getVitrinePlayerRankingsResponse(new URLSearchParams("type=assistencias"))
    .results[0];

  return {
    slug: VITRINE_SLUG,
    date: VITRINE_DEMO_DAY,
    status: "finished",
    updatedAt: VITRINE_DEMO_PUBLICATION_DATE,
    matches: liveMatches,
    standings: teamRows,
    highlights: {
      artilheiro: {
        status: "published",
        athlete: toLiveAthlete(artilheiro?.id),
        value: artilheiro?.gols ?? 0,
      },
      maestro: {
        status: "published",
        athlete: toLiveAthlete(maestro?.id),
        value: maestro?.assistencias ?? 0,
      },
      atacante: {
        status: "published",
        athlete: toLiveAthlete(byPosition("atacante")?.id),
        value: byPosition("atacante")?.gols ?? 0,
      },
      meia: {
        status: "published",
        athlete: toLiveAthlete(byPosition("meia")?.id),
        value: byPosition("meia")?.assistencias ?? 0,
      },
      goleiro: { status: "published", athlete: toLiveAthlete("vitrine-athlete-02"), value: 1 },
      zagueiro: {
        status: "published",
        candidates: [
          {
            athlete: toLiveAthlete("vitrine-athlete-08")!,
            value: "Destaque defensivo do time campeao",
          },
        ],
      },
      timeCampeao: { status: "published", team: "Vanguarda", pts: 3, sg: 2 },
    },
    timeline,
  };
}

function toLiveAthlete(athleteId?: string | null) {
  if (!athleteId) return null;
  const player = athletes.find((entry) => entry.id === athleteId);
  if (!player) return null;
  return {
    id: player.id,
    name: player.nome,
    nickname: player.apelido,
    position: player.posicao,
    photoUrl: player.foto,
  };
}

function buildLiveEvents(match: PublicMatch): LiveEvent[] {
  return match.presences.flatMap((presence) => {
    const events: LiveEvent[] = [];
    for (let index = 0; index < presence.goals; index += 1) {
      events.push({
        id: `${presence.id}-goal-${index + 1}`,
        matchId: match.id,
        teamId: presence.teamId,
        teamName: presence.team?.name ?? "Time",
        type: "GOAL",
        scorer: toLiveAthlete(presence.athleteId),
        assist: null,
        minute: null,
        occurredAt: match.date,
        description: `${presence.athlete?.name ?? "Atleta"} marcou para ${presence.team?.name ?? "o time"}.`,
      });
    }
    return events;
  });
}

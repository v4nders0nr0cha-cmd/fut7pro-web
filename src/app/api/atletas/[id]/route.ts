export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";
import { extractAvailableYears } from "@/server/estatisticas/aggregator";
import type { ConquistasAtleta, EstatisticasSimples, TituloAtleta } from "@/types/estatisticas";
import type { Atleta } from "@/types/atletas";

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

const TEST_EMAIL = process.env.TEST_EMAIL?.toLowerCase();
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const TEST_MODE = Boolean(TEST_EMAIL && TEST_PASSWORD);
const TEST_TENANT_ID = process.env.TEST_TENANT_ID ?? "fut7pro";
const TEST_TENANT_SLUG = process.env.TEST_TENANT_SLUG ?? TEST_TENANT_ID;
const TEST_USER_ID = process.env.TEST_USER_ID ?? "test-admin";
const TEST_USER_NAME = process.env.TEST_USER_NAME ?? "Administrador Demo";
const TEST_USER_SLUG = process.env.TEST_USER_SLUG ?? "admin-demo";

interface ParsedStoredPlayer {
  id: string | null;
  nome: string;
  apelido: string | null;
  gols: number;
  assistencias: number;
  status?: string | null;
}

interface PlayerMatchSummary {
  partidaId: string;
  data: Date;
  ano: number;
  timeNome: string;
  adversario: string;
  resultadoLabel: "Vitória" | "Empate" | "Derrota";
  score: string;
  gols: number;
  assistencias: number;
  campeao: boolean;
  pontos: number;
}

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseStoredPlayers(raw: string | null): ParsedStoredPlayer[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item: any, index: number) => {
        if (!item || typeof item !== "object") return null;
        const nome =
          typeof item.nome === "string" && item.nome.trim().length > 0
            ? item.nome.trim()
            : `Jogador ${index + 1}`;
        const id = typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : null;
        const apelido =
          typeof item.apelido === "string" && item.apelido.trim().length > 0
            ? item.apelido.trim()
            : null;
        const gols = Number.isFinite(item.gols) ? Number(item.gols) : Number(item.gols ?? 0) || 0;
        const assistencias = Number.isFinite(item.assistencias)
          ? Number(item.assistencias)
          : Number(item.assistencias ?? 0) || 0;
        const status = typeof item.status === "string" ? item.status : null;
        return {
          id,
          nome,
          apelido,
          gols,
          assistencias,
          status,
        } as ParsedStoredPlayer;
      })
      .filter((player): player is ParsedStoredPlayer => Boolean(player));
  } catch (_error) {
    return [];
  }
}

function pickPlayer(
  jogadores: ParsedStoredPlayer[],
  candidateIds: Set<string>,
  candidateNames: Set<string>
): ParsedStoredPlayer | null {
  if (jogadores.length === 0) return null;
  const byId = jogadores.find((jogador) => jogador.id && candidateIds.has(jogador.id));
  if (byId) return byId;

  const byName = jogadores.find((jogador) => {
    const nome = normalize(jogador.nome);
    const apelido = normalize(jogador.apelido);
    return (nome && candidateNames.has(nome)) || (apelido && candidateNames.has(apelido));
  });
  if (byName) return byName;

  return null;
}

function buildStats(matches: PlayerMatchSummary[]): EstatisticasSimples {
  if (matches.length === 0) {
    return {
      jogos: 0,
      gols: 0,
      assistencias: 0,
      campeaoDia: 0,
      mediaVitorias: 0,
      pontuacao: 0,
    };
  }

  const jogos = matches.length;
  const gols = matches.reduce((total, partida) => total + partida.gols, 0);
  const assistencias = matches.reduce((total, partida) => total + partida.assistencias, 0);
  const campeaoDia = matches.filter((partida) => partida.campeao).length;
  const pontuacao = matches.reduce((total, partida) => total + partida.pontos, 0);
  const mediaVitorias = jogos > 0 ? Number((campeaoDia / jogos).toFixed(2)) : 0;

  return {
    jogos,
    gols,
    assistencias,
    campeaoDia,
    mediaVitorias,
    pontuacao,
  };
}

function categorizeTitulo(categoria: string | null | undefined): {
  bucket: keyof ConquistasAtleta;
  icon: string;
} {
  const normalized = (categoria ?? "").toLowerCase();
  if (
    normalized.includes("quadr") ||
    normalized.includes("trim") ||
    normalized.includes("mensal")
  ) {
    return { bucket: "titulosQuadrimestrais", icon: "🥇" };
  }
  if (
    normalized.includes("anual") ||
    normalized.includes("temporada") ||
    normalized.includes("ano")
  ) {
    return { bucket: "titulosAnuais", icon: "🌟" };
  }
  return { bucket: "titulosGrandesTorneios", icon: "🏆" };
}

function defaultAtleta(): Atleta {
  return {
    id: "",
    nome: "Atleta Fut7",
    apelido: null,
    slug: "",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    posicao: "Atacante",
    status: "Ativo",
    mensalista: false,
    ultimaPartida: undefined,
    totalJogos: 0,
    estatisticas: {
      historico: buildStats([]),
      anual: {},
    },
    historico: [],
    conquistas: {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    },
    icones: [],
  };
}

function buildTestAtleta(): Atleta {
  const hoje = new Date().toISOString().slice(0, 10);
  const anoAtual = new Date().getFullYear();

  return {
    id: TEST_USER_ID,
    nome: TEST_USER_NAME,
    apelido: "Admin Demo",
    slug: TEST_USER_SLUG,
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    posicao: "Atacante",
    status: "Ativo",
    mensalista: true,
    ultimaPartida: hoje,
    totalJogos: 12,
    estatisticas: {
      historico: {
        jogos: 12,
        gols: 18,
        assistencias: 9,
        campeaoDia: 7,
        mediaVitorias: 0.58,
        pontuacao: 42,
      },
      anual: {
        [anoAtual]: {
          jogos: 12,
          gols: 18,
          assistencias: 9,
          campeaoDia: 7,
          mediaVitorias: 0.58,
          pontuacao: 42,
        },
      },
    },
    historico: [
      {
        data: hoje,
        time: "Fut7Pro",
        resultado: "Vitória (4x2)",
        gols: 2,
        campeao: true,
        pontuacao: 5,
      },
    ],
    conquistas: {
      titulosGrandesTorneios: [
        { descricao: "Copa Demo 2024", ano: anoAtual, icone: "🏆" },
      ],
      titulosAnuais: [{ descricao: "Melhor do Ano", ano: anoAtual, icone: "🥇" }],
      titulosQuadrimestrais: [
        { descricao: "Destaque do Quadrimestre", ano: anoAtual, icone: "⭐" },
      ],
    },
    icones: ["🏆", "🥇", "⭐"],
  };
}

function matchesTestIdentifiers(
  identifier: string,
  sessionUserId: string | null,
  sessionUserEmail: string | null
) {
  const normalized = identifier.trim().toLowerCase();
  if (normalized === "me") {
    if (sessionUserEmail && sessionUserEmail.toLowerCase() === TEST_EMAIL) return true;
    if (sessionUserId && sessionUserId === TEST_USER_ID) return true;
    return false;
  }

  if (normalized === TEST_USER_ID.toLowerCase()) return true;
  if (normalized === TEST_USER_SLUG.toLowerCase()) return true;
  if (TEST_EMAIL && normalized === TEST_EMAIL) return true;
  return false;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (isProd && isWebDirectDbDisabled) {
    return NextResponse.json(
      { error: "web_db_disabled: use a API do backend para atletas/[id]" },
      { status: 501 }
    );
  }
  const url = new URL(request.url);
  const rawRachaId = url.searchParams.get("rachaId");
  const rachaSlug = url.searchParams.get("slug");

  let rachaId = rawRachaId;
  if (!rachaId && rachaSlug) {
    if (TEST_MODE && rachaSlug === TEST_TENANT_SLUG) {
      rachaId = TEST_TENANT_ID;
    } else {
      const rachaRecord = await prisma.racha.findUnique({
        where: { slug: rachaSlug },
        select: { id: true },
      });
      if (!rachaRecord) {
        return NextResponse.json({ error: "Racha não encontrado" }, { status: 404 });
      }
      rachaId = rachaRecord.id;
    }
  }

  if (!rachaId) {
    if (TEST_MODE) {
      rachaId = TEST_TENANT_ID;
    } else {
      return NextResponse.json({ error: "rachaId ou slug é obrigatório" }, { status: 400 });
    }
  } else if (TEST_MODE && rachaId !== TEST_TENANT_ID) {
    return NextResponse.json({ error: "Racha indisponível no modo de teste" }, { status: 400 });
  }

  const period = url.searchParams.get("periodo") ?? "historico";
  const anoParam = url.searchParams.get("ano");
  const anoFilter = anoParam ? Number(anoParam) : undefined;

  let playerIdentifier = params.id;
  let sessionUserId: string | null = null;
  let sessionUserEmail: string | null = null;

  if (playerIdentifier === "me") {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    sessionUserId = (session.user.id as string) ?? null;
    sessionUserEmail = (session.user.email as string) ?? null;
    playerIdentifier = sessionUserId ?? sessionUserEmail ?? "";
  }

  if (TEST_MODE && matchesTestIdentifiers(playerIdentifier, sessionUserId, sessionUserEmail)
      && (!rachaSlug || rachaSlug === TEST_TENANT_SLUG)) {
    const atleta = buildTestAtleta();
    return NextResponse.json({ atleta, periodo: period, ano: anoFilter ?? null });
  }

  const candidateIds = new Set<string>();
  const candidateNames = new Set<string>();

  if (playerIdentifier) candidateIds.add(playerIdentifier);
  if (sessionUserId) candidateIds.add(sessionUserId);
  if (sessionUserEmail) candidateIds.add(sessionUserEmail);

  const slugParam = url.searchParams.get("playerSlug");
  if (slugParam) {
    candidateIds.add(slugParam);
    const normalizedSlug = normalize(slugParam);
    if (normalizedSlug) candidateNames.add(normalizedSlug);
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        ...(playerIdentifier ? [{ id: playerIdentifier }] : []),
        ...(sessionUserId ? [{ id: sessionUserId }] : []),
        ...(sessionUserEmail ? [{ email: sessionUserEmail }] : []),
      ],
    },
  });

  if (usuario) {
    candidateIds.add(usuario.id);
    const nome = normalize(usuario.nome);
    const apelido = normalize(usuario.apelido);
    if (nome) candidateNames.add(nome);
    if (apelido) candidateNames.add(apelido);
  }

  const jogadorCadastro = await prisma.jogador.findFirst({
    where: {
      OR: [
        { id: { in: Array.from(candidateIds) } },
        ...(usuario?.email ? [{ email: usuario.email }] : []),
        ...(usuario?.nome ? [{ nome: usuario.nome }] : []),
      ],
    },
  });

  if (jogadorCadastro) {
    candidateIds.add(jogadorCadastro.id);
    const nome = normalize(jogadorCadastro.nome);
    const apelido = normalize(jogadorCadastro.apelido);
    if (nome) candidateNames.add(nome);
    if (apelido) candidateNames.add(apelido);
  }

  const partidas = await prisma.partida.findMany({
    where: { rachaId },
    orderBy: [{ data: "asc" }, { horario: "asc" }],
  });

  const matchesForPlayer: PlayerMatchSummary[] = [];

  for (const partida of partidas) {
    const jogadoresA = parseStoredPlayers(partida.jogadoresA);
    const jogadoresB = parseStoredPlayers(partida.jogadoresB);

    const jogadorTimeA = pickPlayer(jogadoresA, candidateIds, candidateNames);
    const jogadorTimeB = pickPlayer(jogadoresB, candidateIds, candidateNames);

    const team = jogadorTimeA ? "A" : jogadorTimeB ? "B" : null;
    const jogadorDados = jogadorTimeA ?? jogadorTimeB;

    if (
      !team ||
      !jogadorDados ||
      (jogadorDados.status && jogadorDados.status.toLowerCase() === "ausente")
    ) {
      continue;
    }

    const golsTimeA = partida.golsTimeA ?? 0;
    const golsTimeB = partida.golsTimeB ?? 0;
    const isWin = team === "A" ? golsTimeA > golsTimeB : golsTimeB > golsTimeA;
    const isDraw = golsTimeA === golsTimeB;
    const pontos = isWin ? 3 : isDraw ? 1 : 0;

    matchesForPlayer.push({
      partidaId: partida.id,
      data: partida.data,
      ano: partida.data.getFullYear(),
      timeNome: team === "A" ? partida.timeA : partida.timeB,
      adversario: team === "A" ? partida.timeB : partida.timeA,
      resultadoLabel: isWin ? "Vitória" : isDraw ? "Empate" : "Derrota",
      score: `${golsTimeA}x${golsTimeB}`,
      gols: jogadorDados.gols ?? 0,
      assistencias: jogadorDados.assistencias ?? 0,
      campeao: isWin,
      pontos,
    });
  }

  const availableYears = extractAvailableYears(partidas);
  const estatisticasAnuaisEntries = availableYears.map((ano) => {
    const anoMatches = matchesForPlayer.filter((partida) => partida.ano === ano);
    return [ano, buildStats(anoMatches)];
  });

  const estatisticasHistorico = buildStats(matchesForPlayer);

  const conquistasRecords = await prisma.campeao.findMany({
    where: { rachaId },
    orderBy: [{ data: "desc" }],
  });

  const conquistas: ConquistasAtleta = {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  };
  const icones: string[] = [];

  for (const record of conquistasRecords) {
    if (!record.jogadores) continue;
    let jogadoresCampeoes: string[] = [];
    try {
      const parsed = JSON.parse(record.jogadores);
      if (Array.isArray(parsed)) {
        jogadoresCampeoes = parsed.map((value) => {
          if (typeof value === "string") return value;
          if (value && typeof value === "object" && typeof value.nome === "string") {
            return value.nome;
          }
          return "";
        });
      }
    } catch (_error) {
      jogadoresCampeoes = [];
    }

    if (jogadoresCampeoes.length === 0) continue;

    const hasPlayer = jogadoresCampeoes.some((nome) => {
      const normalizedNome = normalize(nome);
      return normalizedNome ? candidateNames.has(normalizedNome) : false;
    });

    if (!hasPlayer) continue;

    const { bucket, icon } = categorizeTitulo(record.categoria);
    const titulo: TituloAtleta = {
      descricao: record.nome,
      ano: record.data.getFullYear(),
      icone: icon,
    };

    conquistas[bucket].push(titulo);
    if (!icones.includes(icon)) {
      icones.push(icon);
    }
  }

  const sortedMatches = [...matchesForPlayer].sort((a, b) => b.data.getTime() - a.data.getTime());
  const historico = sortedMatches.map((match) => ({
    data: format(match.data, "dd/MM/yyyy", { locale: ptBR }),
    time: match.timeNome,
    resultado: `${match.resultadoLabel} (${match.score})`,
    gols: match.gols,
    campeao: match.campeao,
    pontuacao: match.pontos,
  }));

  const atletaBase = defaultAtleta();

  const posicao = jogadorCadastro?.posicao
    ? jogadorCadastro.posicao.charAt(0).toUpperCase() +
      jogadorCadastro.posicao.slice(1).toLowerCase()
    : atletaBase.posicao;
  const status = jogadorCadastro?.status
    ? jogadorCadastro.status.toLowerCase() === "suspenso"
      ? "Suspenso"
      : jogadorCadastro.status.toLowerCase() === "inativo"
        ? "Inativo"
        : "Ativo"
    : atletaBase.status;

  const nomeAtleta = usuario?.nome ?? jogadorCadastro?.nome ?? atletaBase.nome;
  const apelidoAtleta = usuario?.apelido ?? jogadorCadastro?.apelido ?? atletaBase.apelido;
  const slugAtleta = slugify(apelidoAtleta || nomeAtleta);

  const estatisticas = {
    historico: estatisticasHistorico,
    anual: Object.fromEntries(estatisticasAnuaisEntries) as Record<number, EstatisticasSimples>,
  };

  const atleta: Atleta = {
    ...atletaBase,
    id: usuario?.id ?? jogadorCadastro?.id ?? playerIdentifier ?? "",
    nome: nomeAtleta,
    apelido: apelidoAtleta,
    slug: slugAtleta,
    foto: jogadorCadastro?.foto ?? atletaBase.foto,
    posicao: posicao as Atleta["posicao"],
    status: status as Atleta["status"],
    mensalista: Boolean(jogadorCadastro?.mensalista),
    ultimaPartida:
      sortedMatches.length > 0 ? format(sortedMatches[0].data, "yyyy-MM-dd") : undefined,
    totalJogos: estatisticasHistorico.jogos,
    estatisticas,
    historico,
    conquistas,
    icones,
  };

  return NextResponse.json({ atleta, periodo: period, ano: anoFilter ?? null });
}
// Guard: rotas deste arquivo executam consultas ao Prisma.
// A verificação de bloqueio em produção é aplicada no nível do cliente Prisma
// por meio de src/server/prisma.ts. Caso seja necessário, adicione short‑circuit
// específico nas handlers exportadas.

"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaRegThumbsUp, FaShareAlt, FaMapMarkedAlt, FaMedal } from "react-icons/fa";
import { useAboutPublic } from "@/hooks/useAbout";
import { useFooterConfigPublic } from "@/hooks/useFooterConfig";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useTimesDoDiaPublicado } from "@/hooks/useTimesDoDiaPublicado";
import { usePublicAthletes } from "@/hooks/usePublicAthletes";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import {
  DEFAULT_GALERIA_FOTOS,
  DEFAULT_NOSSA_HISTORIA,
  MAX_GALERIA_FOTOS,
} from "@/utils/schemas/nossaHistoria.schema";
import { buildMapsEmbedUrl } from "@/utils/maps";
import { normalizeYouTubeUrl, youtubeThumb, youtubeWatchUrl } from "@/utils/youtube";
import type { PublicMatch } from "@/types/partida";
import type {
  NossaHistoriaCuriosidade,
  NossaHistoriaDepoimento,
  NossaHistoriaGaleriaFoto,
} from "@/types/paginasInstitucionais";
import type { Admin } from "@/types/racha";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_RACHA_NAME = "seu racha";
const DEFAULT_PRESIDENTE_NAME = "o presidente do racha";
const DESCRICAO_TEMPLATE =
  "O racha {nomeDoRacha} nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por {nomePresidente}, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.";
const LEGACY_ANO_REGEX = /^ano\s*\d+/i;
const GOLEADA_FALLBACK =
  "Ainda não há partidas suficientes para calcular a maior goleada. Assim que os jogos forem cadastrados, esta curiosidade aparece automaticamente.";
const INVICTO_FALLBACK =
  "Ainda não há partidas suficientes para calcular a maior sequência invicta. Assim que os jogos forem cadastrados, esta curiosidade aparece automaticamente.";
const DEFAULT_DEPOIMENTO_TEXTO =
  "Esse racha é mais do que jogo, é encontro, amizade e respeito. Aqui a disputa é saudável, a resenha é garantida e todo mundo faz parte da história. Vamos manter essa tradição viva e continuar fazendo história juntos.";
const AUTO_GOLEADA_ID = "auto-maior-goleada";
const AUTO_INVICTO_ID = "auto-sequencia-invicta";

const roleLabels: Record<string, string> = {
  presidente: "Presidente",
  vicepresidente: "Vice-Presidente",
  diretorfutebol: "Diretor de Futebol",
  diretorfinanceiro: "Diretor Financeiro",
};

const DEFAULT_GALERIA_DESCRICAO = "Registro especial do racha.";

type LegacyCategoriaFotos = {
  nome?: string;
  fotos?: { src?: string; alt?: string }[];
};

type MatchScore = { scoreA: number; scoreB: number };
type MatchOutcome = "W" | "D" | "L";

function resolveMatchScores(match: PublicMatch): MatchScore | null {
  if (typeof match.scoreA !== "number" || typeof match.scoreB !== "number") {
    return null;
  }
  return {
    scoreA: match.scoreA,
    scoreB: match.scoreB,
  };
}

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveDurationMinutes(match: PublicMatch, fallback?: number | null) {
  const candidate = match as Record<string, unknown>;
  const possible = [
    candidate.durationMin,
    candidate.duracaoPartidaMin,
    candidate.tempoMin,
    candidate.tempo,
    candidate.duration,
  ];
  for (const raw of possible) {
    const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : undefined;
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }
  }
  if (typeof fallback === "number" && Number.isFinite(fallback) && fallback > 0) {
    return Math.round(fallback);
  }
  return null;
}

function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}

function normalizeLookup(value?: string | null) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildCuriosidadeId(item: NossaHistoriaCuriosidade, index: number) {
  const explicit = item.id?.trim();
  if (explicit) return explicit;
  const seed = `${item.titulo ?? ""} ${item.texto ?? ""}`.trim().toLowerCase();
  if (!seed) return `curiosidade-${index + 1}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `curiosidade-${hash.toString(36)}`;
}

function buildCuriosidadesAutomaticas(
  matches: PublicMatch[],
  fallbackDuration?: number | null,
  likesMap?: Map<string, number>
): NossaHistoriaCuriosidade[] {
  let maiorGoleada: { match: PublicMatch; scoreA: number; scoreB: number; diff: number } | null =
    null;

  matches.forEach((match) => {
    const scores = resolveMatchScores(match);
    if (!scores) return;
    const diff = Math.abs(scores.scoreA - scores.scoreB);
    if (diff <= 0) return;
    if (!maiorGoleada || diff > maiorGoleada.diff) {
      maiorGoleada = { match, scoreA: scores.scoreA, scoreB: scores.scoreB, diff };
    }
  });

  const goleadaTexto = (() => {
    if (!maiorGoleada) return GOLEADA_FALLBACK;
    const duracao = resolveDurationMinutes(maiorGoleada.match, fallbackDuration);
    if (!duracao) return GOLEADA_FALLBACK;
    const maior = Math.max(maiorGoleada.scoreA, maiorGoleada.scoreB);
    const menor = Math.min(maiorGoleada.scoreA, maiorGoleada.scoreB);
    const placar = `${maior} x ${menor}`;
    return `A maior goleada registrada até hoje foi ${placar}, em uma partida de ${duracao} minutos.`;
  })();

  const resultadosPorJogador = new Map<
    string,
    { nome: string; resultados: Array<{ date: Date; outcome: MatchOutcome }> }
  >();

  matches.forEach((match) => {
    const scores = resolveMatchScores(match);
    if (!scores) return;
    const matchDate = parseMatchDate(match.date);
    if (!matchDate) return;
    const teamAId = match.teamA?.id;
    const teamBId = match.teamB?.id;
    if (!teamAId || !teamBId) return;
    const processed = new Set<string>();

    match.presences.forEach((presence) => {
      if (presence.status === "AUSENTE") return;
      const athleteId = presence.athlete?.id || presence.athleteId;
      if (!athleteId || processed.has(athleteId)) return;
      const teamId = presence.teamId || presence.team?.id;
      if (!teamId) return;

      let outcome: MatchOutcome = "L";
      if (scores.scoreA === scores.scoreB) {
        outcome = "D";
      } else if (teamId === teamAId) {
        outcome = scores.scoreA > scores.scoreB ? "W" : "L";
      } else if (teamId === teamBId) {
        outcome = scores.scoreB > scores.scoreA ? "W" : "L";
      } else {
        return;
      }

      const nome =
        presence.athlete?.name?.trim() || presence.athlete?.nickname?.trim() || "Jogador";
      const entry = resultadosPorJogador.get(athleteId) ?? { nome, resultados: [] };
      entry.nome = nome;
      entry.resultados.push({ date: matchDate, outcome });
      resultadosPorJogador.set(athleteId, entry);
      processed.add(athleteId);
    });
  });

  let melhorInvicto: { nome: string; streak: number; wins: number; draws: number } | null = null;

  resultadosPorJogador.forEach((entry) => {
    const ordered = entry.resultados.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
    let currentStreak = 0;
    let currentWins = 0;
    let currentDraws = 0;
    let bestStreak = 0;
    let bestWins = 0;
    let bestDraws = 0;

    ordered.forEach((item) => {
      if (item.outcome === "L") {
        currentStreak = 0;
        currentWins = 0;
        currentDraws = 0;
        return;
      }
      currentStreak += 1;
      if (item.outcome === "W") {
        currentWins += 1;
      } else {
        currentDraws += 1;
      }
      if (currentStreak > bestStreak || (currentStreak === bestStreak && currentWins > bestWins)) {
        bestStreak = currentStreak;
        bestWins = currentWins;
        bestDraws = currentDraws;
      }
    });

    if (bestStreak <= 0) return;
    if (
      !melhorInvicto ||
      bestStreak > melhorInvicto.streak ||
      (bestStreak === melhorInvicto.streak && bestWins > melhorInvicto.wins)
    ) {
      melhorInvicto = {
        nome: entry.nome,
        streak: bestStreak,
        wins: bestWins,
        draws: bestDraws,
      };
    }
  });

  const invictoTexto = (() => {
    if (!melhorInvicto) return INVICTO_FALLBACK;
    const detalhe =
      melhorInvicto.wins + melhorInvicto.draws > 0
        ? ` Foram ${melhorInvicto.wins} ${pluralize(
            melhorInvicto.wins,
            "vitória",
            "vitórias"
          )} e ${melhorInvicto.draws} ${pluralize(
            melhorInvicto.draws,
            "empate",
            "empates"
          )} nesse período.`
        : "";
    return `O jogador com a maior sequência invicta até hoje é ${melhorInvicto.nome}, com ${melhorInvicto.streak} jogos sem perder.${detalhe}`;
  })();

  return [
    {
      id: AUTO_GOLEADA_ID,
      titulo: "Maior goleada registrada",
      texto: goleadaTexto,
      icone: "⚽",
      curtidas: likesMap?.get(AUTO_GOLEADA_ID) ?? 0,
    },
    {
      id: AUTO_INVICTO_ID,
      titulo: "Maior sequência invicta (jogador)",
      texto: invictoTexto,
      icone: "🔥",
      curtidas: likesMap?.get(AUTO_INVICTO_ID) ?? 0,
    },
  ];
}

function isLegacyMarcos(marcos?: { ano?: string }[] | null) {
  if (!marcos || marcos.length === 0) return false;
  return marcos.every((marco) => LEGACY_ANO_REGEX.test((marco.ano ?? "").trim()));
}

function buildDescricaoPadrao(nomeDoRacha: string, nomePresidente: string) {
  return DESCRICAO_TEMPLATE.replace("{nomeDoRacha}", nomeDoRacha).replace(
    "{nomePresidente}",
    nomePresidente
  );
}

function sanitizeText(value?: string | null) {
  return value ? value.toString().trim() : "";
}

function sanitizeUrl(value?: string | null) {
  return value ? value.toString().trim() : "";
}

function normalizeGaleriaFotos(
  input: unknown,
  fallback: NossaHistoriaGaleriaFoto[]
): NossaHistoriaGaleriaFoto[] {
  if (!Array.isArray(input) || input.length === 0) {
    return fallback.map((foto) => ({ ...foto }));
  }

  const hasLegacy = input.some(
    (item) => item && typeof item === "object" && "fotos" in (item as Record<string, unknown>)
  );

  if (hasLegacy) {
    const legacy = input as LegacyCategoriaFotos[];
    const converted: NossaHistoriaGaleriaFoto[] = [];
    legacy.forEach((cat) => {
      const tituloBase = sanitizeText(cat.nome) || "";
      (cat.fotos ?? []).forEach((foto) => {
        const src = sanitizeUrl(foto?.src);
        if (!src) return;
        const descricao = sanitizeText(foto?.alt) || DEFAULT_GALERIA_DESCRICAO;
        const titulo = tituloBase || sanitizeText(foto?.alt) || "Foto do racha";
        converted.push({
          id: `galeria-${converted.length + 1}`,
          src,
          titulo,
          descricao,
        });
      });
    });
    if (converted.length > 0) {
      return converted.slice(0, MAX_GALERIA_FOTOS);
    }
    return fallback.map((foto) => ({ ...foto }));
  }

  const normalized = (input as NossaHistoriaGaleriaFoto[]).map((foto, index) => ({
    id: foto?.id?.toString().trim() || `galeria-${index + 1}`,
    src: sanitizeUrl(foto?.src),
    titulo: sanitizeText(foto?.titulo),
    descricao: sanitizeText(foto?.descricao),
  }));

  return normalized.length > 0
    ? normalized.slice(0, MAX_GALERIA_FOTOS)
    : fallback.map((foto) => ({ ...foto }));
}

export default function NossaHistoriaPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { publicHref } = usePublicLinks();
  const { about } = useAboutPublic(slug);
  const { footer } = useFooterConfigPublic(slug);
  const { racha } = useRachaPublic(slug);
  const { data: timesDoDiaPublicado } = useTimesDoDiaPublicado({ slug, source: "public" });
  const { athletes } = usePublicAthletes(slug);
  const { rankings: rankingGeral } = usePublicPlayerRankings({
    slug,
    type: "geral",
    period: "all",
    limit: 50,
  });
  const { matches: matchesAll } = usePublicMatches({
    slug,
    from: "2000-01-01",
    to: "2100-01-01",
    limit: 5000,
  });
  const data = about || {};
  const curiosidadesAdmin = useMemo(() => data.curiosidades ?? [], [data.curiosidades]);
  const curiosidadesCurtidasRaw = (data as { curiosidadesCurtidas?: Record<string, number> })
    .curiosidadesCurtidas;
  const admins = useMemo(() => racha?.admins ?? [], [racha?.admins]);

  const presidenteNome = useMemo(() => {
    const presidente = admins.find((admin) => admin.role === "presidente");
    return presidente?.nome?.trim() || presidente?.email?.trim() || DEFAULT_PRESIDENTE_NAME;
  }, [admins]);
  const rachaNome = racha?.nome?.trim() || DEFAULT_RACHA_NAME;
  const descricaoPadrao = buildDescricaoPadrao(rachaNome, presidenteNome);
  const descricaoFonte = data.descricao?.trim();
  const descricao =
    !descricaoFonte || descricaoFonte === DEFAULT_NOSSA_HISTORIA.descricao
      ? descricaoPadrao
      : descricaoFonte;
  const titulo = data.titulo?.trim() || "Nossa História";

  const rawMarcos =
    data.marcos && data.marcos.length > 0 ? data.marcos : DEFAULT_NOSSA_HISTORIA.marcos || [];
  const marcos = isLegacyMarcos(rawMarcos) ? DEFAULT_NOSSA_HISTORIA.marcos || [] : rawMarcos;

  const curiosidadesCurtidasMap = useMemo(() => {
    const map = new Map<string, number>();
    if (curiosidadesCurtidasRaw && typeof curiosidadesCurtidasRaw === "object") {
      Object.entries(curiosidadesCurtidasRaw).forEach(([key, value]) => {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
          map.set(key, numeric);
        }
      });
    }
    curiosidadesAdmin.forEach((item, idx) => {
      const id = buildCuriosidadeId(item, idx);
      if (map.has(id)) return;
      const numeric = Number(item.curtidas ?? 0);
      if (Number.isFinite(numeric)) {
        map.set(id, numeric);
      }
    });
    return map;
  }, [curiosidadesAdmin, curiosidadesCurtidasRaw]);

  const curiosidadesAutomaticas = useMemo(
    () =>
      buildCuriosidadesAutomaticas(
        matchesAll,
        timesDoDiaPublicado?.configuracao?.duracaoPartidaMin ?? null,
        curiosidadesCurtidasMap
      ),
    [matchesAll, timesDoDiaPublicado?.configuracao?.duracaoPartidaMin, curiosidadesCurtidasMap]
  );

  const curiosidadesBase = useMemo(() => {
    const normalize = (value?: string) => value?.trim().toLowerCase() || "";
    const autoTitles = new Set(curiosidadesAutomaticas.map((item) => normalize(item.titulo)));
    const extras = curiosidadesAdmin.filter((item) => {
      const title = normalize(item.titulo);
      if (!title) return true;
      return !autoTitles.has(title);
    });
    return [...curiosidadesAutomaticas, ...extras];
  }, [curiosidadesAutomaticas, curiosidadesAdmin]);

  const [curiosidadesCurtidasLocal, setCuriosidadesCurtidasLocal] = useState<
    Record<string, number>
  >({});
  const [curiosidadesCurtindo, setCuriosidadesCurtindo] = useState<Record<string, boolean>>({});
  const [curiosidadesCurtidasLocalStorage, setCuriosidadesCurtidasLocalStorage] = useState<
    Record<string, boolean>
  >({});
  const [videosAbertos, setVideosAbertos] = useState<Record<number, boolean>>({});

  const curiosidades = useMemo(() => {
    return curiosidadesBase.map((item, idx) => {
      const id = buildCuriosidadeId(item, idx);
      const localValue = curiosidadesCurtidasLocal[id];
      const curtidas =
        typeof localValue === "number"
          ? localValue
          : typeof item.curtidas === "number"
            ? item.curtidas
            : (curiosidadesCurtidasMap.get(id) ?? 0);
      return { ...item, id, curtidas };
    });
  }, [curiosidadesBase, curiosidadesCurtidasLocal, curiosidadesCurtidasMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next: Record<string, boolean> = {};
    const prefix = slug ? `fut7pro-curiosidade-like-${slug}-` : "fut7pro-curiosidade-like-";
    curiosidades.forEach((item) => {
      if (!item.id) return;
      next[item.id] = window.localStorage.getItem(`${prefix}${item.id}`) === "1";
    });
    setCuriosidadesCurtidasLocalStorage(next);
  }, [curiosidades, slug]);

  const athletesById = useMemo(
    () => new Map(athletes.map((athlete) => [athlete.id, athlete])),
    [athletes]
  );
  const athletesByName = useMemo(() => {
    const map = new Map<string, (typeof athletes)[number]>();
    athletes.forEach((athlete) => {
      const key = normalizeLookup(athlete.nome);
      if (key) map.set(key, athlete);
    });
    return map;
  }, [athletes]);
  const adminsByAthleteId = useMemo(() => {
    const map = new Map<string, Admin>();
    admins.forEach((admin) => {
      if (admin.athleteId) {
        map.set(admin.athleteId, admin);
      }
    });
    return map;
  }, [admins]);
  const adminsByName = useMemo(() => {
    const map = new Map<string, Admin>();
    admins.forEach((admin) => {
      const key = normalizeLookup(admin.nome);
      if (key) map.set(key, admin);
    });
    return map;
  }, [admins]);
  const presidenteAdmin = useMemo(
    () => admins.find((admin) => admin.role === "presidente") ?? null,
    [admins]
  );
  const presidenteAthlete = useMemo(() => {
    if (!presidenteAdmin) return null;
    if (presidenteAdmin.athleteId) {
      return athletesById.get(presidenteAdmin.athleteId) ?? null;
    }
    const key = normalizeLookup(presidenteAdmin.nome);
    return key ? (athletesByName.get(key) ?? null) : null;
  }, [presidenteAdmin, athletesById, athletesByName]);

  const depoimentosBase = useMemo(() => {
    const raw = Array.isArray(data.depoimentos) ? data.depoimentos : [];
    const normalized = raw
      .map((item, idx) => {
        const texto = (item?.texto ?? "").toString().trim();
        if (!texto) return null;
        const explicitId = item?.id?.toString().trim();
        const legacyName = (item as { nome?: string })?.nome ?? "";
        const legacyKey = normalizeLookup(legacyName);
        const legacyAthlete = legacyKey ? athletesByName.get(legacyKey) : null;
        const jogadorId =
          (item as { jogadorId?: string })?.jogadorId?.toString().trim() ||
          legacyAthlete?.id ||
          presidenteAthlete?.id ||
          presidenteAdmin?.athleteId ||
          "";
        const id = explicitId || `depoimento-${jogadorId || idx + 1}`;
        return {
          id,
          jogadorId,
          texto,
          destaque: Boolean(item?.destaque),
          legacy: item,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          jogadorId: string;
          texto: string;
          destaque: boolean;
          legacy: NossaHistoriaDepoimento;
        } => Boolean(item)
      );

    if (normalized.length > 0) {
      return normalized;
    }

    return [
      {
        id: "depoimento-presidente",
        jogadorId: presidenteAthlete?.id || presidenteAdmin?.athleteId || "",
        texto: DEFAULT_DEPOIMENTO_TEXTO,
        destaque: true,
      },
    ];
  }, [data.depoimentos, athletesByName, presidenteAthlete, presidenteAdmin]);

  const depoimentosRender = useMemo(() => {
    return depoimentosBase
      .map((dep) => {
        const athlete = dep.jogadorId ? athletesById.get(dep.jogadorId) : null;
        const legacy = dep.legacy as { nome?: string; foto?: string } | undefined;
        const legacyAdmin = legacy?.nome ? adminsByName.get(normalizeLookup(legacy.nome)) : null;
        const adminMatch =
          (dep.jogadorId && adminsByAthleteId.get(dep.jogadorId)) ||
          (athlete ? adminsByName.get(normalizeLookup(athlete.nome)) : null) ||
          legacyAdmin ||
          (presidenteAdmin && dep.id === "depoimento-presidente" ? presidenteAdmin : null);

        const nome =
          athlete?.nome || adminMatch?.nome || legacy?.nome || presidenteAdmin?.nome || "Atleta";
        const foto = athlete?.foto || adminMatch?.foto || legacy?.foto || DEFAULT_AVATAR;
        const cargo = adminMatch ? roleLabels[adminMatch.role] || "Atleta" : "Atleta";

        return {
          ...dep,
          nome,
          foto,
          cargo,
        };
      })
      .filter((dep) => dep.texto);
  }, [depoimentosBase, athletesById, adminsByAthleteId, adminsByName, presidenteAdmin]);
  const galeriaFotosBase = useMemo(
    () => normalizeGaleriaFotos(data.categoriasFotos, DEFAULT_GALERIA_FOTOS),
    [data.categoriasFotos]
  );
  const galeriaFotos = useMemo(
    () => galeriaFotosBase.slice(0, MAX_GALERIA_FOTOS),
    [galeriaFotosBase]
  );
  const galeriaFotosRender = useMemo(
    () =>
      galeriaFotos
        .filter((foto) => Boolean(foto.src))
        .map((foto, idx) => ({
          ...foto,
          titulo: foto.titulo || `Foto ${idx + 1}`,
          descricao: foto.descricao || DEFAULT_GALERIA_DESCRICAO,
        })),
    [galeriaFotos]
  );
  const videos = useMemo(() => data.videos ?? [], [data.videos]);
  const videosRender = useMemo(() => videos.filter((video) => Boolean(video?.url)), [videos]);
  const camposHistoricos = data.camposHistoricos ?? [];
  const campoAtual =
    footer?.campo?.nome || footer?.campo?.endereco || footer?.campo?.mapa
      ? {
          nome: footer.campo.nome ?? "",
          endereco: footer.campo.endereco ?? "",
          mapa: footer.campo.mapa ?? "",
          descricao: "",
          tipo: "Atual",
          cor: "text-green-400",
          tag: "text-xs text-green-300",
        }
      : null;
  const todosCampos = [
    ...camposHistoricos.map((campo) => ({
      ...campo,
      mapaEmbed: buildMapsEmbedUrl(campo.mapa, campo.endereco || campo.nome),
      tipo: "Historico",
      cor: "text-brand-soft",
      tag: "text-xs text-neutral-400",
    })),
    ...(campoAtual
      ? [
          {
            ...campoAtual,
            mapaEmbed: buildMapsEmbedUrl(campoAtual.mapa, campoAtual.endereco || campoAtual.nome),
          },
        ]
      : []),
  ];
  const rankingById = useMemo(() => {
    const map = new Map<string, (typeof rankingGeral)[number]>();
    rankingGeral.forEach((entry) => map.set(entry.id, entry));
    return map;
  }, [rankingGeral]);

  const membrosAntigos = useMemo(() => {
    const map = new Map<
      string,
      { id: string; nome: string; slug: string; foto: string; jogos: number }
    >();

    matchesAll.forEach((match) => {
      (match.presences ?? []).forEach((presence) => {
        if (presence.status === "AUSENTE") return;
        const athlete = presence.athlete;
        if (!athlete?.id || !athlete?.name) return;
        const existing = map.get(athlete.id);
        const rankingEntry = rankingById.get(athlete.id);
        const slugValue = rankingEntry?.slug ?? athlete.id;
        const fotoValue = athlete.photoUrl || rankingEntry?.foto || DEFAULT_AVATAR;
        if (existing) {
          existing.jogos += 1;
          return;
        }
        map.set(athlete.id, {
          id: athlete.id,
          nome: athlete.name,
          slug: slugValue,
          foto: fotoValue,
          jogos: 1,
        });
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.jogos - a.jogos)
      .slice(0, 5);
  }, [matchesAll, rankingById]);
  const campeoesHistoricos = [...rankingGeral]
    .sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0) || (b.jogos ?? 0) - (a.jogos ?? 0))
    .slice(0, 5);

  const diretoria = (() => {
    const admins = (racha?.admins ?? []).filter((admin) => admin.status !== "inativo");
    const resolveName = (admin: (typeof admins)[number]) =>
      admin.nome?.trim() || admin.email?.trim() || "Administrador";
    const resolvePhoto = (admin: (typeof admins)[number]) => admin.foto || DEFAULT_AVATAR;
    const byRole = (role: string) => admins.find((admin) => admin.role === role);
    const presidenteAdmin = byRole("presidente") ?? null;
    const mapped: { nome: string; cargo: string; foto?: string }[] = [];
    if (presidenteAdmin) {
      mapped.push({
        nome: resolveName(presidenteAdmin),
        cargo: "Presidente",
        foto: resolvePhoto(presidenteAdmin),
      });
    }

    const vice = byRole("vicepresidente");
    if (vice) {
      mapped.push({
        nome: resolveName(vice),
        cargo: "Vice-Presidente",
        foto: resolvePhoto(vice),
      });
    }

    const diretorFutebol = byRole("diretorfutebol");
    if (diretorFutebol) {
      mapped.push({
        nome: resolveName(diretorFutebol),
        cargo: "Diretor de Futebol",
        foto: resolvePhoto(diretorFutebol),
      });
    }

    const diretorFinanceiro = byRole("diretorfinanceiro");
    if (diretorFinanceiro) {
      mapped.push({
        nome: resolveName(diretorFinanceiro),
        cargo: "Diretor Financeiro",
        foto: resolvePhoto(diretorFinanceiro),
      });
    }

    return mapped;
  })();

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: "Nossa Historia - Fut7Pro", url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallback
      }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
        return;
      }
      window.prompt("Copie o link:", url);
    } catch {
      alert("Nao foi possivel compartilhar agora.");
    }
  };

  const handleCurtirCuriosidade = async (id: string, current: number) => {
    if (!slug || !id) return;
    if (curiosidadesCurtindo[id] || curiosidadesCurtidasLocalStorage[id]) return;
    setCuriosidadesCurtindo((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(
        `/api/public/${encodeURIComponent(slug)}/curiosidades/${encodeURIComponent(id)}/like`,
        { method: "POST" }
      );
      const body = await res.json().catch(() => null);
      const next =
        typeof body?.curtidas === "number" && Number.isFinite(body.curtidas)
          ? Number(body.curtidas)
          : current + 1;
      setCuriosidadesCurtidasLocal((prev) => ({ ...prev, [id]: next }));
      setCuriosidadesCurtidasLocalStorage((prev) => ({ ...prev, [id]: true }));
      if (typeof window !== "undefined") {
        const prefix = slug ? `fut7pro-curiosidade-like-${slug}-` : "fut7pro-curiosidade-like-";
        window.localStorage.setItem(`${prefix}${id}`, "1");
      }
    } catch {
      // silencioso
    } finally {
      setCuriosidadesCurtindo((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <>
      <Head>
        <title>Nossa Historia | Sobre Nos | Fut7Pro</title>
        <meta
          name="description"
          content="Linha do tempo, fotos, videos, curiosidades e depoimentos sobre a historia do racha. Conteudo dinamicado por tenant."
        />
      </Head>
      <main className="w-full flex flex-col gap-10 pt-20">
        <section className="w-full max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-brand mb-4">{titulo}</h1>
          <p className="text-white text-base md:text-lg mb-4">{descricao}</p>
        </section>

        <section className="w-full max-w-5xl mx-auto px-4 flex flex-wrap gap-4 mb-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-neutral-800 text-brand font-bold px-4 py-2 rounded-xl hover:bg-neutral-700 transition"
          >
            <FaShareAlt /> Compartilhar Historia
          </button>
        </section>

        {marcos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Linha do Tempo</h2>
            <div className="space-y-6 relative border-l-4 border-brand pl-8">
              {marcos.map((marco, idx) => (
                <div
                  key={`${marco.ano}-${idx}`}
                  className="relative flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 group"
                >
                  <div className="absolute -left-9 md:-left-11 bg-brand text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-md border-4 border-black">
                    {/^\d{4}$/.test(marco.ano) ? marco.ano.substring(2) : marco.ano}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{marco.titulo}</span>
                      {marco.conquista && <span className="text-2xl ml-1">{marco.conquista}</span>}
                    </div>
                    <div className="text-neutral-300 text-sm">{marco.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {galeriaFotosRender.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Galeria de Fotos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galeriaFotosRender.map((foto, idx) => {
                const titulo = foto.titulo || `Foto ${idx + 1}`;
                const descricao = foto.descricao || "";
                const alt = `Galeria do racha ${rachaNome}: ${titulo}`;
                return (
                  <div
                    key={foto.id ?? `galeria-${idx}`}
                    className="bg-neutral-900 rounded-xl overflow-hidden shadow-md flex flex-col"
                  >
                    <Image
                      src={foto.src}
                      alt={alt}
                      width={420}
                      height={260}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-white">{titulo}</h3>
                      <p className="text-xs text-neutral-300 mt-1">{descricao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {videosRender.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Videos Historicos</h2>
            <div className="flex flex-wrap gap-6">
              {videosRender.map((video, idx) => {
                const thumb = youtubeThumb(video.url);
                const watchUrl = youtubeWatchUrl(video.url);
                const embedUrl = normalizeYouTubeUrl(video.url);
                const aberto = Boolean(videosAbertos[idx]);
                const titulo = video.titulo || `Video ${idx + 1}`;
                return (
                  <div
                    key={idx}
                    className="w-full md:w-1/2 bg-neutral-900 rounded-xl overflow-hidden border border-[#2a2d36]"
                  >
                    <div className="relative aspect-video bg-neutral-800">
                      {aberto ? (
                        <iframe
                          src={embedUrl}
                          title={titulo}
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setVideosAbertos((prev) => ({ ...prev, [idx]: true }))}
                          className="relative w-full h-full"
                          title="Reproduzir aqui"
                        >
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={`Video do racha ${rachaNome}: ${titulo}`}
                              width={640}
                              height={360}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                              Preview indisponivel
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">
                              Reproduzir aqui
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="text-sm font-semibold text-white">{titulo}</div>
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand hover:text-brand-soft"
                      >
                        Assistir no YouTube
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {curiosidades.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Curiosidades do Racha</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curiosidades
                .slice()
                .sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))
                .map((item, idx) => {
                  const id = item.id ?? `curiosidade-${idx}`;
                  const jaCurtiu = Boolean(curiosidadesCurtidasLocalStorage[id]);
                  const curtindo = Boolean(curiosidadesCurtindo[id]);
                  return (
                    <li
                      key={id}
                      className="bg-neutral-900 rounded-xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">{item.icone}</span>
                      <span className="text-white flex-1">{item.texto}</span>
                      <button
                        type="button"
                        title={jaCurtiu ? "Voce ja curtiu" : "Curtir curiosidade"}
                        onClick={() => handleCurtirCuriosidade(id, item.curtidas ?? 0)}
                        disabled={jaCurtiu || curtindo}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-sm transition ${
                          jaCurtiu
                            ? "border-green-400 text-green-300"
                            : "border-brand text-brand hover:text-brand-soft"
                        } ${curtindo ? "opacity-70 cursor-wait" : ""}`}
                      >
                        <FaRegThumbsUp /> {item.curtidas ?? 0}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}

        {depoimentosRender.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Depoimentos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {depoimentosRender.map((dep) => (
                <div
                  key={dep.id}
                  className={`bg-neutral-900 rounded-2xl p-4 flex flex-col items-center ${dep.destaque ? "border-2 border-brand" : ""}`}
                >
                  <Image
                    src={dep.foto || DEFAULT_AVATAR}
                    alt={dep.nome}
                    width={64}
                    height={64}
                    className="rounded-full mb-2 border-2 border-brand"
                  />
                  <div className="italic text-neutral-200 text-center mb-2">{dep.texto}</div>
                  <div className="text-brand-soft font-semibold">{dep.nome}</div>
                  <div className="text-neutral-400 text-xs">{dep.cargo}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {todosCampos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4 flex items-center gap-2">
              <FaMapMarkedAlt /> Onde Começou e Onde Jogamos Hoje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todosCampos.map((campo, idx) => (
                <div key={idx} className="bg-neutral-900 rounded-xl p-3 flex flex-col">
                  <div className={`font-bold mb-2 ${campo.cor}`}>
                    {campo.nome} <span className={campo.tag}>({campo.tipo})</span>
                  </div>
                  {campo.endereco && (
                    <div className="text-neutral-300 text-xs mb-2">Endereço: {campo.endereco}</div>
                  )}
                  <iframe
                    src={campo.mapaEmbed}
                    width="100%"
                    height="220"
                    loading="lazy"
                    className="rounded-xl mb-2 border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  ></iframe>
                  <div className="text-white text-sm">{campo.descricao}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {membrosAntigos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4 flex items-center gap-2">
              <FaMedal /> Top 5 Mais Assíduos
            </h2>
            <div className="flex flex-wrap gap-4">
              {membrosAntigos.map((membro, idx) => (
                <Link
                  href={publicHref(`/atletas/${membro.slug}`)}
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-36 hover:border-brand border border-neutral-700"
                >
                  <Image
                    src={membro.foto || DEFAULT_AVATAR}
                    alt={membro.nome}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-brand mb-2"
                  />
                  <div className="font-semibold text-white text-center">{membro.nome}</div>
                  <div className="text-brand text-xs">Assiduidade</div>
                  <div className="text-neutral-300 text-xs">{membro.jogos} jogos</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {campeoesHistoricos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand mb-4 flex items-center gap-2">
              <FaMedal className="text-brand" /> Campeoes Historicos (Top 5 Pontuadores de todos os
              tempos)
            </h2>
            <div className="flex flex-wrap gap-4">
              {campeoesHistoricos.map((jogador, idx) => (
                <Link
                  href={publicHref(`/atletas/${jogador.slug}`)}
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-40 hover:border-brand border border-neutral-700 transition"
                >
                  <div className="text-brand-soft text-lg font-extrabold mb-1">#{idx + 1}</div>
                  {jogador.foto && (
                    <Image
                      src={jogador.foto}
                      alt={jogador.nome}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-brand mb-2"
                    />
                  )}
                  <div className="font-semibold text-white text-center">{jogador.nome}</div>
                  <div className="text-brand text-xs mb-1">{jogador.posicao}</div>
                  <div className="text-brand-soft text-base font-bold">{jogador.pontos} pts</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {diretoria.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand mb-4 mt-10 flex items-center gap-2">
              <FaMedal className="text-brand" /> Presidencia e Diretoria
            </h2>
            <div className="flex flex-wrap gap-4">
              {diretoria.map((membro, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-48 hover:border-brand border border-neutral-700 transition"
                >
                  {membro.foto && (
                    <Image
                      src={membro.foto}
                      alt={membro.nome}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-brand mb-2"
                    />
                  )}
                  <div className="font-semibold text-white text-center">{membro.nome}</div>
                  <div className="text-brand text-sm font-bold text-center">{membro.cargo}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

"use client";

import { useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaRegThumbsUp, FaShareAlt, FaDownload, FaMapMarkedAlt, FaMedal } from "react-icons/fa";
import { useAboutPublic } from "@/hooks/useAbout";
import { useFooterConfigPublic } from "@/hooks/useFooterConfig";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useTimesDoDiaPublicado } from "@/hooks/useTimesDoDiaPublicado";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { DEFAULT_NOSSA_HISTORIA } from "@/utils/schemas/nossaHistoria.schema";
import { buildMapsEmbedUrl } from "@/utils/maps";
import type { PublicMatch } from "@/types/partida";
import type { NossaHistoriaCuriosidade } from "@/types/paginasInstitucionais";

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

function buildCuriosidadesAutomaticas(
  matches: PublicMatch[],
  fallbackDuration?: number | null
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
      titulo: "Maior goleada registrada",
      texto: goleadaTexto,
      icone: "⚽",
    },
    {
      titulo: "Maior sequência invicta (jogador)",
      texto: invictoTexto,
      icone: "🔥",
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

export default function NossaHistoriaPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { publicHref } = usePublicLinks();
  const { about } = useAboutPublic(slug);
  const { footer } = useFooterConfigPublic(slug);
  const { racha } = useRachaPublic(slug);
  const { data: timesDoDiaPublicado } = useTimesDoDiaPublicado({ slug, source: "public" });
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

  const presidenteNome = useMemo(() => {
    const presidente = racha?.admins?.find((admin) => admin.role === "presidente");
    return presidente?.nome?.trim() || presidente?.email?.trim() || DEFAULT_PRESIDENTE_NAME;
  }, [racha?.admins]);
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
  const curiosidadesAutomaticas = useMemo(
    () =>
      buildCuriosidadesAutomaticas(
        matchesAll,
        timesDoDiaPublicado?.configuracao?.duracaoPartidaMin ?? null
      ),
    [matchesAll, timesDoDiaPublicado?.configuracao?.duracaoPartidaMin]
  );
  const curiosidadesAdmin = data.curiosidades || [];
  const curiosidades = useMemo(() => {
    const normalize = (value?: string) => value?.trim().toLowerCase() || "";
    const autoTitles = new Set(curiosidadesAutomaticas.map((item) => normalize(item.titulo)));
    const extras = curiosidadesAdmin.filter((item) => {
      const title = normalize(item.titulo);
      if (!title) return true;
      return !autoTitles.has(title);
    });
    return [...curiosidadesAutomaticas, ...extras];
  }, [curiosidadesAutomaticas, curiosidadesAdmin]);
  const depoimentos = data.depoimentos || [];
  const categoriasFotos = data.categoriasFotos || [];
  const videos = data.videos || [];
  const camposHistoricos = data.camposHistoricos || [];
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

  const handleDownload = () => {
    alert("Funcao de download/compartilhar ainda nao implementada.");
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
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand text-black font-bold px-4 py-2 rounded-xl hover:brightness-110 transition"
          >
            <FaDownload /> Baixar Linha do Tempo
          </button>
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({ title: "Nossa Historia - Fut7Pro", url: window.location.href })
                : handleDownload()
            }
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

        {categoriasFotos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Galeria de Fotos</h2>
            <div className="flex flex-wrap gap-6">
              {categoriasFotos.map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="font-bold text-white mb-2">{cat.nome}</div>
                  <div className="flex flex-wrap gap-4">
                    {cat.fotos?.map((foto, i) => (
                      <div
                        key={i}
                        className="bg-neutral-800 rounded-xl p-2 shadow-md w-40 flex flex-col items-center"
                      >
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          width={140}
                          height={100}
                          className="rounded-lg object-cover w-full h-[100px]"
                        />
                        <span className="text-xs text-neutral-300 mt-2">{foto.alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Videos Historicos</h2>
            <div className="flex flex-wrap gap-6">
              {videos.map((video, idx) => (
                <div
                  key={idx}
                  className="w-full md:w-1/2 aspect-video bg-neutral-800 rounded-xl overflow-hidden"
                >
                  <iframe
                    src={video.url}
                    title={video.titulo}
                    allowFullScreen
                    className="w-full h-full min-h-[200px] rounded-xl"
                  ></iframe>
                </div>
              ))}
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
                .map((item, idx) => (
                  <li
                    key={idx}
                    className="bg-neutral-900 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">{item.icone}</span>
                    <span className="text-white flex-1">{item.texto}</span>
                    <button
                      title="Curtir curiosidade"
                      className="flex items-center gap-1 text-brand hover:text-brand-soft"
                    >
                      <FaRegThumbsUp /> {item.curtidas ?? 0}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {depoimentos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Depoimentos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {depoimentos.map((dep, idx) => (
                <div
                  key={idx}
                  className={`bg-neutral-900 rounded-2xl p-4 flex flex-col items-center ${dep.destaque ? "border-2 border-brand" : ""}`}
                >
                  {dep.foto && (
                    <Image
                      src={dep.foto}
                      alt={dep.nome}
                      width={64}
                      height={64}
                      className="rounded-full mb-2 border-2 border-brand"
                    />
                  )}
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

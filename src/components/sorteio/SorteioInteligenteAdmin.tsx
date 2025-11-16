"use client";

import { useEffect, useMemo, useState } from "react";
import ConfiguracoesRacha from "./ConfiguracoesRacha";
import SelecionarTimesDia from "./SelecionarTimesDia";
import ParticipantesRacha from "./ParticipantesRacha";
import TimesGerados from "./TimesGerados";
import BotaoPublicarTimes from "./BotaoPublicarTimes";
import TabelaJogosRacha from "./TabelaJogosRacha";
import {
  sortearTimesInteligente,
  gerarTabelaJogos,
  type JogoConfronto,
} from "@/utils/sorteioUtils";
import type { Time as RachaTime } from "@/types/time";
import type { Participante, ConfiguracaoRacha, TimeSorteado } from "@/types/sorteio";
import type { Athlete } from "@/types/jogador";
import type { MatchPresence } from "@/types/partida";
import { useAuth } from "@/hooks/useAuth";
import { useJogadores } from "@/hooks/useJogadores";
import { useTimes } from "@/hooks/useTimes";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { rachaConfig } from "@/config/racha.config";

const FALLBACK_FOTO = "/images/jogadores/jogador_padrao_01.jpg";

function LoaderBolaFutebol() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="mb-2" aria-hidden>
      <g>
        <ellipse cx="36" cy="64" rx="20" ry="5" fill="#000" opacity="0.2">
          <animate
            attributeName="rx"
            values="20;12;20"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.35;0.2"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </ellipse>
        <circle cx="36" cy="36" r="20" fill="#fff" stroke="#222" strokeWidth="3">
          <animate
            attributeName="cy"
            values="36;16;36"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </circle>
        <polygon points="36,24 44,28 44,36 36,40 28,36 28,28" fill="#222">
          <animate
            attributeName="points"
            values="36,24 44,28 44,36 36,40 28,36 28,28;36,14 46,20 46,36 36,42 26,36 26,20;36,24 44,28 44,36 36,40 28,36 28,28"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polygon>
        <polyline
          points="36,24 36,40"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="36,24 36,40;36,14 36,42;36,24 36,40"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polyline>
        <polyline
          points="36,24 44,28"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="36,24 44,28;36,14 46,20;36,24 44,28"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polyline>
        <polyline
          points="36,24 28,28"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="36,24 28,28;36,14 26,20;36,24 28,28"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polyline>
      </g>
    </svg>
  );
}

function normalizarPosicao(posicao?: string | null): "GOL" | "ZAG" | "MEI" | "ATA" {
  const valor = (posicao ?? "").toLowerCase();
  if (valor.includes("gol")) return "GOL";
  if (valor.includes("zag") || valor.includes("def")) return "ZAG";
  if (valor.includes("mei") || valor.includes("mid")) return "MEI";
  return "ATA";
}

const gerarIdParticipante = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `athlete-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function createParticipanteFromAthlete(
  athlete: Athlete | null | undefined,
  tenantSlug: string,
  overrides?: Partial<Participante>
): Participante {
  const rankingPrimario = athlete?.rankings?.[0];
  const stats = athlete?.stats;
  const legacyPosition = athlete?.posicao ?? null;

  const id = overrides?.id ?? athlete?.id ?? gerarIdParticipante();
  const nome = overrides?.nome ?? athlete?.name ?? "Atleta";
  const slug = overrides?.slug ?? athlete?.slug ?? athlete?.nickname ?? id;
  const photoUrl = overrides?.photoUrl ?? athlete?.photoUrl ?? FALLBACK_FOTO;
  const posicaoBase = athlete?.position ?? legacyPosition ?? null;
  const posicao = overrides?.posicao ?? normalizarPosicao(posicaoBase);

  const rankingPontos =
    overrides?.rankingPontos ?? rankingPrimario?.points ?? athlete?.rankingPontos ?? 0;
  const vitorias =
    overrides?.vitorias ?? rankingPrimario?.wins ?? stats?.wins ?? athlete?.vitorias ?? 0;
  const gols = overrides?.gols ?? rankingPrimario?.goals ?? stats?.goals ?? athlete?.gols ?? 0;
  const assistencias =
    overrides?.assistencias ??
    rankingPrimario?.assists ??
    stats?.assists ??
    athlete?.assistencias ??
    0;
  const partidas =
    overrides?.partidas ?? rankingPrimario?.games ?? stats?.totalMatches ?? athlete?.partidas ?? 0;

  const estrelasBackend = athlete?.estrelas;
  const estrelasLegacy = athlete?.stars;
  const overrideEstrelas = overrides?.estrelas;

  const baseEstrelas: Participante["estrelas"] = {
    id: overrideEstrelas?.id ?? estrelasBackend?.id ?? `${tenantSlug}-${id}`,
    rachaId: overrideEstrelas?.rachaId ?? estrelasBackend?.rachaId ?? tenantSlug,
    jogadorId: overrideEstrelas?.jogadorId ?? estrelasBackend?.jogadorId ?? id,
    estrelas: overrideEstrelas?.estrelas ?? estrelasBackend?.estrelas ?? estrelasLegacy?.value ?? 0,
    atualizadoEm:
      overrideEstrelas?.atualizadoEm ??
      estrelasBackend?.atualizadoEm ??
      estrelasLegacy?.updatedAt ??
      new Date().toISOString(),
    atualizadoPor:
      overrideEstrelas?.atualizadoPor ??
      estrelasBackend?.atualizadoPor ??
      estrelasLegacy?.updatedBy ??
      "",
  };

  const isMember = overrides?.isMember ?? athlete?.isMember ?? false;

  const participante: Participante = {
    id,
    nome,
    slug,
    photoUrl,
    posicao,
    rankingPontos,
    vitorias,
    gols,
    assistencias,
    estrelas: baseEstrelas,
    isMember,
    mensalista: isMember,
    partidas,
  };

  if (!overrides) {
    return participante;
  }

  const mergedEstrelas: Participante["estrelas"] = {
    ...baseEstrelas,
    ...(overrides.estrelas ?? {}),
    estrelas: overrides.estrelas?.estrelas ?? baseEstrelas.estrelas,
    jogadorId: overrides.estrelas?.jogadorId ?? baseEstrelas.jogadorId,
    rachaId: overrides.estrelas?.rachaId ?? baseEstrelas.rachaId,
    id: overrides.estrelas?.id ?? baseEstrelas.id,
  };

  const overrideMember = overrides.isMember ?? null;
  const mergedIsMember = overrideMember ?? participante.isMember;
  const resolvedPhoto = overrides.photoUrl ?? participante.photoUrl;

  return {
    ...participante,
    ...overrides,
    photoUrl: resolvedPhoto,
    isMember: mergedIsMember,
    mensalista: mergedIsMember,
    estrelas: mergedEstrelas,
  };
}

function mapPresenceToParticipante(presence: MatchPresence, tenantSlug: string): Participante {
  return createParticipanteFromAthlete(presence.athlete ?? null, tenantSlug, {
    id: presence.athlete?.id ?? presence.id,
    gols: presence.goals ?? 0,
    assistencias: presence.assists ?? 0,
    partidas: 1,
  });
}

function mergeParticipantes(base: Participante, incoming: Participante): Participante {
  return {
    ...base,
    ...incoming,
    estrelas: {
      ...base.estrelas,
      ...incoming.estrelas,
      estrelas: incoming.estrelas.estrelas ?? base.estrelas.estrelas,
      jogadorId: incoming.estrelas.jogadorId ?? base.estrelas.jogadorId,
      rachaId: incoming.estrelas.rachaId ?? base.estrelas.rachaId,
      id: incoming.estrelas.id ?? base.estrelas.id,
    },
    photoUrl: incoming.photoUrl ?? base.photoUrl,
    isMember: incoming.isMember ?? base.isMember,
    mensalista: incoming.isMember ?? base.isMember,
  };
}

function mapTime(time: RachaTime): RachaTime {
  return {
    ...time,
    logo: time.logo || "/images/times/time_padrao_01.png",
  };
}

export default function SorteioInteligenteAdmin() {
  const { user } = useAuth();
  const resolvedTenantSlug = user?.tenantSlug ?? rachaConfig.slug;

  const { jogadores: jogadoresRaw, isLoading: jogadoresLoading } = useJogadores(resolvedTenantSlug);
  const { times: timesRaw, isLoading: timesLoading } = useTimes(resolvedTenantSlug);
  const { matches: matchesRaw, isLoading: matchesLoading } = useAdminMatches({
    slug: resolvedTenantSlug,
  });

  const matchReferencia = useMemo(() => {
    if (!matchesRaw || matchesRaw.length === 0) return null;
    const ordenadas = [...matchesRaw].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const agora = Date.now();
    return ordenadas.find((match) => new Date(match.date).getTime() >= agora) ?? ordenadas[0];
  }, [matchesRaw]);

  const { participantesDisponiveis, participantesPadrao } = useMemo(() => {
    const mapa = new Map<string, Participante>();
    const selecionados: Participante[] = [];
    const selecionadosIds = new Set<string>();

    const upsert = (entrada: Participante) => {
      const existente = mapa.get(entrada.id);
      if (existente) {
        const mesclado = mergeParticipantes(existente, entrada);
        mapa.set(entrada.id, mesclado);
        return mesclado;
      }
      mapa.set(entrada.id, entrada);
      return entrada;
    };

    (jogadoresRaw ?? []).forEach((athlete) => {
      upsert(createParticipanteFromAthlete(athlete, resolvedTenantSlug));
    });

    matchReferencia?.presences.forEach((presence) => {
      const participante = mapPresenceToParticipante(presence, resolvedTenantSlug);
      const final = upsert(participante);
      if (presence.status !== "AUSENTE" && !selecionadosIds.has(final.id)) {
        selecionadosIds.add(final.id);
        selecionados.push(final);
      }
    });

    const lista = Array.from(mapa.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    return {
      participantesDisponiveis: lista,
      participantesPadrao: selecionados,
    };
  }, [jogadoresRaw, matchReferencia, resolvedTenantSlug]);

  const timesDisponiveis = useMemo(() => (timesRaw ?? []).map(mapTime), [timesRaw]);

  const [config, setConfig] = useState<ConfiguracaoRacha | null>(null);
  const [configConfirmada, setConfigConfirmada] = useState(false);
  const [timesSelecionados, setTimesSelecionados] = useState<string[]>([]);
  const [participantesSelecionados, setParticipantesSelecionados] = useState<Participante[]>([]);
  const [timesGerados, setTimesGerados] = useState<TimeSorteado[]>([]);
  const [tabelaJogos, setTabelaJogos] = useState<JogoConfronto[]>([]);
  const [showTip, setShowTip] = useState(true);
  const [avisoTimesShake, setAvisoTimesShake] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [publicarErro, setPublicarErro] = useState<string | null>(null);
  const [partidasTotais, setPartidasTotais] = useState(0);

  const maxTimes = config?.numTimes ?? Math.min(timesDisponiveis.length, 4);

  useEffect(() => {
    if (timesDisponiveis.length === 0) {
      setTimesSelecionados([]);
      return;
    }

    const limite = Math.max(2, config?.numTimes ?? Math.min(timesDisponiveis.length, 4));

    setTimesSelecionados((prev) => {
      const disponiveisIds = timesDisponiveis.map((t) => t.id);
      const filtrados = prev.filter((id) => disponiveisIds.includes(id)).slice(0, limite);
      if (filtrados.length === limite) return filtrados;

      const adicionais = disponiveisIds
        .filter((id) => !filtrados.includes(id))
        .slice(0, limite - filtrados.length);
      return [...filtrados, ...adicionais];
    });
  }, [timesDisponiveis, config?.numTimes]);

  useEffect(() => {
    setParticipantesSelecionados((prev) => {
      const disponiveisPorId = new Map(participantesDisponiveis.map((p) => [p.id, p]));
      return prev
        .map((p) => {
          const atualizado = disponiveisPorId.get(p.id);
          if (!atualizado) return null;
          return mergeParticipantes(atualizado, p);
        })
        .filter((p): p is Participante => Boolean(p));
    });
  }, [participantesDisponiveis]);

  useEffect(() => {
    if (!config) return;
    const maxJogadores = config.numTimes * config.jogadoresPorTime;
    if (!maxJogadores) return;

    setParticipantesSelecionados((prev) => {
      if (prev.length > 0) return prev;

      if (participantesPadrao.length > 0) {
        return participantesPadrao.slice(0, maxJogadores);
      }

      const mensalistas = participantesDisponiveis.filter((p) => p.isMember).slice(0, maxJogadores);
      if (mensalistas.length > 0) {
        return mensalistas;
      }

      return participantesDisponiveis.slice(0, maxJogadores);
    });
  }, [config, participantesDisponiveis, participantesPadrao]);

  const handleConfirmarConfig = () => {
    if (!config) return;
    if (timesSelecionados.length !== (config?.numTimes ?? 0)) {
      setAvisoTimesShake(true);
      setTimeout(() => setAvisoTimesShake(false), 500);
      return;
    }
    setConfigConfirmada(true);
  };

  const handleSortearTimes = () => {
    if (!config) return;
    if (participantesSelecionados.length === 0) return;

    const timesSelecionadosInfo = timesDisponiveis.filter((t) => timesSelecionados.includes(t.id));
    const resultado = sortearTimesInteligente(
      participantesSelecionados,
      timesSelecionadosInfo,
      participantesSelecionados.reduce((acc, p) => acc + (p.partidas ?? 0), 0)
    );
    setTimesGerados(resultado);
    setPartidasTotais(participantesSelecionados.reduce((acc, p) => acc + (p.partidas ?? 0), 0));

    const tabela = gerarTabelaJogos({
      times: timesSelecionadosInfo,
      duracaoRachaMin: config.duracaoRachaMin,
      duracaoPartidaMin: config.duracaoPartidaMin,
    });
    setTabelaJogos(tabela);
    setPublicado(false);
    setPublicarErro(null);
  };

  const handlePublicarTimes = async () => {
    if (publicando || timesGerados.length === 0) return;

    setPublicando(true);
    setPublicarErro(null);
    try {
      const payload = {
        tenantSlug: resolvedTenantSlug,
        config,
        timesSelecionados,
        timesGerados,
        participantes: participantesSelecionados.map((p) => ({
          id: p.id,
          nome: p.nome,
          posicao: p.posicao,
          estrelas: p.estrelas?.estrelas ?? 0,
        })),
        tabelaJogos,
        partidasTotais,
      };

      const response = await fetch("/api/admin/partidas/sorteio/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.error ?? "Falha ao publicar sorteio");
      }

      setPublicado(true);
    } catch (error) {
      setPublicarErro(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setPublicando(false);
    }
  };

  const carregando = jogadoresLoading || timesLoading || matchesLoading;

  return (
    <div className="bg-[#1d1d1d] text-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Sorteio Inteligente</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Monte times equilibrados usando rankings, posi��es e estrelas personalizadas.
          </p>
        </div>
      </header>

      {carregando && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-300">
          <LoaderBolaFutebol />
          <span className="font-semibold">Carregando dados do racha...</span>
        </div>
      )}

      {!carregando && (
        <>
          {showTip && (
            <div className="bg-[#262627] border border-yellow-400 rounded-lg p-4 mb-6 relative">
              <button
                className="absolute right-2 top-2 text-yellow-400 text-lg font-bold rounded hover:bg-yellow-400 hover:text-black transition px-2 py-0.5"
                onClick={() => setShowTip(false)}
                aria-label="Fechar explica��o"
              >
                ✕
              </button>
              <b>Como garantir um sorteio equilibrado?</b>
              <p className="text-sm text-gray-200 mt-3 space-y-2">
                <span>
                  O sistema considera ranking, posi��o e estrelas. Ajuste manualmente conforme a
                  realidade do seu racha.
                </span>
              </p>
            </div>
          )}

          <div
            className={
              configConfirmada
                ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
                : "transition-all duration-300"
            }
          >
            <ConfiguracoesRacha onSubmit={setConfig} disabled={configConfirmada} />
          </div>

          <div
            className={
              configConfirmada
                ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
                : "transition-all duration-300"
            }
          >
            <SelecionarTimesDia
              timesDisponiveis={timesDisponiveis}
              timesSelecionados={timesSelecionados}
              onChange={setTimesSelecionados}
              disabled={configConfirmada}
              maxTimes={maxTimes}
              shake={avisoTimesShake}
            />
          </div>

          <div className="flex justify-center mt-3 mb-3">
            {!configConfirmada ? (
              <button
                className="w-full md:w-auto py-3 px-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded text-lg shadow transition disabled:opacity-60 disabled:pointer-events-none"
                onClick={handleConfirmarConfig}
                disabled={!config || timesSelecionados.length !== (config?.numTimes ?? 0)}
              >
                Confirmar Configura��o
              </button>
            ) : (
              <button
                className="w-full md:w-auto py-3 px-8 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded text-lg shadow transition"
                onClick={() => setConfigConfirmada(false)}
              >
                Editar Configura��o
              </button>
            )}
          </div>

          <ParticipantesRacha
            tenantSlug={resolvedTenantSlug}
            config={config}
            participantes={participantesSelecionados}
            setParticipantes={setParticipantesSelecionados}
            todosJogadores={participantesDisponiveis}
          />

          <button
            className="w-full py-3 mt-3 mb-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded text-lg"
            onClick={handleSortearTimes}
            disabled={timesSelecionados.length < 2 || !config}
          >
            Sortear Times
          </button>

          {timesGerados.length > 0 && (
            <>
              <TimesGerados times={timesGerados} />
              <BotaoPublicarTimes
                publicado={publicado}
                onClick={handlePublicarTimes}
                loading={publicando}
              />
              {publicarErro && (
                <p className="text-sm text-red-400 mt-2 text-center">{publicarErro}</p>
              )}
              <TabelaJogosRacha jogos={tabelaJogos} />
            </>
          )}
        </>
      )}
    </div>
  );
}

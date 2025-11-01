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
  type Time,
} from "@/utils/sorteioUtils";
import type { Participante, ConfiguracaoRacha, TimeSorteado } from "@/types/sorteio";
import { useAuth } from "@/hooks/useAuth";
import { useJogadores } from "@/hooks/useJogadores";
import { useTimes } from "@/hooks/useTimes";
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

function mapJogadorParaParticipante(raw: any, tenantSlug: string): Participante {
  const rankingPrimario = Array.isArray(raw?.rankings) ? raw.rankings[0] : undefined;
  const partidas = rankingPrimario?.games ?? rankingPrimario?.jogos ?? raw?.partidas ?? 0;
  const vitorias = rankingPrimario?.wins ?? rankingPrimario?.vitorias ?? raw?.vitorias ?? 0;
  const gols = rankingPrimario?.goals ?? rankingPrimario?.gols ?? raw?.gols ?? 0;
  const assistencias =
    rankingPrimario?.assists ?? rankingPrimario?.assistencias ?? raw?.assistencias ?? 0;

  return {
    id: String(raw?.id ?? crypto.randomUUID()),
    nome: raw?.nome ?? raw?.name ?? "Jogador",
    slug: raw?.slug ?? raw?.nickname ?? String(raw?.id ?? crypto.randomUUID()),
    foto: raw?.foto ?? raw?.avatar ?? raw?.photoUrl ?? FALLBACK_FOTO,
    posicao: normalizarPosicao(raw?.posicao ?? raw?.position),
    rankingPontos: rankingPrimario?.points ?? rankingPrimario?.pontos ?? raw?.rankingPontos ?? 0,
    vitorias,
    gols,
    assistencias,
    estrelas: {
      id: `${tenantSlug}-${raw?.id ?? crypto.randomUUID()}`,
      rachaId: tenantSlug,
      jogadorId: String(raw?.id ?? crypto.randomUUID()),
      estrelas: raw?.estrelas?.estrelas ?? 0,
      atualizadoEm: raw?.estrelas?.atualizadoEm ?? "",
      atualizadoPor: raw?.estrelas?.atualizadoPor ?? "",
    },
    mensalista: Boolean(raw?.mensalista ?? raw?.monthly ?? raw?.isMensalista),
    partidas,
  };
}

function mapTime(time: Time): Time {
  return {
    id: time.id,
    nome: time.nome,
    logo: time.logo || "/images/times/time_padrao_01.png",
  };
}

export default function SorteioInteligenteAdmin() {
  const { user } = useAuth();
  const resolvedTenantSlug = user?.tenantSlug ?? rachaConfig.slug;

  const { jogadores: jogadoresRaw, isLoading: jogadoresLoading } = useJogadores(resolvedTenantSlug);
  const { times: timesRaw, isLoading: timesLoading } = useTimes(resolvedTenantSlug);

  const participantesDisponiveis = useMemo(
    () =>
      (jogadoresRaw ?? []).map((jogador) =>
        mapJogadorParaParticipante(jogador, resolvedTenantSlug)
      ),
    [jogadoresRaw, resolvedTenantSlug]
  );

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
          return {
            ...atualizado,
            estrelas: p.estrelas ?? atualizado.estrelas,
          };
        })
        .filter((p): p is Participante => Boolean(p));
    });
  }, [participantesDisponiveis]);

  useEffect(() => {
    if (!config || participantesSelecionados.length > 0) return;
    const maxJogadores = config.numTimes * config.jogadoresPorTime;
    if (!maxJogadores) return;

    const mensalistas = participantesDisponiveis.filter((p) => p.mensalista).slice(0, maxJogadores);
    if (mensalistas.length) {
      setParticipantesSelecionados(mensalistas);
    }
  }, [config, participantesDisponiveis, participantesSelecionados.length]);

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

  const carregando = jogadoresLoading || timesLoading;

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

"use client";

import { useEffect, useState } from "react";
import ConfiguracoesRacha from "./ConfiguracoesRacha";
import SelecionarTimesDia from "./SelecionarTimesDia";
import ParticipantesRacha from "./ParticipantesRacha";
import TimesGerados from "./TimesGerados";
import BotaoPublicarTimes from "./BotaoPublicarTimes";
import { sortearTimesInteligente, gerarTabelaJogos } from "@/utils/sorteioUtils";
import TabelaJogosRacha from "./TabelaJogosRacha";
import type { Participante, ConfiguracaoRacha, TimeSorteado } from "@/types/sorteio";
import type { Time, JogoConfronto } from "@/utils/sorteioUtils";
import { useRacha } from "@/context/RachaContext";
import { useTimes } from "@/hooks/useTimes";
import { useSorteioHistorico } from "@/hooks/useSorteioHistorico";
import { rachaConfig } from "@/config/racha.config";
import { logoPadrao } from "@/config/teamLogoMap";

// SVG Loader animado de bola pulando (não precisa instalar nada)
function LoaderBolaFutebol() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="mb-2" aria-hidden>
      <g>
        {/* Sombra */}
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
        {/* Bola */}
        <circle cx="36" cy="36" r="20" fill="#fff" stroke="#222" strokeWidth="3">
          <animate
            attributeName="cy"
            values="36;16;36"
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Hexágono central */}
        <polygon points="36,24 44,28 44,36 36,40 28,36 28,28" fill="#222">
          <animate
            attributeName="points"
            values="
                            36,24 44,28 44,36 36,40 28,36 28,28;
                            36,14 46,20 46,36 36,42 26,36 26,20;
                            36,24 44,28 44,36 36,40 28,36 28,28
                        "
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polygon>
        {/* Detalhes (gomos) */}
        <polyline
          points="36,24 36,40"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="
                            36,24 36,40;
                            36,14 36,42;
                            36,24 36,40
                        "
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
            values="
                            36,24 44,28;
                            36,14 46,20;
                            36,24 44,28
                        "
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
            values="
                            36,24 28,28;
                            36,14 26,20;
                            36,24 28,28
                        "
            keyTimes="0;0.5;1"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </polyline>
      </g>
    </svg>
  );
}

export default function SorteioInteligenteAdmin() {
  const { rachaId, tenantSlug } = useRacha();
  const resolvedSlug = tenantSlug || rachaId || rachaConfig.slug;
  const configConfirmKey = `${rachaConfig.storage.configKey}-confirmada`;
  const { times: timesDisponiveis, isLoading: loadingTimes } = useTimes(resolvedSlug);
  const {
    historico,
    totalTemporada,
    anoTemporada,
    isLoading: loadingHistorico,
    isError: erroHistorico,
  } = useSorteioHistorico(5);
  const [config, setConfig] = useState<ConfiguracaoRacha | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [times, setTimes] = useState<TimeSorteado[]>([]);
  const [publicado, setPublicado] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [configConfirmada, setConfigConfirmada] = useState(false);

  // Estado dos times selecionados
  const [timesSelecionados, setTimesSelecionados] = useState<string[]>([]);

  // Estado para a tabela de jogos
  const [tabelaJogos, setTabelaJogos] = useState<JogoConfronto[]>([]);

  // Shake no aviso se tentar confirmar sem estar correto
  const [avisoTimesShake, setAvisoTimesShake] = useState(false);

  // Loading do sorteio inteligente
  const [loadingSorteio, setLoadingSorteio] = useState(false);
  const [partidasTotaisSorteio, setPartidasTotaisSorteio] = useState(0);
  const [sorteioAvisos, setSorteioAvisos] = useState<string[]>([]);
  const [sorteioReservas, setSorteioReservas] = useState<Participante[]>([]);
  const [sorteioErro, setSorteioErro] = useState<string | null>(null);

  // Quantidade máxima de times do config
  const maxTimes = config?.numTimes || 2;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(configConfirmKey);
      if (stored === "true") {
        setConfigConfirmada(true);
      }
    } catch {
      /* ignore */
    }
  }, [configConfirmKey]);

  useEffect(() => {
    if (!timesDisponiveis || timesDisponiveis.length === 0) {
      if (timesSelecionados.length) {
        setTimesSelecionados([]);
      }
      return;
    }

    const disponiveisIds = new Set(timesDisponiveis.map((t) => t.id));
    const filtrados = timesSelecionados.filter((id) => disponiveisIds.has(id));
    const limite = Math.min(maxTimes, timesDisponiveis.length);

    const faltando = limite - filtrados.length;
    const extras =
      faltando > 0
        ? timesDisponiveis
            .map((t) => t.id)
            .filter((id) => !filtrados.includes(id))
            .slice(0, faltando)
        : [];

    const proximos = faltando > 0 ? [...filtrados, ...extras] : filtrados.slice(0, limite);
    const mudou =
      proximos.length !== timesSelecionados.length ||
      proximos.some((id, idx) => id !== timesSelecionados[idx]);

    if (mudou) {
      setTimesSelecionados(proximos);
    }
  }, [timesDisponiveis, maxTimes, timesSelecionados]);

  function handleConfirmarConfig() {
    const limiteConfirmacao = Math.min(maxTimes, timesDisponiveis.length || maxTimes);
    if (timesSelecionados.length !== limiteConfirmacao) {
      setAvisoTimesShake(true);
      setTimeout(() => setAvisoTimesShake(false), 500);
      return;
    }
    setConfigConfirmada(true);
    try {
      localStorage.setItem(configConfirmKey, "true");
    } catch {
      /* ignore */
    }
  }

  // NOVO: Função para somar o total de partidas já jogadas pelos participantes
  function calcularPartidasTotais(participantes: Participante[]): number {
    // Soma o campo "partidas" de cada participante (fallback para 0 se não existir)
    return participantes.reduce((acc, p) => acc + (p.partidas || 0), 0);
  }

  const normalizarTime = (time: any): Time => ({
    id: time.id,
    nome: time.nome || (time as any).name || "Time",
    logo: time.logo || (time as any).logoUrl || logoPadrao,
  });

  async function handleSortearTimes() {
    if (!config || participantes.length === 0 || timesSelecionados.length < 2) return;

    const timesParaSorteio = timesDisponiveis.filter((t) => timesSelecionados.includes(t.id));
    if (timesParaSorteio.length < 2) return;
    const timesNormalizados = timesParaSorteio.map((time) => ({
      id: time.id,
      nome: time.nome || (time as any).name || "Time",
      logo: time.logo || (time as any).logoUrl || logoPadrao,
    }));

    setLoadingSorteio(true);
    setSorteioErro(null);
    setSorteioAvisos([]);
    setSorteioReservas([]);

    // Calcula o total de partidas do racha (pode usar s¢ participantes selecionados do dia)
    const partidasTotais = calcularPartidasTotais(participantes);
    setPartidasTotaisSorteio(partidasTotais);

    const sorteiosPublicados = typeof totalTemporada === "number" ? totalTemporada : undefined;

    // Balanceamento "pesado" e delay m¡nimo de 5s (user experience PRO)
    const balanceamentoPromise = new Promise<TimeSorteado[]>((resolve) => {
      setTimeout(() => {
        try {
          const resultado = sortearTimesInteligente(participantes, timesNormalizados, {
            partidasTotais,
            sorteiosPublicadosNaTemporada: sorteiosPublicados,
            historico,
            jogadoresPorTime: config.jogadoresPorTime,
          });
          setSorteioAvisos(resultado.avisos);
          setSorteioReservas(resultado.reservas);
          resolve(resultado.times);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Falha ao sortear os times.";
          setSorteioErro(message);
          resolve([]);
        }
      }, 150); // pequeno delay para simular "thread" JS
    });
    const delayMinimo = new Promise((resolve) => setTimeout(resolve, 5000));

    const [timesGerados] = await Promise.all([balanceamentoPromise, delayMinimo]);

    setTimes(timesGerados);
    setPublicado(false);

    // GERA A TABELA DE JOGOS conforme times selecionados
    if (timesNormalizados.length >= 2 && timesGerados.length > 0) {
      const jogos = gerarTabelaJogos({
        times: timesNormalizados,
        duracaoRachaMin: config.duracaoRachaMin,
        duracaoPartidaMin: config.duracaoPartidaMin,
      });
      setTabelaJogos(jogos);
    } else {
      setTabelaJogos([]);
    }

    setLoadingSorteio(false);
  }

  async function handlePublicarTimes() {
    if (!config || times.length === 0 || !resolvedSlug) return;

    setPublicando(true);
    try {
      const res = await fetch("/api/sorteio/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: resolvedSlug,
          rachaId,
          configuracao: config,
          participantes,
          times,
          tabelaJogos,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setPublicado(true);
    } catch (error) {
      console.error("Falha ao publicar sorteio", error);
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-fundo p-2 md:p-6 rounded-xl shadow-md">
      {/* LOADING ANIMADO */}
      {loadingSorteio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-[#181818] border-2 border-yellow-400 shadow-xl">
            <LoaderBolaFutebol />
            <div className="text-yellow-200 text-xl font-bold text-center">
              Aguarde, o melhor Sistema de Balanceamento do Brasil está equilibrando seus times!
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
        Sorteio Inteligente – Painel do Admin
      </h1>
      <div className="flex flex-col items-center mb-4">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded transition-all text-sm"
          onClick={() => setShowTip((v) => !v)}
        >
          ANTES DE REALIZAR O SORTEIO CLIQUE AQUI
        </button>
        {showTip && (
          <div className="bg-[#232323] mt-2 p-4 rounded-lg text-sm text-gray-100 w-full shadow-lg max-w-2xl border border-yellow-400 relative">
            <button
              className="absolute right-2 top-2 text-yellow-400 text-lg font-bold rounded hover:bg-yellow-400 hover:text-black transition px-2 py-0.5"
              onClick={() => setShowTip(false)}
              aria-label="Fechar explicação"
            >
              ×
            </button>
            <b>Como garantir um sorteio realmente equilibrado?</b>
            <br />
            <br />
            O sorteio inteligente combina nivel do atleta (habilidade 1-5 + fisico 1-3), ranking do
            racha, posicao e historico recente de sorteios (anti-panelinha) para montar times
            equilibrados.
            <br />
            <br />
            <b>PRIMEIROS 8 SORTEIOS / INICIO DE TEMPORADA:</b> Nos primeiros 8 sorteios publicados
            do sistema (ou no inicio de cada ano/temporada, quando os rankings reiniciam), o
            balanceamento usa <b>somente as estrelas definidas pelo administrador</b>. A contagem
            comeca apos a publicacao do sorteio. Rankings e estatisticas continuam sendo
            registrados, apenas nao pesam no balanceamento.
            <br />
            <br />
            <b>APOS O 8o SORTEIO:</b> O algoritmo passa a usar ranking, estrelas e posicao, e aplica
            o anti-panelinha com base no historico recente para evitar repeticao de jogadores no
            mesmo time. O equilibrio melhora a cada racha conforme o historico cresce.
            <br />
            <br />
            <b>GOLEIROS:</b> Sempre 1 goleiro por time. Se faltar goleiro real, use o Goleiro
            Reserva (BOT) para completar o sorteio.
            <br />
            <br />
            <b>CONFIGURACOES INICIAIS:</b> Numero de times, tempo de partida e jogadores por time
            <b>nao influenciam no balanceamento</b>. Servem para organizar os times e gerar a tabela
            de confrontos.
            <br />
            <br />
            <b>TABELA DE CONFRONTOS:</b> A tabela e calculada conforme o tempo total do racha,
            reservando 15 minutos para organizacao e imprevistos. Exemplo: se o racha tem 60
            minutos, a tabela sera criada para 45 minutos de jogos. O modelo e o tempo sugerido
            podem ser ajustados pelo administrador conforme a realidade do grupo.
            <br />
            <br />
            <b>ESTRELAS (NIVEL DO ATLETA):</b> Defina habilidade e fisico na pagina Nivel dos
            Atletas. O nivel final e calculado automaticamente e usado no sorteio. Ajuste sempre que
            perceber evolucao ou queda de desempenho.
            <br />
            <br />
            <b>Dica:</b> Se notar desequilibrio, ajuste manualmente os times enquanto o historico
            ainda esta curto. Isso garante jogos mais disputados ate a calibracao completa.
            <br />
            <br />
            Com o tempo, o sistema aprende e o sorteio fica cada vez mais preciso, justo e
            divertido!
          </div>
        )}
      </div>

      {/* Card de Configurações - Fade ao confirmar */}
      <div
        className={
          configConfirmada
            ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <ConfiguracoesRacha onSubmit={setConfig} disabled={configConfirmada} />
      </div>

      {/* Card Selecionar Times do Dia - Fade ao confirmar */}
      <div
        className={
          configConfirmada
            ? "opacity-60 blur-[2px] pointer-events-none transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <SelecionarTimesDia
          timesDisponiveis={timesDisponiveis}
          loading={loadingTimes}
          timesSelecionados={timesSelecionados}
          onChange={setTimesSelecionados}
          disabled={configConfirmada}
          maxTimes={maxTimes}
          shake={avisoTimesShake}
        />
      </div>

      {/* Botão Confirmar/Editar Configuração */}
      <div className="flex justify-center mt-3 mb-3">
        {!configConfirmada ? (
          <button
            className="w-full md:w-auto py-3 px-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded text-lg shadow transition disabled:opacity-60 disabled:pointer-events-none"
            onClick={handleConfirmarConfig}
            disabled={!config || timesSelecionados.length !== maxTimes}
          >
            Confirmar Configuração
          </button>
        ) : (
          <button
            className="w-full md:w-auto py-3 px-8 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded text-lg shadow transition"
            onClick={() => {
              setConfigConfirmada(false);
              try {
                localStorage.setItem(configConfirmKey, "false");
              } catch {
                /* ignore */
              }
            }}
          >
            Editar Configuração
          </button>
        )}
      </div>

      {/* O RESTANTE DA TELA (participantes, sorteio, botões) fica sempre ativo */}
      {configConfirmada && (
        <div className="text-center text-xs text-yellow-200 mb-4">
          Esta configuracao foi salva e sera usada neste e nos proximos sorteios. Para alterar,
          clique em Editar Configuracao.
        </div>
      )}

      <ParticipantesRacha
        rachaId={rachaId}
        config={config}
        participantes={participantes}
        setParticipantes={setParticipantes}
      />
      <button
        className="w-full py-3 mt-3 mb-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded text-lg"
        onClick={handleSortearTimes}
        disabled={
          loadingTimes || !config || timesSelecionados.length < 2 || timesDisponiveis.length < 2
        }
      >
        Sortear Times
      </button>
      {(loadingHistorico || erroHistorico || typeof totalTemporada === "number") && (
        <div className="text-xs text-center text-yellow-200 mb-3">
          {loadingHistorico && "Carregando historico de sorteios..."}
          {erroHistorico && "Falha ao carregar historico. Balanceamento parcial ativo."}
          {typeof totalTemporada === "number" && (
            <>
              {!loadingHistorico && !erroHistorico && (
                <>
                  Temporada {anoTemporada ?? ""}: {totalTemporada} sorteios publicados.{" "}
                  {totalTemporada < 8
                    ? "Fase de calibracao: nos primeiros 8 sorteios publicados, o balanceamento usa apenas as estrelas do admin."
                    : "Ranking ativo no balanceamento."}
                </>
              )}
            </>
          )}
        </div>
      )}
      {sorteioErro && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg text-center mb-3">
          {sorteioErro}
        </div>
      )}
      {sorteioAvisos.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-lg text-center mb-3">
          {sorteioAvisos.map((aviso) => (
            <div key={aviso}>{aviso}</div>
          ))}
        </div>
      )}
      {sorteioReservas.length > 0 && (
        <div className="bg-zinc-800 border border-zinc-700 text-gray-200 px-4 py-3 rounded-lg text-center mb-3">
          Reservas: {sorteioReservas.map((j) => j.nome).join(", ")}
        </div>
      )}
      {times.length > 0 && (
        <>
          <TimesGerados
            times={times}
            jogadoresPorTime={config?.jogadoresPorTime}
            coeficienteContext={{
              partidasTotais: partidasTotaisSorteio,
              sorteiosPublicadosNaTemporada:
                typeof totalTemporada === "number" ? totalTemporada : undefined,
            }}
          />
          {tabelaJogos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base md:text-lg text-yellow-300 font-bold text-center mb-3">
                Tabela de Confrontos
              </h3>
              {/* NOVO: Tabela de jogos gerada automaticamente */}
              <TabelaJogosRacha jogos={tabelaJogos} />
            </div>
          )}
          <BotaoPublicarTimes
            publicado={publicado}
            loading={publicando}
            onClick={handlePublicarTimes}
          />
        </>
      )}
    </div>
  );
}

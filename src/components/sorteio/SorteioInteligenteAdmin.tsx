"use client";

import { useState } from "react";
import ConfiguracoesRacha from "./ConfiguracoesRacha";
import SelecionarTimesDia from "./SelecionarTimesDia";
import ParticipantesRacha from "./ParticipantesRacha";
import TimesGerados from "./TimesGerados";
import BotaoPublicarTimes from "./BotaoPublicarTimes";
import {
  sortearTimesInteligente,
  gerarTabelaJogos,
} from "@/utils/sorteioUtils";
import TabelaJogosRacha from "./TabelaJogosRacha";
import { mockParticipantes } from "./mockParticipantes";
import type {
  Participante,
  ConfiguracaoRacha,
  TimeSorteado,
} from "@/types/sorteio";
import type { Time, JogoConfronto } from "@/utils/sorteioUtils";

const mockTimes: Time[] = [
  { id: "1", nome: "Leões", logo: "/images/times/time_padrao_01.png" },
  { id: "2", nome: "Tigres", logo: "/images/times/time_padrao_02.png" },
  { id: "3", nome: "Águias", logo: "/images/times/time_padrao_03.png" },
  { id: "4", nome: "Furacão", logo: "/images/times/time_padrao_04.png" },
  { id: "5", nome: "Tubarão", logo: "/images/times/time_padrao_05.png" },
  { id: "6", nome: "Gaviões", logo: "/images/times/time_padrao_06.png" },
  { id: "7", nome: "Panteras", logo: "/images/times/time_padrao_07.png" },
  { id: "8", nome: "Corujas", logo: "/images/times/time_padrao_08.png" },
];

// SVG Loader animado de bola pulando (não precisa instalar nada)
function LoaderBolaFutebol() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      className="mb-2"
      aria-hidden
    >
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
        <circle
          cx="36"
          cy="36"
          r="20"
          fill="#fff"
          stroke="#222"
          strokeWidth="3"
        >
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
  const [config, setConfig] = useState<ConfiguracaoRacha | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>(
    mockParticipantes.filter((p) => p.mensalista),
  );
  const [times, setTimes] = useState<TimeSorteado[]>([]);
  const [publicado, setPublicado] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [configConfirmada, setConfigConfirmada] = useState(false);

  // Estado dos times selecionados
  const [timesSelecionados, setTimesSelecionados] = useState<string[]>(
    mockTimes.slice(0, 4).map((t) => t.id),
  );

  // Estado para a tabela de jogos
  const [tabelaJogos, setTabelaJogos] = useState<JogoConfronto[]>([]);

  // Shake no aviso se tentar confirmar sem estar correto
  const [avisoTimesShake, setAvisoTimesShake] = useState(false);

  // Loading do sorteio inteligente
  const [loadingSorteio, setLoadingSorteio] = useState(false);

  // Quantidade máxima de times do config
  const maxTimes = config?.numTimes || 2;

  function handleConfirmarConfig() {
    if (timesSelecionados.length !== maxTimes) {
      setAvisoTimesShake(true);
      setTimeout(() => setAvisoTimesShake(false), 500);
      return;
    }
    setConfigConfirmada(true);
  }

  // NOVO: Função para somar o total de partidas já jogadas pelos participantes
  function calcularPartidasTotais(participantes: Participante[]): number {
    // Soma o campo "partidas" de cada participante (fallback para 0 se não existir)
    return participantes.reduce((acc, p) => acc + (p.partidas || 0), 0);
  }

  async function handleSortearTimes() {
    if (!config || participantes.length === 0 || timesSelecionados.length < 2)
      return;

    setLoadingSorteio(true);

    // Calcula o total de partidas do racha (pode usar só participantes selecionados do dia)
    const partidasTotais = calcularPartidasTotais(participantes);

    // Balanceamento "pesado" e delay mínimo de 5s (user experience PRO)
    const timesParaSorteio = mockTimes.filter((t) =>
      timesSelecionados.includes(t.id),
    );
    const balanceamentoPromise = new Promise<TimeSorteado[]>((resolve) => {
      setTimeout(() => {
        // Agora passa partidasTotais!
        const timesGerados = sortearTimesInteligente(
          participantes,
          timesParaSorteio,
          partidasTotais,
        );
        resolve(timesGerados);
      }, 150); // pequeno delay para simular "thread" JS
    });
    const delayMinimo = new Promise((resolve) => setTimeout(resolve, 5000));

    const [timesGerados] = await Promise.all([
      balanceamentoPromise,
      delayMinimo,
    ]);

    setTimes(timesGerados);
    setPublicado(false);

    // GERA A TABELA DE JOGOS conforme times selecionados
    if (timesParaSorteio.length >= 2) {
      const jogos = gerarTabelaJogos({
        times: timesParaSorteio,
        duracaoRachaMin: config.duracaoRachaMin,
        duracaoPartidaMin: config.duracaoPartidaMin,
      });
      setTabelaJogos(jogos);
    } else {
      setTabelaJogos([]);
    }

    setLoadingSorteio(false);
  }

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-fundo p-2 shadow-md md:p-6">
      {/* LOADING ANIMADO */}
      {loadingSorteio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-yellow-400 bg-[#181818] p-8 shadow-xl">
            <LoaderBolaFutebol />
            <div className="text-center text-xl font-bold text-yellow-200">
              Aguarde, o melhor Sistema de Balanceamento do Brasil está
              equilibrando seus times!
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-2 text-center text-2xl font-bold text-yellow-400">
        Sorteio Inteligente – Painel do Admin
      </h1>
      <div className="mb-4 flex flex-col items-center">
        <button
          className="rounded bg-yellow-400 px-4 py-1 text-sm font-bold text-black transition-all hover:bg-yellow-500"
          onClick={() => setShowTip((v) => !v)}
        >
          ANTES DE REALIZAR O SORTEIO CLIQUE AQUI
        </button>
        {showTip && (
          <div className="relative mt-2 w-full max-w-2xl rounded-lg border border-yellow-400 bg-[#232323] p-4 text-sm text-gray-100 shadow-lg">
            <button
              className="absolute right-2 top-2 rounded px-2 py-0.5 text-lg font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
              onClick={() => setShowTip(false)}
              aria-label="Fechar explicação"
            >
              ×
            </button>
            <b>Como garantir um sorteio realmente equilibrado?</b>
            <br />
            <br />
            O sistema de sorteio inteligente utiliza rankings, posições e
            estrelas para criar times balanceados e justos.
            <br />
            <br />
            <b>PRIMEIRO SORTEIO / INÍCIO DE TEMPORADA:</b> Nos primeiros
            sorteios do sistema (ou no começo de cada ano/temporada), como ainda
            não há rankings históricos, o balanceamento será feito{" "}
            <b>exclusivamente pelas estrelas atribuídas pelo administrador</b> a
            cada jogador.
            <br />
            <br />
            <b>IMPORTANTE:</b> A partir do momento que o sistema acumula mais
            jogos, rankings e avaliações começam a ser usados para calibrar o
            equilíbrio dos times. Leva de 8 a 10 rachas para o sistema aprender
            quem são os melhores, deixando o sorteio cada vez mais justo.
            <br />
            <br />
            <b>Configurações Iniciais:</b> As opções de número de times, tempo
            de partida e quantidade de jogadores{" "}
            <b>não influenciam no balanceamento</b>. Servem apenas para
            organizar os jogadores nos times e gerar automaticamente a tabela de
            confrontos. O algoritmo do sorteio vai sempre priorizar ranking,
            estrelas e posição.
            <br />
            <br />
            <b>Tabela de Confrontos:</b> A tabela é calculada conforme o tempo
            total do racha, sempre reservando 15 minutos para organização,
            trocas de times e imprevistos. Exemplo: Se o racha tem 60 minutos, a
            tabela será criada para 45 minutos de jogos. O modelo da tabela e o
            tempo sugerido são <b>opcionais</b> e podem ser ajustados pelo
            administrador conforme a realidade do grupo.
            <br />
            <br />
            <b>Dica:</b> Ajuste manualmente os times se notar algum
            desequilíbrio, até que rankings e estrelas estejam bem definidos.
            Isso garante jogos mais disputados enquanto a plataforma calibra
            sozinha.
            <br />
            <br />
            <b>Estrelas:</b> Avalie cada jogador considerando não só habilidade,
            mas também <b>condicionamento físico</b> e{" "}
            <b>aspectos psicológicos</b>. Não avalie apenas pelo futebol! As
            estrelas podem (e devem) ser ajustadas sempre que perceber evolução
            ou queda de desempenho.
            <br />
            <br />
            Com o tempo, o sistema aprende e o sorteio fica cada vez mais
            preciso, justo e divertido!
          </div>
        )}
      </div>

      {/* Card de Configurações - Fade ao confirmar */}
      <div
        className={
          configConfirmada
            ? "pointer-events-none opacity-60 blur-[2px] transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <ConfiguracoesRacha onSubmit={setConfig} disabled={configConfirmada} />
      </div>

      {/* Card Selecionar Times do Dia - Fade ao confirmar */}
      <div
        className={
          configConfirmada
            ? "pointer-events-none opacity-60 blur-[2px] transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <SelecionarTimesDia
          timesSelecionados={timesSelecionados}
          onChange={setTimesSelecionados}
          disabled={configConfirmada}
          maxTimes={maxTimes}
          shake={avisoTimesShake}
        />
      </div>

      {/* Botão Confirmar/Editar Configuração */}
      <div className="mb-3 mt-3 flex justify-center">
        {!configConfirmada ? (
          <button
            className="w-full rounded bg-yellow-400 px-8 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-500 disabled:pointer-events-none disabled:opacity-60 md:w-auto"
            onClick={handleConfirmarConfig}
            disabled={!config || timesSelecionados.length !== maxTimes}
          >
            Confirmar Configuração
          </button>
        ) : (
          <button
            className="w-full rounded bg-yellow-100 px-8 py-3 text-lg font-bold text-black shadow transition hover:bg-yellow-200 md:w-auto"
            onClick={() => setConfigConfirmada(false)}
          >
            Editar Configuração
          </button>
        )}
      </div>

      {/* O RESTANTE DA TELA (participantes, sorteio, botões) fica sempre ativo */}
      <ParticipantesRacha
        config={config}
        participantes={participantes}
        setParticipantes={setParticipantes}
      />
      <button
        className="mb-3 mt-3 w-full rounded bg-yellow-400 py-3 text-lg font-bold text-black hover:bg-yellow-500"
        onClick={handleSortearTimes}
        disabled={timesSelecionados.length < 2 || !config}
      >
        Sortear Times
      </button>
      {times.length > 0 && (
        <>
          <TimesGerados times={times} />
          <BotaoPublicarTimes
            publicado={publicado}
            onClick={() => setPublicado(true)}
          />
          {/* NOVO: Tabela de jogos gerada automaticamente */}
          <TabelaJogosRacha jogos={tabelaJogos} />
        </>
      )}
    </div>
  );
}

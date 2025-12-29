// src/utils/sorteioUtils.ts

import type { Participante, TimeSorteado, SorteioHistoricoItem } from "@/types/sorteio";

export type Time = { id: string; nome: string; logo: string };

export interface JogoConfronto {
  ordem: number;
  timeA: Time;
  timeB: Time;
  tempo: number; // em minutos
}

export type CoeficienteContext = {
  partidasTotais: number;
  sorteiosPublicadosNaTemporada?: number | null;
};

export type SorteioResultado = {
  times: TimeSorteado[];
  reservas: Participante[];
  avisos: string[];
};

const LIMIAR_DIFERENCA = 0.15;
const PESO_COEFICIENTE = 1;
const PESO_PANELINHA = 1.2;
const DECAY_PANELINHA = 0.85;

function resolvePesos(partidasTotais: number, sorteiosPublicadosNaTemporada?: number | null) {
  if (typeof sorteiosPublicadosNaTemporada === "number" && sorteiosPublicadosNaTemporada < 8) {
    return { pesoEstrelas: 1, pesoRanking: 0 };
  }

  let pesoEstrelas = 0.8;
  let pesoRanking = 0.2;

  if (partidasTotais >= 10) {
    pesoEstrelas = 0.4;
    pesoRanking = 0.6;
  } else if (partidasTotais >= 6) {
    pesoEstrelas = 0.5;
    pesoRanking = 0.5;
  } else if (partidasTotais >= 3) {
    pesoEstrelas = 0.6;
    pesoRanking = 0.4;
  }

  return { pesoEstrelas, pesoRanking };
}

// Coeficiente geral: pesos dinamicos (estrelas x ranking), ajustado pelo numero de partidas
export function getCoeficiente(j: Participante, contextoOuPartidas: number | CoeficienteContext) {
  if (j.isBot) return 0;
  const contexto =
    typeof contextoOuPartidas === "number"
      ? { partidasTotais: contextoOuPartidas }
      : contextoOuPartidas;
  const partidasTotais = contexto?.partidasTotais ?? 0;
  const { pesoEstrelas, pesoRanking } = resolvePesos(
    partidasTotais,
    contexto?.sorteiosPublicadosNaTemporada
  );

  const mediaVitorias = j.partidas && j.partidas > 0 ? j.vitorias / j.partidas : 0;
  const coefEstrelas = j.estrelas?.estrelas ?? 0;
  const coefRanking = j.rankingPontos * 0.5 + mediaVitorias * 0.5;

  return pesoEstrelas * coefEstrelas + pesoRanking * coefRanking;
}

function gerarOrdemSerpentina(quantidadeTimes: number, totalJogadores: number) {
  const ordem: number[] = [];
  let idx = 0;
  let direction = 1;

  for (let i = 0; i < totalJogadores; i += 1) {
    ordem.push(idx);
    idx += direction;
    if (idx === quantidadeTimes) {
      idx = quantidadeTimes - 1;
      direction = -1;
    } else if (idx === -1) {
      idx = 0;
      direction = 1;
    }
  }

  return ordem;
}

function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function buildPairWeights(historico: SorteioHistoricoItem[] = [], decay = DECAY_PANELINHA) {
  const pairWeights = new Map<string, number>();
  historico.forEach((item, idx) => {
    const weight = Math.pow(decay, idx);
    item.times.forEach((time) => {
      const ids = time.jogadoresIds || [];
      for (let i = 0; i < ids.length; i += 1) {
        const idA = ids[i];
        if (!idA) continue;
        for (let j = i + 1; j < ids.length; j += 1) {
          const idB = ids[j];
          if (!idB) continue;
          const key = pairKey(idA, idB);
          pairWeights.set(key, (pairWeights.get(key) ?? 0) + weight);
        }
      }
    });
  });
  return pairWeights;
}

function calcularPenalidadePanelinha(
  jogadorId: string,
  jogadoresTime: Participante[],
  pairWeights: Map<string, number>
) {
  return jogadoresTime.reduce((acc, j) => {
    const key = pairKey(jogadorId, j.id);
    return acc + (pairWeights.get(key) ?? 0);
  }, 0);
}

function ordenarJogadoresNoTime(jogadores: Participante[], contexto: CoeficienteContext) {
  const ordem = { GOL: 0, ZAG: 1, MEI: 2, ATA: 3 } as const;
  return [...jogadores].sort((a, b) => {
    const ordemA = ordem[a.posicao] ?? 99;
    const ordemB = ordem[b.posicao] ?? 99;
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }
    return getCoeficiente(b, contexto) - getCoeficiente(a, contexto);
  });
}

function recalcularTimes(times: TimeSorteado[], contexto: CoeficienteContext) {
  times.forEach((time) => {
    const totalRanking = time.jogadores.reduce((acc, j) => acc + (j.rankingPontos || 0), 0);
    const totalEstrelas = time.jogadores.reduce((acc, j) => acc + (j.estrelas?.estrelas ?? 0), 0);
    time.mediaRanking = time.jogadores.length ? totalRanking / time.jogadores.length : 0;
    time.mediaEstrelas = time.jogadores.length ? totalEstrelas / time.jogadores.length : 0;
    time.coeficienteTotal = time.jogadores.reduce((acc, j) => acc + getCoeficiente(j, contexto), 0);
  });
}

function distribuirComCusto({
  jogadores,
  times,
  contexto,
  pairWeights,
  maxJogadoresPorTime,
  reservas,
}: {
  jogadores: Participante[];
  times: TimeSorteado[];
  contexto: CoeficienteContext;
  pairWeights: Map<string, number>;
  maxJogadoresPorTime?: number;
  reservas: Participante[];
}) {
  if (!jogadores.length) return;
  const ordenados = [...jogadores].sort(
    (a, b) => getCoeficiente(b, contexto) - getCoeficiente(a, contexto)
  );
  const ordem = gerarOrdemSerpentina(times.length, ordenados.length);

  ordenados.forEach((jogador, idx) => {
    const baseIdx = ordem[idx] ?? 0;
    const candidatosBase = [baseIdx, baseIdx - 1, baseIdx + 1].filter(
      (pos) => pos >= 0 && pos < times.length
    );
    const candidatosValidos = candidatosBase.filter((pos) => {
      if (maxJogadoresPorTime && times[pos]) {
        return times[pos]!.jogadores.length < maxJogadoresPorTime;
      }
      return true;
    });

    let candidatos = candidatosValidos;
    if (!candidatos.length && maxJogadoresPorTime) {
      candidatos = times
        .map((_, index) => index)
        .filter((pos) => times[pos]!.jogadores.length < maxJogadoresPorTime);
    }

    if (!candidatos.length) {
      reservas.push(jogador);
      return;
    }

    let melhorIdx = candidatos[0]!;
    let melhorScore = Number.POSITIVE_INFINITY;

    candidatos.forEach((pos) => {
      const time = times[pos]!;
      const coefComJogador = time.coeficienteTotal + getCoeficiente(jogador, contexto);
      const penalidade = calcularPenalidadePanelinha(jogador.id, time.jogadores, pairWeights);
      const score = PESO_COEFICIENTE * coefComJogador + PESO_PANELINHA * penalidade;
      if (score < melhorScore) {
        melhorScore = score;
        melhorIdx = pos;
      }
    });

    const alvo = times[melhorIdx]!;
    alvo.jogadores.push(jogador);
    alvo.coeficienteTotal += getCoeficiente(jogador, contexto);
  });
}

// ===== Sorteio Inteligente =====
export function sortearTimesInteligente(
  participantes: Participante[],
  timesSelecionados: Time[],
  contexto: CoeficienteContext & {
    historico?: SorteioHistoricoItem[];
    jogadoresPorTime?: number;
  }
): SorteioResultado {
  const quantidadeTimes = timesSelecionados.length;
  if (!quantidadeTimes) {
    return { times: [], reservas: [], avisos: [] };
  }

  const reservas: Participante[] = [];
  const avisos: string[] = [];
  const coefContext: CoeficienteContext = {
    partidasTotais: contexto.partidasTotais,
    sorteiosPublicadosNaTemporada: contexto.sorteiosPublicadosNaTemporada,
  };
  const pairWeights = buildPairWeights(contexto.historico ?? []);

  // 1. Inicializar times
  const times: TimeSorteado[] = timesSelecionados.map((t) => ({
    id: t.id,
    nome: t.nome,
    jogadores: [],
    mediaRanking: 0,
    mediaEstrelas: 0,
    coeficienteTotal: 0,
  }));

  // 2. Garantir 1 goleiro por time
  const goleiros = participantes.filter((p) => p.posicao === "GOL");
  if (goleiros.length < quantidadeTimes) {
    throw new Error(
      `Goleiros insuficientes: ${goleiros.length}/${quantidadeTimes}. Selecione mais goleiros.`
    );
  }

  const goleirosOrdenados = [...goleiros].sort(
    (a, b) => getCoeficiente(b, coefContext) - getCoeficiente(a, coefContext)
  );
  const goleirosSelecionados = goleirosOrdenados.slice(0, quantidadeTimes);
  const goleirosReservas = goleirosOrdenados.slice(quantidadeTimes);

  if (goleirosReservas.length) {
    reservas.push(...goleirosReservas);
    avisos.push("Goleiros excedentes foram movidos para reserva.");
  }

  const ordemGoleiros = gerarOrdemSerpentina(quantidadeTimes, goleirosSelecionados.length);
  goleirosSelecionados.forEach((goleiro, idx) => {
    const timeIdx = ordemGoleiros[idx] ?? idx;
    const time = times[timeIdx];
    if (!time) return;
    time.jogadores.push(goleiro);
    time.coeficienteTotal += getCoeficiente(goleiro, coefContext);
  });

  const goleirosIds = new Set(goleirosSelecionados.map((g) => g.id));
  const participantesAtivos = participantes.filter(
    (p) => p.posicao !== "GOL" || goleirosIds.has(p.id)
  );

  // 3. Agrupar posicoes de linha
  const grupos: Record<"ZAG" | "MEI" | "ATA", Participante[]> = {
    ZAG: [],
    MEI: [],
    ATA: [],
  };
  participantesAtivos.forEach((p) => {
    if (p.posicao === "ZAG" || p.posicao === "MEI" || p.posicao === "ATA") {
      grupos[p.posicao].push(p);
    }
  });

  // 4. Distribuir linha com serpentina + custo anti-panelinha
  (["ZAG", "MEI", "ATA"] as const).forEach((posicao) => {
    distribuirComCusto({
      jogadores: grupos[posicao],
      times,
      contexto: coefContext,
      pairWeights,
      maxJogadoresPorTime: contexto.jogadoresPorTime,
      reservas,
    });
  });

  if (reservas.some((j) => j.posicao !== "GOL")) {
    avisos.push("Jogadores excedentes foram movidos para reserva por limite de vagas.");
  }

  times.forEach((time) => {
    time.jogadores = ordenarJogadoresNoTime(time.jogadores, coefContext);
  });
  recalcularTimes(times, coefContext);

  // 5. Ajuste fino com objetivo combinado (coeficiente + panelinha)
  ajusteFinoBalanceamento(times, coefContext, pairWeights);
  times.forEach((time) => {
    time.jogadores = ordenarJogadoresNoTime(time.jogadores, coefContext);
  });
  recalcularTimes(times, coefContext);

  return { times, reservas, avisos };
}

function calcularPanelinhaTotal(times: TimeSorteado[], pairWeights: Map<string, number>) {
  let total = 0;
  times.forEach((time) => {
    const ids = time.jogadores.map((j) => j.id);
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        total += pairWeights.get(pairKey(ids[i]!, ids[j]!)) ?? 0;
      }
    }
  });
  return total;
}

function calcularScoreBalanceamento(times: TimeSorteado[], pairWeights: Map<string, number>) {
  const coeficientes = times.map((t) => t.coeficienteTotal);
  const maior = Math.max(...coeficientes);
  const menor = Math.min(...coeficientes);
  const diffRelativo = maior > 0 ? (maior - menor) / maior : 0;
  const panelinhaTotal = calcularPanelinhaTotal(times, pairWeights);
  return diffRelativo * PESO_COEFICIENTE + panelinhaTotal * (PESO_PANELINHA * 0.2);
}

// Ajuste fino do balanceamento (trocas por posicao para reduzir desequilibrio e panelinha)
export function ajusteFinoBalanceamento(
  times: TimeSorteado[],
  contexto: CoeficienteContext,
  pairWeights: Map<string, number>,
  maxTentativas = 200
) {
  let tentativas = 0;

  while (tentativas < maxTentativas) {
    tentativas += 1;
    const coeficientes = times.map((t) => t.coeficienteTotal);
    const maiorCoef = Math.max(...coeficientes);
    const menorCoef = Math.min(...coeficientes);
    const diffRelativo = maiorCoef > 0 ? (maiorCoef - menorCoef) / maiorCoef : 0;
    const shouldAdjust = diffRelativo > LIMIAR_DIFERENCA || pairWeights.size > 0;
    if (!shouldAdjust) {
      return;
    }

    const timeForte = times.find((t) => t.coeficienteTotal === maiorCoef);
    const timeFraco = times.find((t) => t.coeficienteTotal === menorCoef);
    if (!timeForte || !timeFraco) {
      return;
    }

    const scoreAtual = calcularScoreBalanceamento(times, pairWeights);
    let melhorScore = scoreAtual;
    let melhorTroca: { jogadorForte: Participante; jogadorFraco: Participante } | null = null;

    for (const jogadorForte of timeForte.jogadores) {
      for (const jogadorFraco of timeFraco.jogadores) {
        if (jogadorForte.posicao !== jogadorFraco.posicao) continue;

        // troca provisoria
        timeForte.jogadores = timeForte.jogadores.filter((j) => j.id !== jogadorForte.id);
        timeFraco.jogadores = timeFraco.jogadores.filter((j) => j.id !== jogadorFraco.id);
        timeForte.jogadores.push(jogadorFraco);
        timeFraco.jogadores.push(jogadorForte);

        recalcularTimes([timeForte, timeFraco], contexto);
        const scoreNovo = calcularScoreBalanceamento(times, pairWeights);

        if (scoreNovo < melhorScore - 0.0001) {
          melhorScore = scoreNovo;
          melhorTroca = { jogadorForte, jogadorFraco };
        }

        // desfaz troca
        timeForte.jogadores = timeForte.jogadores.filter((j) => j.id !== jogadorFraco.id);
        timeFraco.jogadores = timeFraco.jogadores.filter((j) => j.id !== jogadorForte.id);
        timeForte.jogadores.push(jogadorForte);
        timeFraco.jogadores.push(jogadorFraco);
        recalcularTimes([timeForte, timeFraco], contexto);
      }
    }

    if (melhorTroca) {
      timeForte.jogadores = timeForte.jogadores.filter((j) => j.id !== melhorTroca.jogadorForte.id);
      timeFraco.jogadores = timeFraco.jogadores.filter((j) => j.id !== melhorTroca.jogadorFraco.id);
      timeForte.jogadores.push(melhorTroca.jogadorFraco);
      timeFraco.jogadores.push(melhorTroca.jogadorForte);
      recalcularTimes([timeForte, timeFraco], contexto);
    } else {
      return;
    }
  }
}

// ===== Gerar confrontos =====
export function gerarConfrontos(times: Time[], idaVolta = false): [Time, Time][] {
  const confrontos: [Time, Time][] = [];
  for (let i = 0; i < times.length; i++) {
    for (let j = i + 1; j < times.length; j++) {
      const timeA = times[i];
      const timeB = times[j];
      if (timeA && timeB) {
        confrontos.push([timeA, timeB]);
        if (idaVolta) confrontos.push([timeB, timeA]);
      }
    }
  }
  return confrontos;
}

// ===== Gerar tabela de jogos =====
export function gerarTabelaJogos({
  times,
  duracaoRachaMin,
  duracaoPartidaMin,
}: {
  times: Time[];
  duracaoRachaMin: number;
  duracaoPartidaMin: number;
}): JogoConfronto[] {
  const TEMPO_RESERVA = 15;
  const tempoUtil = duracaoRachaMin - TEMPO_RESERVA;
  const maxPartidas = Math.floor(tempoUtil / duracaoPartidaMin);

  let confrontos = gerarConfrontos(times, false);

  if (confrontos.length < maxPartidas) {
    confrontos = gerarConfrontos(times, true);
  }
  confrontos = confrontos.slice(0, maxPartidas);

  return confrontos
    .filter(([timeA, timeB]) => !!timeA && !!timeB)
    .map(([timeA, timeB], idx) => ({
      ordem: idx + 1,
      timeA,
      timeB,
      tempo: duracaoPartidaMin,
    }));
}

// src/utils/sorteioUtils.ts

import type { Participante, Posicao, TimeSorteado, SorteioHistoricoItem } from "@/types/sorteio";

export type Time = { id: string; nome: string; logo: string };

export interface JogoConfronto {
  ordem: number;
  timeA: Time;
  timeB: Time;
  tempo: number; // em minutos
  turno: "ida" | "volta";
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

type AjustePosicaoResult = {
  participantes: Participante[];
  goleirosSelecionados: Participante[];
  avisos: string[];
};

type ParticipanteAjustado = Participante & {
  posicaoPrincipal: Posicao;
  posicaoSecundaria?: Posicao;
};

function ajustarPosicoesSecundarias(
  participantes: Participante[],
  quantidadeTimes: number,
  contexto: CoeficienteContext
): AjustePosicaoResult {
  if (!quantidadeTimes) {
    return { participantes, goleirosSelecionados: [], avisos: [] };
  }

  const avisos: string[] = [];
  const base: ParticipanteAjustado[] = participantes.map((p) => {
    const posicaoPrincipal = p.posicao;
    const posicaoSecundaria =
      p.posicaoSecundaria && p.posicaoSecundaria !== posicaoPrincipal
        ? p.posicaoSecundaria
        : undefined;
    return {
      ...p,
      posicao: posicaoPrincipal,
      posicaoPrincipal,
      posicaoSecundaria,
    };
  });

  const primaryGoalies = base.filter((p) => p.posicaoPrincipal === "GOL");
  const secondaryGoalies = base.filter(
    (p) => p.posicaoPrincipal !== "GOL" && p.posicaoSecundaria === "GOL"
  );
  const totalGoalkeepers = primaryGoalies.length + secondaryGoalies.length;
  if (totalGoalkeepers < quantidadeTimes) {
    throw new Error(
      `Goleiros insuficientes: ${totalGoalkeepers}/${quantidadeTimes}. Selecione mais goleiros.`
    );
  }

  const sortByCoefDesc = <T extends Participante>(list: T[]) =>
    [...list].sort((a, b) => getCoeficiente(b, contexto) - getCoeficiente(a, contexto));
  const primarySorted = sortByCoefDesc(primaryGoalies);
  const secondarySorted = sortByCoefDesc(secondaryGoalies);

  const goleirosSelecionados = primarySorted.slice(0, quantidadeTimes);
  const faltando = quantidadeTimes - goleirosSelecionados.length;
  if (faltando > 0) {
    avisos.push("Goleiros insuficientes na posicao principal. Secundarias foram usadas.");
    goleirosSelecionados.push(...secondarySorted.slice(0, faltando));
  }

  const goleirosIds = new Set(goleirosSelecionados.map((g) => g.id));

  const ajustados: ParticipanteAjustado[] = base.map((p) => {
    if (goleirosIds.has(p.id)) {
      return { ...p, posicao: "GOL" };
    }
    if (p.posicaoPrincipal === "GOL" && p.posicaoSecundaria && p.posicaoSecundaria !== "GOL") {
      return { ...p, posicao: p.posicaoSecundaria };
    }
    return { ...p, posicao: p.posicaoPrincipal };
  });

  const counts: Record<"GOL" | "ZAG" | "MEI" | "ATA", number> = {
    GOL: 0,
    ZAG: 0,
    MEI: 0,
    ATA: 0,
  };
  ajustados.forEach((p) => {
    counts[p.posicao] = (counts[p.posicao] ?? 0) + 1;
  });

  const targetPorLinha = quantidadeTimes;
  const linhas = ["ZAG", "MEI", "ATA"] as const;
  const shortages = linhas
    .map((pos) => ({
      pos,
      shortage: Math.max(0, targetPorLinha - counts[pos]),
    }))
    .filter((item) => item.shortage > 0)
    .sort((a, b) => b.shortage - a.shortage);

  shortages.forEach((item) => {
    let faltam = item.shortage;
    while (faltam > 0) {
      const candidatos = ajustados.filter(
        (p) => p.posicao !== "GOL" && p.posicao !== item.pos && p.posicaoSecundaria === item.pos
      );
      if (!candidatos.length) {
        avisos.push(`Posicao ${item.pos} insuficiente mesmo com secundarias.`);
        break;
      }

      candidatos.sort((a, b) => {
        const surplusA = counts[a.posicao] - targetPorLinha;
        const surplusB = counts[b.posicao] - targetPorLinha;
        if (surplusA !== surplusB) {
          return surplusB - surplusA;
        }
        return getCoeficiente(a, contexto) - getCoeficiente(b, contexto);
      });

      const escolhido = candidatos[0]!;
      counts[escolhido.posicao] -= 1;
      escolhido.posicao = item.pos;
      counts[item.pos] += 1;
      faltam -= 1;
    }
  });

  const goleirosSelecionadosAjustados = ajustados.filter((p) => goleirosIds.has(p.id));

  return {
    participantes: ajustados,
    goleirosSelecionados: sortByCoefDesc(goleirosSelecionadosAjustados),
    avisos,
  };
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
  const ajustes = ajustarPosicoesSecundarias(participantes, quantidadeTimes, coefContext);
  const participantesAjustados = ajustes.participantes;
  if (ajustes.avisos.length) {
    avisos.push(...ajustes.avisos);
  }

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
  const goleirosSelecionados = ajustes.goleirosSelecionados;
  const goleirosIds = new Set(goleirosSelecionados.map((g) => g.id));
  const goleirosReservas = participantesAjustados.filter(
    (p) => p.posicao === "GOL" && !goleirosIds.has(p.id)
  );

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

  const participantesAtivos = participantesAjustados.filter(
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
      }
    }
  }
  if (!idaVolta) {
    return confrontos;
  }
  const volta = confrontos.map(([timeA, timeB]) => [timeB, timeA] as [Time, Time]);
  return [...confrontos, ...volta];
}

type ConfrontoSlot = {
  timeA: Time;
  timeB: Time;
  turno: "ida" | "volta";
};

type TeamScheduleState = {
  lastIndex: number;
  consecutive: number;
};

type ScheduleMetrics = {
  maxConsecutiveByTeam: number;
  backToBackCount: number;
  scoreTotal: number;
};

function initScheduleState(times: Time[]): Record<string, TeamScheduleState> {
  const state: Record<string, TeamScheduleState> = {};
  times.forEach((time) => {
    state[time.id] = { lastIndex: -9999, consecutive: 0 };
  });
  return state;
}

function cloneScheduleState(state: Record<string, TeamScheduleState>) {
  const clone: Record<string, TeamScheduleState> = {};
  Object.entries(state).forEach(([key, value]) => {
    clone[key] = { lastIndex: value.lastIndex, consecutive: value.consecutive };
  });
  return clone;
}

function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function scoreCandidate(
  match: ConfrontoSlot,
  state: Record<string, TeamScheduleState>,
  index: number,
  numTimes: number
) {
  const teams = [match.timeA, match.timeB];
  let penalty = 0;
  let restScore = 0;

  teams.forEach((team) => {
    const current = state[team.id] ?? { lastIndex: -9999, consecutive: 0 };
    const rest = current.lastIndex >= 0 ? index - current.lastIndex : index + 1;
    const isBackToBack = current.lastIndex === index - 1;
    const nextConsecutive = isBackToBack ? current.consecutive + 1 : 1;

    restScore += rest;
    if (isBackToBack) {
      penalty += 110;
    }
    if (numTimes > 2 && nextConsecutive >= 3) {
      penalty += 10000;
    }
  });

  return { penalty, restScore };
}

function applyMatchState(
  match: ConfrontoSlot,
  state: Record<string, TeamScheduleState>,
  index: number
) {
  const teams = [match.timeA, match.timeB];
  teams.forEach((team) => {
    const current = state[team.id] ?? { lastIndex: -9999, consecutive: 0 };
    const isBackToBack = current.lastIndex === index - 1;
    const nextConsecutive = isBackToBack ? current.consecutive + 1 : 1;
    state[team.id] = { lastIndex: index, consecutive: nextConsecutive };
  });
}

function scheduleGreedy(
  matches: ConfrontoSlot[],
  numTimes: number,
  limit: number,
  baseState: Record<string, TeamScheduleState>,
  startIndex: number,
  seed: number
) {
  const rng = createSeededRandom(seed);
  const remaining = [...matches];
  const schedule: ConfrontoSlot[] = [];
  const state = cloneScheduleState(baseState);

  while (remaining.length > 0 && schedule.length < limit) {
    const index = startIndex + schedule.length;
    let bestIdx = 0;
    let bestPenalty = Number.POSITIVE_INFINITY;
    let bestRest = -1;
    let bestKey = "";

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i]!;
      const { penalty, restScore } = scoreCandidate(candidate, state, index, numTimes);
      const key = `${candidate.timeA.id}-${candidate.timeB.id}-${candidate.turno}`;

      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestRest = restScore;
        bestIdx = i;
        bestKey = key;
        continue;
      }

      if (penalty === bestPenalty) {
        if (restScore > bestRest) {
          bestRest = restScore;
          bestIdx = i;
          bestKey = key;
          continue;
        }

        if (restScore === bestRest) {
          if (key < bestKey) {
            bestIdx = i;
            bestKey = key;
            continue;
          }

          if (key === bestKey && rng() > 0.5) {
            bestIdx = i;
          }
        }
      }
    }

    const selected = remaining.splice(bestIdx, 1)[0]!;
    schedule.push(selected);
    applyMatchState(selected, state, startIndex + schedule.length - 1);
  }

  return { schedule, state };
}

export function validateSchedule(jogos: Array<{ timeA: Time; timeB: Time }>, numTimes: number) {
  const state: Record<string, TeamScheduleState> = {};
  let maxConsecutiveByTeam = 0;
  let backToBackCount = 0;
  let scoreTotal = 0;

  jogos.forEach((jogo, index) => {
    [jogo.timeA, jogo.timeB].forEach((team) => {
      const current = state[team.id] ?? { lastIndex: -9999, consecutive: 0 };
      const isBackToBack = current.lastIndex === index - 1;
      const nextConsecutive = isBackToBack ? current.consecutive + 1 : 1;

      if (isBackToBack) {
        backToBackCount += 1;
        scoreTotal += 110;
      }
      if (numTimes > 2 && nextConsecutive >= 3) {
        scoreTotal += 10000;
      }

      state[team.id] = { lastIndex: index, consecutive: nextConsecutive };
      if (nextConsecutive > maxConsecutiveByTeam) {
        maxConsecutiveByTeam = nextConsecutive;
      }
    });
  });

  return { maxConsecutiveByTeam, backToBackCount, scoreTotal } satisfies ScheduleMetrics;
}

function optimizeSchedule(
  schedule: ConfrontoSlot[],
  numTimes: number,
  start: number,
  end: number,
  iterations: number,
  seed: number
) {
  if (end - start < 2) {
    return schedule;
  }

  const rng = createSeededRandom(seed);
  let bestScore = validateSchedule(schedule, numTimes).scoreTotal;

  for (let i = 0; i < iterations; i += 1) {
    const first = start + Math.floor(rng() * (end - start));
    let second = start + Math.floor(rng() * (end - start));
    if (first === second) {
      second = start + ((second + 1) % (end - start));
    }

    const tmp = schedule[first]!;
    schedule[first] = schedule[second]!;
    schedule[second] = tmp;

    const score = validateSchedule(schedule, numTimes).scoreTotal;
    if (score < bestScore) {
      bestScore = score;
    } else {
      const revert = schedule[first]!;
      schedule[first] = schedule[second]!;
      schedule[second] = revert;
    }
  }

  return schedule;
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
  const numTimes = times.length;

  const confrontosIda = gerarConfrontos(times, false).map(([timeA, timeB]) => ({
    timeA,
    timeB,
    turno: "ida" as const,
  }));

  if (!confrontosIda.length || maxPartidas <= 0) {
    return [];
  }

  const confrontosVolta = confrontosIda.map((jogo) => ({
    timeA: jogo.timeB,
    timeB: jogo.timeA,
    turno: "volta" as const,
  }));

  const maxIda = Math.min(maxPartidas, confrontosIda.length);
  const maxVolta = Math.min(Math.max(0, maxPartidas - maxIda), confrontosVolta.length);

  let bestSchedule: ConfrontoSlot[] = [];
  let bestScore = Number.POSITIVE_INFINITY;
  const attempts = numTimes > 2 ? 20 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const seed = 17 + attempt * 31;
    const baseState = initScheduleState(times);
    const { schedule: idaSchedule, state } = scheduleGreedy(
      confrontosIda,
      numTimes,
      maxIda,
      baseState,
      0,
      seed
    );

    const { schedule: voltaSchedule } = scheduleGreedy(
      confrontosVolta,
      numTimes,
      maxVolta,
      state,
      idaSchedule.length,
      seed + 7
    );

    let schedule = [...idaSchedule, ...voltaSchedule];
    if (schedule.length === 0) {
      continue;
    }

    schedule = optimizeSchedule(schedule, numTimes, 0, idaSchedule.length, 250, seed + 11);
    if (voltaSchedule.length > 1) {
      schedule = optimizeSchedule(
        schedule,
        numTimes,
        idaSchedule.length,
        schedule.length,
        250,
        seed + 19
      );
    }

    const stats = validateSchedule(schedule, numTimes);
    const invalid = numTimes > 2 && stats.maxConsecutiveByTeam > 2;
    const score = invalid ? stats.scoreTotal + 1000000 : stats.scoreTotal;

    if (score < bestScore) {
      bestScore = score;
      bestSchedule = schedule;
    }
  }

  return bestSchedule
    .filter((jogo) => jogo.timeA && jogo.timeB)
    .map((jogo, idx) => ({
      ordem: idx + 1,
      timeA: jogo.timeA,
      timeB: jogo.timeB,
      tempo: duracaoPartidaMin,
      turno: jogo.turno,
    }));
}

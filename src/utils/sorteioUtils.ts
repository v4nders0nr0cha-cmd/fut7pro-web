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
  maiorPontuacaoDaTemporada?: number;
  maiorNumeroCampeoesDaTemporada?: number;
};

export type SorteioResultado = {
  times: TimeSorteado[];
  reservas: Participante[];
  avisos: string[];
};

const PESO_COEFICIENTE = 1;
const PESO_PANELINHA = 1.2;
const DECAY_PANELINHA = 0.85;
export const SORTEIO_ALGORITHM_VERSION = 2;

export function isFaseInicialCalibracao(sorteiosPublicadosNaTemporada?: number | null) {
  return typeof sorteiosPublicadosNaTemporada !== "number" || sorteiosPublicadosNaTemporada < 8;
}

// Coeficiente oficial: nivelFinal durante a calibracao; depois nivel, ranking e Campeoes do Dia.
export function getCoeficiente(j: Participante, contextoOuPartidas: number | CoeficienteContext) {
  if (j.isBot) return 0;
  const contexto =
    typeof contextoOuPartidas === "number"
      ? { partidasTotais: contextoOuPartidas }
      : contextoOuPartidas;
  const nivelScore = j.estrelas?.nivelFinal ?? j.estrelas?.estrelas ?? 0;

  if (isFaseInicialCalibracao(contexto?.sorteiosPublicadosNaTemporada)) {
    return nivelScore;
  }

  const maiorPontuacao = contexto?.maiorPontuacaoDaTemporada ?? 0;
  const maiorCampeoes = contexto?.maiorNumeroCampeoesDaTemporada ?? 0;
  const rankingScore = maiorPontuacao > 0 ? 5 * ((j.rankingPontos || 0) / maiorPontuacao) : 0;
  const campeaoScore = maiorCampeoes > 0 ? 5 * ((j.campeoesDoDia || 0) / maiorCampeoes) : 0;

  return nivelScore * 0.5 + rankingScore * 0.3 + campeaoScore * 0.2;
}

function gerarOrdemSerpentina(
  quantidadeTimes: number,
  totalJogadores: number,
  startIndex = 0,
  initialDirection = 1
) {
  const ordem: number[] = [];
  let idx = Math.min(Math.max(startIndex, 0), Math.max(quantidadeTimes - 1, 0));
  let direction = initialDirection >= 0 ? 1 : -1;

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
    const ordemA = ordem[a.posicaoEfetivaSorteio ?? a.posicao] ?? 99;
    const ordemB = ordem[b.posicaoEfetivaSorteio ?? b.posicao] ?? 99;
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }
    return getCoeficiente(b, contexto) - getCoeficiente(a, contexto);
  });
}

function recalcularTimes(times: TimeSorteado[], contexto: CoeficienteContext) {
  times.forEach((time) => {
    const totalRanking = time.jogadores.reduce((acc, j) => acc + (j.rankingPontos || 0), 0);
    const totalNivel = time.jogadores.reduce(
      (acc, j) => acc + (j.estrelas?.nivelFinal ?? j.estrelas?.estrelas ?? 0),
      0
    );
    time.mediaRanking = time.jogadores.length ? totalRanking / time.jogadores.length : 0;
    time.mediaEstrelas = time.jogadores.length ? totalNivel / time.jogadores.length : 0;
    time.coeficienteTotal = time.jogadores.reduce((acc, j) => acc + getCoeficiente(j, contexto), 0);
    time.forcaMedia = time.jogadores.length ? time.coeficienteTotal / time.jogadores.length : 0;
  });
}

type LinhaPosicao = "ZAG" | "MEI" | "ATA";

type FormationTemplate = Record<Posicao, number>;
type LineQuotas = Record<LinhaPosicao, number>;

type ParticipanteAjustado = Participante & {
  posicaoPrincipal: Posicao;
  posicaoSecundaria?: LinhaPosicao;
  posicaoEfetivaSorteio: Posicao;
};

export const FORMATION_TEMPLATES: Record<number, FormationTemplate> = {
  5: { GOL: 1, ZAG: 2, MEI: 1, ATA: 1 },
  6: { GOL: 1, ZAG: 2, MEI: 2, ATA: 1 },
  7: { GOL: 1, ZAG: 2, MEI: 2, ATA: 2 },
  8: { GOL: 1, ZAG: 3, MEI: 2, ATA: 2 },
  9: { GOL: 1, ZAG: 3, MEI: 3, ATA: 2 },
  10: { GOL: 1, ZAG: 3, MEI: 3, ATA: 3 },
  11: { GOL: 1, ZAG: 4, MEI: 3, ATA: 3 },
};

const LINHA_POSICOES: LinhaPosicao[] = ["ZAG", "MEI", "ATA"];

export function getFormationTemplate(jogadoresPorTime?: number): FormationTemplate {
  return FORMATION_TEMPLATES[jogadoresPorTime || 7] ?? FORMATION_TEMPLATES[7]!;
}

function isLinhaPosicao(posicao: Posicao | undefined | null): posicao is LinhaPosicao {
  return posicao === "ZAG" || posicao === "MEI" || posicao === "ATA";
}

function normalizeParticipante(p: Participante): ParticipanteAjustado {
  const posicaoPrincipal = p.posicaoPrincipal ?? p.posicao;
  const secundaria =
    isLinhaPosicao(posicaoPrincipal) &&
    isLinhaPosicao(p.posicaoSecundaria) &&
    p.posicaoSecundaria !== posicaoPrincipal
      ? p.posicaoSecundaria
      : undefined;

  return {
    ...p,
    posicao: posicaoPrincipal,
    posicaoPrincipal,
    posicaoSecundaria: secundaria,
    posicaoEfetivaSorteio: posicaoPrincipal,
  };
}

function sortByCoefDesc<T extends Participante>(list: T[], contexto: CoeficienteContext) {
  return [...list].sort((a, b) => {
    const diff = getCoeficiente(b, contexto) - getCoeficiente(a, contexto);
    if (Math.abs(diff) > 0.0001) return diff;
    return a.nome.localeCompare(b.nome) || a.id.localeCompare(b.id);
  });
}

function clonePlayerWithEffective(
  jogador: ParticipanteAjustado,
  posicaoEfetivaSorteio: Posicao
): ParticipanteAjustado {
  return {
    ...jogador,
    posicaoEfetivaSorteio,
  };
}

function definirPosicoesEfetivas(
  linhas: ParticipanteAjustado[],
  template: FormationTemplate,
  quantidadeTimes: number,
  contexto: CoeficienteContext
) {
  const targetGlobal = Object.fromEntries(
    LINHA_POSICOES.map((pos) => [pos, template[pos] * quantidadeTimes])
  ) as Record<LinhaPosicao, number>;

  const porPrincipal: Record<LinhaPosicao, ParticipanteAjustado[]> = {
    ZAG: [],
    MEI: [],
    ATA: [],
  };
  linhas.forEach((jogador) => {
    if (isLinhaPosicao(jogador.posicaoPrincipal)) {
      porPrincipal[jogador.posicaoPrincipal].push(jogador);
    }
  });

  const efetivos: ParticipanteAjustado[] = [];
  const excedentes: ParticipanteAjustado[] = [];
  const counts: Record<LinhaPosicao, number> = { ZAG: 0, MEI: 0, ATA: 0 };

  LINHA_POSICOES.forEach((posicao) => {
    const ordenados = sortByCoefDesc(porPrincipal[posicao], contexto);
    const naturais = ordenados.slice(0, targetGlobal[posicao]);
    const sobra = ordenados.slice(targetGlobal[posicao]);
    naturais.forEach((jogador) => {
      efetivos.push(clonePlayerWithEffective(jogador, posicao));
      counts[posicao] += 1;
    });
    excedentes.push(...sobra);
  });

  const excedentesDisponiveis = sortByCoefDesc(excedentes, contexto).reverse();
  const avisos: string[] = [];

  LINHA_POSICOES.map((posicao) => ({
    posicao,
    deficit: Math.max(0, targetGlobal[posicao] - counts[posicao]),
  }))
    .filter((item) => item.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit || a.posicao.localeCompare(b.posicao))
    .forEach(({ posicao, deficit }) => {
      let faltam = deficit;
      while (faltam > 0) {
        const idx = excedentesDisponiveis.findIndex(
          (jogador) => jogador.posicaoSecundaria === posicao
        );
        if (idx < 0) {
          avisos.push(
            `Posicao ${posicao} ficou abaixo do template por falta de atletas compativeis.`
          );
          break;
        }
        const [jogador] = excedentesDisponiveis.splice(idx, 1);
        if (!jogador) break;
        efetivos.push(clonePlayerWithEffective(jogador, posicao));
        counts[posicao] += 1;
        faltam -= 1;
      }
    });

  excedentesDisponiveis.forEach((jogador) => {
    if (isLinhaPosicao(jogador.posicaoPrincipal)) {
      efetivos.push(clonePlayerWithEffective(jogador, jogador.posicaoPrincipal));
      counts[jogador.posicaoPrincipal] += 1;
    }
  });

  return { jogadores: efetivos, avisos };
}

function gerarQuotasCandidatas(lineSlots: number): LineQuotas[] {
  const candidates: LineQuotas[] = [];
  for (let zag = 0; zag <= lineSlots; zag += 1) {
    for (let mei = 0; mei <= lineSlots - zag; mei += 1) {
      const ata = lineSlots - zag - mei;
      candidates.push({ ZAG: zag, MEI: mei, ATA: ata });
    }
  }
  return candidates;
}

function quotaDeviation(quota: LineQuotas, template: FormationTemplate) {
  return LINHA_POSICOES.reduce((acc, pos) => acc + Math.abs(quota[pos] - template[pos]), 0);
}

function escolherQuotasPorTime(
  quantidadeTimes: number,
  jogadoresPorTime: number,
  template: FormationTemplate,
  totalPorPosicao: Record<LinhaPosicao, number>
): LineQuotas[] {
  const lineSlots = Math.max(0, jogadoresPorTime - 1);
  const targetGlobal = {
    ZAG: template.ZAG * quantidadeTimes,
    MEI: template.MEI * quantidadeTimes,
    ATA: template.ATA * quantidadeTimes,
  };
  if (
    totalPorPosicao.ZAG === targetGlobal.ZAG &&
    totalPorPosicao.MEI === targetGlobal.MEI &&
    totalPorPosicao.ATA === targetGlobal.ATA
  ) {
    return Array.from({ length: quantidadeTimes }, () => ({
      ZAG: template.ZAG,
      MEI: template.MEI,
      ATA: template.ATA,
    }));
  }

  const quotas = Array.from({ length: quantidadeTimes }, () => ({
    ZAG: Math.floor(totalPorPosicao.ZAG / quantidadeTimes),
    MEI: Math.floor(totalPorPosicao.MEI / quantidadeTimes),
    ATA: Math.floor(totalPorPosicao.ATA / quantidadeTimes),
  }));
  const vagasRestantes = quotas.map((quota) => lineSlots - quota.ZAG - quota.MEI - quota.ATA);
  const remainders: Record<LinhaPosicao, number> = {
    ZAG: totalPorPosicao.ZAG % quantidadeTimes,
    MEI: totalPorPosicao.MEI % quantidadeTimes,
    ATA: totalPorPosicao.ATA % quantidadeTimes,
  };

  LINHA_POSICOES.forEach((posicao) => {
    for (let count = 0; count < remainders[posicao]; count += 1) {
      const targetIndex = vagasRestantes.findIndex((vagas) => vagas > 0);
      if (targetIndex < 0) break;
      quotas[targetIndex]![posicao] += 1;
      vagasRestantes[targetIndex] -= 1;
    }
  });

  return quotas;
}

function calcularEstruturaScore(
  times: TimeSorteado[],
  quotas: LineQuotas[],
  jogadoresPorTime: number
) {
  let erros = 0;
  times.forEach((time, idx) => {
    if (time.jogadores.length !== jogadoresPorTime) {
      erros += Math.abs(time.jogadores.length - jogadoresPorTime) * 100;
    }
    if (
      time.jogadores.filter((j) => j.posicaoEfetivaSorteio === "GOL" || j.posicao === "GOL")
        .length !== 1
    ) {
      erros += 1000;
    }
    const quota = quotas[idx];
    if (!quota) return;
    LINHA_POSICOES.forEach((posicao) => {
      const count = time.jogadores.filter(
        (j) => (j.posicaoEfetivaSorteio ?? j.posicao) === posicao
      ).length;
      erros += Math.abs(count - quota[posicao]) * 20;
    });
  });
  return erros;
}

function calcularForcaStats(times: TimeSorteado[]) {
  const valores = times.map((t) => t.coeficienteTotal);
  return calcularForcaStatsFromValues(valores);
}

function calcularForcaStatsFromValues(valores: number[]) {
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const media = valores.reduce((acc, v) => acc + v, 0) / Math.max(1, valores.length);
  const variancia =
    valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / Math.max(1, valores.length);
  return { spread: max - min, variancia };
}

function distribuirPosicao({
  posicao,
  jogadores,
  times,
  quotas,
  contexto,
  pairWeights,
  jogadoresPorTime,
}: {
  posicao: LinhaPosicao;
  jogadores: ParticipanteAjustado[];
  times: TimeSorteado[];
  quotas: LineQuotas[];
  contexto: CoeficienteContext;
  pairWeights: Map<string, number>;
  jogadoresPorTime: number;
}) {
  const ordenados = sortByCoefDesc(jogadores, contexto);

  ordenados.forEach((jogador) => {
    const candidatos = times
      .map((time, index) => ({ time, index }))
      .filter(({ time, index }) => {
        const quota = quotas[index];
        if (!quota) return false;
        const posCount = time.jogadores.filter(
          (j) => (j.posicaoEfetivaSorteio ?? j.posicao) === posicao
        ).length;
        return posCount < quota[posicao] && time.jogadores.length < jogadoresPorTime;
      });

    if (!candidatos.length) return;

    candidatos.sort((a, b) => {
      const coefDiff = a.time.coeficienteTotal - b.time.coeficienteTotal;
      if (Math.abs(coefDiff) > 0.0001) return coefDiff;
      const panelinhaA = calcularPenalidadePanelinha(jogador.id, a.time.jogadores, pairWeights);
      const panelinhaB = calcularPenalidadePanelinha(jogador.id, b.time.jogadores, pairWeights);
      if (Math.abs(panelinhaA - panelinhaB) > 0.0001) return panelinhaA - panelinhaB;
      return a.index - b.index;
    });

    const alvo = candidatos[0]!.time;
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
    maiorPontuacaoDaTemporada:
      contexto.maiorPontuacaoDaTemporada ??
      Math.max(0, ...participantes.map((p) => Number(p.rankingPontos || 0))),
    maiorNumeroCampeoesDaTemporada:
      contexto.maiorNumeroCampeoesDaTemporada ??
      Math.max(0, ...participantes.map((p) => Number(p.campeoesDoDia || 0))),
  };
  const pairWeights = buildPairWeights(contexto.historico ?? []);
  const jogadoresPorTime =
    contexto.jogadoresPorTime ?? Math.ceil(participantes.length / quantidadeTimes);
  const template = getFormationTemplate(jogadoresPorTime);
  const participantesNormalizados = participantes.map(normalizeParticipante);

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
  const goleirosPrimarios = participantesNormalizados.filter((p) => p.posicaoPrincipal === "GOL");
  if (goleirosPrimarios.length < quantidadeTimes) {
    throw new Error(
      `Goleiros insuficientes: ${goleirosPrimarios.length}/${quantidadeTimes}. Selecione mais goleiros.`
    );
  }
  const goleirosSelecionados = sortByCoefDesc(goleirosPrimarios, coefContext)
    .slice(0, quantidadeTimes)
    .map((goleiro) => clonePlayerWithEffective(goleiro, "GOL"));
  const goleirosIds = new Set(goleirosSelecionados.map((g) => g.id));
  const goleirosReservas = participantesNormalizados.filter(
    (p) => p.posicaoPrincipal === "GOL" && !goleirosIds.has(p.id)
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

  // 3. Definir posicoes efetivas e quotas estruturais de cada time.
  const linhasSelecionadas = participantesNormalizados.filter((p) => p.posicaoPrincipal !== "GOL");
  const { jogadores: linhasComPosicaoEfetiva, avisos: avisosPosicao } = definirPosicoesEfetivas(
    linhasSelecionadas,
    template,
    quantidadeTimes,
    coefContext
  );
  avisos.push(...avisosPosicao);

  const totalPorPosicao: Record<LinhaPosicao, number> = { ZAG: 0, MEI: 0, ATA: 0 };
  linhasComPosicaoEfetiva.forEach((jogador) => {
    if (isLinhaPosicao(jogador.posicaoEfetivaSorteio)) {
      totalPorPosicao[jogador.posicaoEfetivaSorteio] += 1;
    }
  });

  const quotasBase = escolherQuotasPorTime(
    quantidadeTimes,
    jogadoresPorTime,
    template,
    totalPorPosicao
  );
  const quotaRows = [...quotasBase].sort(
    (a, b) => quotaDeviation(a, template) - quotaDeviation(b, template)
  );
  const teamOrderByStrength = times
    .map((time, index) => ({ time, index }))
    .sort((a, b) => a.time.coeficienteTotal - b.time.coeficienteTotal || a.index - b.index);
  const quotas: LineQuotas[] = Array.from({ length: quantidadeTimes }, () => ({
    ZAG: template.ZAG,
    MEI: template.MEI,
    ATA: template.ATA,
  }));
  teamOrderByStrength.forEach(({ index }, orderIndex) => {
    quotas[index] = quotaRows[orderIndex] ?? quotas[index]!;
  });

  // 4. Agrupar posicoes efetivas de linha
  const grupos: Record<LinhaPosicao, ParticipanteAjustado[]> = {
    ZAG: [],
    MEI: [],
    ATA: [],
  };
  linhasComPosicaoEfetiva.forEach((p) => {
    if (isLinhaPosicao(p.posicaoEfetivaSorteio)) {
      grupos[p.posicaoEfetivaSorteio].push(p);
    }
  });

  // 5. Distribuir linha respeitando slots previamente calculados.
  (["ZAG", "MEI", "ATA"] as const).forEach((posicao) => {
    distribuirPosicao({
      posicao,
      jogadores: grupos[posicao],
      times,
      quotas,
      contexto: coefContext,
      pairWeights,
      jogadoresPorTime,
    });
  });

  const distribuidoIds = new Set(times.flatMap((time) => time.jogadores.map((j) => j.id)));
  const linhaReservas = linhasComPosicaoEfetiva.filter(
    (jogador) => !distribuidoIds.has(jogador.id)
  );
  if (linhaReservas.length) {
    reservas.push(...linhaReservas);
    avisos.push("Jogadores excedentes foram movidos para reserva por limite de vagas.");
  }

  times.forEach((time) => {
    time.jogadores = ordenarJogadoresNoTime(time.jogadores, coefContext);
  });
  recalcularTimes(times, coefContext);

  // 6. Ajuste fino de forca e anti-panelinha preservando a formacao.
  const totalEscalado = times.reduce((acc, time) => acc + time.jogadores.length, 0);
  const maxAjustes = totalEscalado >= 60 ? 6 : totalEscalado >= 44 ? 24 : 160;
  const maxAntiPanelinha = totalEscalado >= 60 ? 6 : totalEscalado >= 44 ? 24 : 80;
  ajusteFinoBalanceamento(times, coefContext, pairWeights, quotas, jogadoresPorTime, maxAjustes);
  aplicarAntiPanelinha(times, coefContext, pairWeights, quotas, jogadoresPorTime, maxAntiPanelinha);
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
  const diffRelativo = maior - menor;
  const panelinhaTotal = calcularPanelinhaTotal(times, pairWeights);
  return diffRelativo * PESO_COEFICIENTE + panelinhaTotal * (PESO_PANELINHA * 0.2);
}

function canSwapPreserveStructure(jogadorA: Participante, jogadorB: Participante) {
  const posA = jogadorA.posicaoEfetivaSorteio ?? jogadorA.posicao;
  const posB = jogadorB.posicaoEfetivaSorteio ?? jogadorB.posicao;
  return posA === posB;
}

function aplicarTroca(
  timeA: TimeSorteado,
  timeB: TimeSorteado,
  jogadorA: Participante,
  jogadorB: Participante,
  contexto: CoeficienteContext
) {
  timeA.jogadores = timeA.jogadores.filter((j) => j.id !== jogadorA.id);
  timeB.jogadores = timeB.jogadores.filter((j) => j.id !== jogadorB.id);
  timeA.jogadores.push(jogadorB);
  timeB.jogadores.push(jogadorA);
  recalcularTimes([timeA, timeB], contexto);
}

function desfazerTroca(
  timeA: TimeSorteado,
  timeB: TimeSorteado,
  jogadorA: Participante,
  jogadorB: Participante,
  contexto: CoeficienteContext
) {
  aplicarTroca(timeA, timeB, jogadorB, jogadorA, contexto);
}

// Ajuste fino do balanceamento (trocas por posicao efetiva para reduzir desequilibrio)
export function ajusteFinoBalanceamento(
  times: TimeSorteado[],
  contexto: CoeficienteContext,
  pairWeights: Map<string, number>,
  quotas: LineQuotas[] = [],
  jogadoresPorTime = 0,
  maxTentativas = 200
) {
  let tentativas = 0;

  while (tentativas < maxTentativas) {
    tentativas += 1;
    const statsAtual = calcularForcaStats(times);
    const totaisAtuais = times.map((time) => time.coeficienteTotal);
    let melhor = {
      spread: statsAtual.spread,
      variancia: statsAtual.variancia,
      timeA: null as TimeSorteado | null,
      timeB: null as TimeSorteado | null,
      jogadorA: null as Participante | null,
      jogadorB: null as Participante | null,
    };

    for (let i = 0; i < times.length; i += 1) {
      for (let j = i + 1; j < times.length; j += 1) {
        const timeA = times[i]!;
        const timeB = times[j]!;
        for (const jogadorA of timeA.jogadores) {
          for (const jogadorB of timeB.jogadores) {
            if (quotas.length && !canSwapPreserveStructure(jogadorA, jogadorB)) {
              continue;
            }
            const coefA = getCoeficiente(jogadorA, contexto);
            const coefB = getCoeficiente(jogadorB, contexto);
            const totaisNovos = [...totaisAtuais];
            totaisNovos[i] = timeA.coeficienteTotal - coefA + coefB;
            totaisNovos[j] = timeB.coeficienteTotal - coefB + coefA;
            const statsNovo = calcularForcaStatsFromValues(totaisNovos);
            const improvesSpread = statsNovo.spread < melhor.spread - 0.0001;
            const improvesVariance =
              Math.abs(statsNovo.spread - melhor.spread) <= 0.0001 &&
              statsNovo.variancia < melhor.variancia - 0.0001;
            if (improvesSpread || improvesVariance) {
              melhor = {
                spread: statsNovo.spread,
                variancia: statsNovo.variancia,
                timeA,
                timeB,
                jogadorA,
                jogadorB,
              };
            }
          }
        }
      }
    }

    if (!melhor.timeA || !melhor.timeB || !melhor.jogadorA || !melhor.jogadorB) {
      return;
    }
    aplicarTroca(melhor.timeA, melhor.timeB, melhor.jogadorA, melhor.jogadorB, contexto);
  }
}

function aplicarAntiPanelinha(
  times: TimeSorteado[],
  contexto: CoeficienteContext,
  pairWeights: Map<string, number>,
  quotas: LineQuotas[],
  jogadoresPorTime: number,
  maxTentativas = 80
) {
  if (!pairWeights.size) return;

  let tentativas = 0;
  while (tentativas < maxTentativas) {
    tentativas += 1;
    const statsAtual = calcularForcaStats(times);
    const panelinhaAtual = calcularPanelinhaTotal(times, pairWeights);
    let melhor = {
      panelinha: panelinhaAtual,
      coefDiff: Number.POSITIVE_INFINITY,
      timeA: null as TimeSorteado | null,
      timeB: null as TimeSorteado | null,
      jogadorA: null as Participante | null,
      jogadorB: null as Participante | null,
    };

    for (let i = 0; i < times.length; i += 1) {
      for (let j = i + 1; j < times.length; j += 1) {
        const timeA = times[i]!;
        const timeB = times[j]!;
        for (const jogadorA of timeA.jogadores) {
          for (const jogadorB of timeB.jogadores) {
            if (!canSwapPreserveStructure(jogadorA, jogadorB)) {
              continue;
            }
            aplicarTroca(timeA, timeB, jogadorA, jogadorB, contexto);
            const statsNovo = calcularForcaStats(times);
            const panelinhaNovo = calcularPanelinhaTotal(times, pairWeights);
            const coefDiff = Math.abs(
              getCoeficiente(jogadorA, contexto) - getCoeficiente(jogadorB, contexto)
            );
            if (
              panelinhaNovo < melhor.panelinha - 0.0001 &&
              statsNovo.spread <= statsAtual.spread + 0.0001 &&
              coefDiff < melhor.coefDiff
            ) {
              melhor = { panelinha: panelinhaNovo, coefDiff, timeA, timeB, jogadorA, jogadorB };
            }
            desfazerTroca(timeA, timeB, jogadorA, jogadorB, contexto);
          }
        }
      }
    }

    if (!melhor.timeA || !melhor.timeB || !melhor.jogadorA || !melhor.jogadorB) {
      return;
    }
    aplicarTroca(melhor.timeA, melhor.timeB, melhor.jogadorA, melhor.jogadorB, contexto);
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

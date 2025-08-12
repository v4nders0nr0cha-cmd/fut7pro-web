// src/utils/sorteioUtils.ts

import type { Participante, TimeSorteado } from "@/types/sorteio";

export type Time = { id: string; nome: string; logo: string };

export interface JogoConfronto {
  ordem: number;
  timeA: Time;
  timeB: Time;
  tempo: number; // em minutos
}

// Coeficiente geral: pesos dinâmicos (estrelas x ranking), ajustado pelo número de partidas
export function getCoeficiente(j: Participante, partidasTotais: number) {
  const mediaVitorias = j.partidas && j.partidas > 0 ? j.vitorias / j.partidas : 0;

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

  const coefEstrelas = j.estrelas.estrelas ?? 0;
  const coefRanking = j.rankingPontos * 0.5 + mediaVitorias * 0.5;

  return pesoEstrelas * coefEstrelas + pesoRanking * coefRanking;
}

// Distribuição serpentina (vai-e-volta) para máxima justiça visual por estrelas
function distribuirPorEstrelaSerpentina(
  jogadores: Participante[] = [],
  quantidadeTimes: number
): Participante[][] {
  if (!Array.isArray(jogadores) || jogadores.length === 0) {
    return Array.from({ length: quantidadeTimes }, () => []);
  }

  // Ordena do maior para o menor número de estrelas
  const ordenados = [...jogadores].sort(
    (a, b) => (b.estrelas.estrelas ?? 0) - (a.estrelas.estrelas ?? 0)
  );

  // Inicializa os times vazios
  const times: Participante[][] = Array.from({ length: quantidadeTimes }, () => []);

  let idx = 0;
  let direction = 1; // 1 = direita, -1 = esquerda
  while (ordenados.length) {
    if (times[idx]) {
      times[idx]!.push(ordenados.shift()!);
    } else {
      ordenados.shift(); // evita travar se índice sair do range
    }
    idx += direction;
    if (idx === quantidadeTimes) {
      idx = quantidadeTimes - 1;
      direction = -1;
    } else if (idx === -1) {
      idx = 0;
      direction = 1;
    }
  }

  return times;
}

// ===== Sorteio Inteligente =====
export function sortearTimesInteligente(
  participantes: Participante[],
  timesSelecionados: Time[],
  partidasTotais: number
): TimeSorteado[] {
  const quantidadeTimes = timesSelecionados.length;

  // 1. Agrupar por posição
  const grupos: Record<string, Participante[]> = {
    GOL: [],
    ZAG: [],
    MEI: [],
    ATA: [],
  };
  participantes.forEach((p) => {
    if (grupos[p.posicao]) grupos[p.posicao].push(p);
  });

  // 2. Distribuir cada grupo por estrelas (serpentina/vai-e-volta)
  const gruposDistribuidos: Record<string, Participante[][]> = {};
  Object.keys(grupos).forEach((posicao) => {
    gruposDistribuidos[posicao] = distribuirPorEstrelaSerpentina(
      grupos[posicao] ?? [],
      quantidadeTimes
    );
  });

  // 3. Inicializar times
  const times: TimeSorteado[] = timesSelecionados.map((t) => ({
    id: t.id,
    nome: t.nome,
    jogadores: [],
    mediaRanking: 0,
    mediaEstrelas: 0,
    coeficienteTotal: 0,
  }));

  // 4. Preencher times por posição: GOLEIRO -> ZAGUEIRO -> MEIA -> ATACANTE (snake draft)
  ["GOL", "ZAG", "MEI", "ATA"].forEach((posicao) => {
    const distribuidos = gruposDistribuidos[posicao] ?? [];
    distribuidos.forEach((grupo, t) => {
      if (!Array.isArray(grupo) || !times[t]) return;
      grupo.forEach((jogador) => {
        if (jogador) times[t]!.jogadores.push(jogador);
      });
    });
  });

  // 5. Ordena jogadores do time na ordem: GOL -> ZAG -> MEI -> ATA (e depois por coeficiente)
  times.forEach((time) =>
    time.jogadores.sort((a, b) => {
      const ordem = { GOL: 0, ZAG: 1, MEI: 2, ATA: 3 };
      if (ordem[a.posicao] !== ordem[b.posicao]) {
        return ordem[a.posicao] - ordem[b.posicao];
      }
      return getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais);
    })
  );

  // 6. Calcula médias para UI
  times.forEach((t) => {
    const totalRanking = t.jogadores.reduce((acc, j) => acc + (j.rankingPontos || 0), 0);
    const totalEstrelas = t.jogadores.reduce((acc, j) => acc + (j.estrelas?.estrelas ?? 0), 0);
    t.mediaRanking = t.jogadores.length ? totalRanking / t.jogadores.length : 0;
    t.mediaEstrelas = t.jogadores.length ? totalEstrelas / t.jogadores.length : 0;
    t.coeficienteTotal = t.jogadores.reduce((acc, j) => acc + getCoeficiente(j, partidasTotais), 0);
  });

  // 7. Rebalanceamento leve final, se necessário
  ajusteFinoBalanceamento(times, partidasTotais);

  return times;
}

// Ajuste fino do balanceamento (troca 1-1 se diferença > 15%)
export function ajusteFinoBalanceamento(times: TimeSorteado[], partidasTotais: number) {
  const maiorCoef = Math.max(...times.map((t) => t.coeficienteTotal));
  const menorCoef = Math.min(...times.map((t) => t.coeficienteTotal));

  if ((maiorCoef - menorCoef) / maiorCoef > 0.15) {
    const timeForte = times.find((t) => t.coeficienteTotal === maiorCoef);
    const timeFraco = times.find((t) => t.coeficienteTotal === menorCoef);

    if (timeForte && timeFraco) {
      const jogadorForte = timeForte.jogadores.find((j) => (j.estrelas?.estrelas ?? 0) >= 4);
      const jogadorFraco = timeFraco.jogadores.find((j) => (j.estrelas?.estrelas ?? 0) <= 2);

      if (jogadorForte && jogadorFraco) {
        timeForte.jogadores = timeForte.jogadores.filter((j) => j.id !== jogadorForte.id);
        timeFraco.jogadores = timeFraco.jogadores.filter((j) => j.id !== jogadorFraco.id);

        timeForte.jogadores.push(jogadorFraco);
        timeFraco.jogadores.push(jogadorForte);

        // Recalcula coeficientes após troca
        timeForte.coeficienteTotal = timeForte.jogadores.reduce(
          (acc, j) => acc + getCoeficiente(j, partidasTotais),
          0
        );
        timeFraco.coeficienteTotal = timeFraco.jogadores.reduce(
          (acc, j) => acc + getCoeficiente(j, partidasTotais),
          0
        );
      }
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

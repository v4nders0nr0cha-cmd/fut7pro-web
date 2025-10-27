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

// ===== Sorteio Inteligente (V2 com regras de goleiro e serpentina composta) =====
export function sortearTimesInteligenteV2(
  participantes: Participante[],
  timesSelecionados: Time[],
  partidasTotais: number
): TimeSorteado[] {
  const quantidadeTimes = timesSelecionados.length;
  const totalSelecionados = participantes.length;

  const times: TimeSorteado[] = timesSelecionados.map((t) => ({
    id: t.id,
    nome: t.nome,
    jogadores: [],
    mediaRanking: 0,
    mediaEstrelas: 0,
    coeficienteTotal: 0,
  }));

  // 1) Goleiros: 1 por time; completa com fictícios de 3 estrelas se faltar
  const goleirosReais = participantes.filter((p) => p.posicao === "GOL" && !p.isFicticio);
  const goleirosOrdenados = [...goleirosReais].sort(
    (a, b) => getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais)
  );
  for (let i = 0; i < quantidadeTimes; i++) {
    const g = goleirosOrdenados[i];
    if (g) {
      times[i]!.jogadores.push(g);
    } else {
      const idx = i + 1;
      const fict: Participante = {
        id: `fict-gol-${idx}`,
        nome: `Goleiro Fictício ${idx}`,
        slug: `goleiro-ficticio-${idx}`,
        foto: "/images/Perfil-sem-Foto-Fut7.png",
        posicao: "GOL",
        rankingPontos: 0,
        vitorias: 0,
        gols: 0,
        assistencias: 0,
        estrelas: { estrelas: 3, atualizadoEm: new Date().toISOString() },
        mensalista: false,
        partidas: 0,
        isFicticio: true,
        naoRanqueavel: true,
      };
      times[i]!.jogadores.push(fict);
    }
  }

  // 2) Demais posições (linha): serpentina (zigue-zague) pela força composta
  const extrasGoleirosComoLinha = goleirosOrdenados.slice(quantidadeTimes).map((g) => ({
    ...g,
    posicao: "ZAG" as const,
  }));
  const linhas = participantes
    .filter((p) => p.posicao !== "GOL")
    .concat(extrasGoleirosComoLinha);

  const lineSlotsPorTime = Math.max(0, Math.floor((totalSelecionados - quantidadeTimes) / quantidadeTimes));
  const totalLineSlots = lineSlotsPorTime * quantidadeTimes;
  // Pools por posição (ordenados pela força composta)
  const zagPool = linhas.filter((p) => p.posicao === "ZAG").sort((a, b) => getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais));
  const meiPool = linhas.filter((p) => p.posicao === "MEI").sort((a, b) => getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais));
  const ataPool = linhas.filter((p) => p.posicao === "ATA").sort((a, b) => getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais));

  const picks: number[] = [];
  for (let round = 0; round < lineSlotsPorTime; round++) {
    if (round % 2 === 0) {
      for (let t = 0; t < quantidadeTimes; t++) picks.push(t);
    } else {
      for (let t = quantidadeTimes - 1; t >= 0; t--) picks.push(t);
    }
  }
  // Contadores por equipe
  const counts = times.map(() => ({ ZAG: 0, MEI: 0, ATA: 0 }));
  // Atualiza contagem considerando goleiro já inserido
  times.forEach((t, idx) => {
    t.jogadores.forEach((j) => {
      if (j.posicao === "ZAG") counts[idx].ZAG++;
      if (j.posicao === "MEI") counts[idx].MEI++;
      if (j.posicao === "ATA") counts[idx].ATA++;
    });
  });

  const pop = (pool: Participante[]) => pool.shift();
  const hasAny = () => zagPool.length + meiPool.length + ataPool.length > 0;

  for (let i = 0; i < totalLineSlots && hasAny(); i++) {
    const teamIdx = picks[i];
    const c = counts[teamIdx];
    // define posição alvo: a com menor contagem neste time (e pool disponível)
    const options: Array<{ pos: "ZAG" | "MEI" | "ATA"; count: number; avail: number }> = [];
    if (zagPool.length > 0) options.push({ pos: "ZAG", count: c.ZAG, avail: zagPool.length });
    if (meiPool.length > 0) options.push({ pos: "MEI", count: c.MEI, avail: meiPool.length });
    if (ataPool.length > 0) options.push({ pos: "ATA", count: c.ATA, avail: ataPool.length });

    let chosen: Participante | undefined;
    if (options.length > 0) {
      const min = Math.min(...options.map((o) => o.count));
      const candidates = options.filter((o) => o.count === min);
      // desempate por maior disponibilidade para evitar esgotar uma posição cedo
      const best = candidates.sort((a, b) => b.avail - a.avail)[0];
      if (best.pos === "ZAG") chosen = pop(zagPool);
      else if (best.pos === "MEI") chosen = pop(meiPool);
      else chosen = pop(ataPool);
    } else {
      // fallback: pegar de qualquer pool com jogador
      chosen = pop(zagPool) ?? pop(meiPool) ?? pop(ataPool);
    }
    if (chosen) {
      times[teamIdx]!.jogadores.push(chosen);
      if (chosen.posicao === "ZAG") counts[teamIdx].ZAG++;
      if (chosen.posicao === "MEI") counts[teamIdx].MEI++;
      if (chosen.posicao === "ATA") counts[teamIdx].ATA++;
    }
  }

  // Ordenação e métricas finais
  times.forEach((time) =>
    time.jogadores.sort((a, b) => {
      const ordem = { GOL: 0, ZAG: 1, MEI: 2, ATA: 3 } as const;
      if (ordem[a.posicao] !== ordem[b.posicao]) return ordem[a.posicao] - ordem[b.posicao];
      return getCoeficiente(b, partidasTotais) - getCoeficiente(a, partidasTotais);
    })
  );

  times.forEach((t) => {
    const totalRanking = t.jogadores.reduce((acc, j) => acc + (j.rankingPontos || 0), 0);
    const totalEstrelas = t.jogadores.reduce((acc, j) => acc + (j.estrelas?.estrelas ?? 0), 0);
    t.mediaRanking = t.jogadores.length ? totalRanking / t.jogadores.length : 0;
    t.mediaEstrelas = t.jogadores.length ? totalEstrelas / t.jogadores.length : 0;
    t.coeficienteTotal = t.jogadores.reduce((acc, j) => acc + getCoeficiente(j, partidasTotais), 0);
  });

  ajusteFinoBalanceamento(times, partidasTotais);
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

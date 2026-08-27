"use client";

import { useEffect, useMemo, useState } from "react";
import type { JogoConfronto, Time } from "@/utils/sorteioUtils";

type ValidacaoTabelaConfrontos = {
  erros: string[];
  avisos: string[];
};

type ValidacaoTabelaOptions = {
  duracaoRachaMin?: number | null;
};

function normalizeJogos(jogos: JogoConfronto[]) {
  return jogos.map((jogo, index) => ({ ...jogo, ordem: index + 1 }));
}

function totalTempoTabela(jogos: JogoConfronto[]) {
  return jogos.reduce((acc, jogo) => acc + Math.max(0, Number(jogo.tempo || 0)), 0);
}

function resumoTempo(jogos: JogoConfronto[], duracaoRachaMin: number) {
  const tempoTotal = Math.max(0, Number(duracaoRachaMin || 0));
  const tempoConfrontos = totalTempoTabela(jogos);
  const saldo = tempoTotal - tempoConfrontos;

  return { tempoTotal, tempoConfrontos, saldo };
}

export function validarTabelaConfrontos(
  jogos: JogoConfronto[],
  timesDisponiveis: Time[],
  _options: ValidacaoTabelaOptions = {}
): ValidacaoTabelaConfrontos {
  const erros: string[] = [];
  const avisos: string[] = [];
  const timesIds = new Set(timesDisponiveis.map((time) => time.id));

  if (!jogos.length) {
    erros.push("A tabela precisa ter pelo menos um confronto.");
  }

  const jogosPorTime = new Map<string, number>();

  jogos.forEach((jogo, index) => {
    if (
      !jogo.timeA?.id ||
      !jogo.timeB?.id ||
      !timesIds.has(jogo.timeA.id) ||
      !timesIds.has(jogo.timeB.id)
    ) {
      erros.push(`Jogo ${index + 1}: selecione dois times válidos.`);
      return;
    }
    if (jogo.timeA.id === jogo.timeB.id) {
      erros.push(`Jogo ${index + 1}: um time não pode jogar contra ele mesmo.`);
    }
    if (!Number.isFinite(Number(jogo.tempo)) || Number(jogo.tempo) <= 0) {
      erros.push(`Jogo ${index + 1}: defina um tempo válido.`);
    }

    jogosPorTime.set(jogo.timeA.id, (jogosPorTime.get(jogo.timeA.id) ?? 0) + 1);
    jogosPorTime.set(jogo.timeB.id, (jogosPorTime.get(jogo.timeB.id) ?? 0) + 1);
  });

  timesDisponiveis.forEach((time) => {
    if (!jogosPorTime.has(time.id)) jogosPorTime.set(time.id, 0);
  });

  const totais = Array.from(jogosPorTime.values());
  const max = totais.length ? Math.max(...totais) : 0;
  const min = totais.length ? Math.min(...totais) : 0;
  const aparicoesPossiveis = jogos.length * 2;
  const timeSemJogoEvitavel =
    timesDisponiveis.length > 0 && aparicoesPossiveis >= timesDisponiveis.length;

  if (timeSemJogoEvitavel && min === 0) {
    erros.push(
      "Todos os Times do Dia precisam ter pelo menos um jogo quando houver confrontos suficientes."
    );
  }

  if (max - min > 1) {
    erros.push(
      "A quantidade de jogos por time está injusta. Ajuste a tabela para equilibrar as participações."
    );
  }

  return { erros: Array.from(new Set(erros)), avisos: Array.from(new Set(avisos)) };
}

export default function EditorTabelaConfrontos({
  jogos,
  timesDisponiveis,
  duracaoGlobal,
  duracaoRachaMin,
  tabelaPersonalizada,
  onDuracaoGlobalChange,
  onSave,
  onRestoreAutomatic,
  onEditingStateChange,
}: {
  jogos: JogoConfronto[];
  timesDisponiveis: Time[];
  duracaoGlobal: number;
  duracaoRachaMin: number;
  tabelaPersonalizada: boolean;
  onDuracaoGlobalChange: (duracao: number) => void;
  onSave: (jogos: JogoConfronto[], duracaoGlobal: number) => void;
  onRestoreAutomatic: (duracaoGlobal: number) => void;
  onEditingStateChange?: (editando: boolean) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [draftJogos, setDraftJogos] = useState<JogoConfronto[]>(jogos);
  const [draftDuracaoGlobal, setDraftDuracaoGlobal] = useState(duracaoGlobal);
  const jogosEmValidacao = editando ? draftJogos : jogos;
  const validacao = useMemo(
    () => validarTabelaConfrontos(jogosEmValidacao, timesDisponiveis, { duracaoRachaMin }),
    [duracaoRachaMin, jogosEmValidacao, timesDisponiveis]
  );
  const { tempoTotal, tempoConfrontos, saldo } = resumoTempo(jogosEmValidacao, duracaoRachaMin);
  const minutosReservaRecomendados = 15;

  useEffect(() => {
    if (!editando) {
      setDraftJogos(jogos);
      setDraftDuracaoGlobal(duracaoGlobal);
    }
  }, [duracaoGlobal, editando, jogos]);

  useEffect(() => {
    onEditingStateChange?.(editando);
    return () => onEditingStateChange?.(false);
  }, [editando, onEditingStateChange]);

  const updateJogo = (index: number, patch: Partial<JogoConfronto>) => {
    setDraftJogos((current) =>
      normalizeJogos(current.map((jogo, idx) => (idx === index ? { ...jogo, ...patch } : jogo)))
    );
  };

  const findTime = (id: string) => timesDisponiveis.find((time) => time.id === id);

  const mover = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draftJogos.length) return;
    const next = [...draftJogos];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(nextIndex, 0, item);
    setDraftJogos(normalizeJogos(next));
  };

  const remover = (index: number) => {
    setDraftJogos((current) => normalizeJogos(current.filter((_, idx) => idx !== index)));
  };

  const adicionar = () => {
    const timeA = timesDisponiveis[0];
    const timeB = timesDisponiveis.find((time) => time.id !== timeA?.id);
    if (!timeA || !timeB) return;
    setDraftJogos((current) =>
      normalizeJogos([
        ...current,
        {
          ordem: current.length + 1,
          timeA,
          timeB,
          tempo: draftDuracaoGlobal,
          turno: "ida",
        },
      ])
    );
  };

  const aplicarTempoGlobal = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    setDraftDuracaoGlobal(value);
    setDraftJogos((current) => current.map((jogo) => ({ ...jogo, tempo: value })));
  };

  const iniciarEdicao = () => {
    setDraftJogos(jogos);
    setDraftDuracaoGlobal(duracaoGlobal);
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setDraftJogos(jogos);
    setDraftDuracaoGlobal(duracaoGlobal);
    setEditando(false);
  };

  const salvarEdicao = () => {
    const next = normalizeJogos(draftJogos);
    const nextValidacao = validarTabelaConfrontos(next, timesDisponiveis, { duracaoRachaMin });
    if (nextValidacao.erros.length > 0) return;
    onDuracaoGlobalChange(draftDuracaoGlobal);
    onSave(next, draftDuracaoGlobal);
    setEditando(false);
  };

  const restaurarAutomatica = () => {
    setDraftJogos([]);
    onRestoreAutomatic(draftDuracaoGlobal);
    setEditando(false);
  };

  const mensagemTempo =
    saldo >= minutosReservaRecomendados
      ? "O tempo restante pode ser usado para organização, troca de times e imprevistos."
      : saldo >= 0
        ? `Seu racha está configurado para ${tempoTotal} minutos e esta tabela utiliza ${tempoConfrontos} minutos em confrontos, deixando ${saldo} minutos para organização, troca de times e imprevistos. O Fut7Pro recomenda reservar pelo menos 15 minutos, mas você pode manter esta configuração se ela fizer sentido para o seu grupo.`
        : `Os confrontos somam ${tempoConfrontos} minutos, ${Math.abs(saldo)} minutos a mais que a duração configurada. Se o horário do seu grupo tiver flexibilidade, você pode manter esta tabela. Caso contrário, reduza o tempo dos confrontos ou remova alguns jogos.`;

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-zinc-700 bg-[#121212] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-sm font-bold text-yellow-300">
            {tabelaPersonalizada
              ? "Tabela personalizada pelo administrador"
              : "Tabela automática do Fut7Pro"}
          </h4>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400">
            O Fut7Pro organizou a tabela e a ordem dos confrontos com base na quantidade de times e
            no tempo disponível. Se quiser, personalize antes de publicar.
          </p>
          <div className="mt-3 grid gap-2 text-xs text-zinc-200 sm:grid-cols-3">
            <span className="rounded border border-zinc-800 bg-black/20 px-3 py-2">
              Tempo total: <strong>{tempoTotal} min</strong>
            </span>
            <span className="rounded border border-zinc-800 bg-black/20 px-3 py-2">
              Tempo dos confrontos: <strong>{tempoConfrontos} min</strong>
            </span>
            <span className="rounded border border-zinc-800 bg-black/20 px-3 py-2">
              {saldo >= 0 ? "Tempo restante" : "Excede o tempo configurado"}:{" "}
              <strong>{Math.abs(saldo)} min</strong>
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-400">{mensagemTempo}</p>
        </div>
        <div className="flex flex-col gap-2 md:min-w-48">
          {!editando && (
            <button
              type="button"
              onClick={iniciarEdicao}
              className="rounded border border-yellow-500 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              Personalizar Tabela
            </button>
          )}
        </div>
      </div>

      {editando && (
        <div className="space-y-3">
          <label className="block max-w-xs text-xs font-semibold text-zinc-300">
            Tempo por confronto
            <input
              type="number"
              min={1}
              value={draftDuracaoGlobal}
              onChange={(event) => aplicarTempoGlobal(Number(event.target.value))}
              className="mt-1 w-full rounded border border-zinc-700 bg-[#181818] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            />
          </label>

          {draftJogos.map((jogo, index) => (
            <div
              key={`${jogo.ordem}-${index}`}
              className="grid gap-2 rounded border border-zinc-800 bg-[#181818] p-3 md:grid-cols-[80px_1fr_1fr_132px]"
            >
              <div className="text-sm font-bold text-zinc-300">Jogo {index + 1}</div>
              <select
                value={jogo.timeA.id}
                onChange={(event) => {
                  const time = findTime(event.target.value);
                  if (time) updateJogo(index, { timeA: time });
                }}
                className="rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
              >
                {timesDisponiveis.map((time) => (
                  <option key={time.id} value={time.id}>
                    {time.nome}
                  </option>
                ))}
              </select>
              <select
                value={jogo.timeB.id}
                onChange={(event) => {
                  const time = findTime(event.target.value);
                  if (time) updateJogo(index, { timeB: time });
                }}
                className="rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
              >
                {timesDisponiveis.map((time) => (
                  <option key={time.id} value={time.id}>
                    {time.nome}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => mover(index, -1)}
                  disabled={index === 0}
                  className="flex-1 rounded border border-zinc-700 px-2 py-2 text-sm text-zinc-200 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => mover(index, 1)}
                  disabled={index === draftJogos.length - 1}
                  className="flex-1 rounded border border-zinc-700 px-2 py-2 text-sm text-zinc-200 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remover(index)}
                  className="flex-[2] rounded border border-red-500/50 px-2 py-2 text-sm text-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
            <button
              type="button"
              onClick={adicionar}
              className="rounded border border-yellow-500 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              Adicionar confronto
            </button>
            <button
              type="button"
              onClick={restaurarAutomatica}
              className="rounded border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              Restaurar tabela automática
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400"
            >
              Cancelar edição
            </button>
            <button
              type="button"
              onClick={salvarEdicao}
              disabled={validacao.erros.length > 0}
              className="rounded bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-500 disabled:pointer-events-none disabled:opacity-50"
            >
              Salvar edição
            </button>
          </div>
        </div>
      )}

      {validacao.erros.length > 0 && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {validacao.erros.map((erro) => (
            <div key={erro}>{erro}</div>
          ))}
        </div>
      )}

      {validacao.avisos.length > 0 && (
        <div className="rounded border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100">
          {validacao.avisos.map((aviso) => (
            <div key={aviso}>{aviso}</div>
          ))}
        </div>
      )}
    </div>
  );
}

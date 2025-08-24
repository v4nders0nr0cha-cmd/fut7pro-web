"use client";

import Image from "next/image";
import type { TimeSorteado, Participante } from "@/types/sorteio";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  times: TimeSorteado[];
  onSaveEdit?: (timesEditados: TimeSorteado[]) => void;
  jogadoresPorTime?: number;
}

export default function TimesGerados({
  times,
  onSaveEdit,
  jogadoresPorTime,
}: Props) {
  const [timesEdit, setTimesEdit] = useState<TimeSorteado[]>(
    structuredClone(times),
  );
  const [editando, setEditando] = useState(false);

  // DnD Kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Handler drag-and-drop dentro do time
  function handleDragEnd(event: DragEndEvent, timeId: string) {
    const { active, over } = event;
    if (!over || !active) return;
    if (active.id === over.id) return;

    const timesCopy = structuredClone(timesEdit);
    const time = timesCopy.find((t) => t.id === timeId);
    if (!time) return;

    const oldIdx = time.jogadores.findIndex((j) => j.id === active.id);
    const newIdx = time.jogadores.findIndex((j) => j.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    time.jogadores = arrayMove(time.jogadores, oldIdx, newIdx);

    setTimesEdit(timesCopy);
  }

  // Mover jogador para outro time (drag manual)
  function moverJogador(
    jogador: Participante,
    timeOrigemId: string,
    timeDestinoId: string,
  ) {
    if (timeOrigemId === timeDestinoId) return;

    const timesCopy = structuredClone(timesEdit);
    const timeOrigem = timesCopy.find((t) => t.id === timeOrigemId);
    const timeDestino = timesCopy.find((t) => t.id === timeDestinoId);

    if (!timeOrigem || !timeDestino) return;
    if (jogadoresPorTime && timeDestino.jogadores.length >= jogadoresPorTime)
      return;

    timeOrigem.jogadores = timeOrigem.jogadores.filter(
      (j) => j.id !== jogador.id,
    );
    timeDestino.jogadores.push(jogador);

    setTimesEdit(timesCopy);
  }

  function salvarEdicao() {
    setEditando(false);
    if (onSaveEdit) onSaveEdit(timesEdit);
  }

  function alertaTimesInvalidos() {
    if (!jogadoresPorTime) return false;
    return timesEdit.some((t) => t.jogadores.length !== jogadoresPorTime);
  }

  // Função utilitária para ordenar jogadores na ordem desejada
  function ordenarJogadores(jogadores: Participante[]): Participante[] {
    const ordemPosicoes: Record<string, number> = {
      GOL: 0,
      ZAG: 1,
      MEI: 2,
      ATA: 3,
    };
    return [...jogadores].sort((a, b) => {
      const posA = ordemPosicoes[a.posicao] ?? 99;
      const posB = ordemPosicoes[b.posicao] ?? 99;
      if (posA !== posB) return posA - posB;
      // Dentro da mesma posição, mais forte em cima
      return getCoeficiente(b) - getCoeficiente(a);
    });
  }

  // Calcula médias dinâmicas em tempo real para o time atual
  function calcularMedias(jogadores: Participante[]) {
    const totalRanking = jogadores.reduce(
      (acc, j) => acc + (j.rankingPontos || 0),
      0,
    );
    const totalEstrelas = jogadores.reduce(
      (acc, j) => acc + (j.estrelas?.estrelas || 0),
      0,
    );
    return {
      mediaRanking: jogadores.length ? totalRanking / jogadores.length : 0,
      mediaEstrelas: jogadores.length ? totalEstrelas / jogadores.length : 0,
    };
  }

  // Componente SortablePlayer
  function SortablePlayer({
    jogador,
    timeId,
  }: {
    jogador: Participante;
    timeId: string;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: jogador.id,
    });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.7 : 1,
        }}
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center gap-1 rounded bg-zinc-900 px-2 py-1"
      >
        <Image
          src={jogador.foto}
          alt={jogador.nome}
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-sm font-semibold">{jogador.nome}</span>
        <span className="text-xs text-gray-400">{jogador.posicao}</span>
        <span className="ml-1 text-yellow-400">
          {"⭐".repeat(jogador.estrelas.estrelas)}
        </span>
        {editando && (
          <select
            className="ml-2 rounded border border-zinc-700 bg-zinc-800 text-xs text-white"
            value={timeId}
            onChange={(e) => moverJogador(jogador, timeId, e.target.value)}
          >
            {timesEdit.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  // --------- RENDER ---------
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-lg font-bold text-yellow-400">Times Gerados</h2>
        <button
          className="rounded bg-yellow-400 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-500"
          onClick={() => setEditando(!editando)}
        >
          {editando ? "Cancelar Edição" : "Editar Times"}
        </button>
        {editando && (
          <button
            className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
            onClick={salvarEdicao}
            disabled={alertaTimesInvalidos()}
            title={
              alertaTimesInvalidos()
                ? "Todos os times devem ter o mesmo número de jogadores"
                : ""
            }
          >
            Salvar Alterações
          </button>
        )}
      </div>
      <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {timesEdit.map((time) => {
          // Ordenar jogadores na ordem desejada!
          const jogadoresOrdenados = ordenarJogadores(time.jogadores);
          // Calcular médias atualizadas em tempo real
          const { mediaRanking, mediaEstrelas } =
            calcularMedias(jogadoresOrdenados);

          return (
            <div
              key={time.id}
              className={`flex flex-col gap-2 rounded-xl bg-[#232323] p-4 shadow ${
                editando &&
                jogadoresPorTime &&
                time.jogadores.length !== jogadoresPorTime
                  ? "border-2 border-red-500"
                  : ""
              }`}
            >
              <h3 className="mb-2 text-xl font-bold text-yellow-400">
                {time.nome}
              </h3>
              {/* Listagem vertical ordenada */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, time.id)}
              >
                <SortableContext
                  items={jogadoresOrdenados.map((j) => j.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {jogadoresOrdenados.map((j) => (
                      <SortablePlayer key={j.id} jogador={j} timeId={time.id} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>
                  Média Ranking:{" "}
                  <b className="text-white">{mediaRanking.toFixed(1)}</b>
                </span>
                <span>
                  Média Estrelas:{" "}
                  <b className="text-yellow-400">{mediaEstrelas.toFixed(1)}</b>
                </span>
              </div>
              {editando &&
                jogadoresPorTime &&
                time.jogadores.length !== jogadoresPorTime && (
                  <span className="mt-1 text-xs text-red-400">
                    {`Este time está com ${time.jogadores.length} jogadores (deve ter ${jogadoresPorTime}).`}
                  </span>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Função utilitária local (igual do sorteioUtils) para garantir ordem por força dentro da posição
function getCoeficiente(j: Participante) {
  const mediaVitorias = (j as { partidas?: number }).partidas
    ? j.vitorias / (j as { partidas: number }).partidas
    : j.vitorias;
  return (
    j.rankingPontos * 0.5 + mediaVitorias * 0.3 + j.estrelas.estrelas * 0.2
  );
}

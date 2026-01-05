"use client";

import Image from "next/image";
import type { TimeSorteado, Participante } from "@/types/sorteio";
import { getCoeficiente, type CoeficienteContext } from "@/utils/sorteioUtils";
import { formatNivel } from "@/utils/nivel-atleta";
import { useState } from "react";
import StarRatingDisplay from "@/components/ui/StarRatingDisplay";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
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
  coeficienteContext?: CoeficienteContext;
}

export default function TimesGerados({
  times,
  onSaveEdit,
  jogadoresPorTime,
  coeficienteContext,
}: Props) {
  const [timesEdit, setTimesEdit] = useState<TimeSorteado[]>(structuredClone(times));
  const [editando, setEditando] = useState(false);

  // DnD Kit
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
  function moverJogador(jogador: Participante, timeOrigemId: string, timeDestinoId: string) {
    if (timeOrigemId === timeDestinoId) return;

    const timesCopy = structuredClone(timesEdit);
    const timeOrigem = timesCopy.find((t) => t.id === timeOrigemId);
    const timeDestino = timesCopy.find((t) => t.id === timeDestinoId);

    if (!timeOrigem || !timeDestino) return;
    if (jogadoresPorTime && timeDestino.jogadores.length >= jogadoresPorTime) return;

    timeOrigem.jogadores = timeOrigem.jogadores.filter((j) => j.id !== jogador.id);
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
    const ordemPosicoes: Record<string, number> = { GOL: 0, ZAG: 1, MEI: 2, ATA: 3 };
    const contexto: CoeficienteContext = coeficienteContext ?? { partidasTotais: 0 };
    return [...jogadores].sort((a, b) => {
      const posA = ordemPosicoes[a.posicao] ?? 99;
      const posB = ordemPosicoes[b.posicao] ?? 99;
      if (posA !== posB) return posA - posB;
      // Dentro da mesma posição, mais forte em cima
      return getCoeficiente(b, contexto) - getCoeficiente(a, contexto);
    });
  }

  // Calcula médias dinâmicas em tempo real para o time atual
  function calcularMedias(jogadores: Participante[]) {
    const totalRanking = jogadores.reduce((acc, j) => acc + (j.rankingPontos || 0), 0);
    const totalEstrelas = jogadores.reduce((acc, j) => acc + (j.estrelas?.estrelas || 0), 0);
    return {
      mediaRanking: jogadores.length ? totalRanking / jogadores.length : 0,
      mediaEstrelas: jogadores.length ? totalEstrelas / jogadores.length : 0,
    };
  }

  // Componente SortablePlayer
  function SortablePlayer({ jogador, timeId }: { jogador: Participante; timeId: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: jogador.id,
    });
    const habilidade = jogador.estrelas?.habilidade ?? null;
    const fisico = jogador.estrelas?.fisico ?? null;
    const nivelFinal = jogador.estrelas?.nivelFinal ?? jogador.estrelas?.estrelas ?? 0;
    const temNivel = typeof habilidade === "number" && typeof fisico === "number";
    const tooltip = `Habilidade ${typeof habilidade === "number" ? habilidade : "-"}, Fisico ${typeof fisico === "number" ? fisico : "-"}`;
    const nivelTexto = formatNivel(temNivel ? nivelFinal : null);
    const posicaoPrincipal = jogador.posicaoPrincipal;
    const usandoSecundaria = posicaoPrincipal && posicaoPrincipal !== jogador.posicao;
    const posicaoLabel = usandoSecundaria ? `${jogador.posicao} (sec)` : jogador.posicao;
    const posicaoTitle = usandoSecundaria
      ? `Posicao principal: ${posicaoPrincipal}`
      : jogador.posicao;

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
        className="flex items-center gap-1 bg-zinc-900 rounded px-2 py-1 cursor-grab"
      >
        <Image
          src={jogador.foto}
          alt={jogador.nome}
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-sm font-semibold">{jogador.nome}</span>
        <span className="text-xs text-gray-400" title={posicaoTitle}>
          {posicaoLabel}
        </span>
        <div className="ml-2 flex items-center gap-1" title={tooltip}>
          <StarRatingDisplay value={nivelFinal} size={12} />
          <span className="text-xs text-yellow-300">Nivel {nivelTexto}</span>
        </div>
        {editando && (
          <select
            className="ml-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white"
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
      <div className="flex items-center mb-2 gap-3">
        <h2 className="text-lg font-bold text-yellow-400">Times Gerados</h2>
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded text-xs"
          onClick={() => setEditando(!editando)}
        >
          {editando ? "Cancelar Edição" : "Editar Times"}
        </button>
        {editando && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded text-xs"
            onClick={salvarEdicao}
            disabled={alertaTimesInvalidos()}
            title={
              alertaTimesInvalidos() ? "Todos os times devem ter o mesmo número de jogadores" : ""
            }
          >
            Salvar Alterações
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {timesEdit.map((time) => {
          // Ordenar jogadores na ordem desejada!
          const jogadoresOrdenados = ordenarJogadores(time.jogadores);
          // Calcular médias atualizadas em tempo real
          const { mediaRanking, mediaEstrelas } = calcularMedias(jogadoresOrdenados);

          return (
            <div
              key={time.id}
              className={`bg-[#232323] rounded-xl p-4 shadow flex flex-col gap-2 ${
                editando && jogadoresPorTime && time.jogadores.length !== jogadoresPorTime
                  ? "border-2 border-red-500"
                  : ""
              }`}
            >
              <h3 className="text-yellow-400 font-bold text-xl mb-2">{time.nome}</h3>
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
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  Média Ranking: <b className="text-white">{mediaRanking.toFixed(1)}</b>
                </span>
                <span>
                  Média Estrelas: <b className="text-yellow-400">{mediaEstrelas.toFixed(1)}</b>
                </span>
              </div>
              {editando && jogadoresPorTime && time.jogadores.length !== jogadoresPorTime && (
                <span className="text-xs text-red-400 mt-1">
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

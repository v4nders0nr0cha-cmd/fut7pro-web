"use client";

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import CalendarioHistorico from "@/components/partidas/CalendarioHistorico";
import ModalEditarPartida, { type PartidaFormValues } from "@/components/admin/ModalEditarPartida";
import { usePartidas } from "@/hooks/usePartidas";
import type { Partida } from "@/types/partida";

type JogadorEstatistica = PartidaFormValues["jogadoresA"][number];

function serializeJogadores(players: JogadorEstatistica[], fallback?: string) {
  if (!players || players.length === 0) {
    return fallback ?? "[]";
  }

  const normalized = players.map((player) => ({
    id: player.id,
    nome: player.nome,
    foto: player.foto ?? null,
    posicao: player.posicao ?? null,
    apelido: player.apelido ?? null,
    status: player.status ?? null,
    gols: Number.isFinite(player.gols) ? player.gols : 0,
    assistencias: Number.isFinite(player.assistencias) ? player.assistencias : 0,
  }));

  return JSON.stringify(normalized);
}

function buildDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toStartOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a: Date, b: Date) {
  return toStartOfDay(a).getTime() === toStartOfDay(b).getTime();
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
}

function serializeDestaques(input: string) {
  const items = input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (items.length === 0) {
    return undefined;
  }
  return JSON.stringify(items);
}

function buildPayload(values: PartidaFormValues, base?: Partida | null): Partial<Partida> {
  const datePart = values.data ? new Date(`${values.data}T00:00:00`) : new Date();
  const dateTime = new Date(datePart);
  if (values.horario) {
    const [hours, minutes] = values.horario.split(":").map((item) => Number(item));
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      dateTime.setHours(hours, minutes, 0, 0);
    }
  }

  const local = values.local.trim();
  const payload: Partial<Partida> = {
    data: dateTime.toISOString(),
    horario: values.horario,
    timeA: values.timeA,
    timeB: values.timeB,
    golsTimeA: values.golsTimeA,
    golsTimeB: values.golsTimeB,
    finalizada: values.finalizada,
  };

  payload.jogadoresA = serializeJogadores(values.jogadoresA, base?.jogadoresA ?? "[]");
  payload.jogadoresB = serializeJogadores(values.jogadoresB, base?.jogadoresB ?? "[]");

  if (local) {
    payload.local = local;
  } else {
    payload.local = undefined;
  }

  const destaquesA = serializeDestaques(values.destaquesA);
  const destaquesB = serializeDestaques(values.destaquesB);
  payload.destaquesA = destaquesA;
  payload.destaquesB = destaquesB;

  return payload;
}

export default function AdminHistoricoPartidasPage() {
  const { partidas, isLoading, isError, error, addPartida, updatePartida, deletePartida } =
    usePartidas();

  const sortedPartidas = useMemo(() => {
    return [...partidas].sort((a, b) => {
      const diff = new Date(b.data).getTime() - new Date(a.data).getTime();
      if (diff !== 0) {
        return diff;
      }
      return (a.horario || "").localeCompare(b.horario || "");
    });
  }, [partidas]);

  const diasComPartida = useMemo(() => {
    const map = new Map<string, Date>();
    sortedPartidas.forEach((partida) => {
      const data = new Date(partida.data);
      const key = buildDayKey(data);
      if (!map.has(key)) {
        map.set(key, toStartOfDay(data));
      }
    });
    return Array.from(map.values()).sort((a, b) => b.getTime() - a.getTime());
  }, [sortedPartidas]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (diasComPartida.length === 0) {
      setSelectedDate(undefined);
      return;
    }
    if (selectedDate && diasComPartida.some((date) => sameDay(date, selectedDate))) {
      return;
    }
    setSelectedDate(diasComPartida[0]);
  }, [diasComPartida, selectedDate]);

  const partidasDoFiltro = useMemo(() => {
    if (!selectedDate) {
      return sortedPartidas;
    }
    return sortedPartidas.filter((partida) => sameDay(new Date(partida.data), selectedDate));
  }, [sortedPartidas, selectedDate]);

  const partidasAgrupadas = useMemo(() => {
    const groups = new Map<string, { date: Date; partidas: Partida[] }>();
    partidasDoFiltro.forEach((partida) => {
      const data = new Date(partida.data);
      const key = buildDayKey(data);
      if (!groups.has(key)) {
        groups.set(key, { date: toStartOfDay(data), partidas: [] });
      }
      groups.get(key)!.partidas.push(partida);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        partidas: group.partidas.sort((a, b) => (a.horario || "").localeCompare(b.horario || "")),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [partidasDoFiltro]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    partida: Partida | null;
    defaultDate?: Date;
  }>(() => ({
    open: false,
    mode: "create",
    partida: null,
    defaultDate: undefined,
  }));
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openCreateModal = () => {
    setModalState({ open: true, mode: "create", partida: null, defaultDate: selectedDate });
    setModalError(null);
  };

  const openEditModal = (partida: Partida) => {
    setModalState({ open: true, mode: "edit", partida });
    setModalError(null);
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
    setModalError(null);
  };

  const handleModalSubmit = async (values: PartidaFormValues) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (modalState.mode === "create") {
        await addPartida(buildPayload(values));
        toast.success("Partida cadastrada");
      } else if (modalState.partida) {
        await updatePartida(modalState.partida.id, buildPayload(values, modalState.partida));
        toast.success("Partida atualizada");
      }
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar partida";
      setModalError(message);
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (partida: Partida) => {
    const confirmMessage = `Deseja excluir a partida ${partida.timeA} x ${partida.timeB}?`;
    if (typeof window !== "undefined" && !window.confirm(confirmMessage)) {
      return;
    }
    try {
      await deletePartida(partida.id);
      toast.success("Partida removida");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover partida";
      toast.error(message);
    }
  };

  return (
    <>
      <Head>
        <title>Historico de Partidas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Corrija placares, status, gols e assistencias das partidas do seu racha. Painel do Presidente Fut7Pro."
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto text-white">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
            Historico de Partidas (Admin)
          </h1>
          <p className="text-base md:text-lg text-neutral-300">
            Revise resultados, finalize confrontos e mantenha o historico do racha atualizado.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              ref={calendarButtonRef}
              type="button"
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-black font-semibold hover:bg-yellow-300 transition"
              onClick={() => setCalendarOpen((open) => !open)}
            >
              Selecionar data
            </button>
            {selectedDate && (
              <span className="text-sm text-neutral-300">
                Exibindo: {formatDateLabel(selectedDate)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
            onClick={openCreateModal}
          >
            Nova partida
          </button>
        </div>

        <CalendarioHistorico
          diasComPartida={diasComPartida}
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date ?? undefined);
            setCalendarOpen(false);
          }}
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          anchorRef={calendarButtonRef}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error ?? "Nao foi possivel carregar as partidas."}
          </div>
        ) : partidasAgrupadas.length === 0 ? (
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300">
            Nenhuma partida publicada ate o momento.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {partidasAgrupadas.map((group) => (
              <section
                key={group.date.getTime()}
                className="rounded-xl border border-neutral-800 bg-[#171717] p-4"
              >
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                  <span className="text-lg font-semibold text-yellow-400">
                    {formatDateLabel(group.date)}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {group.partidas.length} partida(s)
                  </span>
                </header>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-neutral-800 text-neutral-200">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Time A</th>
                        <th className="px-3 py-2 text-center">Placar</th>
                        <th className="px-3 py-2 text-left">Time B</th>
                        <th className="px-3 py-2 text-center">Horario</th>
                        <th className="px-3 py-2 text-center">Local</th>
                        <th className="px-3 py-2 text-center">Status</th>
                        <th className="px-3 py-2 text-center">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.partidas.map((partida, index) => (
                        <tr
                          key={partida.id}
                          className="border-b border-neutral-800 hover:bg-neutral-800/60"
                        >
                          <td className="px-3 py-2 font-semibold text-neutral-300">{index + 1}</td>
                          <td className="px-3 py-2 font-semibold text-neutral-100">
                            {partida.timeA}
                          </td>
                          <td className="px-3 py-2 text-center text-neutral-100">
                            {partida.golsTimeA}
                            <span className="mx-1 text-yellow-400">x</span>
                            {partida.golsTimeB}
                          </td>
                          <td className="px-3 py-2 font-semibold text-neutral-100">
                            {partida.timeB}
                          </td>
                          <td className="px-3 py-2 text-center text-neutral-400">
                            {partida.horario || "--"}
                          </td>
                          <td className="px-3 py-2 text-center text-neutral-400">
                            {partida.local || "Definir"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`rounded-lg px-3 py-1 text-xs font-semibold ${partida.finalizada ? "bg-emerald-600 text-white" : "bg-yellow-500/30 text-yellow-300"}`}
                            >
                              {partida.finalizada ? "Concluido" : "Agendado"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-400 transition"
                                onClick={() => openEditModal(partida)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 transition"
                                onClick={() => handleDelete(partida)}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <ModalEditarPartida
        isOpen={modalState.open}
        mode={modalState.mode}
        partida={modalState.partida}
        defaultDate={modalState.defaultDate}
        loading={modalLoading}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}

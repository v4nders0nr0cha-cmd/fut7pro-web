"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCalendarPlus, FaPlus } from "react-icons/fa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import ModalEditarPartida, { type PartidaFormValues } from "@/components/admin/ModalEditarPartida";
import { usePartidas } from "@/hooks/usePartidas";
import type { Partida } from "@/types/partida";

function normalizeDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function isSameDay(date: string, reference: Date | null) {
  if (!reference) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  return (
    parsed.getFullYear() === reference.getFullYear() &&
    parsed.getMonth() === reference.getMonth() &&
    parsed.getDate() === reference.getDate()
  );
}

function serializeJogadores(players: PartidaFormValues["jogadoresA"], fallback?: string) {
  if (!players || players.length === 0) {
    return fallback ?? "[]";
  }

  const normalized = players.map((player, index) => ({
    id: player.id || `${player.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
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

  const payload: Partial<Partida> = {
    data: dateTime.toISOString(),
    horario: values.horario,
    local: values.local.trim() || undefined,
    timeA: values.timeA,
    timeB: values.timeB,
    golsTimeA: Number(values.golsTimeA ?? 0) || 0,
    golsTimeB: Number(values.golsTimeB ?? 0) || 0,
    finalizada: values.finalizada,
  };

  payload.jogadoresA = serializeJogadores(values.jogadoresA, base?.jogadoresA ?? "[]");
  payload.jogadoresB = serializeJogadores(values.jogadoresB, base?.jogadoresB ?? "[]");

  payload.destaquesA = serializeDestaques(values.destaquesA);
  payload.destaquesB = serializeDestaques(values.destaquesB);

  return payload;
}

export default function PartidaClassicaPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const referenceDate = useMemo(() => normalizeDate(selectedDate), [selectedDate]);

  const { partidas, isLoading, isError, error, addPartida } = usePartidas();

  const partidasDoDia = useMemo(() => {
    if (!referenceDate) return [];

    return partidas
      .filter((partida) => partida.data && isSameDay(partida.data, referenceDate))
      .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [partidas, referenceDate]);

  const handleOpenModal = () => {
    setModalError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (modalLoading) return;
    setModalOpen(false);
    setModalError(null);
  };

  const handleSubmit = async (values: PartidaFormValues) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const payload = buildPayload(values, null);
      await addPartida(payload);
      setModalOpen(false);
      toast.success("Partida cadastrada com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao criar a partida.";
      setModalError(message);
    } finally {
      setModalLoading(false);
    }
  };

  const formattedDateLabel = referenceDate
    ? format(referenceDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <>
      <Head>
        <title>Registrar Rodada | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre partidas clássicas do seu racha e mantenha o histórico atualizado no Fut7Pro."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="px-4 py-6 md:px-8 md:py-10 bg-fundo min-h-screen">
        <section className="max-w-5xl mx-auto">
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                Registrar Rodada Clássica
              </h1>
              <p className="text-sm text-neutral-300 max-w-2xl">
                Use esta página para lançar rapidamente partidas amistosas ou rodadas especiais.
                Após o cadastro você pode ajustar escalações e estatísticas em “Histórico”.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded transition"
            >
              <FaPlus /> Nova partida
            </button>
          </header>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex flex-col text-sm text-neutral-300">
              <span className="font-semibold mb-1">Data da rodada</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
            {formattedDateLabel && (
              <div className="flex items-center gap-2 text-neutral-300 text-sm">
                <FaCalendarPlus className="text-yellow-400" />
                <span className="capitalize">{formattedDateLabel}</span>
              </div>
            )}
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-neutral-100 mb-3">
              Partidas do dia selecionado
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
                {error ?? "Não foi possível carregar as partidas."}
              </div>
            ) : partidasDoDia.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-300">
                Nenhuma partida cadastrada para esta data ainda. Clique em “Nova partida” para
                começar.
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-800 text-neutral-300 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Confronto</th>
                      <th className="px-3 py-2 text-left">Horário</th>
                      <th className="px-3 py-2 text-left">Local</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidasDoDia.map((partida, index) => (
                      <tr key={partida.id} className="border-t border-neutral-800">
                        <td className="px-3 py-2 text-neutral-400">{index + 1}</td>
                        <td className="px-3 py-2 font-semibold text-neutral-100">
                          <span>{partida.timeA}</span>
                          <span className="mx-2 text-yellow-400 font-bold">
                            {partida.golsTimeA} x {partida.golsTimeB}
                          </span>
                          <span>{partida.timeB}</span>
                        </td>
                        <td className="px-3 py-2 text-neutral-300">{partida.horario || "–"}</td>
                        <td className="px-3 py-2 text-neutral-300">{partida.local || "Definir"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${
                              partida.finalizada
                                ? "bg-emerald-600/20 text-emerald-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {partida.finalizada ? "Concluída" : "Agendada"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-4 text-xs text-neutral-400">
              Precisa editar resultado, destaques ou escalações? Abra o menu “Partidas &gt;
              Histórico” e ajuste com o editor completo.
            </p>
          </section>
        </section>
      </main>

      <ModalEditarPartida
        isOpen={modalOpen}
        mode="create"
        partida={null}
        defaultDate={referenceDate ?? new Date()}
        loading={modalLoading}
        errorMessage={modalError}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}

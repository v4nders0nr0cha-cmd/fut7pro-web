"use client";

import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import type { Partida } from "@/types/partida";

export type JogadorEstatistica = {
  id: string;
  nome: string;
  foto?: string | null;
  posicao?: string | null;
  apelido?: string | null;
  status?: string | null;
  gols: number;
  assistencias: number;
};

export type PartidaFormValues = {
  data: string;
  horario: string;
  local: string;
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  finalizada: boolean;
  destaquesA: string;
  destaquesB: string;
  jogadoresA: JogadorEstatistica[];
  jogadoresB: JogadorEstatistica[];
};

interface ModalEditarPartidaProps {
  isOpen: boolean;
  mode: "create" | "edit";
  partida?: Partida | null;
  defaultDate?: Date;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: PartidaFormValues) => Promise<void> | void;
}

type FormState = Omit<PartidaFormValues, "jogadoresA" | "jogadoresB">;

type TeamKey = "A" | "B";

type StatKey = "gols" | "assistencias";

function parseJogadores(raw?: string | null): JogadorEstatistica[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const nome = typeof record.nome === "string" && record.nome.trim().length > 0 ? record.nome.trim() : `Jogador ${index + 1}`;
        const id = typeof record.id === "string" && record.id.trim().length > 0 ? record.id.trim() : `${nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
        const foto = typeof record.foto === "string" ? record.foto : null;
        const posicao = typeof record.posicao === "string" ? record.posicao : null;
        const apelido = typeof record.apelido === "string" ? record.apelido : null;
        const status = typeof record.status === "string" ? record.status : null;
        const gols = typeof record.gols === "number" ? record.gols : Number(record.gols ?? 0) || 0;
        const assistencias = typeof record.assistencias === "number" ? record.assistencias : Number(record.assistencias ?? 0) || 0;
        return {
          id,
          nome,
          foto,
          posicao,
          apelido,
          status,
          gols: Number.isFinite(gols) && gols > 0 ? gols : 0,
          assistencias: Number.isFinite(assistencias) && assistencias > 0 ? assistencias : 0,
        } satisfies JogadorEstatistica;
      })
      .filter((player): player is JogadorEstatistica => Boolean(player));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao interpretar jogadores da partida", error);
    }
    return [];
  }
}

function formatTeamLabel(team: TeamKey, defaultName: string) {
  const fallback = team === "A" ? 'A' : 'B';
  const normalized = defaultName && defaultName.trim().length > 0 ? defaultName : fallback;
  return team === "A" ? `Time ${normalized}` : `Adversário ${normalized}`;
}

function sumStats(players: JogadorEstatistica[], key: StatKey) {
  return players.reduce((total, player) => total + (player[key] ?? 0), 0);
}

export default function ModalEditarPartida({
  isOpen,
  mode,
  partida,
  defaultDate,
  loading = false,
  errorMessage,
  onClose,
  onSubmit,
}: ModalEditarPartidaProps) {
  const fallbackDate = useMemo(() => defaultDate ?? new Date(), [defaultDate]);
  const [formValues, setFormValues] = useState<FormState>(() => ({
    data: formatDateInput(fallbackDate),
    horario: "19:00",
    local: "",
    timeA: "",
    timeB: "",
    golsTimeA: 0,
    golsTimeB: 0,
    finalizada: false,
    destaquesA: "",
    destaquesB: "",
  }));
  const [playersA, setPlayersA] = useState<JogadorEstatistica[]>([]);
  const [playersB, setPlayersB] = useState<JogadorEstatistica[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const baseDate = partida ? new Date(partida.data) : fallbackDate;
    const parsedA = parseJogadores(partida?.jogadoresA);
    const parsedB = parseJogadores(partida?.jogadoresB);

    setFormValues({
      data: formatDateInput(baseDate),
      horario: normalizeHorario(partida?.horario),
      local: partida?.local ?? "",
      timeA: partida?.timeA ?? "",
      timeB: partida?.timeB ?? "",
      golsTimeA: partida?.golsTimeA ?? 0,
      golsTimeB: partida?.golsTimeB ?? 0,
      finalizada: partida?.finalizada ?? false,
      destaquesA: stringifyDestaques(partida?.destaquesA),
      destaquesB: stringifyDestaques(partida?.destaquesB),
    });
    setPlayersA(parsedA);
    setPlayersB(parsedB);
    setLocalError(null);
  }, [isOpen, partida, fallbackDate]);

  function handleInputChange(key: keyof FormState, value: string | number | boolean) {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handlePlayerStatChange(team: TeamKey, index: number, field: StatKey, event: ChangeEvent<HTMLInputElement>) {
    const value = Math.max(0, Number(event.target.value) || 0);
    if (team === "A") {
      setPlayersA((prev) =>
        prev.map((player, idx) =>
          idx === index
            ? {
                ...player,
                [field]: value,
              }
            : player,
        ),
      );
    } else {
      setPlayersB((prev) =>
        prev.map((player, idx) =>
          idx === index
            ? {
                ...player,
                [field]: value,
              }
            : player,
        ),
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const timeA = formValues.timeA.trim();
    const timeB = formValues.timeB.trim();

    if (!timeA || !timeB) {
      setLocalError("Informe os nomes dos dois times");
      return;
    }

    try {
      setLocalError(null);
      await onSubmit({
        ...formValues,
        timeA,
        timeB,
        jogadoresA: playersA,
        jogadoresB: playersB,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Falha ao salvar partida", error);
      }
    }
  }

  if (!isOpen) {
    return null;
  }

  const title = mode === "create" ? "Cadastrar nova partida" : "Editar partida";
  const actionLabel = mode === "create" ? "Cadastrar" : "Salvar alterações";

  const golsDistribuidosA = sumStats(playersA, "gols");
  const golsDistribuidosB = sumStats(playersB, "gols");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-[#111111] p-6 shadow-2xl border border-yellow-500/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
            <p className="text-sm text-neutral-400">Ajuste placar, data, local, status e as estatísticas individuais dos atletas.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-neutral-500 hover:text-yellow-400 transition"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Data
              <input
                type="date"
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                value={formValues.data}
                onChange={(event) => handleInputChange("data", event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Horário
              <input
                type="time"
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                value={formValues.horario}
                onChange={(event) => handleInputChange("horario", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Time A
              <input
                type="text"
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                value={formValues.timeA}
                onChange={(event) => handleInputChange("timeA", event.target.value)}
                placeholder="Nome do primeiro time"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Time B
              <input
                type="text"
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                value={formValues.timeB}
                onChange={(event) => handleInputChange("timeB", event.target.value)}
                placeholder="Nome do segundo time"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Local
              <input
                type="text"
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                placeholder="Arena Fut7"
                value={formValues.local}
                onChange={(event) => handleInputChange("local", event.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-300">
              <label className="flex flex-col gap-1">
                Gols Time A
                <input
                  type="number"
                  min={0}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                  value={formValues.golsTimeA}
                  onChange={(event) => handleInputChange("golsTimeA", Number(event.target.value))}
                />
                <span className="text-xs text-neutral-500">Distribuídos: {golsDistribuidosA}</span>
              </label>
              <label className="flex flex-col gap-1">
                Gols Time B
                <input
                  type="number"
                  min={0}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                  value={formValues.golsTimeB}
                  onChange={(event) => handleInputChange("golsTimeB", Number(event.target.value))}
                />
                <span className="text-xs text-neutral-500">Distribuídos: {golsDistribuidosB}</span>
              </label>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Destaques Time A
              <textarea
                className="min-h-[70px] rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                placeholder="Separe por vírgula"
                value={formValues.destaquesA}
                onChange={(event) => handleInputChange("destaquesA", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Destaques Time B
              <textarea
                className="min-h-[70px] rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                placeholder="Separe por vírgula"
                value={formValues.destaquesB}
                onChange={(event) => handleInputChange("destaquesB", event.target.value)}
              />
            </label>
          </section>

          <section className="space-y-6">
            <TeamStatsEditor
              teamKey="A"
              teamName={formValues.timeA || "A"}
              jogadores={playersA}
              onChange={handlePlayerStatChange}
            />
            <TeamStatsEditor
              teamKey="B"
              teamName={formValues.timeB || "B"}
              jogadores={playersB}
              onChange={handlePlayerStatChange}
            />
          </section>

          <label className="flex items-center gap-2 text-sm font-medium text-neutral-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-neutral-700 bg-neutral-900"
              checked={formValues.finalizada}
              onChange={(event) => handleInputChange("finalizada", event.target.checked)}
            />
            Partida finalizada
          </label>

          {localError && <p className="text-sm text-red-400">{localError}</p>}
          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

          <div className="flex flex-col-reverse md:flex-row md:justify-end md:items-center gap-3 pt-4">
            <button
              type="button"
              className="w-full md:w-auto rounded-lg border border-neutral-600 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full md:w-auto rounded-lg bg-yellow-400 px-6 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Salvando..." : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateInput(date: Date) {
  const iso = new Date(date);
  const year = iso.getFullYear();
  const month = String(iso.getMonth() + 1).padStart(2, "0");
  const day = String(iso.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeHorario(value?: string | null) {
  if (!value) return "19:00";
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const match = /^([0-2]?\d):([0-5]\d)/.exec(trimmed);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return "19:00";
}

function stringifyDestaques(value?: string | null) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao converter destaques", error);
    }
  }
  return value;
}

type TeamStatsEditorProps = {
  teamKey: TeamKey;
  teamName: string;
  jogadores: JogadorEstatistica[];
  onChange: (team: TeamKey, index: number, field: StatKey, event: ChangeEvent<HTMLInputElement>) => void;
};

function TeamStatsEditor({ teamKey, teamName, jogadores, onChange }: TeamStatsEditorProps) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-yellow-300">{formatTeamLabel(teamKey, teamName)}</h3>
        <span className="text-xs text-neutral-500">{jogadores.length} atleta(s)</span>
      </header>
      {jogadores.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhum jogador registrado para este time nesta partida.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {jogadores.map((player, index) => (
            <div
              key={player.id || `${teamKey}-${index}`}
              className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center rounded-lg border border-neutral-800 bg-[#202020] px-3 py-2"
            >
              <div className="flex items-center gap-3 sm:col-span-2">
                <Image
                  src={player.foto || "/images/logos/logo_fut7pro.png"}
                  alt={`Foto de ${player.nome}`}
                  width={36}
                  height={36}
                  className="rounded-full border border-neutral-700 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-200">{player.nome}</span>
                  {player.apelido && <span className="text-xs text-neutral-400">{player.apelido}</span>}
                </div>
              </div>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Gols
                <input
                  type="number"
                  min={0}
                  value={player.gols}
                  onChange={(event) => onChange(teamKey, index, "gols", event)}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Assistências
                <input
                  type="number"
                  min={0}
                  value={player.assistencias}
                  onChange={(event) => onChange(teamKey, index, "assistencias", event)}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

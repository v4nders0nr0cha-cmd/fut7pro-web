"use client";

import { useEffect, useMemo, useState } from "react";

type AgendaItem = {
  id: string;
  weekday: number;
  time: string;
};

type AgendaOption = AgendaItem & {
  label: string;
};

const DIAS_SEMANA_LABEL = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

function sortAgenda(items: AgendaItem[]) {
  return [...items].sort((a, b) => {
    if (a.weekday !== b.weekday) return a.weekday - b.weekday;
    return a.time.localeCompare(b.time);
  });
}

export function formatAgendaLabel(item: AgendaItem) {
  return `${DIAS_SEMANA_LABEL[item.weekday] ?? "Dia"} ${item.time}`;
}

function toAgendaOptions(items: AgendaItem[]): AgendaOption[] {
  return sortAgenda(items).map((item) => ({
    ...item,
    label: formatAgendaLabel(item),
  }));
}

type Props = {
  open: boolean;
  athleteName?: string;
  agendaItems: AgendaItem[];
  selectedAgendaIds: string[];
  onClose: () => void;
  onSave: (agendaIds: string[]) => void | Promise<void>;
  saving?: boolean;
  error?: string | null;
  title?: string;
  ariaLabel?: string;
};

export default function MensalistaDiasModal({
  open,
  athleteName,
  agendaItems,
  selectedAgendaIds,
  onClose,
  onSave,
  saving = false,
  error = null,
  title = "Editar dias do mensalista",
  ariaLabel = "Editar dias do mensalista",
}: Props) {
  const [diasDraft, setDiasDraft] = useState<string[]>([]);

  const agendaOptions = useMemo(() => toAgendaOptions(agendaItems), [agendaItems]);

  useEffect(() => {
    if (!open) return;
    const availableIds = new Set(agendaOptions.map((item) => item.id));
    const filtered = selectedAgendaIds.filter((id) => availableIds.has(id));
    setDiasDraft(filtered);
  }, [agendaOptions, open, selectedAgendaIds]);

  const orderedSelection = useMemo(
    () => agendaOptions.map((item) => item.id).filter((id) => diasDraft.includes(id)),
    [agendaOptions, diasDraft]
  );

  const toggleDia = (id: string) => {
    setDiasDraft((prev) =>
      prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]
    );
  };

  const marcarTodos = () => {
    setDiasDraft(agendaOptions.map((item) => item.id));
  };

  const handleSave = () => {
    if (saving) return;
    void onSave(orderedSelection);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-2"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
        <p className="text-sm text-zinc-400 mb-4">
          {athleteName
            ? `Selecione os dias em que ${athleteName} paga como mensalista.`
            : "Selecione os dias em que o atleta paga como mensalista."}
        </p>

        {agendaOptions.length === 0 ? (
          <div className="text-sm text-zinc-400">
            Nenhum dia cadastrado. Configure os dias e horarios no racha.
          </div>
        ) : (
          <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-1">
            {agendaOptions.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400 rounded-none"
                  checked={diasDraft.includes(item.id)}
                  onChange={() => toggleDia(item.id)}
                  disabled={saving}
                  aria-label={item.label}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-6">
          <button
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={marcarTodos}
            disabled={agendaOptions.length === 0 || saving}
          >
            Marcar todos
          </button>
          <div className="flex gap-2">
            <button
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={agendaOptions.length === 0 || saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

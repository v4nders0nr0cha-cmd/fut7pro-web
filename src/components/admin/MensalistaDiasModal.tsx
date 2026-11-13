"use client";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

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
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
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
    <Fut7DialogBase
      open
      title={title}
      onClose={onClose}
      description={
        athleteName
          ? `Selecione os dias em que ${athleteName} paga mensalidade.`
          : "Selecione os dias em que o atleta paga mensalidade."
      }
      footer={
        <>
          <button
            type="button"
            className="col-span-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:mr-auto"
            onClick={marcarTodos}
            disabled={agendaOptions.length === 0 || saving}
          >
            Marcar todos
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300"
            onClick={handleSave}
            disabled={agendaOptions.length === 0 || saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      {agendaOptions.length === 0 ? (
        <div className="text-sm text-zinc-400">
          Nenhum dia cadastrado. Configure os dias e horários no racha.
        </div>
      ) : (
        <div className="space-y-3">
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
    </Fut7DialogBase>
  );
}

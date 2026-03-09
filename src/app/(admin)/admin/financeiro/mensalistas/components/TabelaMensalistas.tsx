"use client";

import { useEffect, useMemo, useRef } from "react";

export type MensalistaResumo = {
  id: string;
  nome: string;
  status: "Em dia" | "Inadimplente" | "A receber";
  valor: number;
  ultimoPagamento: string | null;
};

type AgendaItem = {
  id: string;
  weekday: number;
  time: string;
};

type Props = {
  mensalistas: MensalistaResumo[];
  agendaItems: AgendaItem[];
  getDiasSelecionados: (id: string) => string[];
  pagamentos: Record<string, boolean>;
  onTogglePagamento: (id: string) => void | Promise<void>;
  onTogglePagamentoAll: (checked: boolean, athleteIds: string[]) => void | Promise<void>;
  onOpenGestaoDias: (athleteId: string) => void;
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

function formatAgendaLabel(weekday: number, time: string) {
  const dia = DIAS_SEMANA_LABEL[weekday] ?? "Dia";
  const hora = (time || "").slice(0, 5);
  return `${dia} ${hora}`.trim();
}

export default function TabelaMensalistas({
  mensalistas,
  agendaItems,
  getDiasSelecionados,
  pagamentos,
  onTogglePagamento,
  onTogglePagamentoAll,
  onOpenGestaoDias,
}: Props) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const agendaOptions = useMemo(() => {
    return [...agendaItems]
      .sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.time.localeCompare(b.time);
      })
      .map((item) => ({
        ...item,
        label: formatAgendaLabel(item.weekday, item.time),
      }));
  }, [agendaItems]);

  const agendaLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    agendaOptions.forEach((item) => {
      map[item.id] = item.label;
    });
    return map;
  }, [agendaOptions]);

  const checkedCount = useMemo(
    () => mensalistas.reduce((count, mensalista) => count + (pagamentos[mensalista.id] ? 1 : 0), 0),
    [mensalistas, pagamentos]
  );

  const allChecked = mensalistas.length > 0 && checkedCount === mensalistas.length;
  const someChecked = checkedCount > 0 && checkedCount < mensalistas.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  const athleteIds = useMemo(() => mensalistas.map((mensalista) => mensalista.id), [mensalistas]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="px-2 py-2 text-left">Nome</th>
            <th className="px-2 py-2 text-left">Status</th>
            <th className="px-2 py-2 text-left">Valor</th>
            <th className="px-2 py-2 text-left">Dias vinculados</th>
            <th className="px-2 py-2 text-left">
              <label className="flex items-center gap-2">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="h-4 w-4 rounded-none accent-yellow-400"
                  checked={allChecked}
                  onChange={(event) => void onTogglePagamentoAll(event.target.checked, athleteIds)}
                  aria-label="Marcar todos como pago"
                  title="Marcar todos"
                  disabled={mensalistas.length === 0}
                />
                <span>Pago</span>
              </label>
            </th>
            <th className="px-2 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {mensalistas.map((m) => {
            const diasIds = getDiasSelecionados(m.id);
            const diasLabel =
              diasIds.length > 0
                ? diasIds.map((id) => agendaLabelById[id] || "Dia removido").join(", ")
                : "Nenhum dia vinculado";

            return (
              <tr key={m.id} className="rounded-lg bg-neutral-800 transition hover:bg-neutral-700">
                <td className="px-2 py-1 font-semibold">{m.nome}</td>
                <td
                  className={
                    "px-2 py-1 font-bold " +
                    (m.status === "Em dia"
                      ? "text-green-400"
                      : m.status === "A receber"
                        ? "text-yellow-400"
                        : "text-red-400")
                  }
                >
                  {m.status}
                </td>
                <td className="px-2 py-1">R$ {m.valor.toFixed(2)}</td>
                <td className="px-2 py-1 text-xs text-zinc-200">{diasLabel}</td>
                <td className="px-2 py-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded-none accent-yellow-400"
                    checked={Boolean(pagamentos[m.id])}
                    onChange={() => void onTogglePagamento(m.id)}
                    aria-label={`Marcar ${m.nome} como pago`}
                  />
                </td>
                <td className="px-2 py-1">
                  <button
                    className="text-xs text-yellow-400 hover:underline"
                    onClick={() => onOpenGestaoDias(m.id)}
                  >
                    Editar em Jogadores
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

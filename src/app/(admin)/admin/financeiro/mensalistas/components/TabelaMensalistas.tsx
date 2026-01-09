"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  onSaveDias: (id: string, diasSelecionados: string[]) => void | Promise<void>;
  pagamentos: Record<string, boolean>;
  onTogglePagamento: (id: string) => void | Promise<void>;
  onTogglePagamentoAll: (checked: boolean, athleteIds: string[]) => void | Promise<void>;
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

export default function TabelaMensalistas({
  mensalistas,
  agendaItems,
  getDiasSelecionados,
  onSaveDias,
  pagamentos,
  onTogglePagamento,
  onTogglePagamentoAll,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJogador, setModalJogador] = useState<MensalistaResumo | null>(null);
  const [diasDraft, setDiasDraft] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const agendaOptions = useMemo(() => {
    return [...agendaItems]
      .sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.time.localeCompare(b.time);
      })
      .map((item) => ({
        ...item,
        label: `${DIAS_SEMANA_LABEL[item.weekday] ?? "Dia"} ${item.time}`,
      }));
  }, [agendaItems]);

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

  const abrirModalDias = (mensalista: MensalistaResumo) => {
    const selected = getDiasSelecionados(mensalista.id);
    const available = new Set(agendaOptions.map((item) => item.id));
    const filtered = selected.filter((id) => available.has(id));
    setDiasDraft(filtered);
    setModalJogador(mensalista);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setModalJogador(null);
    setDiasDraft([]);
  };

  const toggleDia = (id: string) => {
    setDiasDraft((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const marcarTodos = () => {
    setDiasDraft(agendaOptions.map((item) => item.id));
  };

  const salvarDias = () => {
    if (!modalJogador) return;
    const ordered = agendaOptions.map((item) => item.id).filter((id) => diasDraft.includes(id));
    void onSaveDias(modalJogador.id, ordered);
    fecharModal();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="text-left px-2 py-2">Nome</th>
            <th className="text-left px-2 py-2">Status</th>
            <th className="text-left px-2 py-2">Valor</th>
            <th className="text-left px-2 py-2">
              <label className="flex items-center gap-2">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400 rounded-none"
                  checked={allChecked}
                  onChange={(event) => void onTogglePagamentoAll(event.target.checked, athleteIds)}
                  aria-label="Marcar todos como pago"
                  title="Marcar todos"
                  disabled={mensalistas.length === 0}
                />
                <span>Pago</span>
              </label>
            </th>
            <th className="text-left px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {mensalistas.map((m) => (
            <tr key={m.id} className="bg-neutral-800 hover:bg-neutral-700 transition rounded-lg">
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
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400 rounded-none cursor-pointer"
                  checked={Boolean(pagamentos[m.id])}
                  onChange={() => void onTogglePagamento(m.id)}
                  aria-label={`Marcar ${m.nome} como pago`}
                />
              </td>
              <td className="px-2 py-1">
                <button
                  className="text-xs text-yellow-400 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => abrirModalDias(m)}
                  disabled={agendaOptions.length === 0}
                  title={
                    agendaOptions.length === 0
                      ? "Cadastre dias e horarios do racha para habilitar"
                      : "Definir dias"
                  }
                >
                  Definir dias
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && modalJogador && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          aria-modal="true"
          aria-label="Dias de mensalista"
          tabIndex={-1}
        >
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-lg mx-2 relative">
            <h2 className="text-xl font-bold text-white mb-1">Dias de mensalista</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Selecione os dias em que {modalJogador.nome} paga como mensalista.
            </p>

            {agendaOptions.length === 0 ? (
              <div className="text-sm text-zinc-400">
                Nenhum dia cadastrado. Configure os dias e horarios no racha.
              </div>
            ) : (
              <div className="space-y-2">
                {agendaOptions.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-yellow-400 rounded-none"
                      checked={diasDraft.includes(item.id)}
                      onChange={() => toggleDia(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-6">
              <button
                className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={marcarTodos}
                disabled={agendaOptions.length === 0}
              >
                Marcar todos
              </button>
              <div className="flex gap-2">
                <button
                  className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded px-4 py-2 text-sm font-semibold transition"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={salvarDias}
                  disabled={agendaOptions.length === 0}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MensalistaDiasModal from "@/components/admin/MensalistaDiasModal";

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
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const agendaOrdenada = useMemo(() => {
    return [...agendaItems].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });
  }, [agendaItems]);

  const agendaIds = useMemo(() => agendaOrdenada.map((item) => item.id), [agendaOrdenada]);

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
    setModalJogador(mensalista);
    setModalError(null);
    setModalSaving(false);
    setModalOpen(true);
  };

  const fecharModal = () => {
    if (modalSaving) return;
    setModalOpen(false);
    setModalJogador(null);
    setModalError(null);
    setModalSaving(false);
  };

  const modalSelectedDias = useMemo(() => {
    if (!modalJogador) return [];
    const selected = getDiasSelecionados(modalJogador.id);
    const available = new Set(agendaIds);
    return selected.filter((id) => available.has(id));
  }, [agendaIds, getDiasSelecionados, modalJogador]);

  const salvarDias = async (diasSelecionados: string[]) => {
    if (!modalJogador || modalSaving) return;
    setModalSaving(true);
    setModalError(null);
    try {
      await onSaveDias(modalJogador.id, diasSelecionados);
      setModalOpen(false);
      setModalJogador(null);
    } catch (saveError) {
      setModalError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar os dias do mensalista."
      );
    } finally {
      setModalSaving(false);
    }
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
                  disabled={agendaOrdenada.length === 0}
                  title={
                    agendaOrdenada.length === 0
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

      <MensalistaDiasModal
        open={modalOpen && Boolean(modalJogador)}
        athleteName={modalJogador?.nome}
        agendaItems={agendaOrdenada}
        selectedAgendaIds={modalSelectedDias}
        onClose={fecharModal}
        onSave={salvarDias}
        saving={modalSaving}
        error={modalError}
        ariaLabel="Editar dias do mensalista"
      />
    </div>
  );
}

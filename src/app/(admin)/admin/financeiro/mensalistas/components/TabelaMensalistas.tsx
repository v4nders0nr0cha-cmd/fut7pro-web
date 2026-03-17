"use client";

import { useMemo, useState } from "react";
import MensalistaDiasModal from "@/components/admin/MensalistaDiasModal";

export type MensalistaResumo = {
  id: string;
  nome: string;
  valor: number;
  statusPagamento: "pago" | "pendente";
  pagamentoData: string | null;
  diasResumo: string;
  jogosNoMes: number;
  classificacaoDia: "segunda" | "sabado" | "segunda-sabado" | "outros";
  ultimoLancamentoId?: string | null;
  marcadoSemLancamento?: boolean;
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
  onRegistrarPagamento: (athleteId: string) => void | Promise<void>;
  onVerLancamento: (lancamentoId: string, athleteId: string) => void;
  onCancelarPagamento?: (athleteId: string) => void | Promise<void>;
  processandoAthleteId?: string | null;
  processandoLote?: boolean;
};

export default function TabelaMensalistas({
  mensalistas,
  agendaItems,
  getDiasSelecionados,
  onSaveDias,
  onRegistrarPagamento,
  onVerLancamento,
  onCancelarPagamento,
  processandoAthleteId,
  processandoLote = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJogador, setModalJogador] = useState<MensalistaResumo | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const agendaOrdenada = useMemo(() => {
    return [...agendaItems].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });
  }, [agendaItems]);

  const agendaIds = useMemo(() => agendaOrdenada.map((item) => item.id), [agendaOrdenada]);

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
          : "Não foi possível salvar os dias do mensalista."
      );
    } finally {
      setModalSaving(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value ?? 0);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const dateBase = value.includes("T") ? value.slice(0, 10) : value;
    if (!dateBase.includes("-")) return dateBase;
    return dateBase.split("-").reverse().join("/");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="text-left px-3 py-2">Atleta</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Valor</th>
            <th className="text-left px-3 py-2">Dias vinculados</th>
            <th className="text-left px-3 py-2">Pagamento</th>
            <th className="text-left px-3 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {mensalistas.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                Nenhum mensalista encontrado para o período selecionado.
              </td>
            </tr>
          )}
          {mensalistas.map((m) => (
            <tr
              key={m.id}
              className="bg-neutral-900/90 hover:bg-neutral-800 transition rounded-xl border border-neutral-800"
            >
              <td className="px-3 py-3">
                <div className="font-semibold text-white">{m.nome}</div>
                <div className="text-xs text-gray-400">{m.jogosNoMes} jogo(s) no mês</div>
              </td>
              <td className="px-3 py-3">
                {m.statusPagamento === "pago" ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Pago
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                    Pendente
                  </span>
                )}
              </td>
              <td className="px-3 py-3 text-base font-bold text-emerald-300">
                {formatCurrency(m.valor)}
              </td>
              <td className="px-3 py-3">
                <div className="text-xs text-gray-300 leading-relaxed">{m.diasResumo}</div>
                <button
                  className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => abrirModalDias(m)}
                  disabled={agendaOrdenada.length === 0 || Boolean(processandoAthleteId)}
                  title={
                    agendaOrdenada.length === 0
                      ? "Cadastre dias e horários do racha para habilitar."
                      : "Definir dias vinculados."
                  }
                >
                  Definir dias
                </button>
              </td>
              <td className="px-3 py-3">
                {m.statusPagamento === "pago" ? (
                  <div>
                    {m.pagamentoData ? (
                      <div className="text-xs font-semibold text-emerald-300">
                        Pago em {formatDate(m.pagamentoData)}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-emerald-300">
                        Pagamento confirmado
                      </div>
                    )}
                    {m.marcadoSemLancamento && (
                      <div className="mt-1 text-[11px] text-amber-300">
                        Marcado como pago sem lançamento financeiro.
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Aguardando pagamento</span>
                )}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {m.statusPagamento === "pago" ? (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50"
                        onClick={() =>
                          m.ultimoLancamentoId && onVerLancamento(m.ultimoLancamentoId, m.id)
                        }
                        disabled={!m.ultimoLancamentoId || Boolean(processandoAthleteId)}
                      >
                        Ver lançamento
                      </button>
                      {onCancelarPagamento && (
                        <button
                          type="button"
                          className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-50"
                          onClick={() => void onCancelarPagamento(m.id)}
                          disabled={processandoAthleteId === m.id || processandoLote}
                        >
                          {processandoAthleteId === m.id ? "Cancelando..." : "Cancelar pagamento"}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      className="rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-300 disabled:opacity-50"
                      onClick={() => void onRegistrarPagamento(m.id)}
                      disabled={processandoAthleteId === m.id || processandoLote}
                    >
                      {processandoAthleteId === m.id ? "Registrando..." : "Registrar pagamento"}
                    </button>
                  )}
                </div>
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

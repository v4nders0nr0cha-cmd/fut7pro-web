"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import { useRacha } from "@/context/RachaContext";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useJogadores } from "@/hooks/useJogadores";
import { useMensalistaCompetencias } from "@/hooks/useMensalistaCompetencias";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import {
  buildCompetenciaKey,
  extractMensalidadeMetadata,
  isMensalidadeLancamento,
} from "@/lib/financeiro/mensalistas";
import type { LancamentoFinanceiro } from "@/types/financeiro";
import type { Jogador } from "@/types/jogador";
import TabelaMensalistas, { type MensalistaResumo } from "./components/TabelaMensalistas";

const DIAS_SEMANA_LABEL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type FiltroRapido = "todos" | "pagos" | "pendentes" | "segunda" | "sabado" | "segunda-sabado";

type ModalConfirmacaoPagamento = {
  athleteId: string;
};

type ModalConfirmacaoCancelamento = {
  athleteId: string;
};

type MensalistaCalculado = MensalistaResumo & {
  diasSelecionados: string[];
  valorSemDesconto: number;
  desconto: number;
};

type LancamentoCreateResponse = {
  lancamentoId?: string;
  status?: "created" | "already_registered";
};

function mapMensalistas(jogadores: Jogador[]): Array<{ id: string; nome: string }> {
  return jogadores
    .filter((j) => j.mensalista || j.isMensalista || j.isMember)
    .map((j) => ({
      id: j.id,
      nome: (j.nome || j.nickname || "Atleta").trim(),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function countJogosAtletaNoMes(ano: number, mes: number, diasSemanaAtleta: number[]) {
  let count = 0;
  const date = new Date(ano, mes - 1, 1);
  while (date.getMonth() === mes - 1) {
    if (diasSemanaAtleta.includes(date.getDay())) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
}

function countSemanasNoMes(ano: number, mes: number) {
  const primeiraData = new Date(ano, mes - 1, 1);
  const ultimaData = new Date(ano, mes, 0);
  const primeiraSemana = getWeekNumber(primeiraData);
  const ultimaSemana = getWeekNumber(ultimaData);
  return ultimaSemana - primeiraSemana + 1;
}

function getWeekNumber(date: Date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
  const yearStart = new Date(temp.getFullYear(), 0, 1);
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function classifyDias(weekdays: Set<number>): MensalistaResumo["classificacaoDia"] {
  const hasSegunda = weekdays.has(1);
  const hasSabado = weekdays.has(6);
  if (hasSegunda && hasSabado) return "segunda-sabado";
  if (hasSegunda) return "segunda";
  if (hasSabado) return "sabado";
  return "outros";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatCompetenciaTexto(mes: number, ano: number): string {
  return `${MESES[mes - 1]} ${ano}`;
}

function parseLancamentoCreateResponse(value: unknown): LancamentoCreateResponse {
  if (!value || typeof value !== "object") return {};
  const obj = value as {
    id?: unknown;
    lancamentoId?: unknown;
    status?: unknown;
    lancamento?: { id?: unknown };
  };
  const nestedId =
    obj.lancamento && typeof obj.lancamento.id === "string" ? obj.lancamento.id : undefined;
  return {
    lancamentoId:
      typeof obj.id === "string"
        ? obj.id
        : typeof obj.lancamentoId === "string"
          ? obj.lancamentoId
          : nestedId,
    status:
      obj.status === "created" || obj.status === "already_registered" ? obj.status : undefined,
  };
}

type ConfirmacaoModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
};

function ConfirmacaoModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  isLoading = false,
  onClose,
  onConfirm,
  children,
}: ConfirmacaoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-yellow-400">{title}</h2>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
        {children ? (
          <div className="mt-4 rounded-xl border border-neutral-700 bg-neutral-800/70 p-3">
            {children}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-neutral-800"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-bold text-black disabled:opacity-60 ${
              confirmVariant === "danger"
                ? "bg-red-400 hover:bg-red-300"
                : "bg-yellow-400 hover:bg-yellow-300"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type SucessoModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onVerLancamento?: () => void;
};

function SucessoModal({ open, title, description, onClose, onVerLancamento }: SucessoModalProps) {
  if (!open) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-emerald-500/30 bg-neutral-900 p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-emerald-300">{title}</h2>
        <p className="mt-2 text-sm text-gray-200">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-neutral-800"
          >
            Fechar
          </button>
          {onVerLancamento && (
            <button
              type="button"
              onClick={onVerLancamento}
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-300"
            >
              Ver lançamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MensalistasPage() {
  const hoje = useMemo(() => new Date(), []);
  const router = useRouter();
  const { rachaId } = useRacha();

  const [competenciaAno, setCompetenciaAno] = useState(hoje.getFullYear());
  const [competenciaMes, setCompetenciaMes] = useState(hoje.getMonth() + 1);
  const [valorPorDia, setValorPorDia] = useState<number>(10);
  const [busca, setBusca] = useState("");
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("todos");
  const [descontos] = useState<Record<string, number>>({});
  const [diasSelecionados, setDiasSelecionados] = useState<Record<string, string[]>>({});
  const [processandoAthleteId, setProcessandoAthleteId] = useState<string | null>(null);
  const [processandoLote, setProcessandoLote] = useState(false);
  const [confirmacaoPagamento, setConfirmacaoPagamento] =
    useState<ModalConfirmacaoPagamento | null>(null);
  const [confirmacaoLoteAberta, setConfirmacaoLoteAberta] = useState(false);
  const [confirmacaoCancelamento, setConfirmacaoCancelamento] =
    useState<ModalConfirmacaoCancelamento | null>(null);
  const [lancamentoIdsOtimizados, setLancamentoIdsOtimizados] = useState<Record<string, string>>(
    {}
  );
  const [sucessoModal, setSucessoModal] = useState<{
    title: string;
    description: string;
    lancamentoId?: string;
  } | null>(null);

  const competenciaKey = buildCompetenciaKey(competenciaAno, competenciaMes);
  const competenciaTexto = formatCompetenciaTexto(competenciaMes, competenciaAno);

  const {
    items: agendaItems,
    isLoading: isAgendaLoading,
    isError: isAgendaError,
  } = useRachaAgenda();
  const { jogadores, isLoading: isJogadoresLoading } = useJogadores(rachaId || "");
  const {
    items: competencias,
    updateCompetencia,
    registerPagamento: registerPagamentoCompetencia,
    registerPagamentoLote,
    cancelPagamento: cancelPagamentoCompetencia,
    isLoading: isCompetenciasLoading,
  } = useMensalistaCompetencias(competenciaAno, competenciaMes);
  const { lancamentos, mutate: mutateFinanceiro, isLoading: isFinanceiroLoading } = useFinanceiro();

  const agendaOrdenada = useMemo(() => {
    return [...agendaItems].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });
  }, [agendaItems]);

  const agendaIds = useMemo(() => agendaOrdenada.map((item) => item.id), [agendaOrdenada]);

  useEffect(() => {
    setDiasSelecionados(() => {
      const next: Record<string, string[]> = {};
      competencias.forEach((competencia) => {
        next[competencia.athleteId] = competencia.agendaIds || [];
      });
      return next;
    });
  }, [competencias]);

  useEffect(() => {
    setLancamentoIdsOtimizados({});
  }, [competenciaKey]);

  const getDiasSelecionados = useCallback(
    (athleteId: string) => {
      if (Object.prototype.hasOwnProperty.call(diasSelecionados, athleteId)) {
        return diasSelecionados[athleteId] || [];
      }
      return agendaIds;
    },
    [diasSelecionados, agendaIds]
  );

  const salvarDiasSelecionados = useCallback(
    async (athleteId: string, dias: string[]) => {
      const previous = Object.prototype.hasOwnProperty.call(diasSelecionados, athleteId)
        ? diasSelecionados[athleteId] || []
        : agendaIds;

      setDiasSelecionados((prev) => ({
        ...prev,
        [athleteId]: dias,
      }));

      const result = await updateCompetencia(athleteId, { agendaIds: dias });
      if (!result) {
        setDiasSelecionados((prev) => ({
          ...prev,
          [athleteId]: previous,
        }));
        throw new Error("Não foi possível salvar os dias vinculados do mensalista.");
      }
    },
    [agendaIds, diasSelecionados, updateCompetencia]
  );

  const competenciaByAthlete = useMemo(() => {
    const map = new Map<string, (typeof competencias)[number]>();
    competencias.forEach((competencia) => {
      map.set(competencia.athleteId, competencia);
    });
    return map;
  }, [competencias]);

  const lancamentosMensalidadePorAthlete = useMemo(() => {
    const map = new Map<string, LancamentoFinanceiro>();

    (lancamentos || []).forEach((lancamento) => {
      if (!isMensalidadeLancamento(lancamento, { competencia: competenciaKey })) return;

      const metadata = extractMensalidadeMetadata(lancamento);
      if (!metadata) return;

      const previous = map.get(metadata.athleteId);
      if (!previous) {
        map.set(metadata.athleteId, lancamento);
        return;
      }

      const previousDate = `${previous.createdAt || previous.data || ""}`;
      const currentDate = `${lancamento.createdAt || lancamento.data || ""}`;
      if (currentDate > previousDate) {
        map.set(metadata.athleteId, lancamento);
      }
    });

    return map;
  }, [competenciaKey, lancamentos]);

  const mensalistasBase = useMemo(() => mapMensalistas(jogadores), [jogadores]);

  const jogosPorAgendaId = useMemo(() => {
    const map: Record<string, number> = {};
    agendaOrdenada.forEach((item) => {
      map[item.id] = countJogosAtletaNoMes(competenciaAno, competenciaMes, [item.weekday]);
    });
    return map;
  }, [agendaOrdenada, competenciaAno, competenciaMes]);

  const agendaById = useMemo(() => {
    const map = new Map<string, (typeof agendaOrdenada)[number]>();
    agendaOrdenada.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [agendaOrdenada]);

  const mensalistasCalculados = useMemo<MensalistaCalculado[]>(() => {
    return mensalistasBase.map((mensalista) => {
      const diasSelecionadosAtleta = getDiasSelecionados(mensalista.id);
      const agendaSelecionada = diasSelecionadosAtleta
        .map((agendaId) => agendaById.get(agendaId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      const jogosAtleta = diasSelecionadosAtleta.reduce(
        (sum, agendaId) => sum + (jogosPorAgendaId[agendaId] || 0),
        0
      );

      const valorSemDesconto = valorPorDia * jogosAtleta;
      const desconto = descontos[mensalista.id] || 0;
      const valorFinal = Math.max(Number((valorSemDesconto - desconto).toFixed(2)), 0);

      const weekdays = new Set(agendaSelecionada.map((item) => item.weekday));
      const classificacaoDia = classifyDias(weekdays);
      const diasResumo =
        agendaSelecionada.length > 0
          ? agendaSelecionada
              .map((item) => `${DIAS_SEMANA_LABEL[item.weekday]} ${item.time}`)
              .join(" • ")
          : "Sem dias vinculados";

      const lancamento = lancamentosMensalidadePorAthlete.get(mensalista.id);
      const competenciaItem = competenciaByAthlete.get(mensalista.id);
      const pagoPorLancamento = Boolean(lancamento);
      const pagoPorCompetencia = Boolean(competenciaItem?.isPaid);
      const pagamentoConfirmado = pagoPorLancamento || pagoPorCompetencia;

      return {
        id: mensalista.id,
        nome: mensalista.nome,
        valor: valorFinal,
        statusPagamento: pagamentoConfirmado ? "pago" : "pendente",
        pagamentoData: lancamento?.data || competenciaItem?.paidAt || null,
        diasResumo,
        jogosNoMes: jogosAtleta,
        classificacaoDia,
        ultimoLancamentoId: lancamento?.id || lancamentoIdsOtimizados[mensalista.id] || null,
        marcadoSemLancamento: pagoPorCompetencia && !pagoPorLancamento,
        diasSelecionados: diasSelecionadosAtleta,
        valorSemDesconto,
        desconto,
      };
    });
  }, [
    mensalistasBase,
    getDiasSelecionados,
    agendaById,
    jogosPorAgendaId,
    valorPorDia,
    descontos,
    lancamentosMensalidadePorAthlete,
    lancamentoIdsOtimizados,
    competenciaByAthlete,
  ]);

  const totalPrevisto = useMemo(
    () => mensalistasCalculados.reduce((sum, item) => sum + item.valor, 0),
    [mensalistasCalculados]
  );

  const totalRecebido = useMemo(
    () =>
      mensalistasCalculados
        .filter((item) => item.statusPagamento === "pago")
        .reduce((sum, item) => sum + item.valor, 0),
    [mensalistasCalculados]
  );

  const totalPendente = useMemo(
    () =>
      mensalistasCalculados
        .filter((item) => item.statusPagamento === "pendente")
        .reduce((sum, item) => sum + item.valor, 0),
    [mensalistasCalculados]
  );

  const quantidadePagos = useMemo(
    () => mensalistasCalculados.filter((item) => item.statusPagamento === "pago").length,
    [mensalistasCalculados]
  );
  const quantidadePendentes = mensalistasCalculados.length - quantidadePagos;
  const progressoRecebimento =
    totalPrevisto > 0 ? Math.min((totalRecebido / totalPrevisto) * 100, 100) : 0;

  const mensalistasPendentes = useMemo(
    () => mensalistasCalculados.filter((item) => item.statusPagamento === "pendente"),
    [mensalistasCalculados]
  );

  const mensalistasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return mensalistasCalculados.filter((mensalista) => {
      if (termo && !mensalista.nome.toLowerCase().includes(termo)) {
        return false;
      }

      switch (filtroRapido) {
        case "pagos":
          return mensalista.statusPagamento === "pago";
        case "pendentes":
          return mensalista.statusPagamento === "pendente";
        case "segunda":
          return mensalista.classificacaoDia === "segunda";
        case "sabado":
          return mensalista.classificacaoDia === "sabado";
        case "segunda-sabado":
          return mensalista.classificacaoDia === "segunda-sabado";
        case "todos":
        default:
          return true;
      }
    });
  }, [busca, filtroRapido, mensalistasCalculados]);

  const diasDaSemanaDoRacha = useMemo(() => {
    const dias = new Set<number>();
    agendaItems.forEach((item) => {
      const weekday = Number(item.weekday);
      if (Number.isInteger(weekday) && weekday >= 0 && weekday <= 6) {
        dias.add(weekday);
      }
    });
    return Array.from(dias).sort((a, b) => a - b);
  }, [agendaItems]);

  const totalJogosPorDia = useMemo(
    () =>
      diasDaSemanaDoRacha.map((dia) =>
        countJogosAtletaNoMes(competenciaAno, competenciaMes, [dia])
      ),
    [competenciaAno, competenciaMes, diasDaSemanaDoRacha]
  );
  const totalJogosNoMes = totalJogosPorDia.reduce((acc, current) => acc + current, 0);
  const totalSemanasNoMes = countSemanasNoMes(competenciaAno, competenciaMes);

  const agendaDiasLabel =
    diasDaSemanaDoRacha.length > 0
      ? diasDaSemanaDoRacha.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e ")
      : isAgendaLoading
        ? "Carregando agenda"
        : isAgendaError
          ? "Agenda indisponível"
          : "Agenda não configurada";

  const loadingInicial =
    isJogadoresLoading || isAgendaLoading || isCompetenciasLoading || isFinanceiroLoading;

  const yearsOptions = useMemo(() => {
    const currentYear = hoje.getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }, [hoje]);

  const abrirPrestacaoComLancamento = useCallback(
    (lancamentoId?: string | null) => {
      const params = new URLSearchParams({
        origem: "mensalistas",
        competencia: competenciaKey,
      });
      if (lancamentoId) {
        params.set("lancamento", lancamentoId);
      }
      router.push(`/admin/financeiro/prestacao-de-contas?${params.toString()}`);
    },
    [competenciaKey, router]
  );

  const registrarPagamento = useCallback(
    async (mensalista: MensalistaCalculado): Promise<LancamentoCreateResponse> => {
      const lancamentoExistente = lancamentosMensalidadePorAthlete.get(mensalista.id);
      if (lancamentoExistente?.id) {
        return { lancamentoId: lancamentoExistente.id, status: "already_registered" };
      }

      if (mensalista.valor <= 0) {
        throw new Error(
          `O valor da mensalidade do atleta ${mensalista.nome} precisa ser maior que zero para registrar o pagamento.`
        );
      }

      const response = await registerPagamentoCompetencia(mensalista.id, {
        value: Number(mensalista.valor.toFixed(2)),
        athleteName: mensalista.nome,
        agendaResumo: mensalista.diasResumo
          .split(" • ")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await mutateFinanceiro().catch(() => undefined);
      return parseLancamentoCreateResponse(response);
    },
    [lancamentosMensalidadePorAthlete, mutateFinanceiro, registerPagamentoCompetencia]
  );

  const cancelarPagamento = useCallback(
    async (mensalista: MensalistaCalculado) => {
      const response = await cancelPagamentoCompetencia(mensalista.id);
      await mutateFinanceiro().catch(() => undefined);
      return response as { canceled?: boolean };
    },
    [cancelPagamentoCompetencia, mutateFinanceiro]
  );

  const atletaSelecionadoPagamento = useMemo(
    () =>
      confirmacaoPagamento
        ? mensalistasCalculados.find((item) => item.id === confirmacaoPagamento.athleteId) || null
        : null,
    [confirmacaoPagamento, mensalistasCalculados]
  );

  const atletaSelecionadoCancelamento = useMemo(
    () =>
      confirmacaoCancelamento
        ? mensalistasCalculados.find((item) => item.id === confirmacaoCancelamento.athleteId) ||
          null
        : null,
    [confirmacaoCancelamento, mensalistasCalculados]
  );

  async function confirmarPagamentoIndividual() {
    if (!atletaSelecionadoPagamento) return;
    setProcessandoAthleteId(atletaSelecionadoPagamento.id);

    try {
      const { lancamentoId, status } = await registrarPagamento(atletaSelecionadoPagamento);
      if (lancamentoId) {
        setLancamentoIdsOtimizados((prev) => ({
          ...prev,
          [atletaSelecionadoPagamento.id]: lancamentoId,
        }));
      }
      const isDuplicado = status === "already_registered";
      const mensagem = isDuplicado
        ? `A mensalidade de ${atletaSelecionadoPagamento.nome}, referente a ${competenciaTexto}, já estava registrada no financeiro.`
        : `Pagamento registrado com sucesso. A mensalidade de ${atletaSelecionadoPagamento.nome}, referente a ${competenciaTexto}, foi lançada no financeiro.`;
      toast.success(
        isDuplicado
          ? "Pagamento já registrado para esta competência."
          : "Pagamento registrado com sucesso."
      );
      setSucessoModal({
        title: isDuplicado ? "Pagamento já registrado" : "Pagamento registrado com sucesso",
        description: mensagem,
        lancamentoId,
      });
      setConfirmacaoPagamento(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível registrar o pagamento.";
      toast.error(message);
    } finally {
      setProcessandoAthleteId(null);
    }
  }

  async function confirmarPagamentoEmLote() {
    if (mensalistasPendentes.length === 0) return;
    setProcessandoLote(true);

    try {
      const itensLote = mensalistasPendentes
        .filter((item) => item.valor > 0)
        .map((item) => ({
          athleteId: item.id,
          value: Number(item.valor.toFixed(2)),
          athleteName: item.nome,
          agendaResumo: item.diasResumo
            .split(" • ")
            .map((dia) => dia.trim())
            .filter(Boolean),
        }));

      if (itensLote.length === 0) {
        throw new Error("Nenhum mensalista pendente com valor válido para registrar em lote.");
      }

      const response = (await registerPagamentoLote({
        items: itensLote,
      })) as {
        createdCount?: number;
        alreadyRegisteredCount?: number;
        items?: Array<{ lancamentoId?: string }>;
      };

      await mutateFinanceiro().catch(() => undefined);

      const createdCount = Number(response.createdCount ?? 0);
      const alreadyRegisteredCount = Number(response.alreadyRegisteredCount ?? 0);
      const totalProcessado = createdCount + alreadyRegisteredCount;
      const ultimoLancamentoId =
        response.items
          ?.map((item) => item.lancamentoId)
          .filter((id): id is string => Boolean(id))
          .at(-1) ?? undefined;
      const otimizadoEmLote = (response.items || []).reduce<Record<string, string>>((acc, item) => {
        const athleteId =
          item && typeof (item as { athleteId?: unknown }).athleteId === "string"
            ? ((item as { athleteId: string }).athleteId ?? "")
            : "";
        const lancamentoId =
          item && typeof (item as { lancamentoId?: unknown }).lancamentoId === "string"
            ? ((item as { lancamentoId: string }).lancamentoId ?? "")
            : "";
        if (athleteId && lancamentoId) {
          acc[athleteId] = lancamentoId;
        }
        return acc;
      }, {});
      if (Object.keys(otimizadoEmLote).length > 0) {
        setLancamentoIdsOtimizados((prev) => ({
          ...prev,
          ...otimizadoEmLote,
        }));
      }

      if (totalProcessado > 0) {
        const mensagemResumo =
          alreadyRegisteredCount > 0
            ? `${createdCount} novo(s) pagamento(s) registrado(s) e ${alreadyRegisteredCount} já estavam lançados.`
            : "Todos os pendentes foram lançados com sucesso.";

        toast.success("Pagamentos processados com sucesso.");
        setSucessoModal({
          title: "Pagamentos registrados com sucesso",
          description: `Os mensalistas pendentes de ${competenciaTexto} foram lançados no financeiro. ${mensagemResumo}`,
          lancamentoId: ultimoLancamentoId,
        });
      } else {
        toast("Nenhum lançamento novo foi necessário para esta competência.", {
          icon: "ℹ️",
        });
      }

      setConfirmacaoLoteAberta(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível registrar os pagamentos em lote.";
      toast.error(message);
    } finally {
      setProcessandoAthleteId(null);
      setProcessandoLote(false);
    }
  }

  async function confirmarCancelamentoPagamento() {
    if (!atletaSelecionadoCancelamento) return;
    setProcessandoAthleteId(atletaSelecionadoCancelamento.id);

    try {
      const response = await cancelarPagamento(atletaSelecionadoCancelamento);
      setLancamentoIdsOtimizados((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, atletaSelecionadoCancelamento.id)) {
          return prev;
        }
        const next = { ...prev };
        delete next[atletaSelecionadoCancelamento.id];
        return next;
      });
      if (response?.canceled === false) {
        toast("Este pagamento já estava cancelado.", { icon: "ℹ️" });
      } else {
        toast.success("Pagamento cancelado com sucesso.");
      }
      setConfirmacaoCancelamento(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível cancelar o pagamento.";
      toast.error(message);
    } finally {
      setProcessandoAthleteId(null);
    }
  }

  const cardBaseClass =
    "rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400";
  const cardAtivoClass = "border-yellow-400 bg-yellow-400/10";
  const cardInativoClass = "border-neutral-700 bg-neutral-900/80 hover:border-yellow-500/50";

  return (
    <>
      <Head>
        <title>Mensalistas | Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Acompanhe, registre e controle os pagamentos mensais dos atletas vinculados, com integração automática ao financeiro do racha."
        />
      </Head>

      <section className="mx-auto max-w-6xl px-2 pb-24 pt-20 md:pb-10 md:pt-6">
        <h1 className="mb-1 text-3xl font-bold text-yellow-500 break-words">Mensalistas</h1>
        <p className="mb-1 text-sm text-gray-300">
          Acompanhe, registre e controle os pagamentos mensais dos atletas vinculados, com
          integração automática ao financeiro do racha.
        </p>
        <p className="mb-5 text-xs text-yellow-300">
          O valor de cada mensalidade é calculado com base nos dias vinculados do atleta e na agenda
          oficial do racha no período selecionado.
        </p>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-700 bg-neutral-900/80 p-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-300">Competência</label>
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 text-sm font-semibold text-yellow-300">
              {competenciaTexto}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-300">Mês</label>
            <select
              value={String(competenciaMes)}
              onChange={(event) => setCompetenciaMes(Number(event.target.value))}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
            >
              {MESES.map((mesNome, index) => (
                <option key={mesNome} value={String(index + 1)}>
                  {mesNome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-300">Ano</label>
            <select
              value={String(competenciaAno)}
              onChange={(event) => setCompetenciaAno(Number(event.target.value))}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
            >
              {yearsOptions.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-300">Valor por dia (R$)</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={valorPorDia}
              onChange={(event) => setValorPorDia(Number(event.target.value || 0))}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
              onClick={() => setConfirmacaoLoteAberta(true)}
              disabled={mensalistasPendentes.length === 0 || loadingInicial || processandoLote}
            >
              Registrar pagamento de todos os pendentes
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-neutral-700 bg-neutral-900/60 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-200">
            <span className="text-yellow-300">Agenda oficial:</span>
            {diasDaSemanaDoRacha.length > 0 ? (
              diasDaSemanaDoRacha.map((dia, index) => (
                <span
                  key={dia}
                  className="rounded-full border border-yellow-600/60 bg-neutral-800 px-3 py-1 text-xs text-yellow-300"
                  title={`${DIAS_SEMANA_LABEL[dia]}: ${totalJogosPorDia[index]} jogo(s) no mês`}
                >
                  {DIAS_SEMANA_LABEL[dia].slice(0, 3)} ({totalJogosPorDia[index]})
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">
                {isAgendaError
                  ? "Agenda indisponível"
                  : "Cadastre os dias da agenda para calcular."}
              </span>
            )}
            <span className="text-xs text-gray-400">
              Total: {totalJogosNoMes} jogo(s) • {totalSemanasNoMes} semana(s)
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-300">
            A mensalidade é calculada automaticamente com base nos dias vinculados de cada atleta e
            na agenda oficial do racha para o mês selecionado.
          </p>
          <p className="mt-1 text-xs text-yellow-300">
            Referência de agenda: <span className="font-semibold">{agendaDiasLabel}</span>
          </p>
        </div>

        {totalSemanasNoMes === 5 && (
          <div className="mb-4 rounded-xl border border-yellow-700 bg-yellow-900/60 p-3 text-sm text-yellow-200">
            Este período possui 5 semanas com jogos na agenda. O cálculo já considera todas as
            partidas previstas.
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <button
            type="button"
            className={`${cardBaseClass} ${filtroRapido === "todos" ? cardAtivoClass : cardInativoClass}`}
            onClick={() => setFiltroRapido("todos")}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total previsto
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalPrevisto)}</p>
            <p className="mt-1 text-xs text-gray-400">Valor estimado para recebimento no mês.</p>
          </button>

          <button
            type="button"
            className={`${cardBaseClass} ${filtroRapido === "pagos" ? cardAtivoClass : cardInativoClass}`}
            onClick={() => setFiltroRapido("pagos")}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total recebido
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {formatCurrency(totalRecebido)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Pagamentos já confirmados neste período.</p>
          </button>

          <button
            type="button"
            className={`${cardBaseClass} ${filtroRapido === "pendentes" ? cardAtivoClass : cardInativoClass}`}
            onClick={() => setFiltroRapido("pendentes")}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total pendente
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-300">
              {formatCurrency(totalPendente)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Valores ainda aguardando confirmação.</p>
          </button>

          <div className={`${cardBaseClass} ${cardInativoClass}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Situação dos atletas
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroRapido("pagos")}
                className={`rounded-md border px-3 py-1 text-xs font-semibold ${
                  filtroRapido === "pagos"
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                    : "border-neutral-600 text-gray-200 hover:border-emerald-400/70"
                }`}
              >
                Pagos: {quantidadePagos}
              </button>
              <button
                type="button"
                onClick={() => setFiltroRapido("pendentes")}
                className={`rounded-md border px-3 py-1 text-xs font-semibold ${
                  filtroRapido === "pendentes"
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-neutral-600 text-gray-200 hover:border-amber-400/70"
                }`}
              >
                Pendentes: {quantidadePendentes}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Quantidade de mensalistas pagos e pendentes no mês.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-neutral-700 bg-neutral-900/70 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-200">
              Progresso financeiro: {formatCurrency(totalRecebido)} de{" "}
              {formatCurrency(totalPrevisto)}
            </span>
            <span className="text-xs text-gray-400">
              {quantidadePagos} de {mensalistasCalculados.length} atleta(s) com pagamento confirmado
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all"
              style={{ width: `${progressoRecebimento}%` }}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-bold text-gray-300">Busca por atleta</label>
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
              placeholder="Digite o nome do atleta"
            />
          </div>
          <div className="lg:col-span-4 flex flex-wrap items-end gap-2">
            {[
              { key: "todos", label: "Todos" },
              { key: "pagos", label: "Pagos" },
              { key: "pendentes", label: "Pendentes" },
              { key: "segunda", label: "Segunda" },
              { key: "sabado", label: "Sábado" },
              { key: "segunda-sabado", label: "Segunda e Sábado" },
            ].map((filtro) => (
              <button
                key={filtro.key}
                type="button"
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  filtroRapido === (filtro.key as FiltroRapido)
                    ? "border-yellow-400 bg-yellow-400/20 text-yellow-200"
                    : "border-neutral-700 bg-neutral-900 text-gray-200 hover:border-yellow-500/70"
                }`}
                onClick={() => setFiltroRapido(filtro.key as FiltroRapido)}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        {loadingInicial ? (
          <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 p-6 text-sm text-gray-300">
            Carregando mensalistas e dados financeiros...
          </div>
        ) : mensalistasCalculados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-600 bg-neutral-900/70 p-8 text-center">
            <h2 className="text-lg font-semibold text-yellow-300">Nenhum mensalista encontrado</h2>
            <p className="mt-2 text-sm text-gray-300">
              Não há atletas mensalistas vinculados para esta competência. Cadastre mensalistas em{" "}
              <span className="font-semibold text-yellow-300">Jogadores &gt; Mensalistas</span> para
              iniciar os lançamentos financeiros.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 text-xs text-gray-400">
              Exibindo {mensalistasFiltrados.length} de {mensalistasCalculados.length} atleta(s).
            </div>
            <TabelaMensalistas
              mensalistas={mensalistasFiltrados}
              agendaItems={agendaOrdenada}
              getDiasSelecionados={getDiasSelecionados}
              onSaveDias={salvarDiasSelecionados}
              onRegistrarPagamento={(athleteId) => setConfirmacaoPagamento({ athleteId })}
              onVerLancamento={(lancamentoId) => abrirPrestacaoComLancamento(lancamentoId)}
              onCancelarPagamento={(athleteId) => setConfirmacaoCancelamento({ athleteId })}
              processandoAthleteId={processandoAthleteId}
              processandoLote={processandoLote}
            />
          </>
        )}
      </section>

      <ConfirmacaoModal
        open={Boolean(atletaSelecionadoPagamento)}
        title="Confirmar pagamento da mensalidade"
        description={
          atletaSelecionadoPagamento
            ? `Você está prestes a registrar o pagamento da mensalidade de ${atletaSelecionadoPagamento.nome}, referente a ${competenciaTexto}.`
            : ""
        }
        confirmLabel="Confirmar pagamento"
        cancelLabel="Cancelar"
        isLoading={Boolean(processandoAthleteId)}
        onClose={() => setConfirmacaoPagamento(null)}
        onConfirm={confirmarPagamentoIndividual}
      >
        {atletaSelecionadoPagamento && (
          <div className="space-y-1 text-xs text-gray-200">
            <div>
              <span className="text-gray-400">Atleta:</span> {atletaSelecionadoPagamento.nome}
            </div>
            <div>
              <span className="text-gray-400">Competência:</span> {competenciaTexto}
            </div>
            <div>
              <span className="text-gray-400">Valor:</span>{" "}
              {formatCurrency(atletaSelecionadoPagamento.valor)}
            </div>
            <div>
              <span className="text-gray-400">Dias vinculados:</span>{" "}
              {atletaSelecionadoPagamento.diasResumo}
            </div>
            <div>
              <span className="text-gray-400">Tipo do lançamento:</span> Receita
            </div>
            <div>
              <span className="text-gray-400">Categoria:</span> Mensalidade
            </div>
            <p className="pt-1 text-[11px] text-gray-400">
              Você está confirmando o pagamento da mensalidade deste atleta. O lançamento será
              enviado automaticamente para Prestação de Contas.
            </p>
          </div>
        )}
      </ConfirmacaoModal>

      <ConfirmacaoModal
        open={confirmacaoLoteAberta}
        title="Confirmar pagamento em massa"
        description={`Você está prestes a registrar o pagamento de todos os mensalistas pendentes em ${competenciaTexto}. Essa ação criará os lançamentos financeiros correspondentes para os atletas que ainda não possuem pagamento registrado neste período.`}
        confirmLabel="Confirmar pagamentos"
        cancelLabel="Voltar"
        isLoading={processandoLote}
        onClose={() => setConfirmacaoLoteAberta(false)}
        onConfirm={confirmarPagamentoEmLote}
      >
        <div className="space-y-1 text-xs text-gray-200">
          <div>
            <span className="text-gray-400">Competência:</span> {competenciaTexto}
          </div>
          <div>
            <span className="text-gray-400">Atletas pendentes:</span> {mensalistasPendentes.length}
          </div>
          <div>
            <span className="text-gray-400">Valor total a receber:</span>{" "}
            {formatCurrency(totalPendente)}
          </div>
          <p className="pt-1 text-[11px] text-gray-400">
            Essa ação confirmará os pagamentos pendentes do período selecionado e lançará os valores
            automaticamente no financeiro.
          </p>
        </div>
      </ConfirmacaoModal>

      <ConfirmacaoModal
        open={Boolean(atletaSelecionadoCancelamento)}
        title="Cancelar pagamento registrado"
        description={
          atletaSelecionadoCancelamento
            ? `Você está prestes a cancelar o pagamento de ${atletaSelecionadoCancelamento.nome} em ${competenciaTexto}. O lançamento será marcado como cancelado, com auditoria administrativa, e deixará de compor o saldo da Prestação de Contas.`
            : ""
        }
        confirmLabel="Confirmar cancelamento"
        cancelLabel="Voltar"
        confirmVariant="danger"
        isLoading={Boolean(processandoAthleteId)}
        onClose={() => setConfirmacaoCancelamento(null)}
        onConfirm={confirmarCancelamentoPagamento}
      />

      <SucessoModal
        open={Boolean(sucessoModal)}
        title={sucessoModal?.title || ""}
        description={sucessoModal?.description || ""}
        onClose={() => setSucessoModal(null)}
        onVerLancamento={
          sucessoModal?.lancamentoId
            ? () => {
                abrirPrestacaoComLancamento(sucessoModal.lancamentoId || "");
                setSucessoModal(null);
              }
            : undefined
        }
      />
    </>
  );
}

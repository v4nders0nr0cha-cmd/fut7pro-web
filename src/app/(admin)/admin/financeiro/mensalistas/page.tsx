"use client";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import { useJogadores } from "@/hooks/useJogadores";
import { useMensalistaCompetencias } from "@/hooks/useMensalistaCompetencias";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import type { LancamentoFinanceiro } from "@/types/financeiro";
import type { Jogador } from "@/types/jogador";
import type { MensalistaResumo } from "./components/TabelaMensalistas";
import TabelaMensalistas from "./components/TabelaMensalistas";

const DIAS_SEMANA_LABEL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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

const mesesNomes = [
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

const AUTO_MENSALISTAS_CATEGORY = "Mensalistas";
const AUTO_MENSALISTAS_OBSERVACOES = "auto: mensalistas";

function mapMensalistas(jogadores: Jogador[]): MensalistaResumo[] {
  return jogadores
    .filter((j) => j.mensalista || j.isMember)
    .map((j) => ({
      id: j.id,
      nome: j.nome || j.nickname || "Jogador",
      status: "Em dia" as const,
      valor: 0,
      ultimoPagamento: null,
    }));
}

export default function MensalistasPage() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const nomeMes = mesesNomes[mesAtual];
  const competenciaAno = anoAtual;
  const competenciaMes = mesAtual + 1;

  const { rachaId } = useRacha();
  const {
    items: agendaItems,
    isLoading: isAgendaLoading,
    isError: isAgendaError,
  } = useRachaAgenda();
  const { jogadores, isLoading: isJogadoresLoading } = useJogadores(rachaId || "");
  const {
    items: competencias,
    updateCompetencia,
    isLoading: isCompetenciasLoading,
  } = useMensalistaCompetencias(competenciaAno, competenciaMes);
  const {
    lancamentos,
    addLancamento,
    updateLancamento,
    deleteLancamento,
    isLoading: isFinanceiroLoading,
  } = useFinanceiro();

  const agendaOrdenada = useMemo(() => {
    return [...agendaItems].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });
  }, [agendaItems]);

  const agendaIds = useMemo(() => agendaOrdenada.map((item) => item.id), [agendaOrdenada]);

  const [diasSelecionados, setDiasSelecionados] = useState<Record<string, string[]>>({});
  const [pagamentos, setPagamentos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDiasSelecionados(() => {
      const next: Record<string, string[]> = {};
      competencias.forEach((competencia) => {
        next[competencia.athleteId] = competencia.agendaIds || [];
      });
      return next;
    });

    setPagamentos(() => {
      const next: Record<string, boolean> = {};
      competencias.forEach((competencia) => {
        next[competencia.athleteId] = Boolean(competencia.isPaid);
      });
      return next;
    });
  }, [competencias]);

  const getDiasSelecionados = useCallback(
    (id: string) => {
      if (Object.prototype.hasOwnProperty.call(diasSelecionados, id)) {
        return diasSelecionados[id] || [];
      }
      return agendaIds;
    },
    [diasSelecionados, agendaIds]
  );

  const salvarDiasSelecionados = useCallback(
    async (id: string, dias: string[]) => {
      setDiasSelecionados((prev) => ({
        ...prev,
        [id]: dias,
      }));
      await updateCompetencia(id, { agendaIds: dias });
    },
    [updateCompetencia]
  );

  const togglePagamento = useCallback(
    async (id: string) => {
      const nextValue = !Boolean(pagamentos[id]);
      setPagamentos((prev) => ({
        ...prev,
        [id]: nextValue,
      }));
      await updateCompetencia(id, { isPaid: nextValue });
    },
    [pagamentos, updateCompetencia]
  );

  const togglePagamentoAll = useCallback(
    async (checked: boolean, athleteIds: string[]) => {
      if (athleteIds.length === 0) return;
      setPagamentos((prev) => {
        const next = { ...prev };
        athleteIds.forEach((id) => {
          next[id] = checked;
        });
        return next;
      });
      await Promise.all(athleteIds.map((id) => updateCompetencia(id, { isPaid: checked })));
    },
    [updateCompetencia]
  );

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

  const agendaDiasLabel =
    diasDaSemanaDoRacha.length > 0
      ? diasDaSemanaDoRacha.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e ")
      : isAgendaLoading
        ? "Carregando agenda"
        : isAgendaError
          ? "Agenda indisponivel"
          : "Agenda nao configurada";

  const mensalistasBase = useMemo(() => mapMensalistas(jogadores), [jogadores]);

  const [valorPorDia, setValorPorDia] = useState<number>(10);
  const [descontos, setDescontos] = useState<Record<string, number>>({});

  const totalJogosPorDia = diasDaSemanaDoRacha.map((dia) =>
    countJogosAtletaNoMes(anoAtual, mesAtual + 1, [dia])
  );
  const totalJogosNoMes = totalJogosPorDia.reduce((a, b) => a + b, 0);
  const totalSemanasNoMes = countSemanasNoMes(anoAtual, mesAtual + 1);

  const jogosPorAgendaId = useMemo(() => {
    const map: Record<string, number> = {};
    agendaOrdenada.forEach((item) => {
      map[item.id] = countJogosAtletaNoMes(anoAtual, mesAtual + 1, [item.weekday]);
    });
    return map;
  }, [agendaOrdenada, anoAtual, mesAtual]);

  const valoresMensais = mensalistasBase.map((m) => {
    const diasSelecionadosAtleta = getDiasSelecionados(m.id);
    const jogosAtleta = diasSelecionadosAtleta.reduce(
      (sum, agendaId) => sum + (jogosPorAgendaId[agendaId] || 0),
      0
    );
    const valorSemDesconto = valorPorDia * jogosAtleta;
    const desconto = descontos[m.id] || 0;
    return {
      ...m,
      jogosAtleta,
      valorSemDesconto,
      valorFinal: Math.max(valorSemDesconto - desconto, 0),
      labelDias: diasDaSemanaDoRacha.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e "),
      desconto,
    };
  });

  const totalMensalistas = valoresMensais.reduce((sum, m) => sum + m.valorFinal, 0);
  const competenciaKey = `${competenciaAno}-${String(competenciaMes).padStart(2, "0")}`;
  const autoMensalistasDescricao = `Mensalistas ${competenciaKey}`;
  const autoMensalistasData = `${competenciaKey}-01`;

  const autoMensalistasLancamento = useMemo(() => {
    const descricaoAlvo = autoMensalistasDescricao.toLowerCase();
    return (lancamentos || []).find((item) => {
      const categoria = (item.categoria || "").trim().toLowerCase();
      const descricao = (item.descricao || "").trim().toLowerCase();
      return categoria === AUTO_MENSALISTAS_CATEGORY.toLowerCase() && descricao === descricaoAlvo;
    });
  }, [autoMensalistasDescricao, lancamentos]);

  const autoSyncRef = useRef(false);

  useEffect(() => {
    if (
      isAgendaLoading ||
      isJogadoresLoading ||
      isCompetenciasLoading ||
      isFinanceiroLoading ||
      autoSyncRef.current
    ) {
      return;
    }

    const totalArredondado = Number.isFinite(totalMensalistas)
      ? Number(totalMensalistas.toFixed(2))
      : 0;

    if (totalArredondado <= 0) {
      if (autoMensalistasLancamento?.id) {
        autoSyncRef.current = true;
        deleteLancamento(autoMensalistasLancamento.id)
          .catch(() => {})
          .finally(() => {
            autoSyncRef.current = false;
          });
      }
      return;
    }

    const payload: Partial<LancamentoFinanceiro> = {
      data: autoMensalistasData,
      categoria: AUTO_MENSALISTAS_CATEGORY,
      descricao: autoMensalistasDescricao,
      valor: totalArredondado,
      tipo: "entrada",
      observacoes: AUTO_MENSALISTAS_OBSERVACOES,
    };

    if (autoMensalistasLancamento?.id) {
      const valorAtual = Math.abs(autoMensalistasLancamento.valor ?? 0);
      const dataAtual = (autoMensalistasLancamento.data || "").slice(0, 10);
      const categoriaAtual = (autoMensalistasLancamento.categoria || "").trim();
      const descricaoAtual = (autoMensalistasLancamento.descricao || "").trim();
      const observacoesAtual = (autoMensalistasLancamento.observacoes || "").trim();
      const precisaAtualizar =
        Math.abs(valorAtual - totalArredondado) > 0.01 ||
        dataAtual !== autoMensalistasData ||
        categoriaAtual !== AUTO_MENSALISTAS_CATEGORY ||
        descricaoAtual !== autoMensalistasDescricao ||
        observacoesAtual !== AUTO_MENSALISTAS_OBSERVACOES;

      if (!precisaAtualizar) return;

      autoSyncRef.current = true;
      updateLancamento(autoMensalistasLancamento.id, payload)
        .catch(() => {})
        .finally(() => {
          autoSyncRef.current = false;
        });
      return;
    }

    autoSyncRef.current = true;
    addLancamento(payload)
      .catch(() => {})
      .finally(() => {
        autoSyncRef.current = false;
      });
  }, [
    addLancamento,
    autoMensalistasData,
    autoMensalistasDescricao,
    autoMensalistasLancamento,
    deleteLancamento,
    isAgendaLoading,
    isCompetenciasLoading,
    isFinanceiroLoading,
    isJogadoresLoading,
    totalMensalistas,
    updateLancamento,
  ]);

  return (
    <>
      <Head>
        <title>Mensalistas | Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os mensalistas do racha, valores por dia jogado, descontos individuais, dias semanais e controle de pagamentos."
        />
      </Head>
      <section className="max-w-4xl mx-auto pt-20 pb-24 md:pt-6 md:pb-8 px-2">
        <h1 className="text-3xl font-bold text-yellow-500 mb-1 break-words">Mensalistas</h1>
        <p className="text-sm text-gray-300 mb-3">
          Defina o valor por dia jogado e o sistema calculará a mensalidade de cada atleta
          automaticamente.
          <br />
          <b>O sistema usa a agenda dos dias do seu racha:</b>{" "}
          <span className="text-yellow-300">{agendaDiasLabel}</span>
          .<br />
          <span className="text-yellow-400">
            O valor de cada atleta é proporcional ao número de jogos dos dias em que ele é
            mensalista, em cada mês.
          </span>
        </p>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-300 font-bold mb-1">
              Valor por dia jogado (R$)
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={valorPorDia}
              onChange={(e) => setValorPorDia(Number(e.target.value))}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-left"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-semibold">
              <span>
                {nomeMes} {anoAtual}:
              </span>
              {diasDaSemanaDoRacha.length > 0 ? (
                diasDaSemanaDoRacha.map((dia, i) => (
                  <span
                    key={dia}
                    title={`${DIAS_SEMANA_LABEL[dia]}: ${totalJogosPorDia[i]} jogos`}
                    className="bg-neutral-700 px-3 py-1 rounded-full text-yellow-400 border border-yellow-700 text-sm shadow hover:bg-yellow-800 transition"
                  >
                    {DIAS_SEMANA_LABEL[dia].slice(0, 3)} <b>({totalJogosPorDia[i]})</b>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">
                  {isAgendaError ? "Agenda indisponivel" : "Cadastre dias e horarios para calcular"}
                </span>
              )}
              <span className="ml-2 text-gray-300 text-sm font-normal">
                | Total: <b>{totalJogosNoMes}</b> jogos · {totalSemanasNoMes} semanas
              </span>
            </div>
          </div>
        </div>
        {totalSemanasNoMes === 5 && (
          <div className="mb-3 p-3 rounded-lg border border-yellow-700 bg-yellow-900/70 text-yellow-300 text-sm">
            <b>Atenção:</b> Este mês ({nomeMes}/{anoAtual}) possui <b>5 semanas</b> com racha
            agendado. O valor já considera todos os jogos previstos para este mês!
          </div>
        )}
        <div className="mb-4 font-bold text-base text-gray-200">
          Valor total dos mensalistas do mês:{" "}
          <span className="text-green-400">R$ {totalMensalistas.toFixed(2)}</span>
        </div>

        {isJogadoresLoading ? (
          <div className="py-6 text-gray-300">Carregando jogadores...</div>
        ) : (
          <TabelaMensalistas
            mensalistas={valoresMensais.map((m) => ({
              id: m.id,
              nome: m.nome,
              status: m.status,
              valor: m.valorFinal,
              ultimoPagamento: m.ultimoPagamento,
            }))}
            agendaItems={agendaOrdenada}
            getDiasSelecionados={getDiasSelecionados}
            onSaveDias={salvarDiasSelecionados}
            pagamentos={pagamentos}
            onTogglePagamento={togglePagamento}
            onTogglePagamentoAll={togglePagamentoAll}
          />
        )}
      </section>
    </>
  );
}

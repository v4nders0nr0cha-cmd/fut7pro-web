"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaCalendarPlus, FaTrash, FaClock, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatNextDate(value?: string | null) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if ([year, month, day].some((part) => Number.isNaN(part))) return value;
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAYS_SHORT[date.getDay()] ?? "";
  const formattedDay = String(date.getDate()).padStart(2, "0");
  const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
  const formattedYear = String(date.getFullYear()).slice(-2);
  return `${weekday} ${formattedDay}/${formattedMonth}/${formattedYear}`;
}

export default function GerenciarRachasPage() {
  const { items, isLoading, isError, error, isSuccess, createAgenda, removeAgenda } =
    useRachaAgenda();
  const [novoDia, setNovoDia] = useState<number>(6);
  const [novoHorario, setNovoHorario] = useState<string>("");

  const agendaOrdenada = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });
  }, [items]);

  const adicionarRacha = async () => {
    if (!novoHorario) return;
    const created = await createAgenda({ weekday: novoDia, time: novoHorario });
    if (created) {
      setNovoHorario("");
    }
  };

  const removerRacha = async (id: string) => {
    await removeAgenda(id);
  };

  return (
    <>
      <Head>
        <title>Gerenciar Dias & Horarios do Racha | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre, edite e remova os dias e horarios do seu racha. Receba alertas de feriado automaticamente. Gestao profissional no Fut7Pro."
        />
        <meta
          name="keywords"
          content="gestao racha, cadastrar horario, agenda futebol, racha recorrente, painel admin fut7pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 bg-fundo min-h-screen">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FaCalendarPlus className="text-cyan-400 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
              Gerenciar Dias & Horarios do Racha
            </h1>
          </div>

          <p className="text-gray-300 mb-6">
            Cadastre todos os dias e horarios em que seu racha acontece na semana. O sistema avisa
            caso algum caia em feriado.
          </p>

          {isError && error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200">
              Agenda atualizada com sucesso.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <select
              className="bg-[#21272c] text-white border border-[#333] rounded px-3 py-2 focus:outline-none"
              value={novoDia}
              onChange={(e) => setNovoDia(Number(e.target.value))}
              disabled={isLoading}
            >
              {DIAS_SEMANA.map((dia, i) => (
                <option key={i} value={i}>
                  {dia}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="bg-[#21272c] text-white border border-[#333] rounded px-3 py-2 focus:outline-none"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              placeholder="Horario"
              disabled={isLoading}
            />
            <button
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2 rounded transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={adicionarRacha}
              disabled={isLoading || !novoHorario}
            >
              <FaCheck /> Adicionar
            </button>
          </div>

          <div className="bg-[#23272F] rounded-xl shadow p-5">
            <div className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <FaClock className="text-cyan-400" /> Dias & horarios cadastrados
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-[#23272F]">
                  <th className="py-2 px-3">Dia da Semana</th>
                  <th className="py-2 px-3">Horario</th>
                  <th className="py-2 px-3">Proximo Racha</th>
                  <th className="py-2 px-3">Feriado?</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && agendaOrdenada.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-gray-400 text-center">
                      Carregando agenda...
                    </td>
                  </tr>
                ) : agendaOrdenada.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-gray-500 text-center">
                      Nenhum horario cadastrado.
                    </td>
                  </tr>
                ) : (
                  agendaOrdenada.map((racha) => (
                    <tr key={racha.id} className="border-b border-[#181B20] hover:bg-[#222630]">
                      <td className="py-2 px-3 text-white">{DIAS_SEMANA[racha.weekday] ?? "-"}</td>
                      <td className="py-2 px-3 text-white">{racha.time}</td>
                      <td className="py-2 px-3 text-gray-300">{formatNextDate(racha.nextDate)}</td>
                      <td className="py-2 px-3">
                        {racha.holiday ? (
                          <span className="flex items-center gap-1 text-yellow-300 font-bold">
                            <FaExclamationTriangle />
                            {racha.holidayName || "Feriado"}
                          </span>
                        ) : (
                          <span className="text-green-400 font-bold flex items-center gap-1">
                            <FaCheck /> Nao
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => removerRacha(racha.id)}
                          className="text-red-400 hover:text-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Remover"
                          disabled={isLoading}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

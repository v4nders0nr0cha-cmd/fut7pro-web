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

  const horarioValido = /^([01]\d|2[0-3]):[0-5]\d$/.test(novoHorario);
  const adicionarRacha = async () => {
    if (!horarioValido) return;
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
        <title>Gerenciar dias e horários do grupo | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre, edite e remova os dias e horários do grupo. Receba alertas de feriado automaticamente. Gestão profissional no Fut7Pro."
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
              Gerenciar dias e horários do grupo
            </h1>
          </div>

          <p className="text-gray-300 mb-6">
            Cadastre todos os dias e horários em que seu grupo joga na semana. O sistema avisa caso
            algum caia em feriado.
          </p>

          {isError && error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/50 bg-red-900/40 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {isSuccess && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200"
            >
              Agenda atualizada com sucesso.
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void adicionarRacha();
            }}
            className="mb-6 grid min-w-0 gap-4 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="min-w-0">
              <label
                htmlFor="agenda-weekday"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Dia da semana
              </label>
              <select
                id="agenda-weekday"
                className="min-h-12 w-full rounded-lg border border-white/25 bg-[#181B20] px-3 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={novoDia}
                onChange={(event) => setNovoDia(Number(event.target.value))}
                disabled={isLoading}
              >
                {DIAS_SEMANA.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="agenda-time" className="mb-2 block text-sm font-semibold text-white">
                Horário
              </label>
              <input
                id="agenda-time"
                type="time"
                aria-describedby="agenda-time-help"
                required
                className="block min-h-12 w-full min-w-0 appearance-none rounded-lg border border-white/25 bg-[#181B20] px-3 py-3 text-base text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={novoHorario}
                onChange={(event) => setNovoHorario(event.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-bold text-white shadow hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !horarioValido}
            >
              <FaCheck aria-hidden="true" /> Adicionar
            </button>
            <p id="agenda-time-help" className="text-sm text-zinc-300 sm:col-span-3">
              {horarioValido
                ? "Confira o dia e clique em Adicionar para salvar."
                : "Escolha o dia e toque no campo de horário para informar quando a galera se reúne."}
            </p>
          </form>

          <div className="bg-[#23272F] rounded-xl shadow p-5">
            <div className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <FaClock className="text-cyan-400" /> Dias & horarios cadastrados
            </div>
            <div className="space-y-3 sm:hidden">
              {isLoading && agendaOrdenada.length === 0 ? (
                <p className="text-zinc-300">Carregando agenda...</p>
              ) : agendaOrdenada.length === 0 ? (
                <p className="text-zinc-300">Nenhum horário cadastrado.</p>
              ) : (
                agendaOrdenada.map((item) => (
                  <article key={item.id} className="rounded-lg border border-white/15 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">
                        {DIAS_SEMANA[item.weekday]} · {item.time}
                      </h3>
                      <button
                        type="button"
                        aria-label={`Remover ${DIAS_SEMANA[item.weekday]} às ${item.time}`}
                        disabled={isLoading}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-300 disabled:opacity-50"
                        onClick={() => void removerRacha(item.id)}
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-zinc-300">
                      Próximo encontro · {formatNextDate(item.nextDate)}
                    </p>
                    {item.holiday && (
                      <p className="mt-2 text-sm text-yellow-300">
                        {item.holidayName || "Feriado"}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
            <table className="hidden w-full text-sm sm:table">
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

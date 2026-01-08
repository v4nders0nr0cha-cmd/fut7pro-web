"use client";

import { useMemo } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Head from "next/head";
import Link from "next/link";
import { useProximosRachas } from "@/hooks/useProximosRachas";
import type { ProximoRachaItem } from "@/types/agenda";

function parseOccurrenceDate(item: ProximoRachaItem) {
  if (!item.date || !item.time) return null;
  const [year, month, day] = item.date.split("-").map((part) => Number(part));
  const [hour, minute] = item.time.split(":").map((part) => Number(part));
  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) return null;
  return new Date(year, month - 1, day, hour, minute);
}

function formatOccurrenceLabel(item: ProximoRachaItem) {
  const date = parseOccurrenceDate(item);
  if (!date) return item.date;
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${weekday}, ${date.getDate()} de ${month} de ${date.getFullYear()}`;
}

export default function ProximosRachasPage() {
  const { items, isLoading, isError, error } = useProximosRachas({ limit: 5 });

  const ocorrencias = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: formatOccurrenceLabel(item),
        time: item.time,
        holiday: Boolean(item.holiday),
        holidayName: item.holidayName ?? undefined,
      })),
    [items]
  );

  const temFeriado = useMemo(() => items.some((item) => item.holiday), [items]);

  return (
    <>
      <Head>
        <title>Dias e Horários | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Confira os dias e horários recorrentes do seu racha Fut7Pro. Agenda dinâmica, aviso de feriados e gestão completa da agenda do time."
        />
        <meta
          name="keywords"
          content="fut7, racha, dias e horários, agenda do racha, futebol amador, painel admin, gestão de partidas, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-2xl w-full mx-auto bg-[#21252B] rounded-2xl shadow-lg px-6 py-6 flex flex-col min-h-[220px] justify-between">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-cyan-400 w-6 h-6" />
            <span className="text-lg font-bold text-cyan-300 tracking-wide">Dias e horários</span>
          </div>

          {isError && error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-4">
            {isLoading && ocorrencias.length === 0 ? (
              <div className="text-sm text-gray-400">Carregando dias e horários...</div>
            ) : ocorrencias.length === 0 ? (
              <div className="text-sm text-gray-400">
                Nenhuma agenda encontrada. Cadastre dias e horários para liberar a agenda.
              </div>
            ) : (
              ocorrencias.map((racha) => (
                <div
                  key={racha.id}
                  className={`flex flex-wrap items-center text-base font-medium rounded-lg px-2 py-1
                    ${
                      racha.holiday
                        ? "bg-red-100/10 border border-red-500/30 text-red-300"
                        : "text-white"
                    }
                  `}
                  style={{ letterSpacing: 0.5 }}
                >
                  <span className="capitalize">{racha.label}</span>
                  <span className="ml-2 text-cyan-200 font-semibold">- {racha.time}</span>
                  {racha.holiday && (
                    <span
                      className="ml-3 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded shadow font-semibold"
                      title={racha.holidayName}
                    >
                      FERIADO{racha.holidayName ? `: ${racha.holidayName}` : ""}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            href="/admin/rachas"
            className="mt-2 w-full text-center bg-cyan-600 hover:bg-cyan-700 transition text-white font-semibold py-2 px-4 rounded-xl text-sm"
          >
            Gerenciar dias e horarios
          </Link>

          <div className="mt-3 text-xs text-gray-400 text-center">
            Os dias e horários são calculados automaticamente pelos dias fixos cadastrados.
            <br />
            {temFeriado && (
              <span className="text-red-400 font-semibold">
                Atencao: datas em vermelho coincidem com feriados nacionais!
              </span>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

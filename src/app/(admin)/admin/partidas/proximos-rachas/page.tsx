// src/app/admin/partidas/proximos-rachas/page.tsx
"use client";

import { FaCalendarAlt } from "react-icons/fa";
import Head from "next/head";
import Link from "next/link";

const FERIADOS_2025 = [
  [1, 1],
  [2, 3],
  [3, 21],
  [4, 1],
  [8, 7],
  [9, 12],
  [10, 2],
  [10, 15],
  [11, 25],
];

const DIAS_FIXOS = [
  { dia: 6, horario: "06:00" },
  { dia: 3, horario: "20:30" },
];

function getNextOccurrences(diasFixos: { dia: number; horario: string }[], qtd = 5) {
  const now = new Date();
  let ocorrencias: {
    data: Date;
    diaSemanaExtenso: string;
    diaNumero: number;
    mesExtenso: string;
    ano: number;
    horario: string;
    feriado: boolean;
    nomeFeriado?: string;
  }[] = [];
  for (let i = 0; ocorrencias.length < qtd && i < 90; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    diasFixos.forEach((fixo) => {
      if (d.getDay() === fixo.dia) {
        const feriado = isFeriado(d);
        ocorrencias.push({
          data: new Date(d),
          diaSemanaExtenso: d.toLocaleDateString("pt-BR", { weekday: "long" }),
          diaNumero: d.getDate(),
          mesExtenso: d.toLocaleDateString("pt-BR", { month: "long" }),
          ano: d.getFullYear(),
          horario: fixo.horario,
          feriado: !!feriado,
          nomeFeriado: feriado ?? undefined,
        });
      }
    });
  }
  return ocorrencias.slice(0, qtd);
}

function isFeriado(date: Date): string | null {
  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  for (const [fMes, fDia] of FERIADOS_2025) {
    if (fDia === dia && fMes === mes) {
      return getNomeFeriado(mes, dia);
    }
  }
  return null;
}

function getNomeFeriado(mes: number, dia: number): string {
  const mapa: Record<string, string> = {
    "1-1": "Confraternização Universal",
    "2-3": "Carnaval",
    "3-21": "Tiradentes",
    "4-1": "Dia do Trabalhador",
    "8-7": "Independência",
    "9-12": "Nossa Senhora Aparecida",
    "10-2": "Finados",
    "10-15": "Proclamação da República",
    "11-25": "Natal",
  };
  return mapa[`${mes}-${dia}`] ?? "Feriado Nacional";
}

export default function ProximosRachasPage() {
  const ocorrencias = getNextOccurrences(DIAS_FIXOS, 5);

  return (
    <>
      <Head>
        <title>Próximos Rachas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Confira os próximos dias e horários dos rachas já programados no seu racha Fut7Pro. Agenda dinâmica, aviso de feriados e gestão completa dos eventos do seu time!"
        />
        <meta
          name="keywords"
          content="fut7, racha, próximos jogos, agenda de racha, futebol amador, painel admin, gestão de partidas, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-2xl w-full mx-auto bg-[#21252B] rounded-2xl shadow-lg px-6 py-6 flex flex-col min-h-[220px] justify-between">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-cyan-400 w-6 h-6" />
            <span className="text-lg font-bold text-cyan-300 tracking-wide">Próximos rachas</span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {ocorrencias.map((racha, idx) => (
              <div
                key={idx}
                className={`flex flex-wrap items-center text-base font-medium rounded-lg px-2 py-1
                                    ${
                                      racha.feriado
                                        ? "bg-red-100/10 border border-red-500/30 text-red-300"
                                        : "text-white"
                                    }
                                `}
                style={{ letterSpacing: 0.5 }}
              >
                <span className="capitalize">
                  {racha.diaSemanaExtenso}, {racha.diaNumero} de {racha.mesExtenso} de {racha.ano}
                </span>
                <span className="ml-2 text-cyan-200 font-semibold">• {racha.horario}</span>
                {racha.feriado && (
                  <span
                    className="ml-3 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded shadow font-semibold"
                    title={racha.nomeFeriado}
                  >
                    FERIADO{racha.nomeFeriado ? `: ${racha.nomeFeriado}` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/admin/rachas"
            className="mt-2 w-full text-center bg-cyan-600 hover:bg-cyan-700 transition text-white font-semibold py-2 px-4 rounded-xl text-sm"
          >
            Gerenciar dias e horários
          </Link>

          <div className="mt-3 text-xs text-gray-400 text-center">
            Os próximos rachas são calculados automaticamente pelos dias fixos cadastrados.
            <br />
            {ocorrencias.some((o) => o.feriado) && (
              <span className="text-red-400 font-semibold">
                Atenção: datas em vermelho coincidem com feriados nacionais!
              </span>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

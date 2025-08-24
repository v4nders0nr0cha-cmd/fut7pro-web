// src/app/admin/partidas/gerenciar-rachas/page.tsx
"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaCalendarPlus,
  FaTrash,
  FaClock,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MOCK_RACHAS = [
  {
    id: 1,
    dia: 6,
    hora: "06:00",
    proximaData: "Sáb 06/07/25",
    feriado: false,
    feriadoNome: "",
  },
  {
    id: 2,
    dia: 3,
    hora: "20:30",
    proximaData: "Qua 10/07/25",
    feriado: true,
    feriadoNome: "Feriado Municipal",
  },
];

export default function GerenciarRachasPage() {
  const [rachas, setRachas] = useState(MOCK_RACHAS);
  const [novoDia, setNovoDia] = useState<number>(6);
  const [novoHorario, setNovoHorario] = useState<string>("");

  function adicionarRacha() {
    if (!novoHorario) return;
    setRachas([
      ...rachas,
      {
        id: Math.random(),
        dia: novoDia,
        hora: novoHorario,
        proximaData: DIAS_SEMANA[novoDia]?.substring(0, 3) + " XX/XX/XX",
        feriado: false,
        feriadoNome: "",
      },
    ]);
    setNovoHorario("");
  }

  function removerRacha(id: number) {
    setRachas(rachas.filter((r) => r.id !== id));
  }

  return (
    <>
      <Head>
        <title>
          Gerenciar Dias & Horários do Racha | Painel Admin - Fut7Pro
        </title>
        <meta
          name="description"
          content="Cadastre, edite e remova os dias e horários do seu racha. Receba alertas de feriado automaticamente. Gestão profissional no Fut7Pro."
        />
        <meta
          name="keywords"
          content="gestão racha, cadastrar horário, agenda futebol, racha recorrente, painel admin fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <FaCalendarPlus className="text-3xl text-cyan-400" />
            <h1 className="text-2xl font-bold text-yellow-400 md:text-3xl">
              Gerenciar Dias & Horários do Racha
            </h1>
          </div>

          <p className="mb-8 text-gray-300">
            Cadastre todos os dias e horários em que seu racha acontece na
            semana. O sistema avisará caso algum caia em feriado.
          </p>

          <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row">
            <select
              className="rounded border border-[#333] bg-[#21272c] px-3 py-2 text-white focus:outline-none"
              value={novoDia}
              onChange={(e) => setNovoDia(Number(e.target.value))}
            >
              {DIAS_SEMANA.map((dia, i) => (
                <option key={i} value={i}>
                  {dia}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="rounded border border-[#333] bg-[#21272c] px-3 py-2 text-white focus:outline-none"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              placeholder="Horário"
            />
            <button
              className="flex items-center gap-2 rounded bg-cyan-600 px-5 py-2 font-bold text-white shadow transition hover:bg-cyan-700"
              onClick={adicionarRacha}
            >
              <FaCheck /> Adicionar
            </button>
          </div>

          <div className="rounded-xl bg-[#23272F] p-5 shadow">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <FaClock className="text-cyan-400" /> Dias & horários cadastrados
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#23272F] text-left text-gray-400">
                  <th className="px-3 py-2">Dia da Semana</th>
                  <th className="px-3 py-2">Horário</th>
                  <th className="px-3 py-2">Próximo Racha</th>
                  <th className="px-3 py-2">Feriado?</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rachas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nenhum racha cadastrado.
                    </td>
                  </tr>
                ) : (
                  rachas.map((racha) => (
                    <tr
                      key={racha.id}
                      className="border-b border-[#181B20] hover:bg-[#222630]"
                    >
                      <td className="px-3 py-2 text-white">
                        {DIAS_SEMANA[racha.dia] ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-white">{racha.hora}</td>
                      <td className="px-3 py-2 text-gray-300">
                        {racha.proximaData}
                      </td>
                      <td className="px-3 py-2">
                        {racha.feriado ? (
                          <span className="flex items-center gap-1 font-bold text-yellow-300">
                            <FaExclamationTriangle />
                            {racha.feriadoNome || "Feriado"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-green-400">
                            <FaCheck /> Não
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removerRacha(racha.id)}
                          className="text-red-400 transition hover:text-red-600"
                          title="Remover"
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

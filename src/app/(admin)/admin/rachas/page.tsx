// src/app/admin/partidas/gerenciar-rachas/page.tsx
"use client";

import Head from "next/head";
import { useState } from "react";
import { FaCalendarPlus, FaTrash, FaClock, FaCheck, FaExclamationTriangle } from "react-icons/fa";

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
  { id: 1, dia: 6, hora: "06:00", proximaData: "Sáb 06/07/25", feriado: false, feriadoNome: "" },
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
        <title>Gerenciar Dias & Horários do Racha | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre, edite e remova os dias e horários do seu racha. Receba alertas de feriado automaticamente. Gestão profissional no Fut7Pro."
        />
        <meta
          name="keywords"
          content="gestão racha, cadastrar horário, agenda futebol, racha recorrente, painel admin fut7pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 bg-fundo min-h-screen">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FaCalendarPlus className="text-cyan-400 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
              Gerenciar Dias & Horários do Racha
            </h1>
          </div>

          <p className="text-gray-300 mb-8">
            Cadastre todos os dias e horários em que seu racha acontece na semana. O sistema avisará
            caso algum caia em feriado.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <select
              className="bg-[#21272c] text-white border border-[#333] rounded px-3 py-2 focus:outline-none"
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
              className="bg-[#21272c] text-white border border-[#333] rounded px-3 py-2 focus:outline-none"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              placeholder="Horário"
            />
            <button
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2 rounded transition shadow"
              onClick={adicionarRacha}
            >
              <FaCheck /> Adicionar
            </button>
          </div>

          <div className="bg-[#23272F] rounded-xl shadow p-5">
            <div className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <FaClock className="text-cyan-400" /> Dias & horários cadastrados
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-[#23272F]">
                  <th className="py-2 px-3">Dia da Semana</th>
                  <th className="py-2 px-3">Horário</th>
                  <th className="py-2 px-3">Próximo Racha</th>
                  <th className="py-2 px-3">Feriado?</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {rachas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-gray-500 text-center">
                      Nenhum racha cadastrado.
                    </td>
                  </tr>
                ) : (
                  rachas.map((racha) => (
                    <tr key={racha.id} className="border-b border-[#181B20] hover:bg-[#222630]">
                      <td className="py-2 px-3 text-white">{DIAS_SEMANA[racha.dia] ?? "—"}</td>
                      <td className="py-2 px-3 text-white">{racha.hora}</td>
                      <td className="py-2 px-3 text-gray-300">{racha.proximaData}</td>
                      <td className="py-2 px-3">
                        {racha.feriado ? (
                          <span className="flex items-center gap-1 text-yellow-300 font-bold">
                            <FaExclamationTriangle />
                            {racha.feriadoNome || "Feriado"}
                          </span>
                        ) : (
                          <span className="text-green-400 font-bold flex items-center gap-1">
                            <FaCheck /> Não
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => removerRacha(racha.id)}
                          className="text-red-400 hover:text-red-600 transition"
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

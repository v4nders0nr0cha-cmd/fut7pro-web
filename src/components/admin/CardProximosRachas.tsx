"use client";

import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

// MOCK dos dias fixos cadastrados (vem da tela de gestão)
const DIAS_FIXOS = [
  { dia: 6, horario: "06:00" }, // Sábado
  { dia: 3, horario: "20:30" }, // Quarta-feira
];

// MOCK: datas futuras
function getNextOccurrences(diasFixos: { dia: number; horario: string }[], qtd = 5) {
  const now = new Date();
  let ocorrencias: { dataStr: string }[] = [];
  for (let i = 0; ocorrencias.length < qtd && i < 60; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    diasFixos.forEach((fixo) => {
      if (d.getDay() === fixo.dia) {
        ocorrencias.push({
          dataStr: `${capitalizeFirst(d.toLocaleDateString("pt-BR", { weekday: "short" }))}. ${formatData(d)} • ${fixo.horario}`,
        });
      }
    });
  }
  return ocorrencias.slice(0, qtd);
}
function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function formatData(d: Date) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

export default function CardProximosRachas() {
  const ocorrencias = getNextOccurrences(DIAS_FIXOS, 5);

  return (
    <div className="bg-[#21252B] rounded-2xl shadow-lg px-6 py-6 flex flex-col min-h-[220px] justify-between w-full">
      {/* Título */}
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-cyan-400 w-6 h-6" />
        <span className="text-lg font-bold text-cyan-300 tracking-wide">Próximos rachas</span>
      </div>
      {/* Lista */}
      <div className="flex flex-col gap-1 mb-4">
        {ocorrencias.map((racha, idx) => (
          <div
            key={idx}
            className="flex items-center text-base text-white font-medium"
            style={{ letterSpacing: 0.5 }}
          >
            {racha.dataStr}
          </div>
        ))}
      </div>
      {/* Botão */}
      <Link
        href="/admin/rachas"
        className="mt-2 w-full text-center bg-cyan-600 hover:bg-cyan-700 transition text-white font-semibold py-2 px-4 rounded-xl text-sm"
      >
        Gerenciar dias e horários
      </Link>
      {/* Info extra */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Os próximos rachas são calculados automaticamente pelos dias fixos cadastrados.
      </div>
    </div>
  );
}

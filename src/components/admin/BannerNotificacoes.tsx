"use client";

import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

// MOCK: Próximos rachas/feriados (simule integração real depois)
const PROXIMOS_RACHAS = [
  { data: "Sáb 06/07/25", hora: "06:00", feriado: false },
  {
    data: "Qua 10/07/25",
    hora: "20:30",
    feriado: true,
    feriadoNome: "Feriado Municipal",
  },
];

export default function BannerNotificacoes() {
  const [showBanner, setShowBanner] = useState(true);

  // Só exibe alerta se houver feriado marcado
  const feriadoRacha = PROXIMOS_RACHAS.find((r) => r.feriado);

  if (!feriadoRacha || !showBanner) return null;

  return (
    <div className="mb-4">
      <div className="relative flex items-center rounded-lg border-l-4 border-yellow-400 bg-yellow-900 px-4 py-3 text-sm font-semibold text-yellow-200 shadow">
        <FaExclamationTriangle className="mr-3 text-lg text-yellow-400" />
        <span>
          📣 Atenção: Seu racha está agendado para um dia de feriado (
          {feriadoRacha.data}
          {feriadoRacha.feriadoNome ? " - " + feriadoRacha.feriadoNome : ""}).
          Confirme se o racha irá acontecer normalmente ou reagende.
        </span>
        {/* Botão fechar/recolher */}
        <button
          className="absolute right-3 top-2 text-lg text-yellow-300 transition hover:text-white"
          aria-label="Fechar alerta"
          onClick={() => setShowBanner(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

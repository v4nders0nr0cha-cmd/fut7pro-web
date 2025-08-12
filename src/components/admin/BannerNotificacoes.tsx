"use client";

import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

// MOCK: Próximos rachas/feriados (simule integração real depois)
const PROXIMOS_RACHAS = [
  { data: "Sáb 06/07/25", hora: "06:00", feriado: false },
  { data: "Qua 10/07/25", hora: "20:30", feriado: true, feriadoNome: "Feriado Municipal" },
];

export default function BannerNotificacoes() {
  const [showBanner, setShowBanner] = useState(true);

  // Só exibe alerta se houver feriado marcado
  const feriadoRacha = PROXIMOS_RACHAS.find((r) => r.feriado);

  if (!feriadoRacha || !showBanner) return null;

  return (
    <div className="mb-4">
      <div className="relative flex items-center px-4 py-3 rounded-lg bg-yellow-900 text-yellow-200 border-l-4 border-yellow-400 shadow text-sm font-semibold">
        <FaExclamationTriangle className="text-yellow-400 mr-3 text-lg" />
        <span>
          📣 Atenção: Seu racha está agendado para um dia de feriado ({feriadoRacha.data}
          {feriadoRacha.feriadoNome ? " - " + feriadoRacha.feriadoNome : ""}). Confirme se o racha
          irá acontecer normalmente ou reagende.
        </span>
        {/* Botão fechar/recolher */}
        <button
          className="absolute top-2 right-3 text-yellow-300 hover:text-white text-lg transition"
          aria-label="Fechar alerta"
          onClick={() => setShowBanner(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

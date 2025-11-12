"use client";

import { useMemo, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

type ProximoRacha = {
  dataISO: string;
  feriado: boolean;
  feriadoNome?: string;
};

// TODO: substituir pelo retorno real do backend assim que o endpoint de agenda estiver disponível.
const PROXIMOS_RACHAS: ProximoRacha[] = [
  { dataISO: "2025-07-06T06:00:00-03:00", feriado: false },
  { dataISO: "2025-07-10T20:30:00-03:00", feriado: true, feriadoNome: "Feriado Municipal" },
];

function formatarLabelData(data: Date) {
  const weekday = data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(/\.$/, "");
  const capitalizado = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mes = data.toLocaleDateString("pt-BR", { month: "2-digit" });
  const ano = data.toLocaleDateString("pt-BR", { year: "2-digit" });

  return `${capitalizado} ${dia}/${mes}/${ano}`;
}

export default function BannerNotificacoes() {
  const [showBanner, setShowBanner] = useState(true);

  const feriadoRacha = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return (
      PROXIMOS_RACHAS.map((racha) => {
        const data = new Date(racha.dataISO);
        if (Number.isNaN(data.getTime())) {
          return null;
        }

        const dataComparacao = new Date(data);
        dataComparacao.setHours(0, 0, 0, 0);

        return {
          ...racha,
          data,
          label: formatarLabelData(data),
          dataComparacao,
        };
      })
        .filter(
          (
            racha
          ): racha is {
            dataISO: string;
            feriado: boolean;
            feriadoNome?: string;
            data: Date;
            label: string;
            dataComparacao: Date;
          } => Boolean(racha && racha.feriado)
        )
        .filter((racha) => racha.dataComparacao.getTime() >= hoje.getTime())
        .sort((a, b) => a.dataComparacao.getTime() - b.dataComparacao.getTime())[0] ?? null
    );
  }, []);

  if (!feriadoRacha || !showBanner) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="relative flex items-center px-4 py-3 rounded-lg bg-yellow-900 text-yellow-200 border-l-4 border-yellow-400 shadow text-sm font-semibold">
        <FaExclamationTriangle className="text-yellow-400 mr-3 text-lg" />
        <span>
          Atenção: seu racha está agendado para um dia de feriado ({feriadoRacha.label}
          {feriadoRacha.feriadoNome ? ` - ${feriadoRacha.feriadoNome}` : ""}). Confirme se o racha
          irá acontecer normalmente ou reagende.
        </span>
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

"use client";

import { useNotification } from "@/context/NotificationContext";
import { FaExclamationTriangle } from "react-icons/fa";

export default function CardAlertaDashboard() {
  const { jogadores, partidas, config } = useNotification();

  const alertas: string[] = [];

  if (jogadores > 0) {
    alertas.push(
      `${jogadores} jogador${jogadores > 1 ? "es" : ""} aguardando aprovação`,
    );
  }

  if (partidas > 0) {
    alertas.push(`${partidas} partida${partidas > 1 ? "s" : ""} com pendência`);
  }

  if (config > 0) {
    alertas.push(`${config} configuração pendente`);
  }

  if (alertas.length === 0) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded border-l-4 border-yellow-400 bg-yellow-800 p-4 text-yellow-100 shadow">
      <FaExclamationTriangle className="mt-0.5 text-2xl" />
      <div>
        <strong className="mb-1 block">Atenção, presidente!</strong>
        <ul className="list-inside list-disc space-y-0.5 text-sm">
          {alertas.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

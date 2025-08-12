"use client";

import { useNotification } from "@/context/NotificationContext";
import { FaExclamationTriangle } from "react-icons/fa";

export default function CardAlertaDashboard() {
  const { jogadores, partidas, config } = useNotification();

  const alertas: string[] = [];

  if (jogadores > 0) {
    alertas.push(`${jogadores} jogador${jogadores > 1 ? "es" : ""} aguardando aprovação`);
  }

  if (partidas > 0) {
    alertas.push(`${partidas} partida${partidas > 1 ? "s" : ""} com pendência`);
  }

  if (config > 0) {
    alertas.push(`${config} configuração pendente`);
  }

  if (alertas.length === 0) return null;

  return (
    <div className="bg-yellow-800 text-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow mb-4 flex items-start gap-3">
      <FaExclamationTriangle className="text-2xl mt-0.5" />
      <div>
        <strong className="block mb-1">Atenção, presidente!</strong>
        <ul className="list-disc list-inside text-sm space-y-0.5">
          {alertas.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { sponsorsApi } from "@/lib/api";

type Alert = { id: string; text: string; tone: "warning" | "info" };

export default function BannerNotificacoes() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const list: Alert[] = [];
      // Feriado (mock visual existente)
      const feriado = { data: "Qua 10/07/25", feriado: true, feriadoNome: "Feriado Municipal" };
      if (feriado.feriado) {
        list.push({
          id: "feriado",
          text: `Atenção: Seu racha está agendado para um dia de feriado (${feriado.data}${feriado.feriadoNome ? " - " + feriado.feriadoNome : ""}). Confirme se o racha irá acontecer normalmente ou reagende.`,
          tone: "warning",
        });
      }
      // Patrocínios a expirar (30 dias)
      try {
        const res = await sponsorsApi.expiring(30);
        const data = (res.data as any) || { expiring: [], expired: [], counts: { expiring: 0, expired: 0 } };
        if ((data.counts?.expiring ?? 0) > 0) {
          const first = data.expiring[0];
          list.push({
            id: "sponsors-expiring",
            text: `Patrocínio a expirar: "${first.name}" (fim ${first.periodEnd?.slice(0, 10) ?? "—"}). Verifique em Financeiro > Patrocinadores.`,
            tone: "warning",
          });
        }
      } catch {}
      if (active) setAlerts(list);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {alerts.map((a) => (
        <AlertBanner key={a.id} text={a.text} tone={a.tone} />
      ))}
    </div>
  );
}

function AlertBanner({ text, tone }: { text: string; tone: "warning" | "info" }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const cls = tone === "warning" ? "bg-yellow-900 text-yellow-200 border-yellow-400" : "bg-blue-900 text-blue-200 border-blue-400";
  return (
    <div className={`relative flex items-center px-4 py-3 rounded-lg ${cls} border-l-4 shadow text-sm font-semibold`}>
      <FaExclamationTriangle className="mr-3 text-lg" />
      <span>{text}</span>
      <button className="absolute top-2 right-3 text-white/80 hover:text-white text-lg transition" aria-label="Fechar alerta" onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
}


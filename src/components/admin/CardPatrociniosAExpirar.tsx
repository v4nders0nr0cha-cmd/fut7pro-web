"use client";
import { useEffect, useState } from "react";
import { sponsorsApi } from "@/lib/api";

type Summary = {
  expiring: { id: string; name: string; periodEnd?: string }[];
  expired: { id: string; name: string; periodEnd?: string }[];
  counts: { expiring: number; expired: number };
};

export default function CardPatrociniosAExpirar() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await sponsorsApi.expiring(30);
    if (res.error) setError(res.error);
    setData((res.data as any) || { expiring: [], expired: [], counts: { expiring: 0, expired: 0 } });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function scan() {
    try {
      setScanning(true);
      await sponsorsApi.scanAlerts(30);
      await load();
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="bg-[#23272F] rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gray-100">Patrocínios a expirar</span>
        <button
          onClick={scan}
          disabled={scanning}
          className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-3 py-1 rounded"
        >
          {scanning ? "Gerando alertas..." : "Gerar alertas"}
        </button>
      </div>
      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-300">
            <b>{data?.counts.expiring ?? 0}</b> a expirar • <b>{data?.counts.expired ?? 0}</b> expirados
          </div>
          <ul className="text-sm text-gray-200 list-disc pl-5">
            {(data?.expiring || []).slice(0, 5).map((s) => (
              <li key={s.id}>
                {s.name} <span className="text-gray-400">(fim {s.periodEnd?.slice(0, 10) ?? "—"})</span>
              </li>
            ))}
            {(data?.expiring?.length ?? 0) === 0 && (
              <li className="text-gray-400 list-none">Nenhum patrocínio a expirar nos próximos 30 dias.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}


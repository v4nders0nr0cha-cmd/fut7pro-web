"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Partida } from "@/types/partida";

type Estado = "idle" | "loading" | "success" | "error";

export default function HistoricoClient() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [data, setData] = useState<Partida[]>([]);
  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setEstado("loading");
      try {
        const res = await fetch("/api/partidas/historico", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Falha ao buscar histórico");
        const json: Partida[] = await res.json();
        setData(Array.isArray(json) ? json : []);
        setEstado("success");
      } catch {
        setEstado("error");
      }
    };
    run();
  }, []);

  const lista = useMemo(() => {
    const text = q.trim().toLowerCase();
    const byText = (p: Partida) => {
      if (!text) return true;
      const alvo = [
        p.local,
        p.timeCasa?.nome,
        p.timeFora?.nome,
        p.destaque?.nome,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return alvo.includes(text);
    };

    const byDate = (p: Partida) => {
      if (!date) return true;
      // date esperado em YYYY-MM-DD no input
      const d = (p.data ?? "").slice(0, 10);
      return d === date;
    };

    return data.filter((p) => byText(p) && byDate(p));
  }, [data, q, date]);

  if (estado === "loading") {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
        <span className="ml-3 text-gray-200">
          Carregando histórico de partidas…
        </span>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-red-200">
        Erro ao carregar histórico. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros no mesmo padrão visual */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,220px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar time ou local…"
          className="w-full rounded-lg border border-gray-700 bg-[#0e0e0e] px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Buscar por time ou local"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-700 bg-[#0e0e0e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Filtrar por data"
        />
      </div>

      {/* Tabela/cards responsivos (visual alinhado ao Estatísticas) */}
      {lista.length === 0 ? (
        <p className="text-gray-300">Nenhuma partida encontrada.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#121212]">
          {/* Cabeçalho */}
          <div className="hidden grid-cols-12 gap-2 bg-black/40 px-4 py-3 text-xs uppercase tracking-wide text-gray-400 md:grid">
            <div className="col-span-2">Data</div>
            <div className="col-span-4">Confronto</div>
            <div className="col-span-2 text-center">Placar</div>
            <div className="col-span-3">Local</div>
            <div className="col-span-1 text-center">Destaque</div>
          </div>

          <ul className="divide-y divide-gray-800">
            {lista.map((p) => (
              <li
                key={p.id}
                className="hover:bg-white/2 px-3 py-3 transition md:px-4"
              >
                {/* Desktop layout */}
                <div className="hidden grid-cols-12 items-center gap-2 md:grid">
                  <div className="col-span-2 text-sm text-gray-300">
                    {formatDate(p.data)}{" "}
                    <span className="text-gray-500">• {p.hora}</span>
                  </div>

                  <div className="col-span-4 flex items-center gap-3">
                    <TimeBadge
                      nome={p.timeCasa?.nome ?? "Time A"}
                      logo={
                        p.timeCasa?.logo ?? "/images/times/time_padrao_01.png"
                      }
                      alt="Logo do time da casa"
                    />
                    <span className="text-gray-500">vs</span>
                    <TimeBadge
                      nome={p.timeFora?.nome ?? "Time B"}
                      logo={
                        p.timeFora?.logo ?? "/images/times/time_padrao_02.png"
                      }
                      alt="Logo do time visitante"
                    />
                  </div>

                  <div className="col-span-2 text-center font-semibold text-yellow-400">
                    {placar(p)}
                  </div>

                  <div className="col-span-3 text-sm text-gray-300">
                    {p.local}
                  </div>

                  <div className="col-span-1 text-center text-sm text-gray-200">
                    {p.destaque?.nome ?? "-"}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="space-y-2 md:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {formatDate(p.data)}{" "}
                      <span className="text-gray-500">• {p.hora}</span>
                    </span>
                    <span className="font-semibold text-yellow-400">
                      {placar(p)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <TimeBadge
                      nome={p.timeCasa?.nome ?? "Time A"}
                      logo={
                        p.timeCasa?.logo ?? "/images/times/time_padrao_01.png"
                      }
                      alt="Logo do time da casa"
                    />
                    <span className="text-gray-500">vs</span>
                    <TimeBadge
                      nome={p.timeFora?.nome ?? "Time B"}
                      logo={
                        p.timeFora?.logo ?? "/images/times/time_padrao_02.png"
                      }
                      alt="Logo do time visitante"
                    />
                  </div>

                  <div className="text-xs text-gray-400">
                    Local: <span className="text-gray-200">{p.local}</span>
                    {p.destaque?.nome ? (
                      <span className="ml-3">
                        Destaque:{" "}
                        <span className="text-gray-200">{p.destaque.nome}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function placar(p: Partida) {
  const c = p.timeCasa?.gols ?? 0;
  const f = p.timeFora?.gols ?? 0;
  return `${c} x ${f}`;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "-";
  }
}

function TimeBadge({
  nome,
  logo,
  alt,
}: {
  nome: string;
  logo: string;
  alt: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 overflow-hidden rounded">
        <Image
          src={logo}
          alt={alt}
          fill
          sizes="28px"
          className="object-contain"
        />
      </div>
      <span className="text-sm text-gray-200">{nome}</span>
    </div>
  );
}

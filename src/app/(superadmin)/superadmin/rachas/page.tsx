"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaSearch, FaDownload, FaSync } from "react-icons/fa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSuperadminRachas } from "@/hooks/useSuperadminRachas";
import type { SuperadminRachaResumo } from "@/types/superadmin";

const STATUS_COLORS: Record<string, string> = {
  ATIVO: "bg-green-700 text-green-200",
  TRIAL: "bg-yellow-700 text-yellow-200",
  INADIMPLENTE: "bg-red-700 text-red-200",
  BLOQUEADO: "bg-gray-600 text-gray-200",
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  try {
    return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return "-";
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return "-";
  try {
    return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    return "-";
  }
}

function computeStats(rachas: SuperadminRachaResumo[]) {
  const total = rachas.length;
  const ativos = rachas.filter((r) => r.status === "ATIVO").length;
  const trials = rachas.filter((r) => r.status === "TRIAL").length;
  const inadimplentes = rachas.filter((r) => r.status === "INADIMPLENTE").length;
  const bloqueados = rachas.filter((r) => r.bloqueado).length;
  const novosHoje = rachas.filter((r) => {
    try {
      const data = new Date(r.criadoEm);
      const hoje = new Date();
      return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
      );
    } catch (error) {
      return false;
    }
  }).length;

  return { total, ativos, trials, inadimplentes, bloqueados, novosHoje };
}

export default function RachasCadastradosPage() {
  const { rachas, isLoading, error, refresh } = useSuperadminRachas();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = useMemo(() => computeStats(rachas), [rachas]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const statusNormalized = statusFilter.trim().toUpperCase();

    return rachas.filter((racha) => {
      const byQuery =
        query.length === 0 ||
        racha.nome.toLowerCase().includes(query) ||
        racha.presidente.toLowerCase().includes(query) ||
        (racha.emailPresidente ?? "").toLowerCase().includes(query);

      const byStatus = statusNormalized.length === 0 ? true : racha.status === statusNormalized;

      return byQuery && byStatus;
    });
  }, [rachas, search, statusFilter]);

  return (
    <>
      <Head>
        <title>Gestão de Rachas - Painel SuperAdmin | Fut7Pro</title>
        <meta
          name="description"
          content="Administre todos os rachas SaaS na plataforma Fut7Pro e acompanhe status, planos e bloqueios."
        />
      </Head>
      <div className="w-full min-h-screen p-4 md:p-8 bg-[#101826] text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-yellow-400">Rachas cadastrados</h1>
          <div className="flex items-center gap-2">
            {error ? <span className="text-sm text-red-400">Erro ao carregar rachas</span> : null}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold shadow hover:bg-yellow-400"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <FaSync className={isLoading ? "animate-spin" : ""} /> Atualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 w-full mb-6">
          <ResumoCard title="Total" value={stats.total} />
          <ResumoCard title="Ativos" value={stats.ativos} accent="text-green-400" />
          <ResumoCard title="Trials" value={stats.trials} accent="text-yellow-300" />
          <ResumoCard title="Inadimplentes" value={stats.inadimplentes} accent="text-red-400" />
          <ResumoCard title="Bloqueados" value={stats.bloqueados} accent="text-gray-300" />
          <ResumoCard title="Novos hoje" value={stats.novosHoje} accent="text-blue-300" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
          <div className="flex items-center w-full md:w-1/2 bg-zinc-900 rounded-lg px-3 py-2">
            <FaSearch className="text-zinc-500 mr-2" />
            <input
              className="bg-transparent outline-none w-full text-zinc-100"
              placeholder="Buscar por nome, presidente ou email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar racha"
            />
          </div>
          <select
            className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar status"
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativos</option>
            <option value="TRIAL">Trial</option>
            <option value="INADIMPLENTE">Inadimplentes</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>
          <button
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow hover:scale-105 duration-150"
            onClick={() => window.print()}
          >
            <FaDownload /> Exportar CSV
          </button>
        </div>

        <div className="overflow-x-auto bg-zinc-900 rounded-xl shadow">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-950/60 text-zinc-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Racha</th>
                <th className="px-4 py-3 text-left">Presidente</th>
                <th className="px-4 py-3 text-left">Plano</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Atletas</th>
                <th className="px-4 py-3 text-left">Criado em</th>
                <th className="px-4 py-3 text-left">Último acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Carregando rachas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Nenhum racha encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((racha) => (
                  <tr key={racha.id} className="hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{racha.nome}</span>
                        <span className="text-xs text-zinc-400">Slug: {racha.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span>{racha.presidente}</span>
                        <span className="text-xs text-zinc-400">
                          {racha.emailPresidente ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-200">
                      {racha.plano ?? "Sem plano"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[racha.status] ?? "bg-zinc-700 text-zinc-200"}`}
                      >
                        {racha.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{racha.atletas}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(racha.criadoEm)}</td>
                    <td className="px-4 py-3 text-sm">{formatDateTime(racha.ultimoAcesso)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

interface ResumoCardProps {
  title: string;
  value: number;
  accent?: string;
}

function ResumoCard({ title, value, accent }: ResumoCardProps) {
  const valueClassName = accent ? `text-xl font-bold ${accent}` : "text-xl font-bold text-white";

  return (
    <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
      <span className="text-xs text-zinc-400">{title}</span>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}

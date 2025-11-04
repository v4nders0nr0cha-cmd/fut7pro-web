"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FaDownload, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { useAdminPlayerRankings } from "@/hooks/useAdminPlayerRankings";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/context/NotificationContext";

type Periodo = "mes" | "quadrimestre" | "ano" | "todos";

const PERIODOS: Array<{ label: string; value: Periodo }> = [
  { label: "Este mês", value: "mes" },
  { label: "Quadrimestre atual", value: "quadrimestre" },
  { label: "Ano", value: "ano" },
  { label: "Histórico completo", value: "todos" },
];

const MESES = [
  { label: "Janeiro", value: 1 },
  { label: "Fevereiro", value: 2 },
  { label: "Março", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Maio", value: 5 },
  { label: "Junho", value: 6 },
  { label: "Julho", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Setembro", value: 9 },
  { label: "Outubro", value: 10 },
  { label: "Novembro", value: 11 },
  { label: "Dezembro", value: 12 },
];

const QUADRIMESTRES = [
  { label: "1º quadrimestre (jan-abr)", value: 1 },
  { label: "2º quadrimestre (mai-ago)", value: 2 },
  { label: "3º quadrimestre (set-dez)", value: 3 },
];

const AVATAR_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

function resolveQuadrimestreByMonth(month: number) {
  if (month >= 1 && month <= 4) return 1;
  if (month >= 5 && month <= 8) return 2;
  return 3;
}

function formatDate(value?: string | null, timezone?: string) {
  if (!value) return "-";
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone ?? "America/Fortaleza",
      dateStyle: "short",
      timeStyle: "short",
    });
    return formatter.format(new Date(value));
  } catch {
    return "-";
  }
}

function toFortalezaISO(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) {
  return new Date(
    Date.UTC(year, month - 1, day, hour + 3, minute, second, millisecond)
  ).toISOString();
}

function getMonthRange(year: number, month: number) {
  const firstDay = 1;
  const lastDay = new Date(year, month, 0).getDate();

  return {
    start: toFortalezaISO(year, month, firstDay, 0, 0, 0, 0),
    end: toFortalezaISO(year, month, lastDay, 23, 59, 59, 999),
  };
}

export default function RankingAssiduidade() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? null;
  const { notify } = useNotification();
  const agora = useMemo(() => new Date(), []);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [anoSelecionado, setAnoSelecionado] = useState<number>(agora.getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number>(agora.getMonth() + 1);
  const [quadrimestreSelecionado, setQuadrimestreSelecionado] = useState<number>(
    resolveQuadrimestreByMonth(agora.getMonth() + 1)
  );

  const periodMap: Record<Periodo, "month" | "quarter" | "year" | "all"> = {
    mes: "month",
    quadrimestre: "quarter",
    ano: "year",
    todos: "all",
  };

  const { data, rankings, availableYears, isLoading, isError, error, timezone } =
    useAdminPlayerRankings({
      type: "geral",
      limit: 200,
      period: periodMap[periodo],
      year:
        periodMap[periodo] === "all"
          ? undefined
          : periodMap[periodo] === "month" ||
              periodMap[periodo] === "quarter" ||
              periodMap[periodo] === "year"
            ? anoSelecionado
            : undefined,
      month: periodMap[periodo] === "month" ? mesSelecionado : undefined,
      quarter: periodMap[periodo] === "quarter" ? quadrimestreSelecionado : undefined,
    });

  useEffect(() => {
    if (!availableYears.length) return;
    if (!availableYears.includes(anoSelecionado)) {
      setAnoSelecionado(availableYears[0]);
    }
  }, [availableYears, anoSelecionado]);

  const jogadoresOrdenados = useMemo(
    () =>
      [...rankings]
        .map((item) => ({
          ...item,
          jogos: item.jogos ?? 0,
          vitorias: item.vitorias ?? 0,
          empates: item.empates ?? 0,
          derrotas: item.derrotas ?? 0,
          pontos: item.pontos ?? 0,
        }))
        .sort((a, b) => b.jogos - a.jogos),
    [rankings]
  );

  const periodoAplicado = data?.appliedPeriod;
  const [formatoExport, setFormatoExport] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [exportando, setExportando] = useState(false);

  const handleExport = async () => {
    if (!tenantSlug) {
      notify({
        message: "Selecione um racha válido antes de exportar o ranking.",
        type: "warning",
      });
      return;
    }

    const params = new URLSearchParams();
    params.set("type", "geral");
    params.set("limit", String(200));
    params.set("slug", tenantSlug);
    params.set("format", formatoExport);

    const periodMode = periodMap[periodo];
    const ano = anoSelecionado;

    switch (periodMode) {
      case "year":
        params.set("period", "year");
        params.set("year", String(ano));
        break;
      case "quarter":
        params.set("period", "quarter");
        params.set("year", String(ano));
        params.set("quarter", String(quadrimestreSelecionado));
        break;
      case "month": {
        const range = getMonthRange(ano, mesSelecionado);
        params.set("period", "custom");
        params.set("start", range.start);
        params.set("end", range.end);
        break;
      }
      case "all":
      default:
        params.set("period", "all");
        break;
    }

    setExportando(true);
    try {
      const response = await fetch(`/api/admin/rankings/export?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? errorData.message ?? "Falha ao exportar ranking.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition =
        response.headers.get("Content-Disposition") ?? response.headers.get("content-disposition");
      link.href = url;
      link.download =
        extractFilename(disposition) ?? `ranking-assiduidade-${Date.now()}.${formatoExport}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify({ message: "Exportação do ranking iniciada com sucesso!", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível exportar o ranking.";
      notify({ message, type: "error" });
    } finally {
      setExportando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ranking de Assiduidade | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o ranking de assiduidade dos jogadores do seu racha: quem mais marcou presença em jogos oficiais no mês, quadrimestre, ano ou histórico completo."
        />
        <meta
          name="keywords"
          content="fut7, racha, ranking assiduidade, presença jogadores, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-cyan-300">Ranking de Assiduidade</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value as Periodo)}
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {periodo !== "todos" && (
              <select
                className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
                value={anoSelecionado}
                onChange={(event) => setAnoSelecionado(Number(event.target.value))}
              >
                {(availableYears.length ? availableYears : [anoSelecionado]).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            )}

            {periodo === "mes" && (
              <select
                className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
                value={mesSelecionado}
                onChange={(event) => setMesSelecionado(Number(event.target.value))}
              >
                {MESES.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            )}

            {periodo === "quadrimestre" && (
              <select
                className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
                value={quadrimestreSelecionado}
                onChange={(event) => setQuadrimestreSelecionado(Number(event.target.value))}
              >
                {QUADRIMESTRES.map((quadrimestre) => (
                  <option key={quadrimestre.value} value={quadrimestre.value}>
                    {quadrimestre.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
              value={formatoExport}
              onChange={(event) => setFormatoExport(event.target.value as typeof formatoExport)}
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportando || !tenantSlug}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exportando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FaDownload />
                  Exportar {formatoExport.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#23272f] border-l-4 border-cyan-400 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FaInfoCircle className="text-cyan-300 text-2xl shrink-0" />
          <div className="flex-1 text-sm text-gray-200 leading-relaxed">
            <b>O que é o Ranking de Assiduidade?</b>
            <br />
            Ele mostra <b>quais atletas mais participam dos jogos</b> do racha, considerando apenas
            presenças registradas oficialmente.
            <ul className="list-disc pl-5 my-2 text-gray-300">
              <li>Visível apenas para administradores.</li>
              <li>Períodos: mês, quadrimestre, ano ou histórico completo.</li>
              <li>Alta assiduidade = comprometimento e regularidade.</li>
              <li>Use para premiar e incentivar os mais assíduos.</li>
              <li>Baseado nos dados registrados no sistema.</li>
            </ul>
            <span className="block mt-2">
              <b>Dica:</b> reconheça os mais assíduos com brindes, status VIP ou descontos. Isso
              gera engajamento e fideliza o grupo.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#191b1f] rounded-2xl shadow border border-gray-800">
          {isLoading ? (
            <div className="py-8 px-6 text-center text-gray-400 text-sm">
              Carregando ranking de assiduidade...
            </div>
          ) : isError ? (
            <div className="py-8 px-6 text-center text-red-300 text-sm">
              Falha ao carregar ranking: {error}
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-cyan-200 text-left">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Jogador</th>
                  <th className="py-3 px-4 hidden md:table-cell">Posição</th>
                  <th className="py-3 px-4">Jogos</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Vitórias</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Empates</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Derrotas</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Pontos</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Último jogo</th>
                </tr>
              </thead>
              <tbody>
                {jogadoresOrdenados.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8">
                      Nenhum jogador registrado no período selecionado.
                    </td>
                  </tr>
                )}
                {jogadoresOrdenados.map((j, idx) => (
                  <tr
                    key={`${j.id}-${idx}`}
                    className="border-t border-gray-800 hover:bg-[#22242b]"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-300">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={j.foto?.trim() || AVATAR_FALLBACK}
                          alt={`Foto do jogador ${j.nome}`}
                          width={38}
                          height={38}
                          className="rounded-full border-2 border-cyan-400 shadow object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-white font-semibold leading-tight">{j.nome}</span>
                          {j.apelido && (
                            <span className="text-xs text-cyan-200 leading-tight">{j.apelido}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-300">
                      {j.posicao ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{j.jogos}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-200">{j.vitorias}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-200">{j.empates}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-200">{j.derrotas}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-200">{j.pontos}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-400">
                      {formatDate(j.lastMatchAt ?? j.updatedAt, timezone)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-4 text-center">
          * Apenas presenças lançadas no sistema são contabilizadas.
        </div>

        {periodoAplicado?.start && periodoAplicado?.end && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Recorte aplicado: {formatDate(periodoAplicado.start, timezone)} a{" "}
            {formatDate(periodoAplicado.end, timezone)}
          </div>
        )}
      </main>
    </>
  );
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!filenameMatch) return null;
  try {
    const raw = filenameMatch[1];
    if (raw.startsWith("UTF-8''")) {
      return decodeURIComponent(raw.slice(7));
    }
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return null;
  }
}


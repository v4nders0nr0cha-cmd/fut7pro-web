import { useCallback, useState } from "react";
import type { PlayerRankingType } from "@/types/ranking";

export type RankingExportFormat = "csv" | "xlsx" | "pdf";

export interface RankingExportFeedback {
  type: "success" | "error";
  message: string;
}

interface UseRankingExportParams {
  slug: string | null | undefined;
  type: PlayerRankingType;
  limit?: number;
  position?: string | null;
  period?: "all" | "year" | "quarter" | "custom";
  year?: number;
  quarter?: number;
  start?: string | null;
  end?: string | null;
  filenamePrefix: string;
}

const DEFAULT_MESSAGE = "Exportação iniciada com sucesso.";

export function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!match) return null;
  try {
    const raw = match[1];
    if (raw.startsWith("UTF-8''")) {
      return decodeURIComponent(raw.slice(7));
    }
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return null;
  }
}

export function useRankingExport({
  slug,
  type,
  limit,
  position,
  period,
  year,
  quarter,
  start,
  end,
  filenamePrefix,
}: UseRankingExportParams) {
  const [format, setFormat] = useState<RankingExportFormat>("xlsx");
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<RankingExportFeedback | null>(null);

  const handleExport = useCallback(
    async (overrideFormat?: RankingExportFormat) => {
      if (!slug) {
        setFeedback({ type: "error", message: "Racha não identificado para exportação." });
        return;
      }

      const chosenFormat = overrideFormat ?? format;
      setExporting(true);
      setFeedback(null);

      const params = new URLSearchParams({
        slug,
        type,
        format: chosenFormat,
      });
      if (limit) params.set("limit", String(limit));
      if (position) params.set("position", position);
      if (period) params.set("period", period);
      if (typeof year === "number" && !Number.isNaN(year)) {
        params.set("year", String(year));
      }
      if (typeof quarter === "number" && !Number.isNaN(quarter)) {
        params.set("quarter", String(quarter));
      }
      if (start) params.set("start", start);
      if (end) params.set("end", end);

      try {
        const response = await fetch(`/api/public/player-rankings/export?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: "Falha ao exportar ranking.",
          }));
          const message = errorData.error ?? errorData.message ?? "Falha ao exportar ranking.";
          throw new Error(message);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition =
          response.headers.get("Content-Disposition") ??
          response.headers.get("content-disposition");

        const fallbackName = `${filenamePrefix}-${Date.now()}.${chosenFormat}`;
        link.href = url;
        link.download = extractFilename(disposition) ?? fallbackName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setFeedback({ type: "success", message: DEFAULT_MESSAGE });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao exportar ranking.";
        setFeedback({ type: "error", message });
      } finally {
        setExporting(false);
      }
    },
    [slug, type, format, limit, position, period, year, quarter, start, end, filenamePrefix]
  );

  return {
    format,
    setFormat,
    exporting,
    feedback,
    setFeedback,
    handleExport,
  };
}

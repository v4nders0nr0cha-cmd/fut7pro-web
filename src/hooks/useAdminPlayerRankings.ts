"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { rankingsApi } from "@/lib/api";
import type { PositionValue } from "@/constants/positions";
import type { PlayerRankingResponse, PlayerRankingType } from "@/types/ranking";

type PeriodMode = "all" | "year" | "quarter" | "month" | "custom";

export interface AdminPlayerRankingParams {
  type: PlayerRankingType;
  limit?: number;
  position?: PositionValue | null;
  period?: PeriodMode;
  year?: number;
  quarter?: number;
  month?: number;
  start?: string | null;
  end?: string | null;
}

interface RankingQueryPayload {
  limit?: number;
  position?: PositionValue;
  period?: "all" | "year" | "quarter" | "custom";
  year?: number;
  quarter?: number;
  start?: string;
  end?: string;
}

const FORTALEZA_TIMEZONE = "America/Fortaleza";

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

function resolveQuarter(month: number) {
  if (month >= 1 && month <= 4) return 1;
  if (month >= 5 && month <= 8) return 2;
  return 3;
}

function buildRankingQuery(params: AdminPlayerRankingParams, now: Date): RankingQueryPayload {
  const base: RankingQueryPayload = {};

  if (params.limit !== undefined) {
    base.limit = params.limit;
  }
  if (params.position) {
    base.position = params.position;
  }

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  switch (params.period) {
    case "year": {
      base.period = "year";
      base.year = params.year ?? currentYear;
      break;
    }
    case "quarter": {
      base.period = "quarter";
      base.year = params.year ?? currentYear;
      base.quarter = params.quarter ?? resolveQuarter(currentMonth);
      break;
    }
    case "month": {
      const year = params.year ?? currentYear;
      const month = params.month ?? currentMonth;
      const range = getMonthRange(year, month);
      base.period = "custom";
      base.start = range.start;
      base.end = range.end;
      break;
    }
    case "custom": {
      base.period = "custom";
      if (params.start) base.start = params.start;
      if (params.end) base.end = params.end;
      break;
    }
    case "all":
    default: {
      base.period = "all";
      break;
    }
  }

  return base;
}

export function useAdminPlayerRankings(params: AdminPlayerRankingParams) {
  const now = useMemo(() => new Date(), []);
  const query = useMemo(() => buildRankingQuery(params, now), [params, now]);

  const key = params.type
    ? `admin-player-rankings:${params.type}:${JSON.stringify({
        limit: params.limit ?? null,
        position: params.position ?? null,
        query,
      })}`
    : null;

  const fetcher = useCallback(async () => {
    if (!params.type) {
      throw new Error("Tipo de ranking obrigatorio");
    }
    const response = await rankingsApi.getPlayerRankings(params.type, query);
    if (response.error || !response.data) {
      throw new Error(response.error ?? "Falha ao carregar rankings");
    }
    return response.data;
  }, [params.type, query]);

  const { data, error, isLoading, mutate, isValidating } = useSWR<PlayerRankingResponse>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const rankings = data?.results ?? [];
  const availableYears = data?.availableYears ?? [];

  return {
    data,
    rankings,
    availableYears,
    isLoading,
    isValidating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
    timezone: FORTALEZA_TIMEZONE,
  };
}

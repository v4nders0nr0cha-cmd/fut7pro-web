"use client";

import useSWR from "swr";
import { jogadoresApi } from "@/lib/api";

export interface AdminBirthday {
  id: string;
  name: string;
  nickname?: string | null;
  slug?: string | null;
  photoUrl?: string | null;
  birthDate: string | null;
  nextBirthday: string;
  daysUntil: number;
  ageAtNextBirthday: number;
}

interface Params {
  month?: number;
  rangeDays?: number;
  limit?: number;
}

const fetcher = async (params?: Params): Promise<AdminBirthday[]> => {
  const query: Record<string, string> = {};
  if (params?.month) query.month = String(params.month);
  if (params?.rangeDays) query.range = String(params.rangeDays);
  if (params?.limit) query.limit = String(params.limit);

  const response = await jogadoresApi.getBirthdays(query);
  if (response.error) {
    throw new Error(response.error);
  }
  return (response.data ?? []) as AdminBirthday[];
};

export function useAdminBirthdays(params?: Params) {
  const key = [
    "admin-birthdays",
    params?.month ?? null,
    params?.rangeDays ?? null,
    params?.limit ?? null,
  ];

  const { data, error, isLoading, mutate } = useSWR<AdminBirthday[]>(key, async () =>
    fetcher(params)
  );

  return {
    birthdays: data ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

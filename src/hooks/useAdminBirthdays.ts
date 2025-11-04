"use client";

import useSWR from "swr";
import { jogadoresApi } from "@/lib/api";
import type { Athlete } from "@/types/jogador";

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

function adaptAthleteToBirthday(athlete: Athlete, now: Date): AdminBirthday {
  const birthDate = athlete.birthDate ?? null;
  let nextBirthdayIso = "";
  let daysUntil = 0;
  let ageAtNextBirthday = 0;

  if (birthDate) {
    const birth = new Date(birthDate);
    if (!Number.isNaN(birth.getTime())) {
      let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (next < now) {
        next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
      }
      const diffMs = next.getTime() - now.getTime();
      daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      ageAtNextBirthday = next.getFullYear() - birth.getFullYear();
      nextBirthdayIso = next.toISOString();
    }
  }

  return {
    id: athlete.id,
    name: athlete.name,
    nickname: athlete.nickname ?? null,
    slug: athlete.slug ?? null,
    photoUrl: athlete.photoUrl ?? null,
    birthDate,
    nextBirthday: nextBirthdayIso,
    daysUntil,
    ageAtNextBirthday,
  };
}

const fetcher = async (params?: Params): Promise<AdminBirthday[]> => {
  const query: Record<string, string> = {};
  if (params?.month) query.month = String(params.month);
  if (params?.rangeDays) query.range = String(params.rangeDays);
  if (params?.limit) query.limit = String(params.limit);

  const response = await jogadoresApi.getBirthdays(query);
  const athletes = Array.isArray(response) ? (response as Athlete[]) : [];
  const now = new Date();
  return athletes.map((athlete) => adaptAthleteToBirthday(athlete, now));
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

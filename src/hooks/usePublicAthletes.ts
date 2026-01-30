import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";

export type PublicAthlete = {
  id: string;
  slug: string | null;
  nome: string;
  apelido?: string | null;
  posicao?: string | null;
  position?: string | null;
  foto?: string | null;
  status?: string | null;
  mensalista?: boolean | null;
};

type PublicAthletesResponse = {
  slug: string;
  results: PublicAthlete[];
  total: number;
  updatedAt?: string | null;
};

const fetcher = async (url: string): Promise<PublicAthletesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar atletas do racha");
  }
  return res.json();
};

export function usePublicAthletes(slug?: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const resolvedSlug = slug ?? rachaConfig.slug;
  const key = enabled && resolvedSlug ? `/api/public/${resolvedSlug}/athletes` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicAthletesResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    athletes: data?.results ?? [],
    total: data?.total ?? 0,
    slug: data?.slug ?? resolvedSlug,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}

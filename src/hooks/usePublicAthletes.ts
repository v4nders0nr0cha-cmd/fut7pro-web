import useSWR from "swr";

export type PublicAthlete = {
  id: string;
  slug: string | null;
  nome: string;
  apelido?: string | null;
  posicao?: string | null;
  position?: string | null;
  foto?: string | null;
  avatarUrl?: string | null;
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
  const resolvedSlug = slug?.trim() || "";
  const key = enabled && resolvedSlug ? `/api/public/${resolvedSlug}/athletes` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicAthletesResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const athletes = (data?.results ?? []).map((athlete) => {
    const avatarUrl = athlete.avatarUrl ?? athlete.foto ?? null;
    return {
      ...athlete,
      avatarUrl,
      foto: avatarUrl,
    };
  });

  return {
    athletes,
    total: data?.total ?? 0,
    slug: data?.slug ?? resolvedSlug,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}

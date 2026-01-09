import { useMemo } from "react";
import useSWR from "swr";
import type { Patrocinador, StatusPatrocinador } from "@/types/financeiro";

type SponsorApiItem = {
  id?: string;
  name?: string;
  logoUrl?: string;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  value?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  displayOrder?: number | null;
  tier?: string | null;
  showOnFooter?: boolean | null;
};

const DEFAULT_LOGO = "/images/patrocinadores/patrocinador_01.png";

const fetcher = async (url: string): Promise<SponsorApiItem[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Erro ao carregar patrocinadores");
  }
  return res.json();
};

const normalizeDate = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 10);
  return value;
};

const normalizePayloadDate = (value?: string | null) => {
  if (!value) return undefined;
  if (value.includes("T")) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const computeStatus = (inicio?: string, fim?: string): StatusPatrocinador => {
  const now = new Date();
  const start = inicio ? new Date(inicio) : null;
  const end = fim ? new Date(fim) : null;
  if (end && end.getTime() < now.getTime()) return "encerrado";
  if (start && start.getTime() > now.getTime()) return "inativo";
  return "ativo";
};

const normalizeSponsor = (item: SponsorApiItem, index: number): Patrocinador => {
  const periodoInicio = normalizeDate(item.periodStart);
  const periodoFim = normalizeDate(item.periodEnd);
  const descricao = item.about ?? item.benefit ?? item.coupon ?? undefined;
  const valor = typeof item.value === "number" ? item.value : Number(item.value ?? 0);
  const logo = item.logoUrl && item.logoUrl.trim().length > 0 ? item.logoUrl : DEFAULT_LOGO;

  return {
    id: String(item.id ?? `patrocinador-${index}`),
    nome: String(item.name ?? "Patrocinador"),
    valor: Number.isFinite(valor) ? valor : 0,
    periodoInicio,
    periodoFim,
    descricao,
    logo,
    status: computeStatus(periodoInicio, periodoFim),
    comprovantes: [],
    observacoes: descricao,
    link: item.link ?? undefined,
    visivel: item.showOnFooter ?? true,
  };
};

const buildSponsorPayload = (input: Partial<Patrocinador>) => {
  const nome = input.nome?.trim() || "";
  const logo = input.logo?.trim() || "";
  const descricao = input.observacoes?.trim() || input.descricao?.trim() || "";
  const link = input.link?.trim() || undefined;
  const valor = typeof input.valor === "number" ? input.valor : Number(input.valor ?? 0);

  return {
    name: nome,
    logoUrl: logo,
    link,
    value: Number.isFinite(valor) ? valor : 0,
    about: descricao || undefined,
    periodStart: normalizePayloadDate(input.periodoInicio),
    periodEnd: normalizePayloadDate(input.periodoFim),
    showOnFooter: input.visivel ?? true,
  };
};

export function usePatrocinadores() {
  const { data, error, isLoading, mutate } = useSWR<SponsorApiItem[]>(
    "/api/admin/patrocinadores",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const patrocinadores = useMemo(() => {
    const origem = Array.isArray(data) ? data : [];
    return origem.map(normalizeSponsor);
  }, [data]);

  async function addPatrocinador(p: Partial<Patrocinador>) {
    const payload = buildSponsorPayload(p);
    await fetch("/api/admin/patrocinadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    mutate();
  }

  async function updatePatrocinador(p: Patrocinador) {
    const payload = buildSponsorPayload(p);
    await fetch(`/api/admin/patrocinadores/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    mutate();
  }

  async function deletePatrocinador(id: string) {
    await fetch(`/api/admin/patrocinadores/${id}`, { method: "DELETE" });
    mutate();
  }

  return {
    patrocinadores,
    isLoading,
    isError: Boolean(error),
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  };
}

"use client";

import useSWR from "swr";
import type { MensagemContato } from "@/types/mensagem";

type RawContactMessage = {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt: string;
};

const mapMessage = (raw: RawContactMessage): MensagemContato => ({
  id: raw.id,
  slug: raw.slug,
  nome: raw.name,
  email: raw.email,
  telefone: raw.phone ?? undefined,
  assunto: raw.subject,
  mensagem: raw.message,
  dataEnvio: raw.createdAt,
  status: "novo",
});

type UseContactMessagesParams = {
  search?: string;
  limit?: number;
};

export function useContactMessages(params?: UseContactMessagesParams) {
  const searchParams = new URLSearchParams();
  if (params?.search) {
    searchParams.set("search", params.search);
  }
  if (typeof params?.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }
  const key = `/api/admin/contact/messages${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<RawContactMessage[]>(
    key,
    async (url: string) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          "Falha ao carregar mensagens";
        throw new Error(message);
      }
      const json = (await response.json()) as RawContactMessage[];
      return json;
    }
  );

  return {
    mensagens: data ? data.map(mapMessage) : [],
    isLoading,
    isValidating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

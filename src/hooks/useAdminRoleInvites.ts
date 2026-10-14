"use client";

import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { AdminRoleInvite } from "@/types/admin-roles";

type InvitesResponse = { results: AdminRoleInvite[] };

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || body?.error || "Não foi possível atualizar o convite.");
  }
  return body;
}

export function useAdminRoleInvites(enabled = true) {
  const { publicSlug } = usePublicLinks();
  const key = enabled && publicSlug ? `/api/public/${publicSlug}/admin-role-invites` : null;
  const { data, error, isLoading, mutate } = useSWR<InvitesResponse>(key, async (url: string) => {
    const response = await fetch(url, { cache: "no-store" });
    return readResponse(response);
  });

  const respond = async (inviteId: string, action: "accept" | "reject") => {
    if (!publicSlug) throw new Error("Grupo inválido.");
    const response = await fetch(
      `/api/public/${publicSlug}/admin-role-invites/${encodeURIComponent(inviteId)}/${action}`,
      { method: "POST" }
    );
    const payload = await readResponse(response);
    await mutate();
    return payload;
  };

  return {
    invites: data?.results ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    acceptInvite: (inviteId: string) => respond(inviteId, "accept"),
    rejectInvite: (inviteId: string) => respond(inviteId, "reject"),
    mutate,
  };
}

"use client";

import { useCallback, useRef, useState } from "react";
import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";

type GuideError = Error & { status?: number };

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      (body as { message?: string } | null)?.message || "Não foi possível carregar o Guia Fut7Pro."
    ) as GuideError;
    error.status = response.status;
    throw error;
  }
  return body as T;
}

async function fetchGuide(): Promise<AdminGuideData> {
  return readResponse<AdminGuideData>(await fetch("/api/admin/guide", { cache: "no-store" }));
}

export function useAdminGuide() {
  const { tenantSlug } = useRacha();
  const activeSlug = tenantSlug.trim().toLowerCase();
  const scopeRef = useRef(activeSlug);
  scopeRef.current = activeSlug;
  const inFlightRef = useRef(new Set<string>());
  const [actionFailure, setActionFailure] = useState<{ slug: string; error: GuideError } | null>(
    null
  );
  const [updatingSlugs, setUpdatingSlugs] = useState<Set<string>>(() => new Set());
  const { data, error, isLoading, mutate } = useSWR<AdminGuideData, GuideError>(
    activeSlug ? ["/api/admin/guide", activeSlug] : null,
    fetchGuide,
    {
      keepPreviousData: false,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      shouldRetryOnError: (cause) => ![401, 403, 404].includes(cause.status ?? 0),
      errorRetryCount: 1,
    }
  );
  const guide =
    ![401, 403].includes(error?.status ?? 0) && data?.tenant?.slug?.toLowerCase() === activeSlug
      ? data
      : null;

  const update = useCallback(
    async (action: AdminGuidePatch) => {
      if (!guide || scopeRef.current !== guide.tenant.slug.toLowerCase()) return false;
      const scope = scopeRef.current;
      if (inFlightRef.current.has(scope)) return false;
      inFlightRef.current.add(scope);
      setUpdatingSlugs((current) => new Set(current).add(scope));
      setActionFailure(null);
      try {
        await readResponse(
          await fetch("/api/admin/guide", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            cache: "no-store",
            body: JSON.stringify({ ...action, expectedRevision: guide.pedagogicalState.revision }),
          })
        );
        if (scope !== scopeRef.current) return false;
        await mutate();
        return true;
      } catch (cause) {
        if (scope !== scopeRef.current) return false;
        const issue = cause as GuideError;
        setActionFailure({ slug: scope, error: issue });
        if (issue.status === 409) await mutate();
        return false;
      } finally {
        inFlightRef.current.delete(scope);
        setUpdatingSlugs((current) => {
          const next = new Set(current);
          next.delete(scope);
          return next;
        });
      }
    },
    [guide, mutate]
  );

  return {
    guide,
    loading: Boolean(activeSlug) && isLoading,
    error: error ?? null,
    actionError: actionFailure?.slug === activeSlug ? actionFailure.error : null,
    updating: updatingSlugs.has(activeSlug),
    retry: () => mutate(),
    update,
  };
}

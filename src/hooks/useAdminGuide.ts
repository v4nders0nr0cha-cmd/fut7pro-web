"use client";

import { useCallback, useRef, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRacha } from "@/context/RachaContext";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";

type GuideError = Error & { status?: number };
type MutationQueue = { tail: Promise<void>; pending: number; revision: number };
const mutationQueues = new Map<string, MutationQueue>();

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
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const activeSlug = tenantSlug.trim().toLowerCase();
  const activeScope = `${userId}:${activeSlug}`;
  const scopeRef = useRef(activeScope);
  scopeRef.current = activeScope;
  const [actionFailure, setActionFailure] = useState<{ slug: string; error: GuideError } | null>(
    null
  );
  const [updatingSlugs, setUpdatingSlugs] = useState<Set<string>>(() => new Set());
  const { data, error, isLoading, mutate } = useSWR<AdminGuideData, GuideError>(
    activeSlug && userId ? ["/api/admin/guide", userId, activeSlug] : null,
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
      if (!guide || scopeRef.current !== `${userId}:${guide.tenant.slug.toLowerCase()}`)
        return false;
      const scope = scopeRef.current;
      let queue = mutationQueues.get(scope);
      if (!queue) {
        queue = { tail: Promise.resolve(), pending: 0, revision: guide.pedagogicalState.revision };
        mutationQueues.set(scope, queue);
      }
      const currentQueue = queue;
      currentQueue.pending += 1;
      setUpdatingSlugs((current) => new Set(current).add(scope));
      const execute = async () => {
        if (scope !== scopeRef.current) return false;
        setActionFailure(null);
        try {
          const send = () =>
            fetch("/api/admin/guide", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              cache: "no-store",
              body: JSON.stringify({ ...action, expectedRevision: currentQueue.revision }),
            }).then((response) =>
              readResponse<{
                pedagogicalState?: AdminGuideData["pedagogicalState"];
                claimed?: boolean;
              }>(response)
            );
          let result;
          try {
            result = await send();
          } catch (cause) {
            if (
              (cause as GuideError).status !== 409 ||
              !["STEP_SKIPPED", "PREPARATION_CELEBRATED", "FOOTBALL_INVITE_PRESENTED"].includes(
                action.action
              )
            )
              throw cause;
            const fresh = await mutate();
            if (!fresh || scope !== scopeRef.current) return false;
            currentQueue.revision = fresh.pedagogicalState.revision;
            const skippedId = action.action === "STEP_SKIPPED" ? action.tipId : null;
            if (
              skippedId &&
              (fresh.tasks.some((task) => task.id === skippedId && task.completed) ||
                fresh.pedagogicalState.dismissedTips.includes(skippedId))
            )
              return true;
            result = await send();
          }
          currentQueue.revision = result.pedagogicalState?.revision ?? currentQueue.revision + 1;
          if (scope !== scopeRef.current) return false;
          if (result.pedagogicalState)
            await mutate(
              (current) =>
                current ? { ...current, pedagogicalState: result.pedagogicalState! } : current,
              { revalidate: false }
            );
          // The PATCH is confirmed. A failed read must not report that it failed to save.
          const fresh = await mutate().catch(() => undefined);
          if (fresh) currentQueue.revision = fresh.pedagogicalState.revision;
          return (
            result.claimed !== false ||
            !["PREPARATION_CELEBRATED", "FOOTBALL_INVITE_PRESENTED"].includes(action.action)
          );
        } catch (cause) {
          if (scope !== scopeRef.current) return false;
          const issue = cause as GuideError;
          setActionFailure({ slug: scope, error: issue });
          if (issue.status === 409) {
            const fresh = await mutate().catch(() => undefined);
            if (fresh) currentQueue.revision = fresh.pedagogicalState.revision;
          }
          return false;
        }
      };
      const result = currentQueue.tail.then(execute, execute);
      currentQueue.tail = result.then(
        () => undefined,
        () => undefined
      );
      try {
        return await result;
      } finally {
        currentQueue.pending -= 1;
        if (!currentQueue.pending) mutationQueues.delete(scope);
        setUpdatingSlugs((current) => {
          const next = new Set(current);
          next.delete(scope);
          return next;
        });
      }
    },
    [guide, mutate, userId]
  );

  const retry = useCallback(() => mutate(), [mutate]);
  return {
    guide,
    loading: Boolean(activeSlug) && isLoading,
    error: error ?? null,
    actionError: actionFailure?.slug === activeScope ? actionFailure.error : null,
    updating: updatingSlugs.has(activeScope),
    retry,
    update,
  };
}

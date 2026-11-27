"use client";
import { useEffect, useRef, useState } from "react";
import { BillingApiError } from "@/lib/api/billing";

export default function useCentralResource<T>(
  key: string | null,
  load: (signal: AbortSignal) => Promise<T>,
  revision = 0
) {
  const loader = useRef(load);
  loader.current = load;
  const identity = useRef(key);
  const sequence = useRef(0);
  if (identity.current !== key) {
    identity.current = key;
    sequence.current += 1;
  }
  const [retry, setRetry] = useState(0);
  const [stored, setStored] = useState<{
    key: string | null;
    data: T | null;
    loading: boolean;
    error: string | null;
    status: number | null;
  }>({ key, data: null, loading: Boolean(key), error: null, status: null });
  const state =
    stored.key === key
      ? stored
      : { key, data: null, loading: Boolean(key), error: null, status: null };
  useEffect(() => {
    const request = ++sequence.current;
    const controller = new AbortController();
    if (!key) {
      setStored({ key, data: null, loading: false, error: null, status: null });
      return;
    }
    setStored((old) => ({
      key,
      data: old.key === key ? old.data : null,
      loading: true,
      error: null,
      status: null,
    }));
    loader
      .current(controller.signal)
      .then((data) => {
        if (identity.current === key && sequence.current === request && !controller.signal.aborted)
          setStored({ key, data, loading: false, error: null, status: null });
      })
      .catch((error) => {
        if (identity.current !== key || sequence.current !== request || controller.signal.aborted)
          return;
        setStored((old) => ({
          ...old,
          key,
          data:
            error instanceof BillingApiError && [401, 403].includes(error.status) ? null : old.data,
          loading: false,
          status: error instanceof BillingApiError ? error.status : null,
          error:
            error instanceof BillingApiError && error.status === 403
              ? "Seu acesso permite apenas o resumo da assinatura."
              : "Não foi possível carregar estas informações. Tente novamente.",
        }));
      });
    return () => {
      controller.abort();
      sequence.current += 1;
    };
  }, [key, revision, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}

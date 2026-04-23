"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (
    container: HTMLElement | string,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string | number;
  reset: (widgetId?: string | number) => void;
  remove: (widgetId?: string | number) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  enabled: boolean;
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetSignal?: number;
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
};

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const AUTH_APP_TURNSTILE_ENABLED = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true";

export const AUTH_APP_TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

export const TURNSTILE_REQUIRED_MESSAGE = "Confirme a verificação de segurança para continuar.";

export const TURNSTILE_INVALID_MESSAGE = "Não foi possível validar a segurança. Tente novamente.";

export const TURNSTILE_UNAVAILABLE_MESSAGE =
  "A verificação de segurança está indisponível. Tente novamente em instantes.";

export function isTurnstileErrorCode(code: unknown) {
  return (
    code === "TURNSTILE_REQUIRED" ||
    code === "TURNSTILE_INVALID" ||
    code === "TURNSTILE_UNAVAILABLE"
  );
}

export function resolveTurnstileErrorMessage(body: unknown, fallback = TURNSTILE_INVALID_MESSAGE) {
  const record = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const error = typeof record.error === "string" ? record.error.trim() : "";
  return message || error || fallback;
}

export default function TurnstileWidget({
  enabled,
  siteKey,
  onTokenChange,
  resetSignal = 0,
  className = "",
  theme = "dark",
  size = "normal",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const lastResetSignalRef = useRef(resetSignal);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !siteKey || !ready || !containerRef.current || !window.turnstile) {
      return;
    }
    if (widgetIdRef.current !== null) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      size,
      callback: (nextToken) => onTokenChange(nextToken),
      "expired-callback": () => onTokenChange(null),
      "error-callback": () => onTokenChange(null),
    });

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [enabled, onTokenChange, ready, siteKey, size, theme]);

  useEffect(() => {
    if (lastResetSignalRef.current === resetSignal) {
      return;
    }
    lastResetSignalRef.current = resetSignal;
    if (!enabled || widgetIdRef.current === null || !window.turnstile) {
      return;
    }
    window.turnstile.reset(widgetIdRef.current);
    onTokenChange(null);
  }, [enabled, onTokenChange, resetSignal]);

  if (!enabled) {
    return null;
  }

  if (!siteKey) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
        {TURNSTILE_UNAVAILABLE_MESSAGE}
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        id="cloudflare-turnstile"
        src={TURNSTILE_SCRIPT_SRC}
        async
        defer
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div className="flex min-h-[65px] items-center justify-start overflow-hidden rounded-lg">
        <div ref={containerRef} />
      </div>
    </div>
  );
}

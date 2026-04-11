"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaGift, FaShieldAlt } from "react-icons/fa";
import type { AdminNotificationItem } from "@/hooks/useAdminNotifications";

type Props = {
  open: boolean;
  notification: AdminNotificationItem | null;
  processing?: boolean;
  onDismiss: () => void;
  onViewDetails: () => void;
};

type CompensationMetadata = {
  daysGranted?: number;
  days?: number;
  newAccessUntil?: string;
  reasonCategory?: string;
  reasonDescription?: string;
  incidentCode?: string;
};

const reasonLabels: Record<string, string> = {
  SYSTEM_UNAVAILABILITY: "Instabilidade do sistema",
  LOGIN_FAILURE: "Falha de login",
  BILLING_ERROR: "Erro de cobrança",
  CRITICAL_BUG: "Bug crítico",
  EXTRAORDINARY_MAINTENANCE: "Manutenção extraordinária",
  COMMERCIAL_COURTESY: "Cortesia comercial",
  OTHER: "Compensação administrativa",
};

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatDate(value: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function resolveCompensationData(notification: AdminNotificationItem | null) {
  if (!notification) {
    return {
      daysGranted: null as number | null,
      newAccessUntil: null as string | null,
      reasonLabel: "Compensação administrativa",
      reasonDetail: null as string | null,
      incidentCode: null as string | null,
    };
  }

  const metadata = (notification.metadata || {}) as CompensationMetadata;
  const daysFromMetadata = toNumber(metadata.daysGranted ?? metadata.days);
  const fallbackDays = (() => {
    const match = notification.body.match(/\+(\d+)\s+dia/i);
    return match ? toNumber(match[1]) : null;
  })();

  const reasonCategory = toStringValue(metadata.reasonCategory) || "OTHER";
  const reasonLabel = reasonLabels[reasonCategory] || "Compensação administrativa";

  return {
    daysGranted: daysFromMetadata ?? fallbackDays,
    newAccessUntil: toStringValue(metadata.newAccessUntil),
    reasonLabel,
    reasonDetail: toStringValue(metadata.reasonDescription),
    incidentCode: toStringValue(metadata.incidentCode),
  };
}

export default function AccessCompensationGrantedModal({
  open,
  notification,
  processing = false,
  onDismiss,
  onViewDetails,
}: Props) {
  const reduceMotion = useReducedMotion();

  const data = useMemo(() => resolveCompensationData(notification), [notification]);

  useEffect(() => {
    if (!open || reduceMotion) return;

    let active = true;
    const burst = async () => {
      try {
        const module = await import("canvas-confetti");
        if (!active) return;
        module.default({
          particleCount: 80,
          spread: 65,
          startVelocity: 35,
          ticks: 140,
          scalar: 0.85,
          colors: ["#facc15", "#f59e0b", "#fde68a", "#fef3c7"],
          origin: { y: 0.35 },
        });
      } catch {
        // no-op
      }
    };

    const timer = window.setTimeout(burst, 380);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, reduceMotion]);

  const daysLabel = data.daysGranted ? `+${data.daysGranted} dias` : "Dias extras";

  return (
    <AnimatePresence>
      {open && notification ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Compensação concedida ao seu racha"
        >
          <motion.div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-amber-400/45 bg-[#121212] p-6 text-white shadow-[0_36px_110px_-35px_rgba(251,191,36,0.52)]"
            initial={{ y: reduceMotion ? 0 : 28, scale: reduceMotion ? 1 : 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: reduceMotion ? 0 : 10, scale: 0.98, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.16 : 0.35, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.26),_transparent_58%)]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/45 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                <FaShieldAlt className="text-[11px]" /> Compensação oficial Fut7Pro
              </span>
            </div>

            <div className="relative z-10 mt-5 flex flex-col items-center text-center">
              <motion.div
                className="relative flex h-28 w-28 items-center justify-center"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.28 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-amber-300/55 bg-gradient-to-br from-amber-300/35 via-amber-500/25 to-amber-700/30 shadow-[0_0_40px_rgba(251,191,36,0.35)]"
                  animate={reduceMotion ? undefined : { boxShadow: [
                    "0 0 20px rgba(251,191,36,0.25)",
                    "0 0 45px rgba(251,191,36,0.45)",
                    "0 0 20px rgba(251,191,36,0.25)",
                  ] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute left-2 right-2 top-1 h-7 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200/45 via-amber-300/45 to-amber-500/45"
                  initial={{ y: 0 }}
                  animate={reduceMotion ? undefined : { y: [-1, -8, -3] }}
                  transition={{ duration: 0.55, delay: 0.25 }}
                />
                <div className="absolute bottom-0 top-0 left-1/2 w-2 -translate-x-1/2 rounded bg-amber-100/75" />
                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded bg-amber-100/75" />
                <FaGift className="relative z-10 text-3xl text-amber-50 drop-shadow-[0_0_12px_rgba(255,255,255,0.42)]" />
              </motion.div>

              <motion.h2
                className="mt-5 text-2xl font-bold text-amber-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.26 }}
              >
                Seu racha recebeu dias extras de acesso
              </motion.h2>

              <motion.p
                className="mt-2 max-w-lg text-sm text-zinc-200"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
              >
                O Fut7Pro concedeu uma compensação administrativa para sua assinatura.
              </motion.p>

              <motion.div
                className="mt-5 inline-flex items-center justify-center rounded-2xl border border-emerald-400/45 bg-emerald-500/10 px-6 py-3 text-3xl font-black tracking-tight text-emerald-300"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.28, type: "spring", stiffness: 220 }}
              >
                {daysLabel}
              </motion.div>

              <div className="mt-5 w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-4 py-3 text-left">
                <p className="text-sm text-zinc-100">
                  Novo acesso válido até <strong className="text-amber-200">{formatDate(data.newAccessUntil)}</strong>
                </p>
                <p className="mt-1 text-sm text-zinc-300">Motivo: {data.reasonLabel}</p>
                {data.reasonDetail ? (
                  <p className="mt-1 text-xs text-zinc-400">Detalhe: {data.reasonDetail}</p>
                ) : null}
                {data.incidentCode ? (
                  <p className="mt-1 text-xs text-zinc-500">Incidente: {data.incidentCode}</p>
                ) : null}
              </div>

              <p className="mt-4 text-sm text-zinc-300">Obrigado por continuar com o Fut7Pro.</p>
            </div>

            <div className="relative z-10 mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onViewDetails}
                disabled={processing}
                className="rounded-xl border border-zinc-500/55 bg-zinc-800/70 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ver detalhes
              </button>
              <button
                type="button"
                onClick={onDismiss}
                disabled={processing}
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Processando..." : "Entendi"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveComunicados } from "@/hooks/usePublicComunicados";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { Role } from "@/common/enums";
import type { ComunicadoItem, ComunicadoSeverity } from "@/types/comunicado";

const severityLabels: Record<ComunicadoSeverity, string> = {
  INFO: "Info",
  ALERTA: "Alerta",
  REGRA: "Regra",
  FINANCEIRO: "Financeiro",
};

const severityStyles: Record<ComunicadoSeverity, string> = {
  INFO: "bg-blue-500/20 text-blue-200",
  ALERTA: "bg-red-500/20 text-red-200",
  REGRA: "bg-yellow-500/20 text-yellow-200",
  FINANCEIRO: "bg-green-500/20 text-green-200",
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

export default function ComunicadosLoginGate() {
  const { isAuthenticated, user } = useAuth();
  const { publicSlug } = usePublicLinks();
  const role = user?.role?.toString().toUpperCase();
  const isAthlete = role === Role.ATLETA || role === Role.ATHLETE;
  const shouldFetch = isAuthenticated && isAthlete;
  const { active, isLoading } = useActiveComunicados(shouldFetch);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const storageKey = useMemo(() => {
    if (!publicSlug || !user?.id) return null;
    return `fut7pro_comunicado_dismissed_${publicSlug}_${user.id}`;
  }, [publicSlug, user?.id]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(storageKey) === "1";
    setDismissed(stored);
  }, [storageKey]);

  useEffect(() => {
    if (!shouldFetch) {
      if (storageKey && typeof window !== "undefined") {
        window.sessionStorage.removeItem(storageKey);
      }
      setDismissed(false);
      setCurrentIndex(0);
    }
  }, [shouldFetch, storageKey]);

  useEffect(() => {
    if (!active.length) return;
    setCurrentIndex(0);
  }, [active]);

  const shouldOpen = shouldFetch && !isLoading && active.length > 0 && !dismissed;
  const current = active[currentIndex] as ComunicadoItem | undefined;

  useEffect(() => {
    if (!shouldOpen || !current || !publicSlug) return;
    fetch(`/api/public/${publicSlug}/comunicados/${current.id}/view`, {
      method: "POST",
    }).catch(() => null);
  }, [shouldOpen, current, publicSlug]);

  const handleClose = () => {
    if (storageKey && typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, "1");
    }
    setDismissed(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? active.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 >= active.length ? 0 : prev + 1));
  };

  if (!shouldOpen || !current) return null;

  const severity = current.severity || "INFO";
  const periodLabel = `${formatDate(current.startAt)} - ${formatDate(current.endAt)}`;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center px-4">
      <div className="bg-[#1d1d1d] rounded-xl p-6 w-full max-w-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold text-yellow-300">Comunicado do Racha</div>
          <button
            type="button"
            className="text-gray-300 text-xl"
            onClick={handleClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-3">
          <span className={`px-2 py-1 rounded ${severityStyles[severity]}`}>
            {severityLabels[severity]}
          </span>
          <span>Período: {periodLabel}</span>
        </div>
        <div className="text-yellow-200 font-semibold text-lg mb-2">{current.title}</div>
        <div className="text-gray-200 text-sm whitespace-pre-line">{current.message}</div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            {currentIndex + 1} de {active.length}
          </div>
          <div className="flex gap-2">
            {active.length > 1 && (
              <>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-[#2b2b2b] text-gray-200 hover:bg-[#3b3b3b]"
                  onClick={handlePrev}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-[#2b2b2b] text-gray-200 hover:bg-[#3b3b3b]"
                  onClick={handleNext}
                >
                  Próximo
                </button>
              </>
            )}
            <button
              type="button"
              className="px-3 py-1 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
              onClick={handleClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

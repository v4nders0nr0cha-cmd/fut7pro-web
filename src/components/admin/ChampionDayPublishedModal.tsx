"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, LayoutDashboard, Medal, Sparkles, Trophy, X } from "lucide-react";

type ChampionDayPublishedModalProps = {
  open: boolean;
  rachaName: string;
  publicUrl?: string | null;
  onClose: () => void;
  onGoDashboard: () => void;
};

const particles = [
  "left-[10%] top-[18%] h-1.5 w-1.5 bg-yellow-200/70",
  "left-[20%] top-[34%] h-1 w-1 bg-amber-400/70",
  "left-[31%] top-[14%] h-1.5 w-1.5 bg-white/60",
  "right-[30%] top-[19%] h-1 w-1 bg-yellow-300/80",
  "right-[18%] top-[36%] h-1.5 w-1.5 bg-amber-200/70",
  "right-[9%] top-[22%] h-1 w-1 bg-white/60",
];

export default function ChampionDayPublishedModal({
  open,
  rachaName,
  publicUrl,
  onClose,
  onGoDashboard,
}: ChampionDayPublishedModalProps) {
  const visitButtonRef = useRef<HTMLAnchorElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const lastBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      if (publicUrl) {
        visitButtonRef.current?.focus();
        return;
      }
      closeButtonRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, publicUrl]);

  useEffect(() => {
    if (open) return;
    previousActiveElement.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    lastBodyOverflow.current = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = lastBodyOverflow.current ?? "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-[2px]"
        aria-label="Fechar celebração"
        tabIndex={-1}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="champion-day-published-title"
        aria-describedby="champion-day-published-description"
        onClick={(event) => event.stopPropagation()}
        className={`relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[28px] border border-yellow-400/30 bg-[#111112] text-white shadow-[0_24px_90px_rgba(0,0,0,0.65)] transition-all duration-300 motion-safe:transform ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -right-20 top-24 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
          {particles.map((className) => (
            <span
              key={className}
              className={`absolute rounded-full shadow-[0_0_16px_rgba(250,204,21,0.55)] motion-safe:animate-pulse ${className}`}
            />
          ))}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-yellow-300/50 hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="Fechar modal"
          tabIndex={open ? 0 : -1}
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center px-5 pb-6 pt-8 text-center sm:px-8 sm:pb-8 sm:pt-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-300/30 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/50 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 text-black shadow-[0_0_36px_rgba(250,204,21,0.35)] sm:h-24 sm:w-24">
              <Trophy size={42} strokeWidth={1.9} />
            </div>
            <div className="absolute -left-7 top-10 hidden h-10 w-10 items-center justify-center rounded-full border border-yellow-300/30 bg-black/50 text-yellow-200 sm:flex">
              <Medal size={20} />
            </div>
            <div className="absolute -right-7 top-3 hidden h-10 w-10 items-center justify-center rounded-full border border-yellow-300/30 bg-black/50 text-yellow-200 sm:flex">
              <Sparkles size={19} />
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-200/80">
            Encerramento do dia
          </p>
          <h2
            id="champion-day-published-title"
            className="mt-3 max-w-lg text-2xl font-black leading-tight text-white sm:text-3xl"
          >
            Campeões do Dia publicados no site do{" "}
            <span className="text-yellow-300">{rachaName}</span>.
          </h2>
          <p
            id="champion-day-published-description"
            className="mt-4 max-w-md text-sm leading-6 text-zinc-300 sm:text-base"
          >
            O time campeão, os destaques individuais e o banner do dia já estão no ar no site
            público do racha. O fechamento da rodada está registrado e pronto para a galera ver.
          </p>

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            {publicUrl ? (
              <a
                ref={visitButtonRef}
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                tabIndex={open ? 0 : -1}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_12px_34px_rgba(250,204,21,0.24)] transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111112]"
              >
                Visitar o site
                <ExternalLink size={17} />
              </a>
            ) : (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_12px_34px_rgba(250,204,21,0.24)] transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111112]"
              >
                Fechar
              </button>
            )}
            <button
              type="button"
              onClick={onGoDashboard}
              tabIndex={open ? 0 : -1}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-300/30 bg-white/[0.04] px-5 py-3 text-sm font-bold text-yellow-100 transition hover:border-yellow-300/60 hover:bg-yellow-300/10 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111112]"
            >
              Voltar para o dashboard
              <LayoutDashboard size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

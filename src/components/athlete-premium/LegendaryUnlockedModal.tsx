"use client";

import { FaCrown, FaTimes } from "react-icons/fa";

type LegendaryUnlockedModalProps = {
  title: string;
  message: string;
  subtext?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  medalAsset?: string | null;
  athleteName?: string | null;
  isSubmitting?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onClose: () => void;
};

export default function LegendaryUnlockedModal({
  title,
  message,
  subtext = "Seu perfil agora recebeu a insígnia lendária da temporada.",
  primaryActionLabel = "Ver meu perfil lendário",
  secondaryActionLabel,
  medalAsset,
  athleteName,
  isSubmitting = false,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
}: LegendaryUnlockedModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/78 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legendary-unlocked-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#f8c64a]/65 bg-[#050505] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.72),0_0_60px_rgba(248,198,74,0.20)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,198,74,0.24),transparent_34%),linear-gradient(145deg,rgba(255,240,168,0.10),transparent_35%,rgba(248,198,74,0.08))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#fff0a8] to-transparent" />

        <button
          type="button"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-zinc-300 transition hover:border-[#f8c64a]/60 hover:text-[#f8c64a]"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Fechar modal"
        >
          <FaTimes />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
            <div className="absolute inset-1 rounded-full bg-[#f8c64a]/25 blur-2xl motion-safe:animate-pulse" />
            {medalAsset ? (
              <img
                src={medalAsset}
                alt="Medalhão Lendário Fut7Pro"
                className="relative h-full w-full object-contain drop-shadow-[0_0_28px_rgba(248,198,74,0.45)]"
              />
            ) : (
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#f8c64a]/70 bg-[#f8c64a]/12 text-[#f8c64a] shadow-[0_0_32px_rgba(248,198,74,0.35)]">
                <FaCrown size={42} />
              </div>
            )}
          </div>

          {athleteName && (
            <div className="mb-2 rounded-full border border-[#f8c64a]/35 bg-[#f8c64a]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#f8c64a]">
              {athleteName}
            </div>
          )}

          <h2
            id="legendary-unlocked-title"
            className="text-2xl font-black uppercase leading-tight text-[#fff2bd] sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-200 sm:text-base">
            {message}
          </p>
          <p className="mt-3 max-w-md text-sm text-zinc-400">{subtext}</p>

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-gradient-to-r from-[#b97808] via-[#f8c64a] to-[#fff0a8] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_12px_28px_rgba(248,198,74,0.24)] disabled:cursor-wait disabled:opacity-70"
              onClick={onPrimaryAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : primaryActionLabel}
            </button>
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[#f8c64a]/60 bg-black/35 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#f8c64a] transition hover:bg-[#f8c64a] hover:text-black disabled:cursor-wait disabled:opacity-70"
              onClick={onSecondaryAction ?? onClose}
              disabled={isSubmitting}
            >
              {secondaryActionLabel || "Compartilhar depois"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

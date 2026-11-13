"use client";

import { type ReactNode, type RefObject, useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";

export type Fut7DialogTone = "default" | "warning" | "destructive" | "success";

export type Fut7DialogBaseProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  tone?: Fut7DialogTone;
  size?: "md" | "lg" | "xl";
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement>;
  onClose: () => void;
};

const toneStyles: Record<
  Fut7DialogTone,
  {
    ring: string;
    glow: string;
    iconWrap: string;
    icon: ReactNode;
    eyebrow: string;
  }
> = {
  default: {
    ring: "border-yellow-400/35",
    glow: "from-yellow-400/24 via-amber-500/10 to-transparent",
    iconWrap: "border-yellow-300/45 bg-yellow-400/12 text-yellow-200",
    icon: <Info size={24} />,
    eyebrow: "text-yellow-200/85",
  },
  warning: {
    ring: "border-amber-400/35",
    glow: "from-amber-400/25 via-yellow-500/10 to-transparent",
    iconWrap: "border-amber-300/45 bg-amber-400/12 text-amber-200",
    icon: <AlertTriangle size={24} />,
    eyebrow: "text-amber-200/85",
  },
  destructive: {
    ring: "border-red-400/35",
    glow: "from-red-500/22 via-amber-500/8 to-transparent",
    iconWrap: "border-red-300/45 bg-red-500/12 text-red-200",
    icon: <ShieldAlert size={24} />,
    eyebrow: "text-red-200/85",
  },
  success: {
    ring: "border-emerald-400/35",
    glow: "from-emerald-400/20 via-yellow-500/10 to-transparent",
    iconWrap: "border-emerald-300/45 bg-emerald-500/12 text-emerald-200",
    icon: <CheckCircle2 size={24} />,
    eyebrow: "text-emerald-200/85",
  },
};

export default function Fut7DialogBase({
  open,
  title,
  description,
  eyebrow,
  tone = "default",
  size = "md",
  icon,
  children,
  footer,
  initialFocusRef,
  onClose,
}: Fut7DialogBaseProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const previousOverflow = useRef<string | null>(null);
  const styles = toneStyles[tone];

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => {
      const preferred = initialFocusRef?.current;
      if (preferred?.isConnected && !preferred.matches(":disabled")) {
        preferred.focus();
      } else {
        closeButtonRef.current?.focus();
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      if (opener?.isConnected) opener.focus();
    };
  }, [open, initialFocusRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow.current ?? "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center px-0 pt-4 sm:items-center sm:px-4 sm:py-6">
      <div
        className="absolute inset-0 cursor-default bg-black/78 backdrop-blur-[3px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-[24px] border ${styles.ring} bg-[#111214] text-white shadow-[0_30px_110px_rgba(0,0,0,0.72)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] ${size === "xl" ? "sm:max-w-3xl" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${styles.glow}`}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent" />

        <header className="relative flex shrink-0 items-start gap-3 border-b border-white/10 px-4 py-4 sm:gap-4 sm:px-7 sm:py-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.iconWrap} shadow-[0_0_30px_rgba(250,204,21,0.12)] sm:h-12 sm:w-12 sm:rounded-2xl`}
          >
            {icon ?? styles.icon}
          </div>
          <div className="min-w-0 flex-1 pr-1">
            {eyebrow ? (
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${styles.eyebrow}`}>
                {eyebrow}
              </p>
            ) : null}
            <h2 id={titleId} className="mt-1 text-lg font-bold leading-snug sm:text-xl">
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 p-2.5 text-zinc-200 transition hover:border-yellow-300/50 hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </header>

        {(description || children) && (
          <div className="relative min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 text-sm leading-6 sm:px-7 sm:py-6">
            {description ? <div className="text-zinc-300">{description}</div> : null}
            {children}
          </div>
        )}

        {footer ? (
          <footer className="relative grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 bg-[#111214] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>button]:min-w-0 [&>button:only-child]:col-span-2 sm:flex sm:justify-end sm:px-7 sm:py-5">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

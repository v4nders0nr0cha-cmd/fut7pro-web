"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";

export type Fut7DialogTone = "default" | "warning" | "destructive" | "success";

export type Fut7DialogBaseProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  tone?: Fut7DialogTone;
  icon?: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
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
  icon,
  children,
  footer,
  onClose,
}: Fut7DialogBaseProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const previousOverflow = useRef<string | null>(null);
  const styles = toneStyles[tone];

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

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

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow.current ?? "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/78 backdrop-blur-[3px]"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fut7-dialog-title"
        className={`relative w-full max-w-lg overflow-hidden rounded-[28px] border ${styles.ring} bg-[#111214] text-white shadow-[0_30px_110px_rgba(0,0,0,0.72)]`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${styles.glow}`}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent" />

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-yellow-300/50 hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="Fechar modal"
        >
          <X size={18} />
        </button>

        <div className="relative px-5 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-8">
          <div className="flex items-start gap-4 pr-10">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${styles.iconWrap} shadow-[0_0_30px_rgba(250,204,21,0.12)]`}
            >
              {icon ?? styles.icon}
            </div>
            <div>
              {eyebrow ? (
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.22em] ${styles.eyebrow}`}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h2 id="fut7-dialog-title" className="mt-1 text-xl font-black leading-tight">
                {title}
              </h2>
              {description ? (
                <div className="mt-3 text-sm leading-6 text-zinc-300">{description}</div>
              ) : null}
            </div>
          </div>

          {children ? <div className="mt-5">{children}</div> : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        </div>
      </section>
    </div>
  );
}

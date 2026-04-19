"use client";

import { type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Fut7InlineFeedbackTone = "success" | "error" | "warning" | "info";

type Fut7InlineFeedbackProps = {
  tone?: Fut7InlineFeedbackTone;
  title?: string;
  children?: ReactNode;
  message?: ReactNode;
  className?: string;
  onDismiss?: () => void;
};

const toneMap: Record<
  Fut7InlineFeedbackTone,
  { className: string; icon: ReactNode; titleClass: string }
> = {
  success: {
    className: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
    icon: <CheckCircle2 size={18} />,
    titleClass: "text-emerald-200",
  },
  error: {
    className: "border-red-400/35 bg-red-500/10 text-red-100",
    icon: <XCircle size={18} />,
    titleClass: "text-red-200",
  },
  warning: {
    className: "border-amber-400/35 bg-amber-500/10 text-amber-100",
    icon: <AlertTriangle size={18} />,
    titleClass: "text-amber-200",
  },
  info: {
    className: "border-yellow-400/35 bg-yellow-500/10 text-yellow-100",
    icon: <Info size={18} />,
    titleClass: "text-yellow-200",
  },
};

export default function Fut7InlineFeedback({
  tone = "info",
  title,
  children,
  message,
  className = "",
  onDismiss,
}: Fut7InlineFeedbackProps) {
  const styles = toneMap[tone];
  const content = children ?? message;
  if (!content && !title) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_16px_38px_rgba(0,0,0,0.16)] ${styles.className} ${className}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="mt-0.5 shrink-0">{styles.icon}</span>
      <div className="min-w-0 flex-1">
        {title ? <div className={`font-bold ${styles.titleClass}`}>{title}</div> : null}
        {content ? (
          <div className={title ? "mt-1 text-sm leading-5" : "leading-5"}>{content}</div>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-current/70 transition hover:bg-white/10 hover:text-current focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

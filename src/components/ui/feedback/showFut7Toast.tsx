"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import toast from "react-hot-toast";

type Fut7ToastTone = "success" | "error" | "warning" | "info";

type ShowFut7ToastOptions = {
  tone?: Fut7ToastTone;
  title: string;
  message?: string;
  duration?: number;
};

const toneConfig = {
  success: {
    icon: <CheckCircle2 size={20} />,
    iconClass: "text-emerald-300",
    border: "border-emerald-400/30",
  },
  error: {
    icon: <XCircle size={20} />,
    iconClass: "text-red-300",
    border: "border-red-400/30",
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    iconClass: "text-amber-300",
    border: "border-amber-400/30",
  },
  info: {
    icon: <Info size={20} />,
    iconClass: "text-yellow-300",
    border: "border-yellow-400/30",
  },
} satisfies Record<Fut7ToastTone, { icon: JSX.Element; iconClass: string; border: string }>;

export function showFut7Toast({
  tone = "info",
  title,
  message,
  duration = 4200,
}: ShowFut7ToastOptions) {
  const config = toneConfig[tone];

  return toast.custom(
    (toastInstance) => (
      <div
        className={`flex w-[calc(100vw-32px)] max-w-sm items-start gap-3 rounded-2xl border ${config.border} bg-[#111214] px-4 py-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-all ${
          toastInstance.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <span className={`mt-0.5 shrink-0 ${config.iconClass}`}>{config.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black leading-5">{title}</span>
          {message ? (
            <span className="mt-0.5 block text-xs leading-5 text-zinc-300">{message}</span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => toast.dismiss(toastInstance.id)}
          className="rounded-full px-1.5 text-lg leading-none text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    ),
    { duration }
  );
}

"use client";

import { type ReactNode } from "react";
import Fut7DialogBase, { type Fut7DialogTone } from "./Fut7DialogBase";

export type Fut7ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  tone?: Fut7DialogTone;
  impactItems?: string[];
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
};

export default function Fut7ConfirmDialog({
  open,
  title,
  description,
  eyebrow = "Confirmação Fut7Pro",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  disabled = false,
  tone = "default",
  impactItems,
  children,
  onClose,
  onConfirm,
}: Fut7ConfirmDialogProps) {
  const confirmTone =
    tone === "destructive"
      ? "bg-red-500 text-white hover:bg-red-400 focus:ring-red-200"
      : "bg-yellow-400 text-black hover:bg-yellow-300 focus:ring-yellow-200";

  return (
    <Fut7DialogBase
      open={open}
      title={title}
      description={description}
      eyebrow={eyebrow}
      tone={tone}
      onClose={loading ? () => undefined : onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-yellow-300/45 hover:bg-yellow-300/10 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111214] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || disabled}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111214] disabled:cursor-not-allowed disabled:opacity-60 ${confirmTone}`}
          >
            {loading ? "Processando..." : confirmLabel}
          </button>
        </>
      }
    >
      {children}
      {impactItems?.length ? (
        <div className="rounded-2xl border border-yellow-300/20 bg-yellow-400/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-200/80">
            Impacto da ação
          </p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {impactItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Fut7DialogBase>
  );
}

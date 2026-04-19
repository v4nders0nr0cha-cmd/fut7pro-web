"use client";

import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import Fut7DialogBase, { type Fut7DialogTone } from "./Fut7DialogBase";

type Fut7PromptDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  multiline?: boolean;
  required?: boolean;
  tone?: Fut7DialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function Fut7PromptDialog({
  open,
  title,
  description,
  eyebrow = "Informação necessária",
  label,
  placeholder,
  initialValue = "",
  multiline = false,
  required = false,
  tone = "default",
  confirmLabel = "Continuar",
  cancelLabel = "Cancelar",
  loading = false,
  onClose,
  onConfirm,
}: Fut7PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const disabled = loading || (required && !value.trim());

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open, initialValue]);

  const inputClass =
    "mt-2 w-full rounded-2xl border border-yellow-300/20 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-200 focus:ring-2 focus:ring-yellow-300/30";

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
            onClick={() => onConfirm(value)}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_14px_34px_rgba(250,204,21,0.22)] transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111214] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Processando..." : confirmLabel}
          </button>
        </>
      }
    >
      <label className="block text-sm font-semibold text-zinc-100">
        {label}
        {multiline ? (
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        )}
      </label>
    </Fut7DialogBase>
  );
}

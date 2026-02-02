"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

type ThemeSavedModalProps = {
  open: boolean;
  onClose: () => void;
  themeName: string;
  publicUrl?: string;
};

export default function ThemeSavedModal({
  open,
  onClose,
  themeName,
  publicUrl,
}: ThemeSavedModalProps) {
  const okButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      okButtonRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-saved-title"
        aria-describedby="theme-saved-description"
        className={`relative mx-4 w-full max-w-md rounded-2xl border border-brand bg-[#13151b] p-6 text-white shadow-xl transition-transform duration-200 ${
          open ? "scale-100" : "scale-95"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand bg-[#0f1117] text-brand">
            <CheckCircle2 size={28} />
          </div>
        </div>

        <h2 id="theme-saved-title" className="mt-4 text-center text-2xl font-bold text-brand">
          Tema atualizado!
        </h2>
        <p id="theme-saved-description" className="mt-2 text-center text-sm text-gray-200">
          Seu racha agora está em <span className="text-brand font-semibold">{themeName}</span>, no
          admin e no site público.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-lg border border-brand px-4 py-2 text-center text-sm font-semibold text-brand transition hover:bg-brand hover:text-black"
            >
              Ver o site
            </a>
          ) : null}
          <button
            ref={okButtonRef}
            onClick={onClose}
            className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-soft"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

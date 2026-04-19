"use client";

import { type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import Fut7DialogBase from "./Fut7DialogBase";

type Fut7SuccessDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
};

export default function Fut7SuccessDialog({
  open,
  title,
  description,
  primaryLabel = "Concluir",
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: Fut7SuccessDialogProps) {
  return (
    <Fut7DialogBase
      open={open}
      title={title}
      description={description}
      eyebrow="Tudo certo"
      tone="success"
      icon={<CheckCircle2 size={25} />}
      onClose={onClose}
      footer={
        <>
          {secondaryLabel ? (
            <button
              type="button"
              onClick={onSecondary ?? onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-emerald-300/45 hover:bg-emerald-300/10 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-[#111214]"
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPrimary ?? onClose}
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_14px_34px_rgba(250,204,21,0.22)] transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111214]"
          >
            {primaryLabel}
          </button>
        </>
      }
    />
  );
}

"use client";

import { useMemo, useState } from "react";
import Fut7ConfirmDialog, { type Fut7ConfirmDialogProps } from "./Fut7ConfirmDialog";

type Fut7DestructiveDialogProps = Omit<Fut7ConfirmDialogProps, "tone" | "confirmLabel"> & {
  confirmLabel?: string;
  confirmationText?: string;
  confirmationLabel?: string;
};

export default function Fut7DestructiveDialog({
  confirmLabel = "Confirmar ação",
  confirmationText,
  confirmationLabel = "Digite a confirmação para continuar",
  onConfirm,
  onClose,
  open,
  ...props
}: Fut7DestructiveDialogProps) {
  const [value, setValue] = useState("");

  const normalizedExpected = confirmationText?.trim().toLowerCase() || "";
  const normalizedValue = value.trim().toLowerCase();
  const blockedByConfirmation = Boolean(
    normalizedExpected && normalizedValue !== normalizedExpected
  );

  const description = useMemo(() => props.description, [props.description]);

  const handleClose = () => {
    setValue("");
    onClose();
  };

  const handleConfirm = () => {
    if (blockedByConfirmation) return;
    onConfirm();
  };

  return (
    <Fut7ConfirmDialog
      {...props}
      open={open}
      tone="destructive"
      eyebrow={props.eyebrow ?? "Ação destrutiva"}
      description={description}
      confirmLabel={confirmLabel}
      disabled={props.disabled || blockedByConfirmation}
      onClose={handleClose}
      onConfirm={handleConfirm}
    >
      {confirmationText ? (
        <div className="rounded-2xl border border-red-300/25 bg-red-500/[0.07] p-4">
          <label className="block text-sm font-semibold text-red-100">
            {confirmationLabel}
            <span className="mt-1 block font-mono text-xs text-red-200">{confirmationText}</span>
          </label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-3 w-full rounded-xl border border-red-300/25 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-200 focus:ring-2 focus:ring-red-300/30"
            placeholder={confirmationText}
          />
        </div>
      ) : null}
    </Fut7ConfirmDialog>
  );
}

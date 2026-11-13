"use client";

import { FaCopy } from "react-icons/fa";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

interface ModalSenhaResetadaProps {
  open: boolean;
  email?: string | null;
  temporaryPassword?: string | null;
  onClose: () => void;
}

export default function ModalSenhaResetada({
  open,
  email,
  temporaryPassword,
  onClose,
}: ModalSenhaResetadaProps) {
  async function handleCopy() {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
    } catch {
      // No-op fallback.
    }
  }

  if (!open) return null;

  return (
    <Fut7DialogBase
      open
      title="Senha temporária gerada"
      onClose={onClose}
      description="Compartilhe a senha com o administrador para ele entrar e criar uma nova senha."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="col-span-2 rounded-xl border border-white/15 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
        >
          Fechar
        </button>
      }
    >
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-400">Email: {email || "--"}</div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="text"
            readOnly
            value={temporaryPassword || ""}
            className="min-w-0 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500/20 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-500/40"
          >
            <FaCopy /> Copiar
          </button>
        </div>
      </div>
    </Fut7DialogBase>
  );
}

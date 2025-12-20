"use client";

import { FaCopy, FaTimes } from "react-icons/fa";

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
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-md mx-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Senha temporaria gerada</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-300">
          Envie a senha para o admin concluir o acesso e atualizar credenciais com seguranca.
        </p>

        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-400">Email: {email || "--"}</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={temporaryPassword || ""}
              className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
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

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

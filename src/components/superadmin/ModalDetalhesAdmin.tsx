"use client";

import { FaTimes, FaUserShield } from "react-icons/fa";

export type AdminDetalhes = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  tenantNome?: string | null;
  tenantSlug?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

interface ModalDetalhesAdminProps {
  open: boolean;
  admin: AdminDetalhes | null;
  onClose: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ModalDetalhesAdmin({ open, admin, onClose }: ModalDetalhesAdminProps) {
  if (!open || !admin) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Detalhes do admin</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-200">
          <div>
            <span className="text-gray-400">Nome:</span> {admin.name}
          </div>
          <div>
            <span className="text-gray-400">Email:</span> {admin.email}
          </div>
          <div>
            <span className="text-gray-400">Role:</span> {admin.role}
          </div>
          <div>
            <span className="text-gray-400">Status:</span> {admin.active ? "Ativo" : "Inativo"}
          </div>
          <div>
            <span className="text-gray-400">Racha:</span>{" "}
            {admin.tenantNome || admin.tenantSlug || "--"}
          </div>
          <div>
            <span className="text-gray-400">Slug:</span> {admin.tenantSlug || "--"}
          </div>
          <div>
            <span className="text-gray-400">Criado em:</span> {formatDate(admin.createdAt)}
          </div>
          <div>
            <span className="text-gray-400">Atualizado em:</span> {formatDate(admin.updatedAt)}
          </div>
          <div className="text-xs text-gray-500 break-all">
            <span className="text-gray-500">ID:</span> {admin.id}
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

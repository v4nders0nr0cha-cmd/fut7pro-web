"use client";

import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

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
    <Fut7DialogBase
      open
      title="Detalhes do administrador"
      onClose={onClose}
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
    </Fut7DialogBase>
  );
}

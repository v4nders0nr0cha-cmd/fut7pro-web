"use client";
import type { Admin } from "@/types/racha";

type Props = {
  admins: Admin[];
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
};

export default function AdminList({ admins, onEdit, onDelete }: Props) {
  if (!admins.length)
    return (
      <div className="p-4 text-center text-gray-400">
        Nenhum admin cadastrado.
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-2">
      {admins.map((admin) => (
        <div
          key={admin.id}
          className="flex flex-col items-center justify-between rounded-xl border bg-fundo p-3 shadow-sm sm:flex-row"
        >
          <div>
            <span className="font-bold text-yellow-400">{admin.nome}</span>
            <span className="ml-2 text-xs text-gray-400">{admin.email}</span>
            <span className="ml-4 text-xs text-blue-400">
              {admin.role === "presidente"
                ? "Presidente"
                : admin.role === "vicepresidente"
                  ? "Vice-Presidente"
                  : admin.role === "diretorfutebol"
                    ? "Diretor de Futebol"
                    : admin.role === "diretorfinanceiro"
                      ? "Diretor Financeiro"
                      : "Leitor"}
            </span>
          </div>
          <div className="mt-2 flex flex-row gap-2 sm:mt-0">
            <button className="btn-primary" onClick={() => onEdit(admin)}>
              Editar
            </button>
            <button
              className="btn-secondary"
              onClick={() => onDelete(admin.id)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

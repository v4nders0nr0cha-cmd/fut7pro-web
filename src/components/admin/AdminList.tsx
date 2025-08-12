"use client";
import type { Admin } from "@/types/racha";

type Props = {
  admins: Admin[];
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
};

export default function AdminList({ admins, onEdit, onDelete }: Props) {
  if (!admins.length)
    return <div className="p-4 text-center text-gray-400">Nenhum admin cadastrado.</div>;
  return (
    <div className="w-full flex flex-col gap-2">
      {admins.map((admin) => (
        <div
          key={admin.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
        >
          <div>
            <span className="font-bold text-yellow-400">{admin.nome}</span>
            <span className="ml-2 text-gray-400 text-xs">{admin.email}</span>
            <span className="ml-4 text-blue-400 text-xs">
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
          <div className="flex flex-row gap-2 mt-2 sm:mt-0">
            <button className="btn-primary" onClick={() => onEdit(admin)}>
              Editar
            </button>
            <button className="btn-secondary" onClick={() => onDelete(admin.id)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

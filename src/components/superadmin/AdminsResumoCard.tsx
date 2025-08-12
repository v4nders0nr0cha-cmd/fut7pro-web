// src/components/superadmin/AdminsResumoCard.tsx
"use client";
import type { FC } from "react";
import type { AdminRacha } from "./mockAdmins";

interface Props {
  admins: AdminRacha[];
}

const AdminsResumoCard: FC<Props> = ({ admins }) => {
  const total = admins.length;
  const ativos = admins.filter((a) => a.status === "ativo").length;
  const trial = admins.filter((a) => a.status === "trial").length;
  const bloqueados = admins.filter((a) => a.status === "bloqueado").length;
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
        <span className="text-xs text-zinc-400">Total de Rachas</span>
        <div className="text-xl font-bold text-yellow-400">{total}</div>
      </div>
      <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
        <span className="text-xs text-zinc-400">Ativos</span>
        <div className="text-xl font-bold text-green-400">{ativos}</div>
      </div>
      <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
        <span className="text-xs text-zinc-400">Trial</span>
        <div className="text-xl font-bold text-blue-400">{trial}</div>
      </div>
      <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
        <span className="text-xs text-zinc-400">Bloqueados</span>
        <div className="text-xl font-bold text-red-400">{bloqueados}</div>
      </div>
    </div>
  );
};
export default AdminsResumoCard;

// src/components/superadmin/AdminsResumoCard.tsx
"use client";
import type { FC } from "react";

type AdminResumo = { status?: string };

interface Props {
  admins: AdminResumo[];
}

const AdminsResumoCard: FC<Props> = ({ admins }) => {
  const normalizar = (status?: string) => (status || "").toLowerCase();
  const total = admins.length;
  const ativos = admins.filter((a) => normalizar(a.status) === "ativo").length;
  const trial = admins.filter((a) => normalizar(a.status) === "trial").length;
  const bloqueados = admins.filter((a) => normalizar(a.status) === "bloqueado").length;
  return (
    <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <span className="text-xs text-zinc-400">Total de Rachas</span>
        <div className="text-xl font-bold text-yellow-400">{total}</div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <span className="text-xs text-zinc-400">Ativos</span>
        <div className="text-xl font-bold text-green-400">{ativos}</div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <span className="text-xs text-zinc-400">Trial</span>
        <div className="text-xl font-bold text-blue-400">{trial}</div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <span className="text-xs text-zinc-400">Bloqueados</span>
        <div className="text-xl font-bold text-red-400">{bloqueados}</div>
      </div>
    </div>
  );
};
export default AdminsResumoCard;

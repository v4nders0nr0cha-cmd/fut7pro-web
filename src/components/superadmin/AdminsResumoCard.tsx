// src/components/superadmin/AdminsResumoCard.tsx
"use client";
import type { FC } from "react";
import type { Usuario } from "@/types/superadmin";

interface Props {
  admins: Usuario[];
  isLoading?: boolean;
}

const AdminsResumoCard: FC<Props> = ({ admins, isLoading }) => {
  const total = admins.length;
  const superadmins = admins.filter((admin) => admin.role === "SUPERADMIN").length;
  const presidentes = admins.filter((admin) => admin.role === "ADMIN").length;
  const outros = total - superadmins - presidentes;

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <ResumoCard
        titulo="Usuários SuperAdmin"
        valor={superadmins}
        destaque="text-yellow-400"
        isLoading={isLoading}
      />
      <ResumoCard
        titulo="Presidente/Admin"
        valor={presidentes}
        destaque="text-green-400"
        isLoading={isLoading}
      />
      <ResumoCard
        titulo="Outros Perfis"
        valor={Math.max(outros, 0)}
        destaque="text-blue-400"
        isLoading={isLoading}
      />
      <ResumoCard titulo="Total" valor={total} destaque="text-white" isLoading={isLoading} />
    </div>
  );
};

function ResumoCard({
  titulo,
  valor,
  destaque,
  isLoading,
}: {
  titulo: string;
  valor: number;
  destaque: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[140px]">
      <span className="text-xs text-zinc-400">{titulo}</span>
      <div className={`text-xl font-bold ${destaque}`}>
        {isLoading ? <span className="animate-pulse text-zinc-500">...</span> : valor}
      </div>
    </div>
  );
}

export default AdminsResumoCard;

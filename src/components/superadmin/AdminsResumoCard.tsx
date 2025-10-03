"use client";
import type { FC } from "react";
import type { SuperadminUsuariosSnapshot } from "@/types/superadmin";

interface Props {
  snapshot: SuperadminUsuariosSnapshot;
}

const AdminsResumoCard: FC<Props> = ({ snapshot }) => {
  const total = snapshot.total;
  const ativos = snapshot.ativos;
  const superadmins = snapshot.porRole.SUPERADMIN ?? 0;
  const presidentes = snapshot.porRole.PRESIDENTE ?? 0;

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <ResumoCard label="Usuários cadastrados" value={total} highlight="text-yellow-400" />
      <ResumoCard label="Usuários ativos" value={ativos} highlight="text-green-400" />
      <ResumoCard label="SuperAdmins" value={superadmins} highlight="text-blue-400" />
      <ResumoCard label="Presidentes" value={presidentes} highlight="text-emerald-400" />
    </div>
  );
};

interface ResumoProps {
  label: string;
  value: number;
  highlight: string;
}

function ResumoCard({ label, value, highlight }: ResumoProps) {
  const valueClassName = highlight
    ? `text-xl font-bold ${highlight}`
    : "text-xl font-bold text-white";

  return (
    <div className="bg-zinc-900 rounded-xl px-6 py-4 flex-1 min-w-[160px]">
      <span className="text-xs text-zinc-400">{label}</span>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}

export default AdminsResumoCard;

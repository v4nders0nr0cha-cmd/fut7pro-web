"use client";

import type { Usuario } from "@/types/superadmin";

interface Props {
  admins: Usuario[];
  isLoading?: boolean;
  error?: string | null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

export default function AdminsTable({ admins, isLoading, error }: Props) {
  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-xl p-4">{error}</div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse text-zinc-400">
        Carregando administradores...
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-300">
        Nenhum administrador encontrado para os rachas atuais.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wide">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              Nome
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              E-mail
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Perfil
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Racha
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Criado em
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 text-sm text-white">
          {admins.map((admin) => (
            <tr key={admin.id} className="hover:bg-zinc-800/50 transition">
              <td className="px-4 py-3 font-semibold">{admin.nome}</td>
              <td className="px-4 py-3 text-zinc-300">{admin.email}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                  {admin.role}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-300">{admin.tenant?.nome ?? "—"}</td>
              <td className="px-4 py-3 text-zinc-300">{formatDate(admin.criadoEm)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

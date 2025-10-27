"use client";

import type { SuperadminUsuarioResumo } from "@/types/superadmin";

interface AdminsTableProps {
  admins: SuperadminUsuarioResumo[];
  isLoading?: boolean;
}

export default function AdminsTable({ admins, isLoading }: AdminsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (!admins.length) {
    return (
      <div className="bg-zinc-900 rounded-xl px-6 py-8 text-center text-zinc-400">
        Nenhum administrador cadastrado no momento.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                  {admin.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-300">{admin.email ?? "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200">
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${admin.ativo ? "bg-green-600 text-green-100" : "bg-gray-700 text-gray-300"}`}
                  >
                    {admin.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                  {new Date(admin.criadoEm).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

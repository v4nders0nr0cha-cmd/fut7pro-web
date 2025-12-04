"use client";

import { useAdmin } from "@/hooks/useAdmin";

// Forçar renderização no cliente para evitar problemas de template
export const dynamic = "force-dynamic";
import { useState } from "react";
import { Plus, Edit, Trash2, User, Shield, Crown } from "lucide-react";

export default function AdministradoresPage() {
  const { admins, isLoading, isError, error, addAdmin, updateAdmin, deleteAdmin } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando administradores...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar administradores</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const filteredAdmins = admins.filter((admin) => {
    const adminNome = admin.nome?.toLowerCase() ?? "";
    const adminEmail = admin.email?.toLowerCase() ?? "";
    const matchesSearch =
      adminNome.includes(searchTerm.toLowerCase()) || adminEmail.includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || admin.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "ADMIN":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-yellow-600 text-yellow-100";
      case "ADMIN":
        return "bg-blue-600 text-blue-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4 md:mb-0">Administradores</h1>

          <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition flex items-center gap-2">
            <Plus size={16} />
            Novo Administrador
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar administradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-[#232323] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Todas as funções</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="GERENTE">Gerente</option>
            <option value="SUPORTE">Suporte</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedRole("");
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Lista de Administradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-textoSuave">
                Nenhum administrador encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="bg-[#232323] rounded-lg p-4 border border-[#333] hover:border-yellow-400 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(admin.role)}
                    <div>
                      <h3 className="font-semibold text-white">{admin.nome}</h3>
                      <p className="text-sm text-gray-400">{admin.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-yellow-400 transition">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${getRoleColor(admin.role)}`}
                  >
                    {admin.role}
                  </span>

                  {admin.status && (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        admin.status === "ATIVO"
                          ? "bg-green-600 text-green-100"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {admin.status}
                    </span>
                  )}

                  {admin.ultimoAcesso && (
                    <p className="text-xs text-gray-400">
                      Último acesso: {new Date(admin.ultimoAcesso).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

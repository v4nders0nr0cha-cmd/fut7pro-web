"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { Plus, Edit, Trash2, User, Shield, Crown } from "lucide-react";

export default function AdministradoresPage() {
  const {
    admins,
    isLoading,
    isError,
    error,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="flex items-center justify-center py-16">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <span className="text-textoSuave ml-4 text-lg">
            Carregando administradores...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="mb-2 text-2xl font-bold text-red-400">
            Erro ao carregar administradores
          </h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || admin.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
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
    <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
      <div className="rounded-2xl bg-[#1A1A1A] p-6 text-white">
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <h1 className="mb-4 text-2xl font-bold text-yellow-400 md:mb-0">
            Administradores
          </h1>

          <button className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-500">
            <Plus size={16} />
            Novo Administrador
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar administradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg bg-[#232323] px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg bg-[#232323] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            className="rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Lista de Administradores */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdmins.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <p className="text-textoSuave">
                Nenhum administrador encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-lg border border-[#333] bg-[#232323] p-4 transition-all hover:border-yellow-400"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(admin.role)}
                    <div>
                      <h3 className="font-semibold text-white">{admin.nome}</h3>
                      <p className="text-sm text-gray-400">{admin.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 transition hover:text-yellow-400">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-gray-400 transition hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs ${getRoleColor(admin.role)}`}
                  >
                    {admin.role}
                  </span>

                  {admin.status && (
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs ${
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
                      Último acesso:{" "}
                      {new Date(admin.ultimoAcesso).toLocaleDateString()}
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

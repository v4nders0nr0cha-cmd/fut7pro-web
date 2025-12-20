"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { Role } from "@/common/enums";

type RachaOption = {
  id: string;
  nome: string;
  slug: string;
};

export type EditAdminPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string | null;
};

interface ModalEditarAdminProps {
  open: boolean;
  admin: EditAdminPayload | null;
  rachas?: RachaOption[];
  onClose: () => void;
  onSave: (payload: EditAdminPayload) => Promise<void>;
}

const ROLE_OPTIONS: Role[] = [Role.ADMIN, Role.SUPERADMIN, Role.ATLETA];

export default function ModalEditarAdmin({
  open,
  admin,
  rachas = [],
  onClose,
  onSave,
}: ModalEditarAdminProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [tenantId, setTenantId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedRachas = useMemo(
    () => [...rachas].sort((a, b) => a.nome.localeCompare(b.nome)),
    [rachas]
  );

  useEffect(() => {
    if (!open || !admin) return;
    setName(admin.name || "");
    setEmail(admin.email || "");
    setRole(admin.role || Role.ADMIN);
    setTenantId(admin.tenantId || "");
    setError(null);
    setSaving(false);
  }, [open, admin]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!admin) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Informe o nome do administrador.");
      return;
    }
    if (!trimmedEmail) {
      setError("Informe o email do administrador.");
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmedEmail)) {
      setError("Email invalido.");
      return;
    }
    if (role === Role.ADMIN && !tenantId) {
      setError("Vincule o admin a um racha.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        id: admin.id,
        name: trimmedName,
        email: trimmedEmail,
        role,
        tenantId: tenantId || null,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao atualizar admin.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!open || !admin) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-xl mx-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Editar administrador</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-white"
              placeholder="Nome do administrador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-white"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-white"
              >
                {ROLE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vinculo de racha
              </label>
              <select
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-white"
              >
                <option value="">Sem racha</option>
                {sortedRachas.map((racha) => (
                  <option key={racha.id} value={racha.id}>
                    {racha.nome} ({racha.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaSave className="h-4 w-4" />
              <span>{saving ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

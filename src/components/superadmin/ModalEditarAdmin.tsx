"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { Role } from "@/common/enums";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

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
    <Fut7DialogBase
      open
      title="Editar administrador"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-superadmin-form"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
          >
            <FaSave className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <form id="edit-superadmin-form" onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Vinculo de racha</label>
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
      </form>
    </Fut7DialogBase>
  );
}

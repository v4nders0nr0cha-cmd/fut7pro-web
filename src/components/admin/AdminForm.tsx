"use client";
import type { Admin, RoleAdmin } from "@/types/racha";
import { useState } from "react";

const ROLES: { label: string; value: RoleAdmin }[] = [
  { label: "Presidente", value: "presidente" },
  { label: "Vice-Presidente", value: "vicepresidente" },
  { label: "Diretor de Futebol", value: "diretorfutebol" },
  { label: "Diretor Financeiro", value: "diretorfinanceiro" },
  { label: "Leitor", value: "leitor" },
];

type Props = {
  onSave: (admin: Partial<Admin>) => void;
  initialData?: Partial<Admin>;
  onCancel?: () => void;
};

export default function AdminForm({
  onSave,
  initialData = {},
  onCancel,
}: Props) {
  const [form, setForm] = useState<Partial<Admin>>(initialData);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl p-4 shadow-md"
    >
      <h2 className="text-center text-xl font-bold text-yellow-400">
        Adicionar/Editar Administrador
      </h2>
      <input
        name="nome"
        placeholder="Nome"
        value={form.nome ?? ""}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="email"
        placeholder="E-mail"
        value={form.email ?? ""}
        onChange={handleChange}
        required
        className="input"
        type="email"
      />
      <select
        name="role"
        value={form.role ?? "leitor"}
        onChange={handleChange}
        className="input"
      >
        {ROLES.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-primary w-full">
        Salvar
      </button>
      {onCancel && (
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={onCancel}
        >
          Cancelar
        </button>
      )}
    </form>
  );
}

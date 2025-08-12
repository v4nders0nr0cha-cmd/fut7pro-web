"use client";
import { useState } from "react";
import type { Patrocinador } from "@/types/patrocinador"; // <-- Corrigido!

type Props = {
  onSave: (p: Partial<Patrocinador>) => void;
  initialData?: Partial<Patrocinador>;
  onCancel?: () => void;
};

export default function PatrocinadorForm({ onSave, initialData = {}, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Patrocinador>>(initialData);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev: Partial<Patrocinador>) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    setForm({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-card rounded-2xl shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-yellow-400 text-center">
        Adicionar/Editar Patrocinador
      </h2>
      <input
        name="nome"
        placeholder="Nome do patrocinador"
        value={form.nome ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={32}
      />
      <input
        name="logo"
        placeholder="URL da logo"
        value={form.logo ?? ""}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="link"
        placeholder="Link do patrocinador"
        value={form.link ?? ""}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        type="number"
        name="prioridade"
        placeholder="Prioridade (1 = topo)"
        value={form.prioridade ?? 1}
        onChange={handleChange}
        className="input"
        min={1}
        max={99}
      />
      <select
        name="status"
        value={form.status ?? "ativo"}
        onChange={handleChange}
        className="input"
      >
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <textarea
        name="descricao"
        placeholder="Descrição curta"
        value={form.descricao ?? ""}
        onChange={handleChange}
        className="input"
        maxLength={80}
      />
      <button type="submit" className="btn-primary w-full">
        Salvar
      </button>
      {onCancel && (
        <button type="button" className="btn-secondary w-full" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}

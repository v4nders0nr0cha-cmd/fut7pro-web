"use client";
import { useState } from "react";
import type { Torneio } from "@/types/torneio";

type Props = {
  onSave: (torneio: Partial<Torneio>) => void;
  initialData?: Partial<Torneio>;
  onCancel?: () => void;
};

export default function TorneioForm({ onSave, initialData = {}, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Torneio>>(initialData);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
      className="flex flex-col gap-4 bg-card rounded-2xl shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-yellow-400 text-center">Adicionar/Editar Torneio</h2>
      <input
        name="nome"
        placeholder="Nome do Torneio"
        value={form.nome ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={64}
      />
      <input
        name="slug"
        placeholder="Slug do Torneio"
        value={form.slug ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={32}
      />
      <input
        name="ano"
        type="number"
        placeholder="Ano"
        value={form.ano ?? ""}
        onChange={handleChange}
        required
        className="input"
        min={2000}
        max={2100}
      />
      <input
        name="campeao"
        placeholder="Time/Atleta Campeão"
        value={form.campeao ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={32}
      />
      <input
        name="banner"
        placeholder="Banner do Torneio (URL ou path)"
        value={(form as any).banner ?? ""}
        onChange={handleChange}
        className="input"
      />
      <input
        name="logo"
        placeholder="Logo do Torneio (URL ou path)"
        value={(form as any).logo ?? ""}
        onChange={handleChange}
        className="input"
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

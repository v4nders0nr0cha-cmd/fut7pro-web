"use client";
import { useState } from "react";
import type { Financeiro } from "@/hooks/useFinanceiro";

type Props = {
  onSave: (lanc: Partial<Financeiro>) => void;
  adminId: string;
  onCancel?: () => void;
};

const CATEGORIAS = [
  "mensalidade",
  "diaria",
  "patrocinio",
  "evento",
  "campo",
  "uniforme",
  "arbitragem",
  "outros",
];

export default function FinanceiroForm({ onSave, adminId, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Financeiro>>({
    tipo: "entrada",
    categoria: "mensalidade",
    valor: 0,
    data: new Date().toISOString().substring(0, 10),
    adminId,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSave) onSave(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-card rounded-2xl shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-yellow-400 text-center">Novo Lançamento</h2>
      <select name="tipo" value={form.tipo} onChange={handleChange} className="input">
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <select name="categoria" value={form.categoria} onChange={handleChange} className="input">
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
      <input
        name="valor"
        type="number"
        placeholder="Valor"
        value={form.valor ?? ""}
        onChange={handleChange}
        min={0}
        step={0.01}
        className="input"
        required
      />
      <input
        name="data"
        type="date"
        value={form.data?.toString().substring(0, 10) ?? ""}
        onChange={handleChange}
        className="input"
        required
      />
      <input
        name="descricao"
        placeholder="Descrição opcional"
        value={form.descricao ?? ""}
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

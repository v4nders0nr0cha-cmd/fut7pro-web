"use client";
import { useState } from "react";
import type { Time } from "@/types/time";

type Props = {
  onSave: (time: Partial<Time>) => void;
  initialData?: Partial<Time>;
  onCancel?: () => void;
};

export default function TimeForm({ onSave, initialData = {}, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Time>>(initialData);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      <h2 className="text-xl font-bold text-yellow-400 text-center">Adicionar/Editar Time</h2>
      <input
        name="nome"
        placeholder="Nome do time"
        value={form.nome ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={32}
      />
      <input
        name="slug"
        placeholder="Slug do time"
        value={form.slug ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={32}
      />
      <input
        name="logo"
        placeholder="URL do escudo/logo"
        value={(form as any).escudoUrl ?? form.logo ?? ""}
        onChange={handleChange}
        className="input"
      />
      <input
        name="cor"
        placeholder="Cor principal (#HEX ou nome)"
        value={(form as any).corPrincipal ?? form.cor ?? ""}
        onChange={handleChange}
        className="input"
      />
      <input
        name="corSecundaria"
        placeholder="Cor secundária (#HEX ou nome)"
        value={form.corSecundaria ?? ""}
        onChange={handleChange}
        className="input"
      />
      {/* Para MVP: jogadores pode ser lista de IDs/nome separados por vírgula */}
      <input
        name="jogadores"
        placeholder="IDs dos jogadores (separados por vírgula)"
        value={Array.isArray(form.jogadores) ? form.jogadores.join(",") : (form.jogadores ?? "")}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            jogadores: e.target.value
              .split(",")
              .map((j) => j.trim())
              .filter((j) => !!j),
          }))
        }
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

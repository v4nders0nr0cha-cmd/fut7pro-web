"use client";
import { useState } from "react";
import type { Patrocinador, SponsorTier } from "@/types/patrocinador";

type Props = {
  onSave: (patrocinador: Partial<Patrocinador>) => void;
  initialData?: Partial<Patrocinador>;
  onCancel?: () => void;
};

const TIER_OPTIONS: SponsorTier[] = ["BASIC", "PLUS", "PRO"];

export default function PatrocinadorForm({ onSave, initialData = {}, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Patrocinador>>({
    tier: "BASIC",
    displayOrder: 1,
    showOnFooter: false,
    ...initialData,
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = event.target;
    const { name, value } = target;

    setForm((prev) => {
      if (target instanceof HTMLInputElement) {
        if (target.type === "checkbox") {
          return { ...prev, [name]: target.checked };
        }
        if (target.type === "number") {
          const numeric = Number(value);
          return {
            ...prev,
            [name]: Number.isFinite(numeric) ? numeric : prev?.[name as keyof Patrocinador],
          };
        }
      }
      return { ...prev, [name]: value };
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave(form);
    setForm((prev) => ({ ...prev, name: "", logoUrl: "", link: "", about: "" }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-card rounded-2xl shadow-md w-full max-w-[420px] mx-auto"
    >
      <h2 className="text-xl font-bold text-yellow-400 text-center">Adicionar/Editar Patrocinador</h2>
      <input
        name="name"
        placeholder="Nome do patrocinador"
        value={form.name ?? ""}
        onChange={handleChange}
        required
        className="input"
        maxLength={80}
      />
      <input
        name="logoUrl"
        placeholder="URL da logo"
        value={form.logoUrl ?? ""}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="link"
        placeholder="Link do patrocinador"
        value={form.link ?? ""}
        onChange={handleChange}
        className="input"
      />
      <input
        type="number"
        name="displayOrder"
        placeholder="Ordem de exibicao (1 = topo)"
        value={form.displayOrder ?? 1}
        onChange={handleChange}
        className="input"
        min={1}
        max={99}
      />
      <select name="tier" value={form.tier ?? "BASIC"} onChange={handleChange} className="input">
        {TIER_OPTIONS.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-gray-200">
        <input
          type="checkbox"
          name="showOnFooter"
          checked={form.showOnFooter ?? false}
          onChange={handleChange}
        />
        Exibir no rodape publico
      </label>
      <textarea
        name="about"
        placeholder="Descricao curta"
        value={form.about ?? ""}
        onChange={handleChange}
        className="input"
        maxLength={280}
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

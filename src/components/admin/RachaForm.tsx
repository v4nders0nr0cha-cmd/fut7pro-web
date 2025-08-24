// src/components/admin/RachaForm.tsx
"use client";
import { useState, useEffect } from "react";
import type { Racha } from "@/types/racha";

type RachaFormProps = {
  racha?: Partial<Racha>;
  onSave: (racha: Partial<Racha>) => void;
  onCancel?: () => void;
};

export default function RachaForm({ racha, onSave, onCancel }: RachaFormProps) {
  const [form, setForm] = useState<Partial<Racha>>(racha || {});

  useEffect(() => {
    setForm(racha || {});
  }, [racha]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({
        ...f,
        [name]: checked,
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]:
          name === "slug"
            ? value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()
            : value,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-[#232323] bg-[#191919] p-4 shadow-lg"
      autoComplete="off"
    >
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Nome do Racha
        </label>
        <input
          name="nome"
          value={form.nome || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          maxLength={40}
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Slug</label>
        <input
          name="slug"
          value={form.slug || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          maxLength={24}
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Descrição
        </label>
        <textarea
          name="descricao"
          value={form.descricao || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          rows={2}
          maxLength={100}
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Logo (URL)
        </label>
        <input
          name="logoUrl"
          value={form.logoUrl || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          maxLength={120}
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Tema (Slug do Tema)
        </label>
        <input
          name="tema"
          value={form.tema || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          maxLength={24}
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Regras</label>
        <textarea
          name="regras"
          value={form.regras || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          rows={3}
          maxLength={300}
        />
      </div>
      <div>
        <label className="mb-1 flex cursor-pointer items-center gap-2 font-medium text-yellow-500">
          <input
            type="checkbox"
            name="financeiroVisivel"
            checked={!!form.financeiroVisivel}
            onChange={handleChange}
            className="h-5 w-5 accent-yellow-500"
          />
          Mostrar Prestação de Contas na página Sobre Nós
        </label>
        <span className="ml-7 text-xs text-gray-400">
          Se desativado, a subpágina ficará totalmente invisível para atletas e
          visitantes.
        </span>
      </div>
      <div className="mt-2 flex gap-4">
        <button
          type="submit"
          className="w-full rounded bg-yellow-500 py-2 font-bold text-gray-900 shadow transition hover:bg-yellow-600"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Racha"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="w-full rounded bg-gray-700 py-2 text-white transition hover:bg-gray-800"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

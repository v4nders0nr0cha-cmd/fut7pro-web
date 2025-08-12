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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({
        ...f,
        [name]: checked,
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: name === "slug" ? value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase() : value,
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
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl w-full"
      autoComplete="off"
    >
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Nome do Racha</label>
        <input
          name="nome"
          value={form.nome || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          maxLength={40}
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Slug</label>
        <input
          name="slug"
          value={form.slug || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          maxLength={24}
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Descrição</label>
        <textarea
          name="descricao"
          value={form.descricao || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          rows={2}
          maxLength={100}
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Logo (URL)</label>
        <input
          name="logoUrl"
          value={form.logoUrl || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          maxLength={120}
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Tema (Slug do Tema)</label>
        <input
          name="tema"
          value={form.tema || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          maxLength={24}
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Regras</label>
        <textarea
          name="regras"
          value={form.regras || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          rows={3}
          maxLength={300}
        />
      </div>
      <div>
        <label className="flex items-center gap-2 font-medium text-yellow-500 cursor-pointer mb-1">
          <input
            type="checkbox"
            name="financeiroVisivel"
            checked={!!form.financeiroVisivel}
            onChange={handleChange}
            className="accent-yellow-500 w-5 h-5"
          />
          Mostrar Prestação de Contas na página Sobre Nós
        </label>
        <span className="text-xs text-gray-400 ml-7">
          Se desativado, a subpágina ficará totalmente invisível para atletas e visitantes.
        </span>
      </div>
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 font-bold py-2 rounded hover:bg-yellow-600 transition shadow w-full"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Racha"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition w-full"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

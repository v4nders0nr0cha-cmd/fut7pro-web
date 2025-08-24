// src/components/admin/PartidaForm.tsx
"use client";
import { useState, useEffect } from "react";
import type { Partida } from "@/types/partida";

type PartidaFormProps = {
  partida?: Partial<Partida>;
  onSave: (partida: Partial<Partida>) => void;
  onCancel?: () => void;
};

export default function PartidaForm({
  partida,
  onSave,
  onCancel,
}: PartidaFormProps) {
  const [form, setForm] = useState<Partial<Partida>>(partida || {});

  useEffect(() => {
    setForm(partida || {});
  }, [partida]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Ajusta para backend: converte "data" string para ISO, gols para number
    const partidaEnviada: Partial<Partida> = {
      ...form,
      data: form.data ? new Date(form.data).toISOString() : undefined,
      golsTimeA: form.golsTimeA ? Number(form.golsTimeA) : 0,
      golsTimeB: form.golsTimeB ? Number(form.golsTimeB) : 0,
    };
    onSave(partidaEnviada);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-[#232323] bg-[#191919] p-4 shadow-lg"
      autoComplete="off"
    >
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Data</label>
        <input
          type="date"
          name="data"
          value={form.data ? form.data.slice(0, 10) : ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Horário
        </label>
        <input
          type="time"
          name="horario"
          value={form.horario || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Local</label>
        <input
          name="local"
          value={form.local || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          maxLength={40}
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Time A</label>
        <input
          name="timeA"
          value={form.timeA || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Gols Time A
        </label>
        <input
          type="number"
          name="golsTimeA"
          value={form.golsTimeA ?? ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          min={0}
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">Time B</label>
        <input
          name="timeB"
          value={form.timeB || ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-medium text-yellow-500">
          Gols Time B
        </label>
        <input
          type="number"
          name="golsTimeB"
          value={form.golsTimeB ?? ""}
          onChange={handleChange}
          className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          min={0}
          required
        />
      </div>
      <div className="mt-2 flex gap-4">
        <button
          type="submit"
          className="w-full rounded bg-yellow-500 py-2 font-bold text-gray-900 shadow transition hover:bg-yellow-600"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Partida"}
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

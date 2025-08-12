// src/components/admin/PartidaForm.tsx
"use client";
import { useState, useEffect } from "react";
import type { Partida } from "@/types/partida";

type PartidaFormProps = {
  partida?: Partial<Partida>;
  onSave: (partida: Partial<Partida>) => void;
  onCancel?: () => void;
};

export default function PartidaForm({ partida, onSave, onCancel }: PartidaFormProps) {
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
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl w-full"
      autoComplete="off"
    >
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Data</label>
        <input
          type="date"
          name="data"
          value={form.data ? form.data.slice(0, 10) : ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Horário</label>
        <input
          type="time"
          name="horario"
          value={form.horario || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Local</label>
        <input
          name="local"
          value={form.local || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          maxLength={40}
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Time A</label>
        <input
          name="timeA"
          value={form.timeA || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Gols Time A</label>
        <input
          type="number"
          name="golsTimeA"
          value={form.golsTimeA ?? ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          min={0}
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Time B</label>
        <input
          name="timeB"
          value={form.timeB || ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium text-yellow-500 mb-1">Gols Time B</label>
        <input
          type="number"
          name="golsTimeB"
          value={form.golsTimeB ?? ""}
          onChange={handleChange}
          className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          min={0}
          required
        />
      </div>
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 font-bold py-2 rounded hover:bg-yellow-600 transition shadow w-full"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Partida"}
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

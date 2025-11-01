"use client";

import React, { useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { Jogador } from "@/types/jogador";
import { POSITION_OPTIONS, type PositionValue } from "@/constants/positions";

type FormState = Partial<Jogador> & {
  foto?: string;
  posicao?: PositionValue;
  status?: string;
};

const DEFAULT_FORM: FormState = {
  id: "",
  nome: "",
  apelido: "",
  foto: "",
  status: "Ativo",
  mensalista: false,
  posicao: "atacante",
};

export default function JogadorForm({
  jogador,
  onCancel,
  onSave,
}: {
  jogador?: Jogador;
  onCancel?: () => void;
  onSave?: (jogador: Partial<Jogador>) => void;
}) {
  const [form, setForm] = useState<FormState>(jogador ? normalizeJogador(jogador) : DEFAULT_FORM);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(jogador?.foto ?? jogador?.avatar ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jogador) {
      setForm(normalizeJogador(jogador));
      setFotoPreview(jogador.foto ?? jogador.avatar ?? "");
    } else {
      setForm(DEFAULT_FORM);
      setFotoPreview("");
      setFotoFile(null);
    }
  }, [jogador]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const preview = URL.createObjectURL(file);
    setFotoPreview(preview);
    setForm((prev) => ({ ...prev, foto: preview }));
  }

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (onSave) {
      onSave({
        ...form,
        posicao: form.posicao ?? "atacante",
      });
    }
    setFotoFile(null);
    setFotoPreview("");
    if (onCancel) onCancel();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl"
    >
      <div className="flex gap-4">
        <div
          onClick={handleFotoClick}
          className="w-20 h-20 bg-[#222] rounded-lg border-2 border-dashed border-yellow-600 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition"
          title="Clique para selecionar uma foto"
        >
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt="Preview Foto"
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-sm text-center px-2">+ Foto</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Nome</label>
            <input
              name="nome"
              value={form.nome || ""}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={60}
              required
            />
          </div>
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Apelido</label>
            <input
              name="apelido"
              value={form.apelido || ""}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={40}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium text-yellow-500 mb-1">Status</label>
          <select
            name="status"
            value={form.status ?? "Ativo"}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium text-yellow-500 mb-1">Posicao</label>
          <select
            name="posicao"
            value={form.posicao ?? "atacante"}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            {POSITION_OPTIONS.map((posicao) => (
              <option key={posicao.value} value={posicao.value}>
                {posicao.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 font-medium text-yellow-500 cursor-pointer mb-1">
            <input
              name="mensalista"
              type="checkbox"
              checked={Boolean(form.mensalista)}
              onChange={handleChange}
              className="accent-yellow-500"
            />
            Mensalista
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 font-bold py-2 rounded hover:bg-yellow-600 transition shadow flex-1"
        >
          {form.id ? "Salvar alteracoes" : "Cadastrar jogador"}
        </button>
        {form.id && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600 transition shadow flex-1"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function normalizeJogador(jogador: Jogador): FormState {
  return {
    ...jogador,
    foto: jogador.avatar ?? (jogador as { foto?: string }).foto ?? "",
    posicao: jogador.posicao ?? "atacante",
    status: jogador.status ?? "Ativo",
  };
}

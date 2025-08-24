"use client";
import React, { useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { Jogador, PosicaoJogador } from "@/types/jogador";

const POSICOES: { label: string; value: PosicaoJogador }[] = [
  { label: "Atacante", value: "atacante" },
  { label: "Meia", value: "meia" },
  { label: "Zagueiro", value: "zagueiro" },
  { label: "Goleiro", value: "goleiro" },
];

export default function JogadorForm({
  jogador,
  onCancel,
  onSave,
}: {
  jogador?: Jogador;
  onCancel?: () => void;
  onSave?: (jogador: Partial<Jogador>) => void;
}) {
  const [form, setForm] = useState<Partial<Jogador>>(
    jogador || {
      id: "",
      nome: "",
      apelido: "",
      foto: "",
      status: "ativo",
      mensalista: false,
      posicao: "atacante",
    },
  );
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(jogador?.foto || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jogador) {
      setForm(jogador);
      setFotoPreview(jogador.foto || "");
    } else {
      setForm({
        id: "",
        nome: "",
        apelido: "",
        foto: "",
        status: "ativo",
        mensalista: false,
        posicao: "atacante",
      });
      setFotoPreview("");
      setFotoFile(null);
    }
  }, [jogador]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const preview = URL.createObjectURL(file);
      setFotoPreview(preview);
      setForm((prev) => ({ ...prev, foto: preview }));
    }
  }

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSave) onSave(form);
    setFotoFile(null);
    setFotoPreview("");
    if (onCancel) onCancel();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-4 rounded-xl border border-[#232323] bg-[#191919] p-4 shadow-lg"
    >
      <div className="flex gap-4">
        <div
          onClick={handleFotoClick}
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-yellow-600 bg-[#222] transition hover:border-yellow-400"
          title="Clique para selecionar uma foto"
        >
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt="Preview Foto"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span className="px-2 text-center text-sm text-gray-400">
              + Foto
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <label className="mb-1 block font-medium text-yellow-500">
              Nome
            </label>
            <input
              name="nome"
              value={form.nome || ""}
              onChange={handleChange}
              className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
              maxLength={20}
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-yellow-500">
              Apelido
            </label>
            <input
              name="apelido"
              value={form.apelido || ""}
              onChange={handleChange}
              className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
              maxLength={15}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block font-medium text-yellow-500">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block font-medium text-yellow-500">
            Posição
          </label>
          <select
            name="posicao"
            value={form.posicao}
            onChange={handleChange}
            className="w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          >
            {POSICOES.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="mb-1 flex cursor-pointer items-center gap-2 font-medium text-yellow-500">
            <input
              name="mensalista"
              type="checkbox"
              checked={!!form.mensalista}
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
          className="flex-1 rounded bg-yellow-500 py-2 font-bold text-gray-900 shadow transition hover:bg-yellow-600"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Jogador"}
        </button>
        {form.id && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded bg-gray-700 py-2 font-bold text-white shadow transition hover:bg-gray-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

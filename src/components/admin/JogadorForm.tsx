"use client";
import Image from "next/image";
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
    }
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl"
    >
      <div className="flex gap-4">
        <div
          onClick={handleFotoClick}
          className="w-20 h-20 bg-[#222] rounded-lg border-2 border-dashed border-yellow-600 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition"
          title="Clique para selecionar uma foto"
        >
          {fotoPreview ? (
            <Image
              src={fotoPreview}
              alt="Preview Foto"
              width={80}
              height={80}
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
              maxLength={20}
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
              maxLength={15}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-yellow-500 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium text-yellow-500 mb-1">Posição</label>
          <select
            name="posicao"
            value={form.posicao}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            {POSICOES.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 font-medium text-yellow-500 cursor-pointer mb-1">
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
          className="bg-yellow-500 text-gray-900 font-bold py-2 rounded hover:bg-yellow-600 transition shadow flex-1"
        >
          {form.id ? "Salvar Alterações" : "Cadastrar Jogador"}
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

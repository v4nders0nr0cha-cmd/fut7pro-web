"use client";

import React, { useRef, useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Athlete, AthletePosition, AthleteStatus } from "@/types/jogador";
import { POSITION_OPTIONS } from "@/constants/positions";

type FormState = {
  id?: string;
  name: string;
  nickname: string;
  email?: string;
  status: AthleteStatus;
  position: AthletePosition;
  isMember: boolean;
  photoUrl?: string | null;
};

const DEFAULT_FORM: FormState = {
  name: "",
  nickname: "",
  email: "",
  status: "Ativo",
  position: "atacante",
  isMember: true,
  photoUrl: null,
};

type Props = {
  jogador?: Athlete;
  onCancel?: () => void;
  onSave?: (payload: Partial<Athlete>) => void;
};

export default function JogadorForm({ jogador, onCancel, onSave }: Props) {
  const [form, setForm] = useState<FormState>(jogador ? normalizeAthlete(jogador) : DEFAULT_FORM);
  const [photoPreview, setPhotoPreview] = useState<string>(jogador?.photoUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jogador) {
      setForm(normalizeAthlete(jogador));
      setPhotoPreview(jogador.photoUrl ?? "");
    } else {
      setForm(DEFAULT_FORM);
      setPhotoPreview("");

    }
  }, [jogador]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;


    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setForm((prev) => ({ ...prev, photoUrl: preview }));
  }

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSave) return;

    const payload: Partial<Athlete> = {
      id: form.id,
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      email: form.email?.trim() ?? undefined,
      position: form.position,
      status: form.status,
      isMember: form.isMember,
      mensalista: form.isMember,
      photoUrl: form.photoUrl,
    };

    onSave(payload);

    // Reset file preview apenas se estivermos criando um novo jogador
    if (!form.id) {

      setPhotoPreview("");
      setForm(DEFAULT_FORM);
    }

    if (onCancel) {
      onCancel();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl"
    >
      <div className="flex gap-4">
        <div
          onClick={handlePhotoClick}
          className="w-20 h-20 bg-[#222] rounded-lg border-2 border-dashed border-yellow-600 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition"
          title="Clique para selecionar uma foto"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Foto do jogador"
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-sm text-center px-2">+ Foto</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Nome</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={60}
              required
            />
          </div>
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Apelido</label>
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={40}
            />
          </div>
          <div>
            <label className="block font-medium text-yellow-500 mb-1">E-mail</label>
            <input
              name="email"
              value={form.email ?? ""}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={120}
              type="email"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium text-yellow-500 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium text-yellow-500 mb-1">Posição</label>
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 font-medium text-yellow-500 cursor-pointer mb-1">
            <input
              name="isMember"
              type="checkbox"
              checked={form.isMember}
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
          {form.id ? "Salvar alterações" : "Cadastrar jogador"}
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

function normalizeAthlete(athlete: Athlete): FormState {
  return {
    id: athlete.id,
    name: athlete.name,
    nickname: athlete.nickname ?? "",
    email: athlete.email ?? "",
    status: (athlete.status as AthleteStatus) ?? "Ativo",
    position: (athlete.position as AthletePosition) ?? "atacante",
    isMember: athlete.isMember ?? Boolean(athlete.mensalista),
    photoUrl: athlete.photoUrl ?? null,
  };
}

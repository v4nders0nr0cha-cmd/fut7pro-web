"use client";

import { useState } from "react";
import Image from "next/image";
import { FaTimes, FaUpload, FaFutbol, FaHandPaper } from "react-icons/fa";

type Props = {
  fotoUrl?: string;
  nomeTime?: string;
  jogadores?: string[];
  onClose: () => void;
};

export default function ModalEditarCampeao({
  fotoUrl = "/images/times/time_campeao_padrao_01.png",
  nomeTime = "Time Campeão do Dia",
  jogadores = ["Jogador 01", "Jogador 02", "Jogador 03", "Jogador 04"],
  onClose,
}: Props) {
  const [novaFoto, setNovaFoto] = useState<File | null>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) setNovaFoto(e.target.files[0]);
  }

  // Aqui você implementaria a lógica de salvar resultados, gols, passes etc.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative flex w-full max-w-xl flex-col gap-4 rounded-2xl bg-[#22252c] p-8 shadow-2xl">
        <button
          type="button"
          className="absolute right-3 top-2 text-xl text-gray-300 hover:text-yellow-400"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="mb-1 text-center text-2xl font-bold text-[#ffd600]">
          Editar Campeão do Dia
        </h2>
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-24 w-32">
            <Image
              src={novaFoto ? URL.createObjectURL(novaFoto) : fotoUrl}
              alt="Nova Foto Time Campeão"
              fill
              className="rounded-lg border-4 border-[#ffd600] object-cover shadow"
            />
            <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-[#ffd600] p-2 shadow">
              <FaUpload className="h-4 w-4 text-black" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </label>
          </div>
        </div>

        <div className="mt-3">
          <label className="font-semibold text-white">Jogadores do Time:</label>
          <ul className="mt-1 flex flex-wrap gap-2">
            {jogadores.map((jog, idx) => (
              <li
                key={idx}
                className="rounded bg-[#222a35] px-2 py-1 text-sm text-yellow-200"
              >
                {jog}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <FaFutbol /> Gols do Time:
            </label>
            <input
              type="text"
              className="input mt-1"
              placeholder="Ex: Jogador 01 (2), Jogador 03 (1)"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <FaHandPaper /> Passes/Assistências:
            </label>
            <input
              type="text"
              className="input mt-1"
              placeholder="Ex: Jogador 02 (1), Jogador 04 (1)"
            />
          </div>
        </div>

        <button
          className="btn-primary mt-4"
          onClick={() => {
            // Aqui você enviaria os dados para backend
            onClose();
          }}
        >
          Salvar Dados do Campeão
        </button>
      </div>
    </div>
  );
}

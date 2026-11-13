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
  fotoUrl = "/images/times/time_padrao_01.png",
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
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 px-0 pt-3 sm:items-center sm:px-3 sm:py-6">
      <div className="relative flex max-h-[calc(100dvh-0.75rem)] w-full max-w-xl flex-col gap-4 overflow-y-auto overscroll-contain rounded-t-2xl bg-[#22252c] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:p-8">
        <button
          type="button"
          className="sticky top-0 z-10 ml-auto rounded-lg border border-white/15 bg-[#22252c] px-3 py-1 text-xl text-gray-200 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar edição do campeão"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold text-[#ffd600] mb-1 text-center">
          Editar Campeão do Dia
        </h2>
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-32 h-24">
            <Image
              src={novaFoto ? URL.createObjectURL(novaFoto) : fotoUrl}
              alt="Nova Foto Time Campeão"
              fill
              className="rounded-lg border-4 border-[#ffd600] object-cover shadow"
            />
            <label className="absolute bottom-1 right-1 bg-[#ffd600] p-2 rounded-full cursor-pointer shadow">
              <FaUpload className="text-black w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
            </label>
          </div>
        </div>

        <div className="mt-3">
          <label className="font-semibold text-white">Jogadores do Time:</label>
          <ul className="flex flex-wrap gap-2 mt-1">
            {jogadores.map((jog, idx) => (
              <li key={idx} className="bg-[#222a35] rounded px-2 py-1 text-sm text-yellow-200">
                {jog}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <FaFutbol /> Gols do Time:
            </label>
            <input
              type="text"
              className="input mt-1"
              placeholder="Ex: Jogador 01 (2), Jogador 03 (1)"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-white flex items-center gap-2">
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

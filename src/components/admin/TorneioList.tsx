"use client";
import Image from "next/image";
import type { Torneio } from "@/types/torneio";

type Props = {
  torneios: Torneio[];
  onEdit: (torneio: Torneio) => void;
  onDelete: (id: string) => void;
};

export default function TorneioList({ torneios, onEdit, onDelete }: Props) {
  if (!torneios.length)
    return <div className="p-4 text-center text-gray-400">Nenhum torneio cadastrado.</div>;

  return (
    <div className="w-full flex flex-col gap-2">
      {torneios.map((torneio) => (
        <div
          key={torneio.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm gap-2"
        >
          <div className="flex items-center gap-3 w-full">
            {/* Banner do Torneio */}
            {torneio.bannerUrl && (
              <Image
                src={torneio.bannerUrl}
                alt={`Banner do Torneio ${torneio.nome}`}
                width={80}
                height={40}
                className="rounded-lg object-cover border"
              />
            )}
            {/* Logo do Torneio */}
            {torneio.logoUrl && (
              <Image
                src={torneio.logoUrl}
                alt={`Logo do Torneio ${torneio.nome}`}
                width={32}
                height={32}
                className="rounded-full object-contain border"
              />
            )}

            <div className="flex flex-col flex-1">
              <span className="font-bold text-yellow-400">
                {torneio.nome} ({torneio.ano})
              </span>
              <span className="text-xs text-gray-500 mb-1">Slug: {torneio.slug}</span>
              <span className="text-sm text-gray-400">Campeão: {torneio.campeao}</span>
            </div>
          </div>
          <div className="flex flex-row gap-2 mt-2 sm:mt-0">
            <button className="btn-primary" onClick={() => onEdit(torneio)}>
              Editar
            </button>
            <button className="btn-secondary" onClick={() => onDelete(torneio.id)}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

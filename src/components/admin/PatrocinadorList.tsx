"use client";
import Image from "next/image";
import type { Patrocinador } from "@/types/patrocinador"; // <-- Corrigido!

type Props = {
  patrocinadores: Patrocinador[];
  onEdit: (p: Patrocinador) => void;
  onDelete: (id: string) => void;
};

export default function PatrocinadorList({ patrocinadores, onEdit, onDelete }: Props) {
  if (!patrocinadores.length)
    return <div className="p-4 text-center text-gray-400">Nenhum patrocinador cadastrado.</div>;
  return (
    <div className="w-full flex flex-col gap-2">
      {patrocinadores.map((patro) => (
        <div
          key={patro.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Image
              src={patro.logo}
              alt={`Logo ${patro.nome}`}
              width={60}
              height={60}
              className="rounded-lg object-contain bg-white"
            />
            <div className="flex flex-col">
              <span className="font-bold text-yellow-400">{patro.nome}</span>
              <span className="text-sm text-gray-500">{patro.descricao}</span>
              <a
                href={patro.link}
                target="_blank"
                rel="noopener"
                className="text-xs text-blue-400 underline mt-1"
              >
                Acessar site
              </a>
            </div>
          </div>
          <div className="flex flex-row gap-2 mt-2 sm:mt-0">
            <button className="btn-primary" onClick={() => onEdit(patro)}>
              Editar
            </button>
            <button className="btn-secondary" onClick={() => onDelete(patro.id)}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

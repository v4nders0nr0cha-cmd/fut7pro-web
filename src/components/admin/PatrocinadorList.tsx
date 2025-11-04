"use client";
import Image from "next/image";
import type { Patrocinador } from "@/types/patrocinador";

type Props = {
  patrocinadores: Patrocinador[];
  onEdit: (patrocinador: Patrocinador) => void;
  onDelete: (id: string) => void;
};

export default function PatrocinadorList({ patrocinadores, onEdit, onDelete }: Props) {
  if (!patrocinadores.length) {
    return <div className="p-4 text-center text-gray-400">Nenhum patrocinador cadastrado.</div>;
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {patrocinadores.map((patrocinador) => {
        const logoSrc =
          patrocinador.logoUrl && patrocinador.logoUrl.length > 0
            ? patrocinador.logoUrl
            : "/images/logos/logo_fut7pro.png";

        return (
          <div
            key={patrocinador.id}
            className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Image
                src={logoSrc}
                alt={`Logo ${patrocinador.name}`}
                width={60}
                height={60}
                className="rounded-lg object-contain bg-white"
              />
              <div className="flex flex-col">
                <span className="font-bold text-yellow-400">{patrocinador.name}</span>
                {patrocinador.about && (
                  <span className="text-sm text-gray-500">{patrocinador.about}</span>
                )}
                {patrocinador.link && (
                  <a
                    href={patrocinador.link}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-blue-400 underline mt-1"
                  >
                    Acessar site
                  </a>
                )}
                <span className="text-xs text-gray-500 mt-1">
                  Tier: <span className="font-semibold text-gray-200">{patrocinador.tier}</span>
                  {patrocinador.showOnFooter ? " - Rodape ativo" : ""}
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-2 mt-2 sm:mt-0">
              <button className="btn-primary" onClick={() => onEdit(patrocinador)}>
                Editar
              </button>
              <button className="btn-secondary" onClick={() => onDelete(patrocinador.id)}>
                Excluir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

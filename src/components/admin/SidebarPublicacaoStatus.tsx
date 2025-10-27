"use client";

import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

type Props = {
  rachaId: string;
};

export default function SidebarPublicacaoStatus({ rachaId }: Props) {
  const [data, setData] = useState<{ slug: string; ativo: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rachaId) {
      setLoading(false);
      return;
    }

    fetch(`/api/rachas/${rachaId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.slug && d.ativo !== undefined) {
          setData({ slug: d.slug, ativo: d.ativo });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [rachaId]);

  // Fallback: sempre mostrar algo
  if (loading) {
    return (
      <div className="px-4 mt-3">
        <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-3 text-center">
          <span className="text-gray-400 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.slug) {
    // Fallback para quando não há dados - mostrar link padrão
    return (
      <div className="px-4 mt-3">
        <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-3 flex items-center justify-between hover:bg-[#222] transition shadow">
          <a
            href="/fut7pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-bold text-yellow-300"
            title="Abrir site público do seu racha"
          >
            Ver o Site
            <FaExternalLinkAlt className="text-yellow-400 ml-1" />
          </a>
        </div>
        <div className="text-xs text-gray-400 mt-1 pl-1">
          Atualizações podem levar até 15 minutos para aparecer no site público.
        </div>
      </div>
    );
  }

  const { slug, ativo } = data;

  if (ativo) {
    return (
      <div className="px-4 mt-3">
        <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-3 flex items-center justify-between hover:bg-[#222] transition shadow">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-bold text-yellow-300"
            title="Abrir site público do seu racha"
          >
            Ver o Site
            <FaExternalLinkAlt className="text-yellow-400 ml-1" />
          </a>
        </div>
        <div className="text-xs text-gray-400 mt-1 pl-1">
          Atualizações podem levar até 15 minutos para aparecer no site público.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-3">
      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-3 flex flex-col gap-2">
        <a
          href={`/${slug}?dev=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-semibold text-gray-300 hover:text-yellow-300 transition"
          title="Pré-visualizar site (em desenvolvimento)"
        >
          Pré-visualizar
          <FaExternalLinkAlt className="text-gray-400" size={14} />
        </a>
        <div className="text-xs text-gray-400">Site em rascunho. Publique pelo Dashboard.</div>
      </div>
    </div>
  );
}

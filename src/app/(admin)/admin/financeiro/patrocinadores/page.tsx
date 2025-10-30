"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import { useAuth } from "@/hooks/useAuth";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import type { Patrocinador } from "@/types/patrocinador";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? null;
  const {
    patrocinadores,
    isLoading,
    error,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    toggleFooterForAll,
    toggleFooterVisibility,
  } = usePatrocinadores(tenantSlug);

  const inicioPadrao = useMemo(
    () => new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString().slice(0, 10),
    []
  );
  const [periodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Patrocinador | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const footerVisivel = patrocinadores.some((p) => p.showOnFooter);
  const atingiuLimite = patrocinadores.length >= 10;

  const handleNovo = () => {
    if (atingiuLimite || !tenantSlug) return;
    setSelectedSponsor(null);
    setModalOpen(true);
  };

  const handleEditar = (patro: Patrocinador) => {
    setSelectedSponsor(patro);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    await deletePatrocinador(id);
  };

  const handleToggleVisibilidade = async () => {
    await toggleFooterForAll(!footerVisivel);
  };

  const handleToggleSponsorFooter = async (id: string, show: boolean) => {
    await toggleFooterVisibility(id, show);
  };

  const handleSave = async (payload: Parameters<typeof createPatrocinador>[0], id?: string) => {
    setSubmitting(true);
    try {
      if (id) {
        await updatePatrocinador(id, payload);
      } else {
        await createPatrocinador(payload);
      }
      setModalOpen(false);
      setSelectedSponsor(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Painel Admin | Patrocinadores - Fut7Pro</title>
        <meta
          name="description"
          content="Gestão de patrocinadores do racha com integração automática ao site público. Controle vigência, tier, link, benefícios e visibilidade."
        />
        <meta
          name="keywords"
          content="Fut7Pro, painel admin, patrocinadores, racha, futebol, SaaS, financeiro, patrocínio"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center flex-wrap mb-6 gap-2 justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-yellow-400">Patrocinadores</h1>
          <button
            type="button"
            onClick={handleNovo}
            disabled={atingiuLimite || submitting || isLoading || !tenantSlug}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Novo Patrocinador
          </button>
        </div>

        {!tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-500 bg-yellow-900/30 text-sm text-yellow-200">
            Selecione um racha válido para gerenciar seus patrocinadores.
          </div>
        )}

        {error && tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-900/40 text-sm text-red-200">
            Falha ao carregar patrocinadores. Tente novamente mais tarde.
          </div>
        )}

        <CardResumoPatrocinio patrocinadores={patrocinadores} periodo={periodo} />

        <ToggleVisibilidadePublica visivel={footerVisivel} onToggle={handleToggleVisibilidade} />

        {isLoading && (
          <div className="w-full py-8 text-center text-gray-300 text-sm">
            Carregando patrocinadores...
          </div>
        )}

        {!isLoading && (
          <TabelaPatrocinadores
            patrocinadores={patrocinadores}
            onEditar={handleEditar}
            onExcluir={handleExcluir}
            onToggleFooter={handleToggleSponsorFooter}
            onNovo={handleNovo}
          />
        )}

        <ModalPatrocinador
          open={modalOpen}
          onClose={() => {
            if (submitting) return;
            setModalOpen(false);
            setSelectedSponsor(null);
          }}
          onSave={handleSave}
          initial={selectedSponsor}
          submitting={submitting}
        />
      </div>
    </>
  );
}

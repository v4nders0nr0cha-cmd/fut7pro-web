"use client";
import Head from "next/head";
import { useState } from "react";
import { mockPatrocinadores } from "./mocks/mockPatrocinadores";
import type { Patrocinador } from "@/types/financeiro";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const [patrocinadores, setPatrocinadores] =
    useState<Patrocinador[]>(mockPatrocinadores);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<
    Patrocinador | undefined
  >(undefined);

  // Período padrão: últimos 12 meses
  const inicioPadrao = new Date(new Date().setMonth(new Date().getMonth() - 11))
    .toISOString()
    .slice(0, 10);
  const [periodo, setPeriodo] = useState({
    inicio: inicioPadrao,
    fim: DATA_ATUAL,
  });

  // CRUD handlers
  const handleEditar = (p: Patrocinador) => {
    setEditPatrocinador(p);
    setModalOpen(true);
  };
  const handleExcluir = (id: string) =>
    setPatrocinadores((arr) => arr.filter((p) => p.id !== id));
  const handleSalvar = (p: Partial<Patrocinador>) => {
    if (
      !p.nome ||
      !p.valor ||
      !p.periodoInicio ||
      !p.periodoFim ||
      !p.status ||
      !p.logo
    )
      return;
    if (p.id) {
      setPatrocinadores((arr) =>
        arr.map((x) =>
          x.id === p.id ? ({ ...x, ...p, id: x.id } as Patrocinador) : x,
        ),
      );
    } else {
      if (patrocinadores.length >= 10) return;
      setPatrocinadores((arr) => [
        ...arr,
        {
          ...p,
          id: Date.now().toString(),
          comprovantes: [],
          visivel: true,
        } as Patrocinador,
      ]);
    }
    setModalOpen(false);
    setEditPatrocinador(undefined);
  };
  const handleToggleVisivel = (id: string) => {
    setPatrocinadores((arr) =>
      arr.map((p) => (p.id === id ? { ...p, visivel: !p.visivel } : p)),
    );
  };
  const handleNovo = () => {
    if (patrocinadores.length < 10) {
      setEditPatrocinador(undefined);
      setModalOpen(true);
    }
  };

  return (
    <>
      <Head>
        <title>Painel Admin | Patrocinadores - Fut7Pro</title>
        <meta
          name="description"
          content="Gestão de patrocinadores do racha, valores, vigência, status e integração automática com a prestação de contas. Sistema de futebol SaaS, Fut7, racha, patrocínio, gestão financeira."
        />
        <meta
          name="keywords"
          content="Fut7Pro, painel admin, patrocinadores, racha, futebol, SaaS, financeiro, patrocínio"
        />
      </Head>
      <div className="mx-auto w-full max-w-6xl pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-black text-yellow-400 md:text-3xl">
            Patrocinadores
          </h1>
        </div>
        <CardResumoPatrocinio
          patrocinadores={patrocinadores}
          periodo={periodo}
        />
        <ToggleVisibilidadePublica
          visivel={patrocinadores.some((p) => p.visivel)}
          onToggle={() => {
            const allVisivel = patrocinadores.some((p) => p.visivel);
            setPatrocinadores((arr) =>
              arr.map((p) => ({ ...p, visivel: !allVisivel })),
            );
          }}
        />
        <TabelaPatrocinadores
          patrocinadores={patrocinadores}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onToggleVisivel={handleToggleVisivel}
          onNovo={handleNovo}
        />
        <ModalPatrocinador
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditPatrocinador(undefined);
          }}
          onSave={handleSalvar}
          initial={editPatrocinador}
        />
      </div>
    </>
  );
}

"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import type { Patrocinador as PatroFin } from "@/types/financeiro";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import { rachaConfig } from "@/config/racha.config";
import type { Patrocinador as PatroDb } from "@/types/patrocinador";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const rachaId = rachaConfig.slug;
  const {
    patrocinadores: patrocinadoresDb,
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  } = usePatrocinadores(rachaId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<PatroFin | undefined>(undefined);

  // Período padrão: últimos 12 meses
  const inicioPadrao = new Date(new Date().setMonth(new Date().getMonth() - 11))
    .toISOString()
    .slice(0, 10);
  const [periodo, setPeriodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });

  // Mapeia o tipo de DB -> tipo de UI financeiro (campos não mapeados recebem defaults)
  const patrocinadores: PatroFin[] = useMemo(() => {
    const map = (p: PatroDb): PatroFin => ({
      id: p.id,
      nome: p.nome,
      valor: 0,
      periodoInicio: inicioPadrao,
      periodoFim: DATA_ATUAL,
      descricao: p.descricao ?? undefined,
      logo: p.logo,
      status: (p.status as any) || "ativo",
      comprovantes: [],
      observacoes: undefined,
      link: p.link || "",
      visivel: (p.status || "ativo") === "ativo",
    });
    return (patrocinadoresDb ?? []).map(map);
  }, [patrocinadoresDb, inicioPadrao]);

  // CRUD handlers
  const handleEditar = (p: Patrocinador) => {
    setEditPatrocinador(p);
    setModalOpen(true);
  };
  const handleExcluir = async (id: string) => {
    await deletePatrocinador(id);
  };
  const handleSalvar = async (p: Partial<PatroFin>) => {
    if (!p.nome || !p.logo) return;
    const payload: Partial<PatroDb> = {
      id: p.id,
      nome: p.nome,
      logo: p.logo,
      link: p.link || "",
      status: (p.status as any) || "ativo",
      descricao: p.descricao || p.observacoes,
      rachaId,
      prioridade: 1,
    } as any;
    if (p.id) await updatePatrocinador(payload as PatroDb);
    else await addPatrocinador(payload);
    setModalOpen(false);
    setEditPatrocinador(undefined);
  };
  const handleToggleVisivel = async (id: string) => {
    const base = patrocinadores.find((x) => x.id === id);
    if (!base) return;
    await updatePatrocinador({
      id,
      nome: base.nome,
      logo: base.logo,
      link: base.link,
      status: base.visivel ? "inativo" : "ativo",
      prioridade: 1,
      rachaId,
    } as any);
    await mutate();
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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center flex-wrap mb-6 gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-yellow-400">Patrocinadores</h1>
        </div>
        <CardResumoPatrocinio patrocinadores={patrocinadores} periodo={periodo} />
        <ToggleVisibilidadePublica
          visivel={patrocinadores.some((p) => p.visivel)}
          onToggle={() => {
            const allVisivel = patrocinadores.some((p) => p.visivel);
            setPatrocinadores((arr) => arr.map((p) => ({ ...p, visivel: !allVisivel })));
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

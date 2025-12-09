"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import { useRacha } from "@/context/RachaContext";
import type { Patrocinador } from "@/types/financeiro";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const { rachaId } = useRacha();
  const { patrocinadores, isLoading, addPatrocinador, updatePatrocinador, deletePatrocinador } =
    usePatrocinadores(rachaId || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<Patrocinador | undefined>(undefined);

  const inicioPadrao = new Date(new Date().setMonth(new Date().getMonth() - 11))
    .toISOString()
    .slice(0, 10);
  const [periodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });

  const visiveis = useMemo(
    () => patrocinadores.filter((p) => p.visivel !== false),
    [patrocinadores]
  );
  const todosVisiveis =
    patrocinadores.length === 0 ? true : patrocinadores.every((p) => p.visivel !== false);

  const handleEditar = (p: Patrocinador) => {
    setEditPatrocinador(p);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    await deletePatrocinador(id);
  };

  const handleSalvar = async (p: Partial<Patrocinador>) => {
    if (!p.nome || !p.valor || !p.periodoInicio || !p.periodoFim || !p.status || !p.logo) return;
    if (p.id) {
      await updatePatrocinador({
        ...(p as Patrocinador),
        visivel: p.visivel ?? true,
        comprovantes: p.comprovantes || [],
      });
    } else {
      await addPatrocinador({
        ...p,
        visivel: true,
        comprovantes: [],
      });
    }
    setModalOpen(false);
    setEditPatrocinador(undefined);
  };

  const handleToggleVisivelCard = async (id: string) => {
    const alvo = patrocinadores.find((p) => p.id === id);
    if (!alvo) return;
    await updatePatrocinador({
      ...alvo,
      visivel: alvo.visivel === false ? true : false,
    });
  };

  const handleTogglePublico = async () => {
    const novoValor = !todosVisiveis;
    await Promise.all(
      patrocinadores.map((p) =>
        updatePatrocinador({
          ...p,
          visivel: novoValor,
        })
      )
    );
  };

  return (
    <>
      <Head>
        <title>Patrocinadores | Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie patrocinadores do racha, metas financeiras, visibilidade pública e relatórios."
        />
      </Head>

      <section className="max-w-5xl mx-auto pt-20 pb-24 md:pt-6 md:pb-8 px-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">Patrocinadores</h1>
            <p className="text-sm text-gray-300">
              Cadastre, edite e controle a visibilidade dos patrocinadores do seu racha.
            </p>
          </div>
          <ToggleVisibilidadePublica visivel={todosVisiveis} onToggle={handleTogglePublico} />
        </div>

        <CardResumoPatrocinio patrocinadores={visiveis} periodo={periodo} />

        <div className="flex justify-between items-center mt-6 mb-3">
          <h2 className="text-xl font-bold text-yellow-400">Lista de Patrocinadores</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            Novo Patrocinador
          </button>
        </div>

        {isLoading ? (
          <div className="text-gray-300 py-6">Carregando patrocinadores...</div>
        ) : (
          <TabelaPatrocinadores
            patrocinadores={patrocinadores}
            onEditar={handleEditar}
            onExcluir={handleExcluir}
            onToggleVisivel={handleToggleVisivelCard}
            onNovo={() => {
              setEditPatrocinador(undefined);
              setModalOpen(true);
            }}
          />
        )}

        {modalOpen && (
          <ModalPatrocinador
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            initial={editPatrocinador}
            onSave={handleSalvar}
          />
        )}
      </section>
    </>
  );
}

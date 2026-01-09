"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import type { Patrocinador } from "@/types/financeiro";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const { patrocinadores, isLoading, addPatrocinador, updatePatrocinador, deletePatrocinador } =
    usePatrocinadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<Partial<Patrocinador> | undefined>(
    undefined
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const inicioPadrao = new Date(new Date().setMonth(new Date().getMonth() - 11))
    .toISOString()
    .slice(0, 10);
  const [periodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });

  const visiveis = useMemo(
    () => patrocinadores.filter((p) => p.visivel !== false),
    [patrocinadores]
  );

  const handleEditar = (p: Patrocinador) => {
    setEditPatrocinador(p);
    setSelectedSlot(p.displayOrder ?? null);
    setModalOpen(true);
  };

  const handleNovo = (slot: number) => {
    setEditPatrocinador({ displayOrder: slot });
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    try {
      await deletePatrocinador(id);
      toast.success("Patrocinador removido.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover patrocinador.";
      toast.error(message);
    }
  };

  const handleSalvar = async (p: Partial<Patrocinador>) => {
    if (!p.nome || !p.valor || !p.periodoInicio || !p.periodoFim || !p.status || !p.logo) {
      toast.error("Preencha todos os campos obrigatorios.");
      return;
    }
    const displayOrder = p.displayOrder ?? selectedSlot ?? 1;
    try {
      if (p.id) {
        await updatePatrocinador({
          ...(p as Patrocinador),
          visivel: p.visivel ?? true,
          comprovantes: p.comprovantes || [],
          displayOrder,
        });
        toast.success("Patrocinador atualizado.");
      } else {
        await addPatrocinador({
          ...p,
          visivel: true,
          comprovantes: [],
          displayOrder,
        });
        toast.success("Patrocinador criado.");
      }
      setModalOpen(false);
      setEditPatrocinador(undefined);
      setSelectedSlot(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar patrocinador.";
      toast.error(message);
    }
  };

  const handleToggleVisivelCard = async (id: string) => {
    const alvo = patrocinadores.find((p) => p.id === id);
    if (!alvo) return;
    try {
      await updatePatrocinador({
        ...alvo,
        visivel: alvo.visivel === false ? true : false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar patrocinador.";
      toast.error(message);
    }
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
        </div>

        <CardResumoPatrocinio patrocinadores={visiveis} periodo={periodo} />

        <div className="flex justify-between items-center mt-6 mb-3">
          <h2 className="text-xl font-bold text-yellow-400">Lista de Patrocinadores</h2>
          <button
            onClick={() => {
              const ocupados = new Set(patrocinadores.map((p) => p.displayOrder));
              const primeiroDisponivel =
                Array.from({ length: 10 }, (_, idx) => idx + 1).find(
                  (slot) => !ocupados.has(slot)
                ) ?? 1;
              handleNovo(primeiroDisponivel);
            }}
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
            onNovo={handleNovo}
          />
        )}

        {modalOpen && (
          <ModalPatrocinador
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditPatrocinador(undefined);
              setSelectedSlot(null);
            }}
            initial={editPatrocinador}
            onSave={handleSalvar}
          />
        )}
      </section>
    </>
  );
}

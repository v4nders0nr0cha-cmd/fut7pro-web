"use client";
import Head from "next/head";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import type { Patrocinador } from "@/types/financeiro";

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PaginaPatrocinadores() {
  return (
    <Suspense
      fallback={
        <section className="max-w-5xl mx-auto pt-20 pb-24 md:pt-6 md:pb-8 px-2">
          <div className="text-gray-300 py-6">Carregando patrocinadores...</div>
        </section>
      }
    >
      <PaginaPatrocinadoresClient />
    </Suspense>
  );
}

function PaginaPatrocinadoresClient() {
  const { patrocinadores, isLoading, addPatrocinador, updatePatrocinador, deletePatrocinador } =
    usePatrocinadores();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledQueryRef = useRef(false);
  const editId = searchParams.get("edit");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<Partial<Patrocinador> | undefined>(
    undefined
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const hoje = new Date();
  const inicioPadraoDate = new Date(hoje);
  inicioPadraoDate.setFullYear(inicioPadraoDate.getFullYear() - 1);
  const [periodo] = useState({
    inicio: formatDateInput(inicioPadraoDate),
    fim: formatDateInput(hoje),
  });

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
    if (
      !p.nome ||
      !p.valor ||
      !p.periodoInicio ||
      !p.periodoFim ||
      !p.status ||
      !p.logo ||
      !p.billingPlan
    ) {
      toast.error("Preencha todos os campos obrigatorios.");
      return;
    }
    const inicio = new Date(p.periodoInicio);
    const fim = new Date(p.periodoFim);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      toast.error("Datas de inicio e fim invalidas.");
      return;
    }
    if (fim.getTime() < inicio.getTime()) {
      toast.error("A data fim nao pode ser menor que a data inicio.");
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

  useEffect(() => {
    if (!editId || handledQueryRef.current) return;
    const sponsor = patrocinadores.find((item) => item.id === editId);
    if (!sponsor) return;
    handledQueryRef.current = true;
    setEditPatrocinador(sponsor);
    setSelectedSlot(sponsor.displayOrder ?? null);
    setModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    const query = params.toString();
    router.replace(
      query ? `/admin/financeiro/patrocinadores?${query}` : "/admin/financeiro/patrocinadores"
    );
  }, [editId, patrocinadores, router, searchParams]);

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

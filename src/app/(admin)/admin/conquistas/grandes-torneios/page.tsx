"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import Image from "next/image";
import { FaPlus, FaTrophy, FaEdit, FaTrash } from "react-icons/fa";
import ModalCadastroTorneio from "@/components/admin/ModalCadastroTorneio";
import type { DadosTorneio, Torneio } from "@/types/torneio";
import { useTorneios } from "@/hooks/useTorneios";
import { useRacha } from "@/context/RachaContext";

export default function GrandesTorneiosAdminPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [torneioSelecionado, setTorneioSelecionado] = useState<Torneio | null>(null);
  const { rachaId, tenantSlug } = useRacha();
  const slug = tenantSlug || "";
  const missingTenantScope = !slug || !rachaId;
  const { torneios, isLoading, addTorneio, updateTorneio, deleteTorneio } = useTorneios(slug);

  async function handleSalvarTorneio(dados: DadosTorneio) {
    if (!slug || !rachaId) {
      return;
    }

    if (torneioSelecionado?.id) {
      await updateTorneio({
        ...dados,
        id: torneioSelecionado.id,
        rachaId: torneioSelecionado.rachaId ?? rachaId,
        slug: torneioSelecionado.slug ?? slug,
      });
    } else {
      await addTorneio({
        ...dados,
        rachaId,
        slug,
      });
    }
    setModalOpen(false);
    setTorneioSelecionado(null);
  }

  const torneiosOrdenados = useMemo(
    () => [...torneios].sort((a, b) => (b.ano || 0) - (a.ano || 0)),
    [torneios]
  );

  return (
    <>
      <Head>
        <title>Grandes Torneios | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os grandes torneios do seu racha e destaque os campeoes no Fut7Pro."
        />
        <meta name="keywords" content="fut7pro, torneio, admin, racha, campeao" />
      </Head>

      <main className="min-h-screen bg-fundo text-white pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 text-center">
            Grandes Torneios (Gestão)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha. Atletas campeões
            recebem o <b>ícone especial</b> em seus perfis.
          </p>

          {missingTenantScope && (
            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Não foi possível identificar o racha ativo. Acesse o Hub e selecione um racha para
              gerenciar torneios.
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-xl shadow text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => setModalOpen(true)}
              disabled={missingTenantScope}
            >
              <FaPlus /> Cadastrar Novo Torneio
            </button>
          </div>

          <ModalCadastroTorneio
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setTorneioSelecionado(null);
            }}
            onSave={handleSalvarTorneio}
            onDelete={async (id) => {
              await deleteTorneio(id);
              setTorneioSelecionado(null);
              setModalOpen(false);
            }}
            torneio={torneioSelecionado}
          />

          <div className="flex flex-col gap-8">
            {isLoading && (
              <div className="text-gray-400 font-semibold text-center py-12">Carregando...</div>
            )}
            {!isLoading && torneiosOrdenados.length === 0 && (
              <div className="text-gray-400 font-semibold text-center py-12">
                Nenhum torneio cadastrado ainda.
              </div>
            )}
            {torneiosOrdenados.map((torneio) => (
              <div
                key={torneio.slug}
                className="bg-zinc-900 border-2 border-yellow-400 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48 sm:h-64 md:h-72 w-full">
                  <Image
                    src={torneio.bannerUrl || torneio.banner || "/images/torneios/placeholder.jpg"}
                    alt={`Banner do ${torneio.nome}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end">
                    <div className="p-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
                        <FaTrophy className="inline mr-1" /> {torneio.nome}
                      </h3>
                      <button
                        type="button"
                        className="inline-block mt-1 text-sm font-semibold text-yellow-400 hover:underline"
                        onClick={() => {
                          setTorneioSelecionado(torneio);
                          setModalOpen(true);
                        }}
                      >
                        Gerenciar detalhes →
                      </button>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-semibold"
                          onClick={() => {
                            setTorneioSelecionado(torneio);
                            setModalOpen(true);
                          }}
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 font-semibold"
                          onClick={async () => {
                            const ok = confirm(
                              "Tem certeza que deseja excluir este torneio? Esta ação não pode ser desfeita."
                            );
                            if (!ok) return;
                            await deleteTorneio(torneio.id);
                          }}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

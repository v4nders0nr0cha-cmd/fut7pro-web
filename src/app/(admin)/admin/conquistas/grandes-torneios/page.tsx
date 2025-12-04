"use client";

import Head from "next/head";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaTrophy, FaEdit, FaTrash } from "react-icons/fa";
import { torneiosMock } from "@/components/lists/mockTorneios";
import ModalCadastroTorneio from "@/components/admin/ModalCadastroTorneio";
import type { DadosTorneio } from "@/types/torneio";

export default function GrandesTorneiosAdminPage() {
  const [modalOpen, setModalOpen] = useState(false);

  function handleSalvarTorneio(dados: DadosTorneio) {
    alert("Torneio cadastrado com sucesso! (mock)");
  }

  return (
    <>
      <Head>
        <title>Grandes Torneios | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os grandes torneios do seu racha e destaque os campeões no Fut7Pro."
        />
        <meta name="keywords" content="fut7pro, torneio, admin, racha, campeão" />
      </Head>

      <main className="min-h-screen bg-fundo text-white pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 text-center">
            Grandes Torneios (Gestão)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha. Atletas campeões
            recebem o <b>ícone 🏆</b> em seus perfis.
          </p>

          <div className="flex justify-end mb-4">
            <button
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-xl shadow text-sm"
              onClick={() => setModalOpen(true)}
            >
              <FaPlus /> Cadastrar Novo Torneio
            </button>
          </div>

          <ModalCadastroTorneio
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSalvarTorneio}
          />

          <div className="flex flex-col gap-8">
            {torneiosMock.length === 0 ? (
              <div className="text-gray-400 font-semibold text-center py-12">
                Nenhum torneio cadastrado ainda.
              </div>
            ) : (
              torneiosMock.map((torneio) => (
                <div
                  key={torneio.slug}
                  className="bg-zinc-900 border-2 border-yellow-400 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="relative h-48 sm:h-64 md:h-72 w-full">
                    <Image
                      src={
                        torneio.bannerUrl || torneio.banner || "/images/torneios/placeholder.jpg"
                      }
                      alt={`Banner do ${torneio.nome}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end">
                      <div className="p-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
                          <FaTrophy className="inline mr-1" /> {torneio.nome}
                        </h3>
                        <Link
                          href={`/admin/conquistas/grandes-torneios/${torneio.slug}`}
                          className="inline-block mt-1 text-sm font-semibold text-yellow-400 hover:underline"
                        >
                          Gerenciar Detalhes →
                        </Link>
                        <div className="flex gap-2 mt-2">
                          <Link
                            href={`/admin/conquistas/grandes-torneios/editar/${torneio.slug}`}
                            className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-semibold"
                          >
                            <FaEdit /> Editar
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 font-semibold"
                            onClick={() =>
                              alert("Funcionalidade de exclusão será implementada em breve.")
                            }
                          >
                            <FaTrash /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}

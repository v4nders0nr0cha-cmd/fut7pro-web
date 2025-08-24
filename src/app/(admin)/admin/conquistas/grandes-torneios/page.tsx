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
        <meta
          name="keywords"
          content="fut7pro, torneio, admin, racha, campeão"
        />
      </Head>

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-20 text-white md:pb-8 md:pt-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-3 text-center text-3xl font-bold text-yellow-400">
            Grandes Torneios (Gestão)
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-gray-300">
            Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha.
            Atletas campeões recebem o <b>ícone 🏆</b> em seus perfis.
          </p>

          <div className="mb-4 flex justify-end">
            <button
              className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2 text-sm font-bold text-black shadow hover:bg-yellow-600"
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
              <div className="py-12 text-center font-semibold text-gray-400">
                Nenhum torneio cadastrado ainda.
              </div>
            ) : (
              torneiosMock.map((torneio) => (
                <div
                  key={torneio.slug}
                  className="overflow-hidden rounded-xl border-2 border-yellow-400 bg-zinc-900 shadow-lg"
                >
                  <div className="relative h-48 w-full sm:h-64 md:h-72">
                    <Image
                      src={torneio.imagem || "/images/torneios/placeholder.jpg"}
                      alt={`Banner do ${torneio.nome}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-end bg-black bg-opacity-60">
                      <div className="p-4">
                        <h3 className="mb-1 text-xl font-bold text-yellow-400 sm:text-2xl">
                          <FaTrophy className="mr-1 inline" /> {torneio.nome}
                        </h3>
                        <Link
                          href={`/admin/conquistas/grandes-torneios/${torneio.slug}`}
                          className="mt-1 inline-block text-sm font-semibold text-yellow-400 hover:underline"
                        >
                          Gerenciar Detalhes →
                        </Link>
                        <div className="mt-2 flex gap-2">
                          <Link
                            href={`/admin/conquistas/grandes-torneios/editar/${torneio.slug}`}
                            className="inline-flex items-center gap-1 font-semibold text-yellow-400 hover:text-yellow-300"
                          >
                            <FaEdit /> Editar
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 font-semibold text-red-400 hover:text-red-600"
                            onClick={() =>
                              alert(
                                "Funcionalidade de exclusão será implementada em breve.",
                              )
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

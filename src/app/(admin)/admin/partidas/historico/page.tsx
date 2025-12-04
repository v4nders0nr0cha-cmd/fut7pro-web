"use client";
// src/app/admin/partidas/historico/page.tsx

import Head from "next/head";
import { useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import PartidaList from "@/components/admin/PartidaList";
import PartidaForm from "@/components/admin/PartidaForm";
import type { Partida } from "@/types/partida";

export default function AdminHistoricoPartidasPage() {
  const { partidas, isLoading, isError, error, addPartida, updatePartida, deletePartida } =
    usePartidas();

  const [partidaEditando, setPartidaEditando] = useState<Partida | null>(null);

  async function handleSalvar(dados: Partial<Partida>) {
    if (partidaEditando?.id) {
      await updatePartida(partidaEditando.id, dados);
    } else {
      await addPartida(dados);
    }
    setPartidaEditando(null);
  }

  function handleEditar(partida: Partida) {
    setPartidaEditando(partida);
  }

  async function handleExcluir(id: string) {
    if (window.confirm("Tem certeza que deseja excluir esta partida?")) {
      await deletePartida(id);
    }
  }

  return (
    <>
      <Head>
        <title>Hist�rico de Partidas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Corrija placares, status, gols e assist�ncias das partidas do seu racha. Painel do Presidente Fut7Pro, seguro e audit�vel."
        />
        <meta
          name="keywords"
          content="admin fut7, editar partidas, corrigir placar, editar gols, editar assist�ncias, hist�rico futebol 7"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto text-white">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 text-center">
          Hist�rico de Partidas (Admin)
        </h1>
        <p className="text-base md:text-lg mb-6 text-textoSuave text-center">
          Corrija eventuais erros de placar, gols ou assist�ncias de qualquer partida do hist�rico.
          Edi��o r�pida e f�cil, baseada nas partidas reais cadastradas no sistema.
        </p>

        <section className="mb-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-yellow-300 mb-3">
            {partidaEditando ? "Editar partida" : "Selecionar partida para edi��o"}
          </h2>
          <div className="w-full flex justify-center">
            <PartidaForm
              partida={partidaEditando ?? undefined}
              onSave={handleSalvar}
              onCancel={() => setPartidaEditando(null)}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-yellow-300 mb-3">Hist�rico de partidas</h2>
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando partidas...</div>
          ) : isError ? (
            <div className="text-center text-red-400 py-8">
              Ocorreu um erro ao carregar as partidas.
              {error && <div className="text-xs text-red-300 mt-2">{error}</div>}
            </div>
          ) : partidas.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Nenhuma partida cadastrada ainda. Use o formul�rio acima para adicionar partidas
              retroativas ou corrigir rodadas antigas.
            </div>
          ) : (
            <PartidaList partidas={partidas} onEdit={handleEditar} onDelete={handleExcluir} />
          )}
        </section>
      </main>
    </>
  );
}

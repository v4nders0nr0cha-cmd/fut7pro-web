"use client";

import Head from "next/head";
import { useState } from "react";
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { rachaConfig } from "@/config/racha.config";
import type { Jogador } from "@/types/jogador";

// --- MODAL EXCLUSÃO ---
function ModalExcluirJogador({
  open,
  jogador,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jogador?: Jogador;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !jogador) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#201414] border-2 border-red-700 rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center gap-4">
        <FaExclamationTriangle className="text-4xl text-red-600 animate-pulse" />
        <h2 className="text-lg text-red-500 font-bold text-center">
          Atenção! Exclusão definitiva de jogador
        </h2>
        <div className="text-sm text-gray-200 text-center">
          <b>{jogador.nome}</b> será{" "}
          <span className="text-red-400 font-bold">
            removido de todos os rankings, históricos e estatísticas
          </span>{" "}
          do racha.
          <br />
          <span className="text-red-400 font-bold block mt-2">Essa ação é IRREVERSÍVEL!</span>
          <br />
          Tem certeza que deseja continuar?
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-md"
          >
            Excluir DEFINITIVAMENTE
          </button>
        </div>
      </div>
    </div>
  );
}

// --- BADGE DE STATUS ---
function StatusBadge({ status }: { status: Jogador["status"] }) {
  const color =
    status === "Ativo"
      ? "bg-green-700 text-green-200"
      : status === "Suspenso"
        ? "bg-yellow-700 text-yellow-200"
        : "bg-gray-600 text-gray-200";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold mr-1 ${color}`}>
      {status}
    </span>
  );
}

// === COMPONENTE PRINCIPAL ===
export default function Page() {
  const rachaId = rachaConfig.slug;
  const { jogadores, isLoading, isError, error, deleteJogador } = useJogadores(rachaId);
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Jogador | undefined>();

  const jogadoresFiltrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.apelido.toLowerCase().includes(busca.toLowerCase())
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06 },
    }),
    exit: { opacity: 0, y: 14, transition: { duration: 0.2 } },
  };

  return (
    <>
      <Head>
        <title>Gestão de Jogadores | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Administre a lista de jogadores do seu racha, incluindo cadastro, edição e exclusão."
        />
      </Head>

      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-2 sm:px-6 max-w-5xl mx-auto">
        {/* DESCRIÇÃO ADMIN */}
        <div className="bg-[#1a1a1a] border border-yellow-600 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-yellow-400">⚠️ Importante:</strong> Todos os atletas do seu
            racha podem se cadastrar diretamente pelo <strong>site público</strong>.
          </p>
          <p className="mb-2">
            Recomendamos que você incentive os jogadores a realizarem o cadastro por conta própria,
            garantindo dados corretos e integração automática com os rankings.
          </p>
          <p className="mb-2">
            Utilize o botão <strong>"Cadastrar Jogador"</strong> apenas em casos específicos, como:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Jogadores com dificuldade de acesso à internet;</li>
            <li>Atletas com pouca familiaridade com tecnologia;</li>
            <li>Casos excepcionais onde o administrador precisa intervir manualmente.</li>
          </ul>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full sm:w-72 focus:border-cyan-600"
            />
            <FaSearch className="text-gray-400 text-lg -ml-8 pointer-events-none" />
          </div>
          <button
            onClick={() => alert("Cadastro manual implementado apenas em casos específicos.")}
            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-bold"
          >
            <FaUserPlus /> Cadastrar Jogador
          </button>
        </div>

        {/* LISTA DE JOGADORES */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            Jogadores cadastrados ({jogadoresFiltrados.length})
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando jogadores...</div>
          ) : isError ? (
            <div className="text-center text-red-400 py-8">
              Ocorreu um erro ao carregar os jogadores.
              {error && <div className="text-xs text-red-300 mt-2">{error}</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {jogadoresFiltrados.map((j, i) => (
                  <motion.div
                    key={j.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={cardVariants}
                    layout
                    className="bg-[#23272f] border border-cyan-700 rounded-xl p-4 shadow-xl"
                  >
                    <div className="flex items-center">
                      <Image
                        src={j.avatar || "/images/jogadores/jogador_padrao_01.jpg"}
                        alt={j.nome}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="pl-4 flex-1">
                        <div className="font-bold text-white">
                          {j.nome} <span className="text-gray-400">({j.apelido})</span>
                        </div>
                        <div className="text-sm text-gray-300">{j.posicao}</div>
                        <div className="text-xs mt-1 flex gap-1 items-center">
                          <StatusBadge status={j.status} />
                          {j.mensalista && (
                            <span className="bg-yellow-700 text-yellow-200 font-bold rounded px-2 py-0.5 text-xs">
                              Mensalista
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-cyan-900/40 mt-4 pt-3 flex gap-2 justify-end">
                      <button
                        className="bg-gray-700 hover:bg-cyan-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => alert("Função de edição em desenvolvimento.")}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => {
                          setExcluirJogador(j);
                          setShowModalExcluir(true);
                        }}
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ModalExcluirJogador
        open={showModalExcluir}
        jogador={excluirJogador}
        onClose={() => setShowModalExcluir(false)}
        onConfirm={() => {
          if (excluirJogador) deleteJogador(excluirJogador.id);
          setShowModalExcluir(false);
        }}
      />
    </>
  );
}

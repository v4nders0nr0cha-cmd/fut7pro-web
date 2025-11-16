"use client";

import Head from "next/head";
import { useState } from "react";
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants, TargetAndTransition } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { useAuth } from "@/hooks/useAuth";
import { rachaConfig } from "@/config/racha.config";
import type { Athlete } from "@/types/jogador";
import { positionLabel } from "@/constants/positions";

type Status = Athlete["status"];

function StatusBadge({ status }: { status: Status }) {
  const resolvedStatus = status ?? "Ativo";
  const color =
    resolvedStatus === "Ativo"
      ? "bg-green-700 text-green-200"
      : resolvedStatus === "Suspenso"
        ? "bg-yellow-700 text-yellow-200"
        : "bg-gray-600 text-gray-200";

  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold mr-1 ${color}`}>
      {resolvedStatus}
    </span>
  );
}

function ModalExcluirJogador({
  open,
  jogador,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jogador?: Athlete;
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
          <b>{jogador.name}</b> será{" "}
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

export default function JogadoresPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? rachaConfig.slug;
  const { jogadores, deleteJogador } = useJogadores(tenantSlug);
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Athlete | undefined>();

  const buscaNormalizada = busca.trim().toLowerCase();
  const jogadoresFiltrados = jogadores.filter((jogador) => {
    const nome = jogador.name?.toLowerCase() ?? "";
    const apelido = jogador.nickname?.toLowerCase() ?? "";
    return nome.includes(buscaNormalizada) || apelido.includes(buscaNormalizada);
  });

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number): TargetAndTransition => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        type: "spring",
        stiffness: 60,
        damping: 18,
      },
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
        <div className="bg-[#1a1a1a] border border-yellow-600 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-yellow-400">⚠ Importante:</strong> incentive os atletas a
            realizarem o cadastro pelo <strong>site público</strong> para garantir dados corretos e
            integração automática com os rankings.
          </p>
          <p className="mb-2">
            Utilize o botão <strong>"Cadastrar Jogador"</strong> apenas em situações especiais (ex.:
            dificuldade de acesso, suporte manual).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full sm:w-72 focus:border-cyan-600"
            />
            <FaSearch className="text-gray-400 text-lg -ml-8 pointer-events-none" />
          </div>
          <button
            onClick={() => alert("Cadastro manual será habilitado após revisão do fluxo.")}
            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-bold"
          >
            <FaUserPlus /> Cadastrar Jogador
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            Jogadores cadastrados ({jogadoresFiltrados.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {jogadoresFiltrados.map((jogador, index) => {
                const avatar =
                  jogador.photoUrl ??
                  `/images/jogadores/default.png?fallback=${encodeURIComponent(jogador.name ?? "")}`;
                const nickname = jogador.nickname ? `(${jogador.nickname})` : "";
                const posicaoLabel = positionLabel(jogador.position ?? null);

                return (
                  <motion.div
                    key={jogador.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={cardVariants}
                    layout
                    className="bg-[#23272f] border border-cyan-700 rounded-xl p-4 shadow-xl"
                  >
                    <div className="flex items-center">
                      <Image
                        src={avatar}
                        alt={jogador.name ?? "Jogador"}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="pl-4 flex-1">
                        <div className="font-bold text-white">
                          {jogador.name}
                          {nickname && <span className="text-gray-400 ml-1">{nickname}</span>}
                        </div>
                        <div className="text-sm text-gray-300">{posicaoLabel}</div>
                        <div className="text-xs mt-1 flex gap-1 items-center">
                          <StatusBadge status={jogador.status} />
                          {jogador.isMember && (
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
                        onClick={() => alert("Edição de jogador será disponibilizada em breve.")}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => {
                          setExcluirJogador(jogador);
                          setShowModalExcluir(true);
                        }}
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ModalExcluirJogador
        open={showModalExcluir}
        jogador={excluirJogador}
        onClose={() => setShowModalExcluir(false)}
        onConfirm={() => {
          if (excluirJogador) {
            deleteJogador(excluirJogador.id);
          }
          setShowModalExcluir(false);
        }}
      />
    </>
  );
}

"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { rachaConfig } from "@/config/racha.config";

// --- TIPAGEM ---
interface Jogador {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "Ativo" | "Inativo" | "Suspenso";
  mensalista: boolean;
  avatar: string;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border-2 border-red-700 bg-[#201414] p-8 shadow-xl">
        <FaExclamationTriangle className="animate-pulse text-4xl text-red-600" />
        <h2 className="text-center text-lg font-bold text-red-500">
          Atenção! Exclusão definitiva de jogador
        </h2>
        <div className="text-center text-sm text-gray-200">
          <b>{jogador.nome}</b> será{" "}
          <span className="font-bold text-red-400">
            removido de todos os rankings, históricos e estatísticas
          </span>{" "}
          do racha.
          <br />
          <span className="mt-2 block font-bold text-red-400">
            Essa ação é IRREVERSÍVEL!
          </span>
          <br />
          Tem certeza que deseja continuar?
        </div>
        <div className="mt-2 flex gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
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
    <span
      className={`mr-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${color}`}
    >
      {status}
    </span>
  );
}

// === COMPONENTE PRINCIPAL ===
export default function Page() {
  const rachaId = rachaConfig.slug;
  const { jogadores, addJogador, updateJogador, deleteJogador } =
    useJogadores(rachaId);
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Jogador | undefined>();

  const jogadoresFiltrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.apelido.toLowerCase().includes(busca.toLowerCase()),
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
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

      <div className="mx-auto max-w-5xl px-2 pb-24 pt-20 sm:px-6 md:pb-8 md:pt-6">
        {/* DESCRIÇÃO ADMIN */}
        <div className="mb-6 rounded-lg border border-yellow-600 bg-[#1a1a1a] p-4 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-yellow-400">📌 Importante:</strong> Todos os
            atletas do seu racha podem se cadastrar diretamente pelo{" "}
            <strong>site público</strong>.
          </p>
          <p className="mb-2">
            Recomendamos que você incentive os jogadores a realizarem o cadastro
            por conta própria, garantindo dados corretos e integração automática
            com os rankings.
          </p>
          <p className="mb-2">
            Utilize o botão <strong>"Cadastrar Jogador"</strong> apenas em casos
            específicos, como:
          </p>
          <ul className="ml-5 mt-2 list-disc">
            <li>Jogadores com dificuldade de acesso à internet;</li>
            <li>Atletas com pouca familiaridade com tecnologia;</li>
            <li>
              Casos excepcionais onde o administrador precisa intervir
              manualmente.
            </li>
          </ul>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="w-full rounded-md border border-gray-700 bg-[#23272f] px-3 py-2 text-white focus:border-cyan-600 sm:w-72"
            />
            <FaSearch className="pointer-events-none -ml-8 text-lg text-gray-400" />
          </div>
          <button
            onClick={() =>
              alert("Cadastro manual implementado apenas em casos específicos.")
            }
            className="flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 font-bold text-white hover:bg-cyan-800"
          >
            <FaUserPlus /> Cadastrar Jogador
          </button>
        </div>

        {/* LISTA DE JOGADORES */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-400">
            Jogadores cadastrados ({jogadoresFiltrados.length})
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                  className="rounded-xl border border-cyan-700 bg-[#23272f] p-4 shadow-xl"
                >
                  <div className="flex items-center">
                    <Image
                      src={j.avatar}
                      alt={j.nome}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1 pl-4">
                      <div className="font-bold text-white">
                        {j.nome}{" "}
                        <span className="text-gray-400">({j.apelido})</span>
                      </div>
                      <div className="text-sm text-gray-300">{j.posicao}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <StatusBadge status={j.status} />
                        {j.mensalista && (
                          <span className="rounded bg-yellow-700 px-2 py-0.5 text-xs font-bold text-yellow-200">
                            Mensalista
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-cyan-900/40 pt-3">
                    <button
                      className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-cyan-800"
                      onClick={() =>
                        alert("Função de edição em desenvolvimento.")
                      }
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="flex items-center gap-1 rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-800"
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

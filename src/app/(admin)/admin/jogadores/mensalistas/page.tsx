"use client";

import Head from "next/head";
import { useState } from "react";
import Image from "next/image";
import { FaPlus, FaTrash, FaInfoCircle } from "react-icons/fa";

// MOCK temporário (substituir por API futuramente)
const MOCK_JOGADORES = [
  {
    id: "1",
    nome: "Carlos Silva",
    apelido: "Carlinhos",
    posicao: "Atacante",
    status: "Ativo",
    mensalista: true,
    avatar: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    id: "2",
    nome: "Lucas Souza",
    apelido: "Luk",
    posicao: "Meia",
    status: "Ativo",
    mensalista: false,
    avatar: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    id: "3",
    nome: "Renan Costa",
    apelido: "Rena",
    posicao: "Zagueiro",
    status: "Suspenso",
    mensalista: true,
    avatar: "/images/jogadores/jogador_padrao_03.jpg",
  },
];

// MODAL DE ADIÇÃO
function ModalMensalista({
  open,
  onClose,
  jogadores,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  jogadores: typeof MOCK_JOGADORES;
  onAdd: (id: string) => void;
}) {
  const [busca, setBusca] = useState("");

  const jogadoresDisponiveis = jogadores.filter(
    (j) =>
      !j.mensalista &&
      (j.nome.toLowerCase().includes(busca.toLowerCase()) ||
        j.apelido.toLowerCase().includes(busca.toLowerCase())),
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex w-full min-w-[320px] max-w-md flex-col gap-5 rounded-2xl bg-[#1c1e22] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-yellow-400">
          Cadastrar Jogador Mensalista
        </h2>
        <input
          type="text"
          placeholder="Buscar por nome ou apelido..."
          className="rounded border border-gray-700 bg-[#23272f] px-3 py-2 text-white outline-none focus:border-yellow-400"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
          {jogadoresDisponiveis.length === 0 && (
            <div className="text-center text-sm text-gray-400">
              Nenhum jogador disponível para se tornar mensalista.
            </div>
          )}
          {jogadoresDisponiveis.map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 rounded-xl bg-[#23272f] px-2 py-2"
            >
              <Image
                src={j.avatar}
                alt={`Foto do jogador ${j.nome}`}
                width={36}
                height={36}
                className="rounded-full border-2 border-gray-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">{j.nome}</div>
                <div className="text-xs text-cyan-200">{j.apelido}</div>
              </div>
              <button
                onClick={() => onAdd(j.id)}
                className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-1 text-xs font-bold text-black shadow hover:bg-yellow-600"
                title="Adicionar como mensalista"
              >
                <FaPlus /> Adicionar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function MensalistasPage() {
  const [jogadores, setJogadores] = useState(MOCK_JOGADORES);
  const [modalOpen, setModalOpen] = useState(false);

  const mensalistas = jogadores.filter((j) => j.mensalista);

  function handleAddMensalista(id: string) {
    setJogadores((prev) =>
      prev.map((j) => (j.id === id ? { ...j, mensalista: true } : j)),
    );
    setModalOpen(false);
  }

  function handleRemoverMensalista(id: string) {
    if (
      window.confirm("Deseja realmente remover este jogador dos mensalistas?")
    ) {
      setJogadores((prev) =>
        prev.map((j) => (j.id === id ? { ...j, mensalista: false } : j)),
      );
    }
  }

  return (
    <>
      <Head>
        <title>Mensalistas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre e controle os jogadores mensalistas do seu racha, garantindo caixa fixo e benefícios exclusivos aos atletas mais comprometidos."
        />
        <meta
          name="keywords"
          content="fut7, racha, jogadores, mensalistas, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          Jogadores Mensalistas
        </h1>

        <div className="mb-8 flex flex-col items-start gap-4 rounded-xl border-l-4 border-yellow-400 bg-[#23272f] p-4 sm:flex-row sm:items-center">
          <FaInfoCircle className="shrink-0 text-2xl text-yellow-300" />
          <div className="text-sm leading-relaxed text-gray-200">
            <b>Recomendação:</b> Mantenha{" "}
            <b>60% a 70% das vagas do racha para mensalistas</b>.
            <br />
            Jogadores mensalistas ajudam a manter o caixa fixo, garantindo:
            <ul className="mb-2 mt-2 list-disc pl-5 text-gray-300">
              <li>Vaga garantida em dias de racha</li>
              <li>Descontos no pagamento à vista</li>
              <li>Benefícios em lojas e parceiros</li>
            </ul>
            Mantenha algumas vagas para <b>diaristas</b> para estimular a
            concorrência e renovação.
            <br />
            <span className="mt-2 block">
              Importante: <b>Mensalistas também pagam multa em caso de falta</b>
              .
            </span>
          </div>
        </div>

        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2 text-sm font-bold text-black shadow transition hover:bg-yellow-600"
          >
            <FaPlus />
            Cadastrar Mensalista
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-7">
          {mensalistas.length === 0 ? (
            <div className="w-full py-12 text-center font-semibold text-gray-400">
              Nenhum mensalista cadastrado.
            </div>
          ) : (
            mensalistas.map((j) => (
              <div
                key={j.id}
                className="relative flex w-[320px] max-w-full flex-col items-center rounded-2xl border-2 border-yellow-400 bg-[#191b1f] p-6 shadow transition hover:shadow-xl"
              >
                <button
                  className="absolute right-3 top-3 rounded-full bg-gray-900 p-2 text-red-700 transition hover:text-red-500"
                  onClick={() => handleRemoverMensalista(j.id)}
                  title="Remover mensalista"
                >
                  <FaTrash />
                </button>
                <div className="mb-2 h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-400 bg-black shadow-lg">
                  <Image
                    src={j.avatar}
                    alt={`Foto do jogador ${j.nome}`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="text-lg font-bold text-white">{j.nome}</div>
                <div className="mb-2 text-sm font-semibold text-cyan-200">
                  {j.apelido}
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span className="rounded bg-cyan-700 px-3 py-0.5 text-xs text-white">
                    {j.posicao}
                  </span>
                  <span
                    className={`rounded px-3 py-0.5 ${j.status === "Ativo" ? "bg-green-600" : j.status === "Inativo" ? "bg-gray-500" : "bg-red-700"} text-xs text-white`}
                  >
                    {j.status}
                  </span>
                  <span className="rounded bg-yellow-500 px-3 py-0.5 text-xs font-semibold text-black">
                    Mensalista
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <ModalMensalista
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          jogadores={jogadores}
          onAdd={handleAddMensalista}
        />
      </main>
    </>
  );
}

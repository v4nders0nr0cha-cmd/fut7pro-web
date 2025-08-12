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
        j.apelido.toLowerCase().includes(busca.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e22] rounded-2xl p-6 min-w-[320px] w-full max-w-md shadow-xl flex flex-col gap-5">
        <h2 className="text-lg text-yellow-400 font-bold">Cadastrar Jogador Mensalista</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou apelido..."
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-700 focus:border-yellow-400 outline-none"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {jogadoresDisponiveis.length === 0 && (
            <div className="text-center text-gray-400 text-sm">
              Nenhum jogador disponível para se tornar mensalista.
            </div>
          )}
          {jogadoresDisponiveis.map((j) => (
            <div key={j.id} className="flex items-center gap-3 bg-[#23272f] rounded-xl px-2 py-2">
              <Image
                src={j.avatar}
                alt={`Foto do jogador ${j.nome}`}
                width={36}
                height={36}
                className="rounded-full border-2 border-gray-500"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{j.nome}</div>
                <div className="text-xs text-cyan-200">{j.apelido}</div>
              </div>
              <button
                onClick={() => onAdd(j.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1 rounded shadow text-xs flex items-center gap-1"
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
          className="mt-1 px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 font-semibold text-sm"
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
    setJogadores((prev) => prev.map((j) => (j.id === id ? { ...j, mensalista: true } : j)));
    setModalOpen(false);
  }

  function handleRemoverMensalista(id: string) {
    if (window.confirm("Deseja realmente remover este jogador dos mensalistas?")) {
      setJogadores((prev) => prev.map((j) => (j.id === id ? { ...j, mensalista: false } : j)));
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

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl text-yellow-400 font-bold mb-6 text-center">
          Jogadores Mensalistas
        </h1>

        <div className="bg-[#23272f] border-l-4 border-yellow-400 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FaInfoCircle className="text-yellow-300 text-2xl shrink-0" />
          <div className="text-sm text-gray-200 leading-relaxed">
            <b>Recomendação:</b> Mantenha <b>60% a 70% das vagas do racha para mensalistas</b>.
            <br />
            Jogadores mensalistas ajudam a manter o caixa fixo, garantindo:
            <ul className="list-disc pl-5 mt-2 mb-2 text-gray-300">
              <li>Vaga garantida em dias de racha</li>
              <li>Descontos no pagamento à vista</li>
              <li>Benefícios em lojas e parceiros</li>
            </ul>
            Mantenha algumas vagas para <b>diaristas</b> para estimular a concorrência e renovação.
            <br />
            <span className="block mt-2">
              Importante: <b>Mensalistas também pagam multa em caso de falta</b>.
            </span>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-xl shadow transition text-sm"
          >
            <FaPlus />
            Cadastrar Mensalista
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-7">
          {mensalistas.length === 0 ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Nenhum mensalista cadastrado.
            </div>
          ) : (
            mensalistas.map((j) => (
              <div
                key={j.id}
                className="bg-[#191b1f] rounded-2xl border-2 border-yellow-400 p-6 flex flex-col items-center w-[320px] max-w-full shadow hover:shadow-xl transition relative"
              >
                <button
                  className="absolute top-3 right-3 text-red-700 hover:text-red-500 bg-gray-900 rounded-full p-2 transition"
                  onClick={() => handleRemoverMensalista(j.id)}
                  title="Remover mensalista"
                >
                  <FaTrash />
                </button>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 mb-2 shadow-lg bg-black">
                  <Image
                    src={j.avatar}
                    alt={`Foto do jogador ${j.nome}`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="text-lg font-bold text-white">{j.nome}</div>
                <div className="text-sm font-semibold text-cyan-200 mb-2">{j.apelido}</div>
                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                  <span className="px-3 py-0.5 rounded bg-cyan-700 text-white text-xs">
                    {j.posicao}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded ${j.status === "Ativo" ? "bg-green-600" : j.status === "Inativo" ? "bg-gray-500" : "bg-red-700"} text-white text-xs`}
                  >
                    {j.status}
                  </span>
                  <span className="px-3 py-0.5 rounded bg-yellow-500 text-black font-semibold text-xs">
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

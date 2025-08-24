// src/components/modals/ModalDestaquesDoDia.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { IoClose } from "react-icons/io5";

// Mocks de destaques do dia
const destaquesTimeCampeao = [
  {
    title: "ATACANTE DO DIA",
    name: "Jogador XPTO",
    info: "3 gols",
    image: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    title: "MEIA DO DIA",
    name: "Jogador Genérico",
    info: "2 assistências",
    image: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    title: "ZAGUEIRO DO DIA",
    name: "Jogador Modelo",
    info: "1 desarme",
    image: "/images/jogadores/jogador_padrao_03.jpg",
  },
  {
    title: "GOLEIRO DO DIA",
    name: "Jogador Fictício",
    info: "3 defesas",
    image: "/images/jogadores/jogador_padrao_04.jpg",
  },
];

const destaquesGerais = [
  {
    title: "ARTILHEIRO DO DIA",
    name: "Jogador XPTO",
    info: "3 gols",
    image: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    title: "MAESTRO DO DIA",
    name: "Camisa 10",
    info: "4 assistências",
    image: "/images/jogadores/jogador_padrao_03.jpg",
  },
];

export default function ModalDestaquesDoDia({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [showRegras, setShowRegras] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative mx-2 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#18181b] pb-2 pt-3 shadow-lg">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-3xl text-yellow-400 hover:text-yellow-300"
          aria-label="Fechar"
        >
          <IoClose />
        </button>
        {/* Título */}
        <h2 className="mb-6 mt-2 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
          Todos os Destaques do Dia
        </h2>

        {/* Cards do Time Campeão */}
        <div className="flex flex-col gap-4">
          {destaquesTimeCampeao.map((d, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-[#111] p-3"
            >
              <Image
                src={d.image}
                alt={d.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
              <div>
                <span className="text-[13px] font-bold uppercase text-yellow-400">
                  {d.title}
                </span>
                <p className="text-lg font-semibold leading-5 text-white">
                  {d.name}
                </p>
                <p className="text-[15px] font-medium text-yellow-300">
                  {d.info}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Linha divisória */}
        <div className="mx-auto my-5 h-[2.5px] w-1/2 rounded-full bg-yellow-400 opacity-80" />

        {/* Cards dos Destaques Gerais */}
        <div className="mb-2 flex flex-col gap-4">
          {destaquesGerais.map((d, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-[#111] p-3"
            >
              <Image
                src={d.image}
                alt={d.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
              <div>
                <span className="text-[13px] font-bold uppercase text-yellow-400">
                  {d.title}
                </span>
                <p className="text-lg font-semibold leading-5 text-white">
                  {d.name}
                </p>
                <p className="text-[15px] font-medium text-yellow-300">
                  {d.info}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botão para regras */}
        <button
          className="mx-auto mb-2 mt-6 block text-[15px] font-semibold text-yellow-400 underline"
          onClick={() => setShowRegras(true)}
        >
          Entenda as regras dos destaques do dia
        </button>

        {/* Modal Regras */}
        {showRegras && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative w-full max-w-xs rounded-xl border border-yellow-600 bg-neutral-900 p-5 text-white shadow-xl">
              <button
                className="absolute right-3 top-2 text-xl text-yellow-400"
                onClick={() => setShowRegras(false)}
              >
                <IoClose />
              </button>
              <h3 className="mb-2 text-center text-lg font-bold text-yellow-400">
                Como são escolhidos os Destaques do Dia?
              </h3>
              <ul className="mb-3 space-y-2 text-sm">
                <li>
                  <b>Atacante do Dia:</b> Entre atacantes do time campeão, quem
                  fez mais gols. Valoriza esforço pelo time.
                </li>
                <li>
                  <b>Meia do Dia:</b> Entre meias do campeão, quem deu mais
                  assistências.
                </li>
                <li>
                  <b>Zagueiro do Dia:</b> Eleito por votação dos jogadores do
                  campeão.
                </li>
                <li>
                  <b>Goleiro do Dia:</b> Goleiro do time campeão.
                </li>
                <li>
                  <b>Artilheiro do Dia:</b> Jogador com mais gols em toda a
                  rodada.
                </li>
                <li>
                  <b>Maestro do Dia:</b> Jogador com mais assistências na
                  rodada.
                </li>
              </ul>
              <div className="mb-1 text-center text-xs text-neutral-300">
                A escolha do Atacante do Dia prioriza o esforço coletivo e sua
                importância para o time campeão, não apenas quem fez mais gols
                na rodada.
              </div>
              <button
                className="mt-3 w-full rounded bg-yellow-400 py-2 font-bold text-black hover:bg-yellow-300"
                onClick={() => setShowRegras(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

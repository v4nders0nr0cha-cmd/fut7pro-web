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
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 pt-3 sm:items-center sm:p-4">
      <div className="relative flex max-h-[calc(100dvh-0.75rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-[#18181b] shadow-lg sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <h2 className="text-xl font-bold text-brand">Todos os Destaques do Dia</h2>
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/15 p-1 text-2xl text-brand hover:text-brand-soft"
            aria-label="Fechar"
          >
            <IoClose />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Cards do Time Campeão */}
          <div className="flex flex-col gap-4">
            {destaquesTimeCampeao.map((d, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#111] rounded-xl p-3">
                <Image
                  src={d.image}
                  alt={d.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <span className="uppercase text-brand font-bold text-[13px]">{d.title}</span>
                  <p className="text-white font-semibold text-lg leading-5">{d.name}</p>
                  <p className="text-brand-soft text-[15px] font-medium">{d.info}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Linha divisória */}
          <div className="w-1/2 mx-auto my-5 h-[2.5px] rounded-full bg-brand opacity-80" />

          {/* Cards dos Destaques Gerais */}
          <div className="flex flex-col gap-4 mb-2">
            {destaquesGerais.map((d, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#111] rounded-xl p-3">
                <Image
                  src={d.image}
                  alt={d.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <span className="uppercase text-brand font-bold text-[13px]">{d.title}</span>
                  <p className="text-white font-semibold text-lg leading-5">{d.name}</p>
                  <p className="text-brand-soft text-[15px] font-medium">{d.info}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botão para regras */}
          <button
            className="block mx-auto mt-6 mb-2 text-brand underline text-[15px] font-semibold"
            onClick={() => setShowRegras(true)}
          >
            Entenda as regras dos destaques do dia
          </button>

          {/* Modal Regras */}
          {showRegras && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 pt-3 sm:items-center sm:p-4">
              <div className="relative max-h-[calc(100dvh-0.75rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-t-2xl border border-brand-strong bg-neutral-900 p-5 text-white shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
                <button
                  className="absolute top-2 right-3 text-brand text-xl"
                  onClick={() => setShowRegras(false)}
                >
                  <IoClose />
                </button>
                <h3 className="text-lg font-bold text-brand mb-2 text-center">
                  Como são escolhidos os Destaques do Dia?
                </h3>
                <ul className="text-sm mb-3 space-y-2">
                  <li>
                    <b>Atacante do Dia:</b> Entre atacantes do time campeão, quem fez mais gols.
                    Valoriza esforço pelo time.
                  </li>
                  <li>
                    <b>Meia do Dia:</b> Entre meias do campeão, quem deu mais assistências.
                  </li>
                  <li>
                    <b>Zagueiro do Dia:</b> Eleito por votação dos jogadores do campeão.
                  </li>
                  <li>
                    <b>Goleiro do Dia:</b> Goleiro do time campeão.
                  </li>
                  <li>
                    <b>Artilheiro do Dia:</b> Jogador com mais gols em toda a rodada.
                  </li>
                  <li>
                    <b>Maestro do Dia:</b> Jogador com mais assistências na rodada.
                  </li>
                </ul>
                <div className="text-xs text-neutral-300 mb-1 text-center">
                  A escolha do Atacante do Dia prioriza o esforço coletivo e sua importância para o
                  time campeão, não apenas quem fez mais gols na rodada.
                </div>
                <button
                  className="w-full mt-3 bg-brand text-black rounded font-bold py-2 hover:bg-brand-soft"
                  onClick={() => setShowRegras(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import { X, Info } from "lucide-react";

type DestaqueItem = {
  title: string;
  name: string;
  value?: string;
  image?: string;
};

const DEFAULT_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";

// Componente institucional do box de regras
function BoxRegras() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-3 mt-2 text-[15px] text-zinc-900 font-normal flex flex-col gap-2 shadow-sm">
      <div className="font-bold text-yellow-700 mb-2">Como sao escolhidos os destaques do dia?</div>
      <ul className="list-disc pl-5 mb-1">
        <li>
          <span className="font-semibold text-zinc-900">Atacante do Dia:</span> Entre os atacantes
          do <b>time campeao</b>, aquele que fez mais gols.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Meia do Dia:</span> Entre os meias do{" "}
          <b>time campeao</b>, quem deu mais assistencias.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Zagueiro do Dia:</span> Eleito por votacao
          dos proprios jogadores do racha (sem estatisticas exatas).
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Goleiro do Dia:</span> O goleiro do{" "}
          <b>time campeao</b> do dia (nao computa defesas).
        </li>
      </ul>
      <div className="h-2" />
      <ul className="list-disc pl-5 mb-2">
        <li>
          <span className="font-semibold text-zinc-900">Artilheiro do Dia:</span> Jogador de
          qualquer time/posicao com mais gols na rodada.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Maestro do Dia:</span> Jogador de qualquer
          time/posicao com mais assistencias no dia.
        </li>
      </ul>
      <div className="text-[14px] text-zinc-800 font-medium mt-1">
        <span className="text-yellow-600 font-bold">Obs:</span> Esses criterios valorizam quem
        ajudou o time a ser campeao, mesmo que nao seja o maior artilheiro ou assistente geral do
        racha.
      </div>
    </div>
  );
}

type GamesOfTheDayMobileModalProps = {
  open: boolean;
  onClose: () => void;
  destaques?: DestaqueItem[];
  artilheiroMaestro?: DestaqueItem[];
  isLoading?: boolean;
};

export default function GamesOfTheDayMobileModal({
  open,
  onClose,
  destaques = [],
  artilheiroMaestro = [],
  isLoading = false,
}: GamesOfTheDayMobileModalProps) {
  const [showInfo, setShowInfo] = useState(false);
  const hasDestaques = destaques.length > 0;
  const hasArtilheiroMaestro = artilheiroMaestro.length > 0;

  const renderCard = (item: DestaqueItem) => (
    <div
      key={item.title}
      className="flex items-center bg-neutral-900 rounded-xl px-3 py-2 gap-3 shadow-md"
    >
      <Image
        src={item.image || DEFAULT_IMAGE}
        alt={item.name || item.title}
        width={52}
        height={52}
        className="rounded-md object-cover border-2 border-yellow-400"
      />
      <div>
        <p className="uppercase text-xs font-bold text-yellow-400 mb-0.5">{item.title}</p>
        <p className="font-semibold text-[15px] text-white">{item.name}</p>
        {item.value && <p className="text-yellow-300 text-sm">{item.value}</p>}
      </div>
    </div>
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Fundo escuro */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        {/* Painel central */}
        <div className="fixed inset-0 flex items-center justify-center px-2 py-6 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-8"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-8"
          >
            <Dialog.Panel className="relative w-full max-w-md mx-auto bg-[#191919] rounded-2xl shadow-xl px-3 pb-4 pt-7">
              {/* Botao Fechar */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 bg-black/70 rounded-full p-1.5 z-20"
                aria-label="Fechar"
              >
                <X size={26} className="text-white" />
              </button>

              {/* Titulo fixo */}
              <Dialog.Title
                as="h2"
                className="text-xl font-bold text-yellow-400 mb-5 text-center pt-1 pb-2"
                style={{ letterSpacing: "-0.5px" }}
              >
                Todos os Destaques do Dia
              </Dialog.Title>

              {isLoading && (
                <div className="text-center text-zinc-400 py-6">Carregando destaques...</div>
              )}

              {!isLoading && !hasDestaques && !hasArtilheiroMaestro && (
                <div className="text-center text-zinc-400 py-6">
                  Nenhum destaque publicado ainda.
                </div>
              )}

              {!isLoading && hasDestaques && (
                <div className="flex flex-col gap-3">{destaques.map(renderCard)}</div>
              )}

              {hasDestaques && hasArtilheiroMaestro && (
                <div className="flex justify-center my-2">
                  <div className="h-1 w-24 rounded-full bg-yellow-400 opacity-70" />
                </div>
              )}

              {!isLoading && hasArtilheiroMaestro && (
                <div className="flex flex-col gap-3 mb-2">{artilheiroMaestro.map(renderCard)}</div>
              )}

              {/* Botao de regras */}
              <div className="flex justify-center my-2">
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-full shadow transition active:scale-95"
                  style={{ fontSize: 15 }}
                >
                  <Info size={18} /> Entenda as regras dos destaques do dia
                </button>
              </div>
              {/* Regras box */}
              {showInfo && <BoxRegras />}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import { X, Info } from "lucide-react";

// Mock dos destaques do dia (TIME CAMPEÃO)
const destaquesDia = [
  {
    title: "Atacante do Dia",
    name: "Jogador XPTO",
    value: "3 gols",
    image: "/images/jogadores/jogador_padrao_01.jpg",
    href: "/estatisticas/atacantes",
  },
  {
    title: "Meia do Dia",
    name: "Jogador Genérico",
    value: "2 assistências",
    image: "/images/jogadores/jogador_padrao_02.jpg",
    href: "/estatisticas/meias",
  },
  {
    title: "Zagueiro do Dia",
    name: "Jogador Modelo",
    value: "",
    image: "/images/jogadores/jogador_padrao_03.jpg",
    href: "/estatisticas/zagueiros",
  },
  {
    title: "Goleiro do Dia",
    name: "Jogador Fictício",
    value: "",
    image: "/images/jogadores/jogador_padrao_04.jpg",
    href: "/estatisticas/goleiros",
  },
];

// Artilheiro e Maestro do Dia (TODOS DO RACHA)
const artilheiroMaestro = [
  {
    title: "Artilheiro do Dia",
    name: "Jogador XPTO",
    value: "3 gols",
    image: "/images/jogadores/jogador_padrao_01.jpg",
    href: "/estatisticas/atacantes",
  },
  {
    title: "Maestro do Dia",
    name: "Camisa 10",
    value: "4 assistências",
    image: "/images/jogadores/jogador_padrao_03.jpg",
    href: "/estatisticas/meias",
  },
];

// Componente institucional do box de regras
function BoxRegras() {
  return (
    <div className="mt-2 flex flex-col gap-2 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-3 text-[15px] font-normal text-zinc-900 shadow-sm">
      <div className="mb-2 font-bold text-yellow-700">
        Como são escolhidos os destaques do dia?
      </div>
      <ul className="mb-1 list-disc pl-5">
        <li>
          <span className="font-semibold text-zinc-900">Atacante do Dia:</span>{" "}
          Entre os atacantes do <b>time campeão</b>, aquele que fez mais gols.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Meia do Dia:</span>{" "}
          Entre os meias do <b>time campeão</b>, quem deu mais assistências.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Zagueiro do Dia:</span>{" "}
          Eleito por votação dos próprios jogadores do racha (sem estatísticas
          exatas).
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Goleiro do Dia:</span> O
          goleiro do <b>time campeão</b> do dia (não computa defesas).
        </li>
      </ul>
      <div className="h-2" />
      <ul className="mb-2 list-disc pl-5">
        <li>
          <span className="font-semibold text-zinc-900">
            Artilheiro do Dia:
          </span>{" "}
          Jogador de qualquer time/posição com mais gols na rodada.
        </li>
        <li>
          <span className="font-semibold text-zinc-900">Maestro do Dia:</span>{" "}
          Jogador de qualquer time/posição com mais assistências no dia.
        </li>
      </ul>
      <div className="mt-1 text-[14px] font-medium text-zinc-800">
        <span className="font-bold text-yellow-600">Obs:</span> Esses critérios
        valorizam quem ajudou o time a ser campeão, mesmo que não seja o maior
        artilheiro ou assistente geral do racha.
      </div>
    </div>
  );
}

export default function GamesOfTheDayMobileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

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
          <div
            className="fixed inset-0 bg-black/80 transition-opacity"
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Painel central */}
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto px-2 py-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-8"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-8"
          >
            <Dialog.Panel className="relative mx-auto w-full max-w-md rounded-2xl bg-[#191919] px-3 pb-4 pt-7 shadow-xl">
              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-20 rounded-full bg-black/70 p-1.5"
                aria-label="Fechar"
              >
                <X size={26} className="text-white" />
              </button>

              {/* Título fixo */}
              <Dialog.Title
                as="h2"
                className="mb-5 pb-2 pt-1 text-center text-xl font-bold text-yellow-400"
                style={{ letterSpacing: "-0.5px" }}
              >
                Todos os Destaques do Dia
              </Dialog.Title>

              {/* Cards principais (time campeão) */}
              <div className="flex flex-col gap-3">
                {destaquesDia.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl bg-neutral-900 px-3 py-2 shadow-md"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={52}
                      height={52}
                      className="rounded-md border-2 border-yellow-400 object-cover"
                    />
                    <div>
                      <p className="mb-0.5 text-xs font-bold uppercase text-yellow-400">
                        {item.title}
                      </p>
                      <p className="text-[15px] font-semibold text-white">
                        {item.name}
                      </p>
                      {item.value && (
                        <p className="text-sm text-yellow-300">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Separador visual */}
              <div className="my-2 flex justify-center">
                <div className="h-1 w-24 rounded-full bg-yellow-400 opacity-70" />
              </div>

              {/* Cards Artilheiro/Maestro */}
              <div className="mb-2 flex flex-col gap-3">
                {artilheiroMaestro.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl bg-neutral-900 px-3 py-2 shadow-md"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={52}
                      height={52}
                      className="rounded-md border-2 border-yellow-400 object-cover"
                    />
                    <div>
                      <p className="mb-0.5 text-xs font-bold uppercase text-yellow-400">
                        {item.title}
                      </p>
                      <p className="text-[15px] font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-yellow-300">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de regras */}
              <div className="my-2 flex justify-center">
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 font-semibold text-black shadow transition hover:bg-yellow-300 active:scale-95"
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

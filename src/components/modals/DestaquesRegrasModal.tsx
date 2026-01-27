"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DestaquesRegrasModal({ open, onClose }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 flex items-center justify-center px-3 py-6 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-8"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-8"
          >
            <Dialog.Panel className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] px-6 pb-6 pt-7 text-white shadow-2xl">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/40 p-1.5 text-white hover:text-brand-soft"
                aria-label="Fechar"
              >
                <X size={22} />
              </button>

              <Dialog.Title as="h2" className="text-xl font-bold text-brand text-center mb-4">
                Regras dos Destaques do Dia
              </Dialog.Title>

              <ul className="space-y-3 text-sm text-gray-200">
                <li>
                  <span className="font-semibold text-brand-soft">Time Campeao do Dia:</span>{" "}
                  somatoria de pontos nas partidas finalizadas (3 vitoria, 1 empate, 0 derrota).
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Atacante do Dia:</span> atacante
                  do Time Campeao do Dia com mais gols. Desempate: mais assistencias, depois a
                  primeira ordem do sistema.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Meia do Dia:</span> meia do Time
                  Campeao do Dia com mais assistencias. Desempate: mais gols, depois a primeira
                  ordem do sistema.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Goleiro do Dia:</span> goleiro do
                  Time Campeao do Dia.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Zagueiro do Dia:</span> escolha
                  manual entre os zagueiros do Time Campeao do Dia (o sistema nao calcula desarmes).
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Artilheiro do Dia:</span> jogador
                  de qualquer time com mais gols no dia.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Maestro do Dia:</span> jogador de
                  qualquer time com mais assistencias no dia.
                </li>
              </ul>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

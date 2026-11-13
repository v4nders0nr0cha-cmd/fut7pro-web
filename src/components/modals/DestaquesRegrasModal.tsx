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

        <div className="fixed inset-0 flex items-end justify-center pt-3 sm:items-center sm:px-3 sm:py-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-8"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-8"
          >
            <Dialog.Panel className="relative flex max-h-[calc(100dvh-0.75rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#111827] text-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl">
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
                <Dialog.Title as="h2" className="text-lg font-bold text-brand">
                  Regras dos Destaques do Dia
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg border border-white/15 bg-black/40 p-1.5 text-white hover:text-brand-soft"
                  aria-label="Fechar"
                >
                  <X size={22} />
                </button>
              </header>

              <ul className="min-h-0 space-y-3 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm leading-6 text-gray-200 sm:px-6">
                <li>
                  <span className="font-semibold text-brand-soft">Time Campeão do Dia:</span>{" "}
                  somatória de pontos nas partidas finalizadas (3 vitória, 1 empate, 0 derrota).
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Atacante do Dia:</span> atacante
                  do Time Campeão do Dia com mais gols. Desempate: mais assistências, depois a
                  primeira ordem do sistema.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Meia do Dia:</span> meia do Time
                  Campeão do Dia com mais assistências. Desempate: mais gols, depois a primeira
                  ordem do sistema.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Goleiro do Dia:</span> goleiro do
                  Time Campeão do Dia.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Zagueiro do Dia:</span> escolha
                  manual entre os zagueiros do Time Campeão do Dia (o sistema não calcula desarmes).
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Artilheiro do Dia:</span> jogador
                  de qualquer time com mais gols no dia.
                </li>
                <li>
                  <span className="font-semibold text-brand-soft">Maestro do Dia:</span> jogador de
                  qualquer time com mais assistências no dia.
                </li>
              </ul>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

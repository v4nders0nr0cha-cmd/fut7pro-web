"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ChevronDown, Info, X } from "lucide-react";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";

type PageHelpProps = {
  title: string;
  summary: string;
  details: ReactNode;
  variant?: "main-page" | "subpage";
  headingLevel?: "h1" | "h2";
  align?: "center" | "left";
  className?: string;
  detailsTitle?: string;
};

export default function PageHelp({
  title,
  summary,
  details,
  variant = "subpage",
  headingLevel = "h2",
  align = "center",
  className = "",
  detailsTitle,
}: PageHelpProps) {
  const [open, setOpen] = useState(false);
  const Heading = headingLevel;
  const isMainPage = variant === "main-page";
  const aligned = align === "center";

  return (
    <>
      <div
        className={[
          aligned ? "text-center" : "text-center md:text-left",
          isMainPage ? "mb-8" : "mb-3 md:mb-4",
          className,
        ].join(" ")}
      >
        <div
          className={[
            "flex flex-col gap-2",
            aligned ? "items-center" : "items-center md:items-start",
          ].join(" ")}
        >
          <Heading
            className={[
              isMainPage ? "text-3xl md:text-4xl font-extrabold" : "text-2xl md:text-3xl font-bold",
              "text-brand leading-tight drop-shadow-sm",
            ].join(" ")}
          >
            {title}
          </Heading>

          <div
            className={[
              "flex flex-col gap-2",
              aligned ? "items-center" : "items-center md:items-start",
              isMainPage ? "max-w-3xl" : "max-w-2xl",
            ].join(" ")}
          >
            <p
              className={[
                "text-gray-300 leading-relaxed",
                isMainPage ? "text-base md:text-lg" : "hidden text-sm md:block",
              ].join(" ")}
            >
              {summary}
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex min-h-[36px] items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition hover:border-brand/60 hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/50"
              aria-label={`Entender ${title}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>{isMainPage ? "Saiba mais" : "Entenda esta página"}</span>
              <ChevronDown
                className="h-3.5 w-3.5 transition group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-8 sm:scale-95 sm:translate-y-0"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:scale-95 sm:translate-y-0"
            >
              <Dialog.Panel className="relative w-full max-h-[86vh] overflow-y-auto rounded-t-3xl border border-brand/15 bg-[#151515] px-5 pb-6 pt-5 shadow-2xl shadow-black/60 sm:max-w-2xl sm:rounded-2xl sm:px-7 sm:pb-7 sm:pt-6">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-200 transition hover:border-brand/50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/50"
                  aria-label="Fechar explicação"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="pr-11">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                    Ajuda contextual
                  </p>
                  <Dialog.Title className="text-xl font-bold leading-tight text-brand sm:text-2xl">
                    {detailsTitle ?? `Entenda ${title}`}
                  </Dialog.Title>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-200">
                  {details}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

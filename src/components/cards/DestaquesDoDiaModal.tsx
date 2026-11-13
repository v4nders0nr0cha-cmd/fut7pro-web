"use client";

import Image from "next/image";

export default function DestaquesDoDiaModal({
  destaques,
  open,
  onClose,
}: {
  destaques: {
    title: string;
    name: string;
    value?: string;
    image: string;
    href: string;
  }[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 pt-3 sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="destaques-do-dia-title"
        className="relative flex max-h-[calc(100dvh-0.75rem)] w-full max-w-sm flex-col overflow-hidden rounded-t-2xl bg-neutral-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
          <h2 id="destaques-do-dia-title" className="text-xl font-bold text-brand">
            Destaques do Dia
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar destaques"
            className="rounded-lg border border-white/15 px-3 py-1 text-xl font-bold text-brand"
          >
            ×
          </button>
        </header>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {destaques.map((d, i) => (
            <a
              href={d.href}
              key={i}
              className="flex items-center gap-3 bg-[#181818] rounded-xl p-3 hover:scale-[1.01] transition"
            >
              <Image
                src={d.image}
                alt={`Foto de ${d.name}`}
                width={50}
                height={50}
                className="rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs uppercase text-brand font-bold">{d.title}</span>
                <span className="font-semibold text-white">{d.name}</span>
                {d.value && <span className="text-brand-soft text-xs">{d.value}</span>}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

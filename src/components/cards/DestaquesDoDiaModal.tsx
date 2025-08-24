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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-60 sm:items-center">
      <div className="animate-slideup relative mx-auto w-full max-w-sm rounded-t-2xl bg-neutral-900 p-4 pb-6 sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-2 text-xl font-bold text-yellow-400"
        >
          ×
        </button>
        <h2 className="mb-3 text-center text-xl font-bold text-yellow-400">
          Destaques do Dia
        </h2>
        <div className="flex flex-col gap-4">
          {destaques.map((d, i) => (
            <a
              href={d.href}
              key={i}
              className="flex items-center gap-3 rounded-xl bg-[#181818] p-3 transition hover:scale-[1.01]"
            >
              <Image
                src={d.image}
                alt={`Foto de ${d.name}`}
                width={50}
                height={50}
                className="rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-yellow-400">
                  {d.title}
                </span>
                <span className="font-semibold text-white">{d.name}</span>
                {d.value && (
                  <span className="text-xs text-yellow-300">{d.value}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

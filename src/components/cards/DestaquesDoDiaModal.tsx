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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-neutral-900 rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-auto p-4 pb-6 animate-slideup relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-brand font-bold text-xl">
          ×
        </button>
        <h2 className="text-xl font-bold text-brand mb-3 text-center">Destaques do Dia</h2>
        <div className="flex flex-col gap-4">
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
      </div>
    </div>
  );
}

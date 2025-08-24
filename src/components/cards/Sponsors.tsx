"use client";

import Image from "next/image";

const patrocinadores = [
  {
    nome: "Patrocinador Genérico 1",
    logo: "/images/patrocinadores/patrocinador_01.png",
  },
  {
    nome: "Patrocinador Genérico 2",
    logo: "/images/patrocinadores/patrocinador_02.png",
  },
  {
    nome: "Patrocinador Genérico 3",
    logo: "/images/patrocinadores/patrocinador_03.png",
  },
  {
    nome: "Patrocinador Genérico 4",
    logo: "/images/patrocinadores/patrocinador_04.png",
  },
];

export default function Sponsors() {
  return (
    <section className="border-t border-yellow-400 bg-[#111] px-4 py-8">
      <div className="mx-auto w-full max-w-md text-center">
        <h3 className="mb-4 text-lg font-bold text-yellow-400">
          NOSSOS PATROCINADORES
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {patrocinadores.map((p, idx) => (
            <Image
              key={idx}
              src={p.logo}
              alt={p.nome}
              width={100}
              height={50}
              className="h-12 object-contain opacity-80 transition duration-300 ease-in-out hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

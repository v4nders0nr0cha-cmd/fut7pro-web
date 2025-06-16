"use client";

import Image from "next/image";

const patrocinadores = [
  { nome: "Patrocinador Genérico 1", logo: "/images/patrocinadores/patrocinador_01.png" },
  { nome: "Patrocinador Genérico 2", logo: "/images/patrocinadores/patrocinador_02.png" },
  { nome: "Patrocinador Genérico 3", logo: "/images/patrocinadores/patrocinador_03.png" },
  { nome: "Patrocinador Genérico 4", logo: "/images/patrocinadores/patrocinador_04.png" },
];

export default function Sponsors() {
  return (
    <section className="bg-[#111] py-8 border-t border-yellow-400 px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">NOSSOS PATROCINADORES</h3>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {patrocinadores.map((p, idx) => (
            <Image
              key={idx}
              src={p.logo}
              alt={p.nome}
              width={100}
              height={50}
              className="object-contain h-12 opacity-80 hover:opacity-100 transition duration-300 ease-in-out"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

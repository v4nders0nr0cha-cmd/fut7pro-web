"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { atletasMock } from "@/components/lists/mockAtletas";

export default function ListaAtletasPage() {
  const [busca, setBusca] = useState("");

  const atletasFiltrados = atletasMock.filter((atleta) =>
    atleta.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Perfis dos Atletas</h1>

      <input
        type="text"
        placeholder="Digite o nome do atleta..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800 text-white mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atletasFiltrados.map((atleta) => (
          <Link key={atleta.id} href={`/atletas/${atleta.slug}`}>
            <div className="bg-zinc-900 p-4 rounded shadow hover:shadow-lg cursor-pointer">
              <Image
                src={atleta.foto}
                alt={atleta.nome}
                width={80}
                height={80}
                className="rounded-full mb-2"
              />
              <h2 className="text-lg font-semibold">{atleta.nome}</h2>
              <p className="text-sm text-gray-400">{atleta.posicao}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

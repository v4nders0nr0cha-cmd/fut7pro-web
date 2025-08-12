"use client";

import Image from "next/image";
import { useState } from "react";
import Head from "next/head";
import { torneiosMock } from "@/components/lists/mockTorneios";
import type { Torneio } from "@/types/torneio";

const getNovoTorneio = (): Torneio => ({
  nome: "",
  ano: new Date().getFullYear(),
  slug: "",
  campeao: "",
  imagem: "",
});

export default function AdminTorneiosPage() {
  const [torneios, setTorneios] = useState<Torneio[]>(torneiosMock);
  const [novoTorneio, setNovoTorneio] = useState<Torneio>(getNovoTorneio());
  const [modoEdicao, setModoEdicao] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNovoTorneio((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!novoTorneio.nome || !novoTorneio.slug || !novoTorneio.campeao || !novoTorneio.imagem)
      return;

    if (modoEdicao !== null) {
      const atualizados = [...torneios];
      atualizados[modoEdicao] = { ...novoTorneio, ano: Number(novoTorneio.ano) };
      setTorneios(atualizados);
      setModoEdicao(null);
    } else {
      setTorneios([...torneios, { ...novoTorneio, ano: Number(novoTorneio.ano) }]);
    }

    setNovoTorneio(getNovoTorneio());
  };

  const handleEditar = (index: number) => {
    const t = torneios[index];
    if (!t) return; // Protege contra índices inválidos
    setNovoTorneio({
      nome: t.nome,
      ano: Number(t.ano),
      slug: t.slug,
      campeao: t.campeao,
      imagem: t.imagem,
    });
    setModoEdicao(index);
  };

  const handleExcluir = (index: number) => {
    const confirmado = confirm("Tem certeza que deseja excluir este torneio?");
    if (confirmado) {
      const copia = [...torneios];
      copia.splice(index, 1);
      setTorneios(copia);
      if (modoEdicao === index) {
        setModoEdicao(null);
        setNovoTorneio(getNovoTorneio());
      }
    }
  };

  return (
    <>
      <Head>
        <title>Admin Torneios | Fut7Pro</title>
        <meta name="description" content="Administração dos torneios especiais do Fut7Pro." />
        <meta name="keywords" content="admin torneios, fut7pro, futebol 7, torneios especiais" />
      </Head>

      <div className="min-h-screen bg-fundo text-white px-4 pt-6 pb-10">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Painel Admin – Grandes Torneios
        </h1>

        {/* FORMULÁRIO */}
        <div className="max-w-xl mx-auto bg-[#1A1A1A] rounded-xl p-4 mb-10">
          <h2 className="text-lg font-bold text-white mb-4">
            {modoEdicao !== null ? "Editar Torneio" : "Novo Torneio"}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              name="nome"
              value={novoTorneio.nome}
              onChange={handleChange}
              placeholder="Nome do Torneio"
              className="p-2 rounded bg-zinc-800 text-white"
              autoComplete="off"
            />
            <input
              name="ano"
              value={novoTorneio.ano}
              onChange={handleChange}
              type="number"
              placeholder="Ano"
              className="p-2 rounded bg-zinc-800 text-white"
              min={2000}
              max={2100}
              autoComplete="off"
            />
            <input
              name="slug"
              value={novoTorneio.slug}
              onChange={handleChange}
              placeholder="Slug do Campeão (link)"
              className="p-2 rounded bg-zinc-800 text-white"
              autoComplete="off"
            />
            <input
              name="campeao"
              value={novoTorneio.campeao}
              onChange={handleChange}
              placeholder="Nome do Campeão"
              className="p-2 rounded bg-zinc-800 text-white"
              autoComplete="off"
            />
            <input
              name="imagem"
              value={novoTorneio.imagem}
              onChange={handleChange}
              placeholder="Caminho da Imagem"
              className="p-2 rounded bg-zinc-800 text-white"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400"
            >
              {modoEdicao !== null ? "Salvar Alterações" : "Cadastrar Torneio"}
            </button>
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {torneios.map((torneio, idx) => (
            <div key={torneio.slug + idx} className="bg-[#1A1A1A] rounded-xl p-4 shadow-md">
              <Image
                src={torneio.imagem}
                alt={`Imagem do torneio ${torneio.nome}`}
                width={400}
                height={200}
                className="rounded-md object-cover mb-3 w-full h-40"
              />
              <h3 className="text-lg font-bold text-yellow-400 mb-1">{torneio.nome}</h3>
              <p className="text-sm text-gray-300 mb-1">Ano: {torneio.ano}</p>
              <p className="text-sm text-white mb-2">
                Campeão: <span className="text-blue-400">{torneio.campeao}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(idx)}
                  className="text-sm bg-blue-600 py-1 px-3 rounded hover:bg-blue-500"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleExcluir(idx)}
                  className="text-sm bg-red-600 py-1 px-3 rounded hover:bg-red-500"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

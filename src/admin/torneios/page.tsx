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
    if (
      !novoTorneio.nome ||
      !novoTorneio.slug ||
      !novoTorneio.campeao ||
      !novoTorneio.imagem
    )
      return;

    if (modoEdicao !== null) {
      const atualizados = [...torneios];
      atualizados[modoEdicao] = {
        ...novoTorneio,
        ano: Number(novoTorneio.ano),
      };
      setTorneios(atualizados);
      setModoEdicao(null);
    } else {
      setTorneios([
        ...torneios,
        { ...novoTorneio, ano: Number(novoTorneio.ano) },
      ]);
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
        <meta
          name="description"
          content="Administração dos torneios especiais do Fut7Pro."
        />
        <meta
          name="keywords"
          content="admin torneios, fut7pro, futebol 7, torneios especiais"
        />
      </Head>

      <div className="min-h-screen bg-fundo px-4 pb-10 pt-6 text-white">
        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          Painel Admin – Grandes Torneios
        </h1>

        {/* FORMULÁRIO */}
        <div className="mx-auto mb-10 max-w-xl rounded-xl bg-[#1A1A1A] p-4">
          <h2 className="mb-4 text-lg font-bold text-white">
            {modoEdicao !== null ? "Editar Torneio" : "Novo Torneio"}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              name="nome"
              value={novoTorneio.nome}
              onChange={handleChange}
              placeholder="Nome do Torneio"
              className="rounded bg-zinc-800 p-2 text-white"
              autoComplete="off"
            />
            <input
              name="ano"
              value={novoTorneio.ano}
              onChange={handleChange}
              type="number"
              placeholder="Ano"
              className="rounded bg-zinc-800 p-2 text-white"
              min={2000}
              max={2100}
              autoComplete="off"
            />
            <input
              name="slug"
              value={novoTorneio.slug}
              onChange={handleChange}
              placeholder="Slug do Campeão (link)"
              className="rounded bg-zinc-800 p-2 text-white"
              autoComplete="off"
            />
            <input
              name="campeao"
              value={novoTorneio.campeao}
              onChange={handleChange}
              placeholder="Nome do Campeão"
              className="rounded bg-zinc-800 p-2 text-white"
              autoComplete="off"
            />
            <input
              name="imagem"
              value={novoTorneio.imagem}
              onChange={handleChange}
              placeholder="Caminho da Imagem"
              className="rounded bg-zinc-800 p-2 text-white"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-400"
            >
              {modoEdicao !== null ? "Salvar Alterações" : "Cadastrar Torneio"}
            </button>
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {torneios.map((torneio, idx) => (
            <div
              key={torneio.slug + idx}
              className="rounded-xl bg-[#1A1A1A] p-4 shadow-md"
            >
              <Image
                src={torneio.imagem}
                alt={`Imagem do torneio ${torneio.nome}`}
                width={400}
                height={200}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />
              <h3 className="mb-1 text-lg font-bold text-yellow-400">
                {torneio.nome}
              </h3>
              <p className="mb-1 text-sm text-gray-300">Ano: {torneio.ano}</p>
              <p className="mb-2 text-sm text-white">
                Campeão:{" "}
                <span className="text-blue-400">{torneio.campeao}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(idx)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleExcluir(idx)}
                  className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-500"
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

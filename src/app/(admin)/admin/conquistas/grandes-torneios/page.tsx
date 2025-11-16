"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaTrophy } from "react-icons/fa";
import { useTorneios } from "@/hooks/useTorneios";
import type { CreateTorneioPayload } from "@/types/torneio";

function currentYear() {
  return new Date().getFullYear();
}

export default function GrandesTorneiosAdminPage() {
  const { torneios, addTorneio, isLoading, isError, error } = useTorneios();
  const [form, setForm] = useState<CreateTorneioPayload>({
    nome: "",
    ano: currentYear(),
    campeao: "",
    bannerUrl: "",
    logoUrl: "",
    descricaoResumida: "",
    status: "publicado",
  });
  const [saving, setSaving] = useState(false);

  const ordered = useMemo(
    () => torneios.slice().sort((a, b) => (b.publicadoEm ?? "").localeCompare(a.publicadoEm ?? "")),
    [torneios]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome?.trim()) return;
    setSaving(true);
    try {
      await addTorneio({
        ...form,
        nome: form.nome?.trim(),
        campeao: form.campeao?.trim() || undefined,
        descricaoResumida: form.descricaoResumida?.trim() || undefined,
        bannerUrl: form.bannerUrl?.trim() || undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
      });
      setForm({
        nome: "",
        ano: currentYear(),
        campeao: "",
        bannerUrl: "",
        logoUrl: "",
        descricaoResumida: "",
        status: "publicado",
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Falha ao salvar torneio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Grandes Torneios | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os grandes torneios do seu racha e destaque os campeões no Fut7Pro."
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 text-center">
            Grandes Torneios (Gestão)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha. Atletas campeões
            recebem destaque no perfil público.
          </p>

          {isError && (
            <div className="text-center text-red-200 bg-red-900/30 border border-red-700/40 px-4 py-3 rounded-lg mb-4">
              {error ?? "Não foi possível carregar os torneios."}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-8 shadow flex flex-col gap-3"
          >
            <h2 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
              <FaPlus /> Novo Torneio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Nome do torneio *
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.nome ?? ""}
                  maxLength={120}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Ano *
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.ano ?? currentYear()}
                  onChange={(e) => setForm((prev) => ({ ...prev, ano: Number(e.target.value) }))}
                  required
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Campeão
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.campeao ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, campeao: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Descrição curta
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.descricaoResumida ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, descricaoResumida: e.target.value }))
                  }
                  maxLength={220}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Banner (URL)
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.bannerUrl ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </label>
              <label className="text-sm text-gray-200 flex flex-col gap-1">
                Logo (URL)
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.logoUrl ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black px-5 py-2 rounded-xl font-bold shadow"
              >
                {saving ? "Salvando..." : "Cadastrar Torneio"}
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-6">
            {ordered.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 py-12 font-semibold">
                Nenhum torneio cadastrado ainda.
              </div>
            )}
            {ordered.map((torneio) => (
              <div
                key={torneio.id}
                className="bg-zinc-900 border-2 border-yellow-400 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48 sm:h-64 md:h-72 w-full">
                  <Image
                    src={torneio.bannerUrl || "/images/torneios/placeholder.jpg"}
                    alt={`Banner do ${torneio.nome}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end">
                    <div className="p-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1 flex items-center gap-2">
                        <FaTrophy className="inline" /> {torneio.nome}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {torneio.descricaoResumida ?? "Torneio especial do racha."}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-200">
                        <span>Ano: {torneio.ano}</span>
                        <span>Campeão: {torneio.campeao ?? "-"}</span>
                        <span>Status: {torneio.status ?? "publicado"}</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-sm">
                        <Link
                          href={`/admin/conquistas/grandes-torneios/${torneio.slug}`}
                          className="inline-block mt-1 text-sm font-semibold text-yellow-400 hover:underline"
                        >
                          Gerenciar Detalhes →
                        </Link>
                        <Link
                          href={`/admin/conquistas/grandes-torneios/${torneio.slug}`}
                          className="inline-block mt-1 text-sm font-semibold text-white/80 hover:underline"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

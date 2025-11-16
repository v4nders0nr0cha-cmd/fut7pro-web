"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTorneios } from "@/hooks/useTorneios";
import { useTorneioDetalhe } from "@/hooks/useTorneioDetalhe";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import type { Athlete } from "@/types/jogador";
import type { Torneio, TorneioJogadorCampeao } from "@/types/torneio";

type FormState = {
  nome: string;
  ano: number;
  campeao: string;
  descricao: string;
  descricaoResumida: string;
  bannerUrl: string;
  logoUrl: string;
  dataInicio: string;
  dataFim: string;
  status: Torneio["status"];
  destacarNoSite: boolean;
  jogadoresCampeoes: TorneioJogadorCampeao[];
};

const STATUS_OPTIONS: Array<{ value: Torneio["status"]; label: string }> = [
  { value: "publicado", label: "Publicado (aparece no site)" },
  { value: "rascunho", label: "Rascunho" },
];

function toISODate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function normalizeChampionFromAthlete(athlete: Athlete): TorneioJogadorCampeao {
  return {
    athleteId: athlete.id,
    athleteSlug: athlete.slug ?? athlete.id,
    nome: athlete.name ?? athlete.nickname ?? "",
    posicao: String(athlete.position ?? athlete.posicao ?? "meia"),
    fotoUrl: athlete.photoUrl ?? null,
  };
}

export default function TorneioDetalhePage({ params }: { params: { torneioSlug: string } }) {
  const { user } = useAuth();
  const { rachaId } = useRacha();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"banner" | "logo" | null>(null);
  const [jogadorFiltro, setJogadorFiltro] = useState("");

  const tenantSlug = useMemo(
    () => user?.tenantSlug ?? (rachaId || null),
    [user?.tenantSlug, rachaId]
  );

  const {
    torneios,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    updateTorneio,
    setDestaque,
    mutate: mutateLista,
  } = useTorneios();

  const torneioDaLista = useMemo(
    () => torneios.find((item) => item.slug === params.torneioSlug) ?? null,
    [params.torneioSlug, torneios]
  );
  const torneioId = torneioDaLista?.id ?? null;

  const {
    torneio,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    mutate: mutateDetalhe,
  } = useTorneioDetalhe(torneioId, tenantSlug, torneioDaLista);

  const { jogadores, isLoading: jogadoresLoading } = useJogadores(tenantSlug);

  const [form, setForm] = useState<FormState>(() => ({
    nome: "",
    ano: new Date().getFullYear(),
    campeao: "",
    descricao: "",
    descricaoResumida: "",
    bannerUrl: "",
    logoUrl: "",
    dataInicio: "",
    dataFim: "",
    status: "rascunho",
    destacarNoSite: false,
    jogadoresCampeoes: [],
  }));

  useEffect(() => {
    if (!torneio) return;
    setForm({
      nome: torneio.nome ?? "",
      ano: torneio.ano ?? new Date().getFullYear(),
      campeao: torneio.campeao ?? "",
      descricao: torneio.descricao ?? "",
      descricaoResumida: torneio.descricaoResumida ?? "",
      bannerUrl: torneio.bannerUrl ?? "",
      logoUrl: torneio.logoUrl ?? "",
      dataInicio: toISODate(torneio.dataInicio),
      dataFim: toISODate(torneio.dataFim),
      status: torneio.status ?? "rascunho",
      destacarNoSite: Boolean(torneio.destacarNoSite),
      jogadoresCampeoes: torneio.jogadoresCampeoes ?? [],
    });
  }, [torneio]);

  const campeoesSelecionados = form.jogadoresCampeoes ?? [];
  const campeoesIndex = useMemo(
    () =>
      new Set(
        campeoesSelecionados.map((item) => {
          if (item.athleteId) return item.athleteId;
          return item.athleteSlug;
        })
      ),
    [campeoesSelecionados]
  );

  const jogadoresFiltrados = useMemo(() => {
    const termo = jogadorFiltro.toLowerCase().trim();
    return jogadores.filter((jogador) => {
      if (!termo) return true;
      return (
        jogador.name?.toLowerCase().includes(termo) ||
        jogador.nickname?.toLowerCase().includes(termo) ||
        jogador.position?.toString().toLowerCase().includes(termo)
      );
    });
  }, [jogadorFiltro, jogadores]);

  if (!torneioId && !isListLoading) {
    return (
      <main className="min-h-screen bg-fundo text-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-300">Torneio n�o encontrado.</p>
          <Link href="/admin/conquistas/grandes-torneios" className="text-yellow-400 font-semibold">
            Voltar para lista
          </Link>
        </div>
      </main>
    );
  }

  const handleToggleJogador = (athlete: Athlete) => {
    const championKey = athlete.id ?? athlete.slug;
    if (!championKey) return;

    const exists = campeoesIndex.has(championKey);
    if (exists) {
      setForm((prev) => ({
        ...prev,
        jogadoresCampeoes: (prev.jogadoresCampeoes ?? []).filter((item) => {
          const key = item.athleteId ?? item.athleteSlug;
          return key !== championKey;
        }),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      jogadoresCampeoes: [...(prev.jogadoresCampeoes ?? []), normalizeChampionFromAthlete(athlete)],
    }));
  };

  const handleSave = async () => {
    if (!torneioId) return;
    if (!form.nome.trim()) {
      toast.error("Informe o nome do torneio");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Torneio> = {
        nome: form.nome.trim(),
        ano: Number(form.ano) || new Date().getFullYear(),
        campeao: form.campeao?.trim() || null,
        descricao: form.descricao?.trim() || null,
        descricaoResumida: form.descricaoResumida?.trim() || null,
        bannerUrl: form.bannerUrl?.trim() || null,
        logoUrl: form.logoUrl?.trim() || null,
        dataInicio: form.dataInicio || null,
        dataFim: form.dataFim || null,
        status: form.status ?? "rascunho",
        destacarNoSite: form.destacarNoSite,
        jogadoresCampeoes: form.jogadoresCampeoes ?? [],
      };

      await updateTorneio(torneioId, payload);
      await Promise.all([mutateDetalhe(), mutateLista()]);
      toast.success("Torneio atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao salvar torneio");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDestaque = async () => {
    if (!torneioId) return;
    setSaving(true);
    try {
      const novoValor = !form.destacarNoSite;
      await setDestaque(torneioId, novoValor);
      setForm((prev) => ({ ...prev, destacarNoSite: novoValor }));
      await Promise.all([mutateDetalhe(), mutateLista()]);
      toast.success(novoValor ? "Torneio destacado no site" : "Destaque removido");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao atualizar destaque");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File, field: "bannerUrl" | "logoUrl") => {
    if (!file) return;
    setUploading(field === "bannerUrl" ? "banner" : "logo");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", field === "bannerUrl" ? "banner" : "logo");
      if (tenantSlug) {
        formData.append("tenantSlug", tenantSlug);
      }

      const response = await fetch("/api/admin/torneios/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Falha no upload");
      }
      const url = payload.url ?? payload.publicUrl ?? "";
      if (!url) {
        throw new Error("Upload conclu�do mas a URL n�o foi retornada");
      }
      setForm((prev) => ({ ...prev, [field]: url }));
      toast.success("Upload conclu�do");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao enviar arquivo");
    } finally {
      setUploading(null);
    }
  };

  const loading = isListLoading || isDetailLoading;

  return (
    <>
      <Head>
        <title>Grandes Torneios - Detalhe | Painel Admin</title>
        <meta
          name="description"
          content="Edite os detalhes do torneio, campe�es e destaque p�blico diretamente do painel."
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <header className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/conquistas/grandes-torneios"
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 font-semibold"
              >
                <FaArrowLeft /> Voltar
              </Link>
              <div>
                <p className="text-sm text-gray-300">Gest�o de torneio</p>
                <h1 className="text-2xl font-bold text-yellow-400">
                  {torneio?.nome ?? "Carregando..."}
                </h1>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full border border-zinc-700 text-gray-200">
                    Slug: {params.torneioSlug}
                  </span>
                  {form.status && (
                    <span
                      className={`px-2 py-1 rounded-full ${
                        form.status === "publicado"
                          ? "bg-green-600/60 text-white"
                          : "bg-zinc-800 text-gray-200"
                      }`}
                    >
                      {form.status === "publicado" ? "Publicado" : "Rascunho"}
                    </span>
                  )}
                  {form.destacarNoSite && (
                    <span className="px-2 py-1 rounded-full bg-yellow-500 text-black font-bold">
                      Em destaque
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-end">
              <button
                type="button"
                onClick={handleToggleDestaque}
                disabled={!torneioId || saving}
                className={`px-4 py-2 rounded-lg font-semibold border ${
                  form.destacarNoSite
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "bg-zinc-800 border-zinc-700"
                } disabled:opacity-60`}
              >
                {form.destacarNoSite ? "Remover destaque" : "Destacar no site"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!torneioId || saving}
                className="px-5 py-2 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-60 shadow"
              >
                {saving ? "Salvando..." : "Salvar altera��es"}
              </button>
            </div>
          </header>

          {isListError && (
            <div className="text-red-200 bg-red-900/30 border border-red-700/40 px-4 py-3 rounded-lg">
              {listError ?? "Falha ao carregar a lista de torneios."}
            </div>
          )}
          {isDetailError && (
            <div className="text-red-200 bg-red-900/30 border border-red-700/40 px-4 py-3 rounded-lg">
              {detailError ?? "Falha ao carregar os detalhes do torneio."}
            </div>
          )}

          <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow">
            <h2 className="text-lg font-bold text-yellow-300 mb-4">Dados gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Nome do torneio *
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.nome}
                  disabled={loading}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Status
                <select
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.status ?? "rascunho"}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value as Torneio["status"] }))
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Ano
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.ano}
                  disabled={loading}
                  onChange={(e) => setForm((prev) => ({ ...prev, ano: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Data de in�cio
                <input
                  type="date"
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.dataInicio}
                  disabled={loading}
                  onChange={(e) => setForm((prev) => ({ ...prev, dataInicio: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Data de fim
                <input
                  type="date"
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.dataFim}
                  disabled={loading}
                  onChange={(e) => setForm((prev) => ({ ...prev, dataFim: e.target.value }))}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Campe�o (time)
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.campeao}
                  disabled={loading}
                  onChange={(e) => setForm((prev) => ({ ...prev, campeao: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-200">
                Descri��o curta
                <input
                  className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700"
                  value={form.descricaoResumida}
                  maxLength={220}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, descricaoResumida: e.target.value }))
                  }
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm text-gray-200 mt-4">
              Descri��o completa
              <textarea
                className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 min-h-[120px]"
                value={form.descricao}
                disabled={loading}
                onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
              />
            </label>
          </section>

          <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow">
            <h2 className="text-lg font-bold text-yellow-300 mb-4">Banner e logo (Supabase)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-300 font-semibold">Banner</p>
                <div className="relative bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden h-48">
                  {form.bannerUrl ? (
                    <Image
                      src={form.bannerUrl}
                      alt="Banner do torneio"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 860px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                      Sem banner enviado
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUpload(file, "bannerUrl");
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 cursor-pointer hover:border-yellow-500">
                    <FaUpload /> {uploading === "banner" ? "Enviando..." : "Enviar banner"}
                  </span>
                </label>
                <small className="text-gray-400">
                  Sugest�o: 1600x600 px. O arquivo � enviado para o bucket p�blico do Supabase.
                </small>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-300 font-semibold">Logo / Escudo</p>
                <div className="relative bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden h-48 flex items-center justify-center">
                  {form.logoUrl ? (
                    <Image
                      src={form.logoUrl}
                      alt="Logo do torneio"
                      fill
                      className="object-contain p-6"
                      sizes="240px"
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">Sem logo enviado</div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUpload(file, "logoUrl");
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 cursor-pointer hover:border-yellow-500">
                    <FaUpload /> {uploading === "logo" ? "Enviando..." : "Enviar logo"}
                  </span>
                </label>
                <small className="text-gray-400">
                  PNG/WebP com fundo transparente. O link � salvo diretamente no registro do
                  torneio.
                </small>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div>
                <h2 className="text-lg font-bold text-yellow-300">Jogadores campe�es</h2>
                <p className="text-sm text-gray-300">
                  Selecione atletas reais (useJogadores) para aplicar o �cone de campe�o no perfil
                  p�blico.
                </p>
              </div>
              <input
                type="text"
                placeholder="Buscar atleta por nome ou posi��o"
                value={jogadorFiltro}
                onChange={(e) => setJogadorFiltro(e.target.value)}
                className="bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 min-w-[220px]"
              />
            </div>

            {jogadoresLoading && <p className="text-gray-400 text-sm">Carregando atletas...</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {jogadoresFiltrados.map((athlete) => {
                const key = athlete.id ?? athlete.slug ?? "";
                const selecionado = campeoesIndex.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleJogador(athlete)}
                    className={`text-left border rounded-lg p-3 transition ${
                      selecionado
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-100"
                        : "border-zinc-700 bg-zinc-800 text-gray-200 hover:border-yellow-500"
                    }`}
                  >
                    <div className="font-semibold text-sm">{athlete.name}</div>
                    <div className="text-xs text-gray-400">
                      {athlete.position ?? athlete.posicao}
                    </div>
                    {selecionado && <div className="text-xs mt-1">Selecionado</div>}
                  </button>
                );
              })}
            </div>

            {campeoesSelecionados.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-300 mb-2">
                  Campe�es que ser�o enviados ao backend:
                </p>
                <div className="flex flex-wrap gap-2">
                  {campeoesSelecionados.map((jogador) => (
                    <span
                      key={jogador.athleteId ?? jogador.athleteSlug}
                      className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {jogador.nome} ({jogador.posicao})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

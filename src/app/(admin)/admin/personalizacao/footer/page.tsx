// src/app/admin/personalizacao/footer/page.tsx
"use client";

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram, FaPlus, FaTimes, FaSave } from "react-icons/fa";
import { useFooterConfigAdmin } from "@/hooks/useFooterConfig";

type Plano =
  | "gratuito"
  | "mensal-essencial"
  | "anual-essencial"
  | "mensal-marketing"
  | "anual-marketing"
  | "mensal-enterprise"
  | "anual-enterprise";

const plano = "gratuito" as Plano; // Troque para "mensal-enterprise" para testar Enterprise
const isEnterprise = plano === "mensal-enterprise" || plano === "anual-enterprise";

const topicosPadrao = [
  { id: "ranking", label: "Sistema de Ranking" },
  { id: "premiacao", label: "Sistema de Premiacao" },
  { id: "balanceamento", label: "Sistema de Balanceamento" },
  { id: "como-funciona", label: "Como Funciona" },
  { id: "sobre", label: "Sobre o Fut7Pro" },
  { id: "termos", label: "Termos de Uso" },
  { id: "privacidade", label: "Politica de Privacidade" },
];

const defaultLegenda =
  "Fut7Pro, plataforma para organizar racha de Futebol 7, com sorteio inteligente de times e rankings automáticos.";
const defaultNomeCampo = "Arena Fut7Pro";
const defaultEnderecoCampo = "Rua do Futebol, 77 - Centro, Cidade/UF";
const defaultMapa = "https://maps.google.com/...";

const resolveValue = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

const normalizeTopicosOcultos = (items: string[]) => {
  const mapped = items.map((item) => {
    const found = topicosPadrao.find((topico) => topico.label === item);
    return found ? found.id : item;
  });
  return Array.from(new Set(mapped));
};

export default function FooterPersonalizacaoPage() {
  const { footer, update, isLoading } = useFooterConfigAdmin();

  const [topicosExtras, setTopicosExtras] = useState<string[]>([]);
  const [topicosOcultos, setTopicosOcultos] = useState<string[]>([]);
  const [novoTopico, setNovoTopico] = useState("");

  const [legenda, setLegenda] = useState(defaultLegenda);
  const [nomeCampo, setNomeCampo] = useState(defaultNomeCampo);
  const [enderecoCampo, setEnderecoCampo] = useState(defaultEnderecoCampo);
  const [linkGoogleMaps, setLinkGoogleMaps] = useState(defaultMapa);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!footer || initializedRef.current) return;

    setTopicosExtras(footer.topicosExtras ?? []);
    setTopicosOcultos(normalizeTopicosOcultos(footer.topicosOcultos ?? []));
    setLegenda(resolveValue(footer.legenda, defaultLegenda));
    setNomeCampo(resolveValue(footer.campo?.nome, defaultNomeCampo));
    setEnderecoCampo(resolveValue(footer.campo?.endereco, defaultEnderecoCampo));
    setLinkGoogleMaps(resolveValue(footer.campo?.mapa, defaultMapa));

    initializedRef.current = true;
  }, [footer]);

  const topicosVisiveis = useMemo(
    () =>
      topicosPadrao.filter(
        (topico) => !topicosOcultos.includes(topico.id) && !topicosOcultos.includes(topico.label)
      ),
    [topicosOcultos]
  );

  const podeAdicionar = topicosExtras.length < 2 && novoTopico.trim().length > 0;

  function adicionarTopico() {
    if (!podeAdicionar) return;
    const topico = novoTopico.trim();
    if (topicosExtras.includes(topico)) {
      setNovoTopico("");
      return;
    }
    setTopicosExtras([...topicosExtras, topico]);
    setNovoTopico("");
  }

  function removerTopico(idx: number) {
    setTopicosExtras(topicosExtras.filter((_, i) => i !== idx));
  }

  function removerPadrao(topicoId: string) {
    if (!isEnterprise) return;
    if (topicosOcultos.includes(topicoId)) return;
    setTopicosOcultos([...topicosOcultos, topicoId]);
  }

  function restaurarPadroes() {
    setTopicosOcultos([]);
  }

  async function handleSalvar() {
    setStatus("saving");
    setErro(null);
    try {
      const topicosOcultosNormalizados = normalizeTopicosOcultos(topicosOcultos);
      await update({
        legenda,
        campo: {
          nome: nomeCampo,
          endereco: enderecoCampo,
          mapa: linkGoogleMaps,
        },
        topicosExtras,
        topicosOcultos: topicosOcultosNormalizados,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      setErro(message);
      setStatus("error");
    }
  }

  return (
    <>
      <Head>
        <title>Personalizar Rodape | Admin Fut7Pro</title>
        <meta
          name="description"
          content="Personalize os topicos do rodape, legenda institucional e localizacao do campo oficial do seu racha no Fut7Pro."
        />
        <meta
          name="keywords"
          content="personalizar rodape, localizacao campo, footer Fut7Pro, SaaS racha futebol, painel admin"
        />
      </Head>
      <div className="w-full max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6">
          Configuracao do Rodape
        </h1>

        {/* Topicos editaveis */}
        <section className="mb-10">
          <h2 className="text-lg text-yellow-300 font-semibold mb-3">
            Topicos editaveis do rodape (direita)
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              maxLength={24}
              className="flex-1 rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white focus:outline-none"
              placeholder="Adicionar novo topico ao rodape"
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
              disabled={topicosExtras.length >= 2}
            />
            <button
              onClick={adicionarTopico}
              className="flex items-center gap-2 px-5 py-2 rounded bg-yellow-400 text-black font-bold transition hover:bg-yellow-300 disabled:opacity-50"
              disabled={!podeAdicionar}
            >
              <FaPlus /> Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {topicosVisiveis.map((topico) => (
              <div
                key={topico.id}
                className="bg-[#202328] text-yellow-100 px-4 py-2 rounded flex items-center gap-2 text-sm font-semibold"
              >
                {topico.label}
                {isEnterprise && (
                  <button
                    className="ml-2 hover:text-red-400"
                    onClick={() => removerPadrao(topico.id)}
                    title="Excluir topico padrao"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            {topicosExtras.map((topico, idx) => (
              <div
                key={topico}
                className="bg-[#23272F] text-yellow-200 px-4 py-2 rounded flex items-center gap-2 text-sm font-semibold"
              >
                {topico}
                <button
                  className="ml-2 hover:text-red-400"
                  onClick={() => removerTopico(idx)}
                  title="Remover topico"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-400 block">
              {topicosExtras.length >= 2
                ? "Limite maximo de 2 topicos adicionais atingido."
                : "Adicione ate 2 topicos extras personalizados."}
            </span>
            {topicosOcultos.length > 0 && (
              <button
                type="button"
                className="text-xs text-yellow-300 underline"
                onClick={restaurarPadroes}
              >
                Restaurar topicos padrao
              </button>
            )}
          </div>
        </section>

        {/* Informacoes do campo */}
        <section className="mb-10">
          <h2 className="text-lg text-yellow-300 font-semibold mb-2">
            Informacoes do campo no rodape
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Nome ou titulo do campo oficial
              </label>
              <input
                className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white"
                value={nomeCampo}
                onChange={(e) => setNomeCampo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Endereco do campo (aparece abaixo do titulo)
              </label>
              <input
                className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white"
                value={enderecoCampo}
                onChange={(e) => setEnderecoCampo(e.target.value)}
              />
            </div>
          </div>
          <label className="block text-gray-300 font-semibold mt-4 mb-1">
            Link do Google Maps (iframe/preview)
          </label>
          <input
            className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white"
            value={linkGoogleMaps}
            onChange={(e) => setLinkGoogleMaps(e.target.value)}
          />
        </section>

        {/* Redes sociais */}
        <section className="mb-6">
          <h2 className="text-lg text-yellow-300 font-semibold mb-2">Redes sociais</h2>
          <div className="flex gap-4 mt-2">
            <a
              href="https://www.facebook.com/profile.php?id=61581917656941"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:scale-110 transition"
            >
              <FaFacebookF size={32} />
            </a>
            <a
              href="https://wa.me/..."
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:scale-110 transition"
            >
              <FaWhatsapp size={32} />
            </a>
            <a
              href="https://www.instagram.com/fut7pro_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:scale-110 transition"
            >
              <FaInstagram size={32} />
            </a>
          </div>
          <span className="text-xs text-gray-400 block mt-1">
            (redes sociais editaveis em outra pagina)
          </span>
        </section>

        {/* Legenda institucional */}
        <section className="mb-6">
          <h2 className="text-lg text-yellow-300 font-semibold mb-2">
            Legenda institucional abaixo do logo
          </h2>
          <textarea
            className="w-full bg-[#181a1e] border border-yellow-800 rounded p-3 text-white resize-none"
            maxLength={120}
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            disabled={!isEnterprise}
            readOnly={!isEnterprise}
          />
          {!isEnterprise && (
            <span className="text-xs text-gray-400 block mt-1">
              Apenas no plano <b>Enterprise White Label</b> e possivel editar esta legenda.
            </span>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2 rounded bg-yellow-400 text-black font-bold transition hover:bg-yellow-300 disabled:opacity-60"
              onClick={handleSalvar}
              disabled={status === "saving" || isLoading}
            >
              <FaSave /> {status === "saving" ? "Salvando..." : "Salvar configuracoes"}
            </button>
            {status === "saved" && (
              <div className="bg-green-700 border-l-4 border-green-400 text-green-100 px-4 py-2 rounded flex items-center gap-2">
                <FaSave /> Configuracoes salvas com sucesso!
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-700 border-l-4 border-red-400 text-red-100 px-4 py-2 rounded">
                {erro || "Erro ao salvar."}
              </div>
            )}
          </div>
          {isLoading && (
            <span className="text-xs text-gray-400">Carregando configuracoes do rodape...</span>
          )}
        </div>
      </div>
    </>
  );
}

// src/app/admin/personalizacao/footer/page.tsx
"use client";

import Head from "next/head";
import { useState } from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram, FaPlus, FaTimes } from "react-icons/fa";

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
  "Sistema de Ranking",
  "Sistema de Premiações",
  "Sistema de Balanceamento",
  "Como Funciona",
  "Sobre o Fut7Pro",
  "Termos de Uso",
  "Política de Privacidade",
];

export default function FooterPersonalizacaoPage() {
  const [topicosExtras, setTopicosExtras] = useState<string[]>([]);
  const [novoTopico, setNovoTopico] = useState("");

  const podeAdicionar = topicosExtras.length < 2 && novoTopico.trim().length > 0;

  const [legenda, setLegenda] = useState(
    "Fut7Pro é o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos."
  );

  const [nomeCampo, setNomeCampo] = useState("Arena Fut7Pro");
  const [enderecoCampo, setEnderecoCampo] = useState("Rua do Futebol, 77 - Centro, Cidade/UF");
  const [linkGoogleMaps, setLinkGoogleMaps] = useState("https://maps.google.com/...");

  function adicionarTopico() {
    if (podeAdicionar) {
      setTopicosExtras([...topicosExtras, novoTopico.trim()]);
      setNovoTopico("");
    }
  }
  function removerTopico(idx: number) {
    setTopicosExtras(topicosExtras.filter((_, i) => i !== idx));
  }
  function removerPadrao(idx: number) {
    if (isEnterprise) {
      topicosPadrao.splice(idx, 1);
    }
  }

  return (
    <>
      <Head>
        <title>Personalizar Rodapé | Admin Fut7Pro</title>
        <meta
          name="description"
          content="Personalize os tópicos do rodapé, legenda institucional e localização do campo oficial do seu racha no Fut7Pro."
        />
        <meta
          name="keywords"
          content="personalizar rodapé, localização campo, footer Fut7Pro, SaaS racha futebol, painel admin"
        />
      </Head>
      <div className="w-full max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6">
          ⚙️ Configuração do Rodapé
        </h1>

        {/* Tópicos editáveis */}
        <section className="mb-10">
          <h2 className="text-lg text-yellow-300 font-semibold mb-3">
            Tópicos editáveis do rodapé (direita)
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              maxLength={24}
              className="flex-1 rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white focus:outline-none"
              placeholder="Adicionar novo tópico ao rodapé"
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
              disabled={topicosExtras.length >= 2}
            />
            <button
              onClick={adicionarTopico}
              className={`flex items-center gap-2 px-5 py-2 rounded bg-yellow-400 text-black font-bold transition hover:bg-yellow-300 disabled:opacity-50`}
              disabled={!podeAdicionar}
            >
              <FaPlus /> Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {topicosPadrao.map((topico, idx) => (
              <div
                key={topico}
                className="bg-[#202328] text-yellow-100 px-4 py-2 rounded flex items-center gap-2 text-sm font-semibold"
              >
                {topico}
                {isEnterprise && (
                  <button
                    className="ml-2 hover:text-red-400"
                    onClick={() => removerPadrao(idx)}
                    title="Excluir tópico padrão"
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
                  title="Remover tópico"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-2 block">
            {topicosExtras.length >= 2
              ? "Limite máximo de 2 tópicos adicionais atingido."
              : "Adicione até 2 tópicos extras personalizados."}
          </span>
        </section>

        {/* Informações do campo */}
        <section className="mb-10">
          <h2 className="text-lg text-yellow-300 font-semibold mb-2">
            Informações do campo no rodapé
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Nome ou título do campo oficial
              </label>
              <input
                className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white"
                value={nomeCampo}
                onChange={(e) => setNomeCampo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Endereço do campo (aparece abaixo do título)
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
              href="https://facebook.com"
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
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:scale-110 transition"
            >
              <FaInstagram size={32} />
            </a>
          </div>
          <span className="text-xs text-gray-400 block mt-1">
            (redes sociais editáveis em outra página)
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
              Apenas no plano <b>Enterprise White Label</b> é possível editar esta legenda.
            </span>
          )}
        </section>
      </div>
    </>
  );
}

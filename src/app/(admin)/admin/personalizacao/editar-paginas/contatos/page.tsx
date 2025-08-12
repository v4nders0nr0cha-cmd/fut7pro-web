"use client";

import Head from "next/head";
import * as React from "react";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaBuilding,
  FaSave,
} from "react-icons/fa";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

interface ContatosData {
  tituloPatrocinio: string;
  descricaoPatrocinio: string;
  email: string;
  whatsapp: string;
  endereco: string;
}

const MOCK_CONTATOS: ContatosData = {
  tituloPatrocinio: "Sua marca em destaque no nosso Racha",
  descricaoPatrocinio:
    "Empresas e patrocinadores podem divulgar sua marca nos jogos e eventos parceiros do Racha Fut7Pro, com exposição em banners, páginas e posts oficiais. Peça nosso Media Kit ou solicite mais informações pelo formulário ou pelos canais diretos!",
  email: "contato@fut7pro.com.br",
  whatsapp: "https://wa.me/5599999999999", // Link completo do WhatsApp
  endereco: "Racha Fut7pro – São Paulo/SP",
};

export default function EditarContatosPage() {
  const [contatos, setContatos] = React.useState<ContatosData>(MOCK_CONTATOS);
  const [msg, setMsg] = React.useState<string | null>(null);

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target;
    setContatos((prev) => ({ ...prev, [name]: value }));
    setMsg(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMsg("Alterações salvas com sucesso! (integração real em breve)");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <>
      <Head>
        <title>Editar Página: Contatos | Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Painel administrativo para personalizar os canais de contato, mídia e patrocínio do racha. Altere e-mail, WhatsApp, endereço e textos institucionais."
        />
        <meta
          name="keywords"
          content="editar contato, admin fut7pro, painel racha, patrocínio, e-mail, whatsapp, endereço, personalização"
        />
      </Head>
      <main className="max-w-3xl mx-auto pt-20 pb-24 md:pt-10 md:pb-10 px-4 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
          Editar Página: Contatos
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* Canais Diretos */}
          <section>
            <label className="font-bold text-yellow-300 mb-2">Canais Diretos</label>
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1">
                <label className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                  <FaEnvelope /> E-mail do racha
                </label>
                <input
                  type="email"
                  name="email"
                  value={contatos.email}
                  onChange={handleChange}
                  maxLength={80}
                  className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
                  placeholder="email@seudominio.com.br"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                  <FaWhatsapp /> WhatsApp Comercial (link completo)
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={contatos.whatsapp}
                  onChange={handleChange}
                  maxLength={80}
                  className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
            {/* Preview dos links */}
            <div className="flex flex-col gap-2 mt-2">
              <div>
                <a
                  href={`mailto:${contatos.email}`}
                  className="flex items-center gap-2 text-yellow-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaEnvelope /> {contatos.email || "email@seudominio.com.br"}
                </a>
              </div>
              <div>
                <a
                  href={contatos.whatsapp || "#"}
                  className="flex items-center gap-2 text-yellow-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> WhatsApp Comercial
                </a>
              </div>
              <div className="flex gap-4 mt-2 items-center">
                <span className="text-yellow-400 text-2xl">
                  <FaInstagram />
                </span>
                <span className="text-yellow-400 text-2xl">
                  <FaFacebook />
                </span>
                <span className="text-zinc-400 text-xs">
                  (redes sociais editáveis em outra página)
                </span>
              </div>
            </div>
          </section>

          {/* Endereço/Sede */}
          <section>
            <label className="font-bold text-yellow-300 mb-2">Endereço ou Sede</label>
            <input
              type="text"
              name="endereco"
              maxLength={120}
              value={contatos.endereco}
              onChange={handleChange}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
              placeholder="Ex: Racha Fut7pro – São Paulo/SP"
            />
          </section>

          {/* Bloco Patrocínio/Mídia */}
          <section>
            <label className="font-bold text-yellow-300 mb-2 flex items-center gap-2">
              <FaBuilding /> Título do Bloco Patrocínio/Mídia
            </label>
            <input
              type="text"
              name="tituloPatrocinio"
              maxLength={60}
              value={contatos.tituloPatrocinio}
              onChange={handleChange}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full mb-3 border border-neutral-700 focus:border-yellow-400"
            />
            <textarea
              name="descricaoPatrocinio"
              maxLength={600}
              value={contatos.descricaoPatrocinio}
              onChange={handleChange}
              rows={5}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400 min-h-[120px]"
            />
          </section>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition shadow-lg"
            >
              <FaSave /> Salvar Alterações
            </button>
          </div>
          {msg && <div className="text-center text-green-400 font-semibold py-2">{msg}</div>}
        </form>
      </main>
    </>
  );
}

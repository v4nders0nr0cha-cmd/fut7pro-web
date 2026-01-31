"use client";

import Head from "next/head";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaBuilding,
  FaSave,
} from "react-icons/fa";
import { useRacha } from "@/context/RachaContext";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useContatosAdmin } from "@/hooks/useContatos";
import type { ContatosConfig } from "@/types/contatos";
import { interpolateRachaName, resolveContatosConfig, resolveWhatsappLink } from "@/utils/contatos";

export default function EditarContatosPage() {
  const { tenantSlug } = useRacha();
  const { racha } = useRachaPublic(tenantSlug || "");
  const { contatos: contatosData, update, isLoading } = useContatosAdmin();
  const [contatos, setContatos] = useState<ContatosConfig>(() => resolveContatosConfig());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!contatosData || initializedRef.current) return;
    setContatos(resolveContatosConfig(contatosData));
    initializedRef.current = true;
  }, [contatosData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContatos((prev) => ({ ...prev, [name]: value }));
    setStatus("idle");
    setErro(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setErro(null);
    try {
      const payload = resolveContatosConfig(contatos);
      await update(payload);
      setContatos(payload);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      setErro(message);
      setStatus("error");
    }
  };

  const preview = resolveContatosConfig(contatos);
  const whatsappLink = resolveWhatsappLink(preview.whatsapp);
  const descricaoPreview = interpolateRachaName(preview.descricaoPatrocinio, racha?.nome);

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
                  value={contatos.email || ""}
                  onChange={handleChange}
                  maxLength={80}
                  className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
                  placeholder="seuemail@outlook.com"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                  <FaWhatsapp /> WhatsApp Comercial (link completo)
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={contatos.whatsapp || ""}
                  onChange={handleChange}
                  maxLength={120}
                  className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
                  placeholder="https://wa.me/5511999999999"
                />
              </div>
            </div>
            {/* Preview dos links */}
            <div className="flex flex-col gap-2 mt-2">
              {preview.email ? (
                <div>
                  <a
                    href={`mailto:${preview.email}`}
                    className="flex items-center gap-2 text-yellow-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaEnvelope /> {preview.email}
                  </a>
                </div>
              ) : (
                <div className="text-sm text-zinc-500 flex items-center gap-2">
                  <FaEnvelope /> E-mail não informado
                </div>
              )}
              {whatsappLink ? (
                <div>
                  <a
                    href={whatsappLink}
                    className="flex items-center gap-2 text-yellow-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp /> WhatsApp Comercial
                  </a>
                </div>
              ) : (
                <div className="text-sm text-zinc-500 flex items-center gap-2">
                  <FaWhatsapp /> WhatsApp não informado
                </div>
              )}
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
              maxLength={160}
              value={contatos.endereco || ""}
              onChange={handleChange}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400"
              placeholder="Ex: Racha Fut7Pro - São Paulo/SP"
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
              maxLength={80}
              value={contatos.tituloPatrocinio || ""}
              onChange={handleChange}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full mb-3 border border-neutral-700 focus:border-yellow-400"
            />
            <textarea
              name="descricaoPatrocinio"
              maxLength={800}
              value={contatos.descricaoPatrocinio || ""}
              onChange={handleChange}
              rows={5}
              className="bg-neutral-900 text-white rounded-lg p-3 w-full border border-neutral-700 focus:border-yellow-400 min-h-[120px]"
            />
            {racha?.nome && (
              <div className="mt-2 text-xs text-yellow-300">Prévia no site: {descricaoPreview}</div>
            )}
          </section>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition shadow-lg disabled:opacity-60"
              disabled={status === "saving" || isLoading}
            >
              <FaSave /> {status === "saving" ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
          {status === "saved" && (
            <div className="text-center text-green-400 font-semibold py-2">
              Alterações salvas com sucesso!
            </div>
          )}
          {status === "error" && (
            <div className="text-center text-red-400 font-semibold py-2">
              {erro || "Erro ao salvar alterações."}
            </div>
          )}
          {isLoading && (
            <div className="text-center text-zinc-400 text-sm">Carregando contatos...</div>
          )}
        </form>
      </main>
    </>
  );
}

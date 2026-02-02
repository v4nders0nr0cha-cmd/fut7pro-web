"use client";

import Head from "next/head";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaSave,
  FaTimes,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import { useSocialLinksAdmin } from "@/hooks/useSocialLinks";
import type { SocialLinksConfig } from "@/types/social-links";
import { normalizeSocialUrl, resolveSocialLinksConfig } from "@/utils/social-links";

type SocialField = {
  key: keyof SocialLinksConfig;
  label: string;
  icon: JSX.Element;
  placeholder: string;
  helper?: string;
};

const socialFields: SocialField[] = [
  {
    key: "facebookUrl",
    label: "Facebook",
    icon: <FaFacebookF size={26} className="text-blue-500" />,
    placeholder: "Link da página do Facebook",
  },
  {
    key: "whatsappGroupUrl",
    label: "WhatsApp (Grupo)",
    icon: <FaWhatsapp size={26} className="text-green-400" />,
    placeholder: "Link do grupo do WhatsApp (convite)",
    helper:
      'Aqui é o link do GRUPO do WhatsApp do racha (convite). Para WhatsApp comercial/contato direto, use a página Contatos em /admin/personalizacao/editar-paginas/contatos (campo "WhatsApp Comercial (link completo)").',
  },
  {
    key: "instagramUrl",
    label: "Instagram",
    icon: <FaInstagram size={26} className="text-pink-400" />,
    placeholder: "Link do Instagram",
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    icon: <FaYoutube size={26} className="text-red-500" />,
    placeholder: "Link do canal ou vídeo do YouTube",
  },
  {
    key: "websiteUrl",
    label: "Site",
    icon: <FaGlobe size={26} className="text-yellow-300" />,
    placeholder: "Link do site do racha",
  },
];

export default function RedesSociaisPage() {
  const { socialLinks, update, isLoading } = useSocialLinksAdmin();
  const [links, setLinks] = useState<SocialLinksConfig>(() => resolveSocialLinksConfig());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!socialLinks || initializedRef.current) return;
    setLinks(resolveSocialLinksConfig(socialLinks));
    initializedRef.current = true;
  }, [socialLinks]);

  const handleChange = (key: keyof SocialLinksConfig, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
    setErro(null);
  };

  const handleClear = (key: keyof SocialLinksConfig) => {
    setLinks((prev) => ({ ...prev, [key]: "" }));
    setStatus("idle");
    setErro(null);
  };

  const handleSalvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setErro(null);
    try {
      const payload = resolveSocialLinksConfig(links);
      await update(payload);
      setLinks(payload);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      setErro(message);
      setStatus("error");
    }
  };

  const getPreviewLink = (value?: string) => normalizeSocialUrl(value);

  return (
    <>
      <Head>
        <title>Redes Sociais | Admin Fut7Pro</title>
        <meta
          name="description"
          content="Adicione e personalize as redes sociais do seu racha para aparecerem no site Fut7Pro."
        />
        <meta
          name="keywords"
          content="redes sociais fut7pro, personalizar instagram, whatsapp, facebook, youtube, blog, painel admin futebol, SaaS racha"
        />
      </Head>
      <div className="w-full max-w-2xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6">
          🌐 Redes Sociais do Seu Racha
        </h1>
        <p className="text-gray-300 mb-8">
          Preencha os campos abaixo para exibir os ícones das redes sociais do seu racha no site.
          Deixe em branco para ocultar uma rede específica.
        </p>
        <form className="space-y-7" onSubmit={handleSalvar}>
          {socialFields.map((rede) => {
            const value = links[rede.key] || "";
            const previewLink = getPreviewLink(value);
            return (
              <div
                key={rede.key}
                className="flex flex-col gap-2 bg-[#202328] rounded-lg px-4 py-3 shadow"
              >
                <div className="flex items-center gap-3">
                  <span>{rede.icon}</span>
                  <input
                    type="text"
                    className="flex-1 rounded px-3 py-2 bg-[#181a1e] border border-yellow-800 text-white focus:outline-none"
                    placeholder={rede.placeholder}
                    value={value}
                    onChange={(e) => handleChange(rede.key, e.target.value)}
                    maxLength={180}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {value && previewLink && (
                    <a
                      href={previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline text-yellow-300 text-sm"
                      title="Visualizar"
                    >
                      Preview
                    </a>
                  )}
                  {value && (
                    <button
                      type="button"
                      className="ml-2 text-red-400 hover:text-red-600"
                      title="Remover rede social"
                      onClick={() => handleClear(rede.key)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {rede.helper && (
                  <p className="text-xs text-zinc-400 leading-relaxed">{rede.helper}</p>
                )}
              </div>
            );
          })}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded bg-yellow-400 text-black font-bold transition hover:bg-yellow-300 disabled:opacity-60"
              disabled={status === "saving" || isLoading}
            >
              <FaSave /> {status === "saving" ? "Salvando..." : "Salvar redes sociais"}
            </button>
          </div>
          {status === "saved" && (
            <div className="bg-green-700 border-l-4 border-green-400 text-green-100 px-4 py-2 rounded flex items-center gap-3 mt-2">
              <FaSave /> Redes sociais salvas com sucesso!
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-700 border-l-4 border-red-400 text-red-100 px-4 py-2 rounded flex items-center gap-3 mt-2">
              <FaTimes /> {erro || "Erro ao salvar redes sociais."}
            </div>
          )}
          {isLoading && (
            <div className="text-center text-zinc-400 text-sm">Carregando redes sociais...</div>
          )}
        </form>
      </div>
    </>
  );
}

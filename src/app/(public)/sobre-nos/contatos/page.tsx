"use client";

import Head from "next/head";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaBuilding,
  FaCheckCircle,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import { useRacha } from "@/context/RachaContext";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useContatosPublic } from "@/hooks/useContatos";
import { useSocialLinksPublic } from "@/hooks/useSocialLinks";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import { interpolateRachaName, resolveContatosConfig, resolveWhatsappLink } from "@/utils/contatos";
import { normalizeSocialUrl } from "@/utils/social-links";

type AssuntoValue = "patrocinio" | "anunciar" | "suporte" | "duvida" | "outros" | "";

const assuntoLabelMap: Record<Exclude<AssuntoValue, "">, string> = {
  patrocinio: "Patrocínio",
  anunciar: "Anunciar",
  suporte: "Suporte ao sistema",
  duvida: "Dúvidas gerais",
  outros: "Outros",
};

export default function ContatosPage() {
  const { tenantSlug } = useRacha();
  const pathname = usePathname() ?? "";
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const resolvedSlug = tenantSlug?.trim() || slugFromPath || "";
  const { contatos: contatosData, isLoading } = useContatosPublic(resolvedSlug);
  const { socialLinks } = useSocialLinksPublic(resolvedSlug);
  const { racha } = useRachaPublic(resolvedSlug);
  const contatos = useMemo(() => resolveContatosConfig(contatosData), [contatosData]);
  const whatsappLink = resolveWhatsappLink(contatos.whatsapp);
  const descricaoPatrocinio = useMemo(
    () => interpolateRachaName(contatos.descricaoPatrocinio, racha?.nome),
    [contatos.descricaoPatrocinio, racha?.nome]
  );
  const socialItems = useMemo(
    () => [
      {
        id: "instagram",
        label: "Instagram",
        href: normalizeSocialUrl(socialLinks?.instagramUrl),
        icon: <FaInstagram />,
      },
      {
        id: "facebook",
        label: "Facebook",
        href: normalizeSocialUrl(socialLinks?.facebookUrl),
        icon: <FaFacebook />,
      },
      {
        id: "youtube",
        label: "YouTube",
        href: normalizeSocialUrl(socialLinks?.youtubeUrl),
        icon: <FaYoutube />,
      },
      {
        id: "website",
        label: "Site",
        href: normalizeSocialUrl(socialLinks?.websiteUrl),
        icon: <FaGlobe />,
      },
      {
        id: "whatsapp",
        label: "WhatsApp (Grupo)",
        href: normalizeSocialUrl(socialLinks?.whatsappGroupUrl),
        icon: <FaWhatsapp />,
      },
    ],
    [socialLinks]
  );

  const socialVisible = useMemo(
    () => socialItems.filter((item) => Boolean(item.href)),
    [socialItems]
  );

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "" as AssuntoValue,
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.assunto || !form.mensagem) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    setEnviando(true);
    setErro(null);

    const assuntoLabel = form.assunto ? assuntoLabelMap[form.assunto] || form.assunto : "";

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome.trim(),
          email: form.email.trim(),
          phone: form.telefone.trim() || undefined,
          subject: assuntoLabel,
          message: form.mensagem.trim(),
          slug: resolvedSlug || undefined,
        }),
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem, tente novamente.");
      setEnviado(true);
      setForm({
        nome: "",
        email: "",
        telefone: "",
        assunto: "",
        mensagem: "",
      });
      setTimeout(() => setEnviado(false), 4000);
    } catch (err: any) {
      setErro(err?.message || "Erro desconhecido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Fale Conosco | Contato Fut7Pro</title>
        <meta
          name="description"
          content="Entre em contato para dúvidas, parcerias, patrocínios ou suporte ao sistema Fut7Pro – o maior SaaS para rachas de futebol 7."
        />
        <meta
          name="keywords"
          content="contato, suporte, patrocínio, anunciar, futebol 7, racha, fut7pro, sistema de racha"
        />
      </Head>

      <main className="w-full pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          {/* TÍTULO AMARELO */}
          <h1 className="text-2xl md:text-4xl font-bold text-center text-brand mb-3">
            Fale Conosco
          </h1>
          <p className="text-center text-zinc-300 mb-6">
            Quer ser parceiro, anunciar sua marca ou tirar dúvidas sobre o Racha Fut7Pro? Fale
            direto com a equipe responsável pela administração através das opções abaixo!
          </p>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 rounded-2xl shadow p-4 flex flex-col gap-3 mb-6"
          >
            <div>
              <label htmlFor="nome" className="font-semibold text-white">
                Nome da empresa ou pessoa *
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                maxLength={50}
                value={form.nome}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-700 rounded p-2 mt-1 text-white placeholder:text-zinc-400"
                placeholder="Digite seu nome ou empresa"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="font-semibold text-white">
                E-mail para retorno *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                maxLength={60}
                value={form.email}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-700 rounded p-2 mt-1 text-white placeholder:text-zinc-400"
                placeholder="nome@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="telefone" className="font-semibold text-white">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                name="telefone"
                id="telefone"
                maxLength={20}
                value={form.telefone}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-700 rounded p-2 mt-1 text-white placeholder:text-zinc-400"
                placeholder="(xx) xxxxx-xxxx"
              />
            </div>
            <div>
              <label htmlFor="assunto" className="font-semibold text-white">
                Assunto *
              </label>
              <select
                name="assunto"
                id="assunto"
                value={form.assunto}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-700 rounded p-2 mt-1 text-white"
                required
              >
                <option value="">Selecione</option>
                <option value="patrocinio">Patrocínio</option>
                <option value="anunciar">Anunciar</option>
                <option value="suporte">Suporte ao sistema</option>
                <option value="duvida">Dúvidas gerais</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label htmlFor="mensagem" className="font-semibold text-white">
                Mensagem *
              </label>
              <textarea
                name="mensagem"
                id="mensagem"
                rows={4}
                maxLength={1000}
                value={form.mensagem}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-700 rounded p-2 mt-1 text-white placeholder:text-zinc-400"
                placeholder="Digite sua mensagem"
                required
              />
            </div>
            {erro && <span className="text-brand text-sm">{erro}</span>}
            <button
              type="submit"
              className="bg-brand hover:bg-brand-strong text-black rounded-lg p-2 font-bold transition mt-2"
              disabled={enviando || enviado}
            >
              {enviando ? (
                <span className="flex items-center gap-2 justify-center animate-pulse">
                  <FaCheckCircle className="text-brand-strong" /> Enviando...
                </span>
              ) : enviado ? (
                <span className="flex items-center gap-2 justify-center">
                  <FaCheckCircle className="text-green-500" /> Enviado com sucesso!
                </span>
              ) : (
                "Enviar mensagem"
              )}
            </button>
          </form>

          {/* Canais diretos */}
          <div className="bg-neutral-900 rounded-2xl shadow p-4 flex flex-col gap-3 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">Canais Diretos</h2>
            {isLoading && !contatosData && (
              <span className="text-xs text-zinc-400">Carregando contatos...</span>
            )}
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              {contatos.email && (
                <a
                  href={`mailto:${contatos.email}`}
                  className="flex items-center gap-2 text-brand hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Enviar e-mail"
                >
                  <FaEnvelope /> {contatos.email}
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  className="flex items-center gap-2 text-brand hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar no WhatsApp"
                >
                  <FaWhatsapp /> WhatsApp Comercial
                </a>
              )}
            </div>
            {socialVisible.length > 0 && (
              <div className="flex gap-4 mt-2">
                {socialVisible.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="text-brand hover:text-white text-2xl"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Bloco Patrocínio e Mídia */}
          <div className="bg-neutral-950 border border-brand rounded-2xl shadow p-4 flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FaBuilding className="text-brand" />
              <h3 className="font-bold text-brand text-base md:text-lg">
                {contatos.tituloPatrocinio}
              </h3>
            </div>
            <p className="text-sm md:text-base text-white mb-1">{descricaoPatrocinio}</p>
          </div>

          {/* Endereço ou Sede */}
          <div className="text-center text-zinc-400 text-sm">{contatos.endereco}</div>
        </div>
      </main>
    </>
  );
}

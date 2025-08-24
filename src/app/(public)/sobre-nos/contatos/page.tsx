"use client";

import Head from "next/head";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";

export default function ContatosPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

      <main className="w-full pb-10 pt-20">
        <div className="mx-auto max-w-2xl px-4">
          {/* TÍTULO AMARELO */}
          <h1 className="mb-3 text-center text-2xl font-bold text-yellow-400 md:text-4xl">
            Fale Conosco
          </h1>
          <p className="mb-6 text-center text-zinc-300">
            Quer ser parceiro, anunciar sua marca ou tirar dúvidas sobre o Racha
            Fut7Pro? Fale direto com a equipe responsável pela administração
            através das opções abaixo!
          </p>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="mb-6 flex flex-col gap-3 rounded-2xl bg-neutral-900 p-4 shadow"
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
                className="mt-1 w-full rounded border border-zinc-700 bg-black p-2 text-white placeholder:text-zinc-400"
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
                className="mt-1 w-full rounded border border-zinc-700 bg-black p-2 text-white placeholder:text-zinc-400"
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
                className="mt-1 w-full rounded border border-zinc-700 bg-black p-2 text-white placeholder:text-zinc-400"
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
                className="mt-1 w-full rounded border border-zinc-700 bg-black p-2 text-white"
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
                className="mt-1 w-full rounded border border-zinc-700 bg-black p-2 text-white placeholder:text-zinc-400"
                placeholder="Digite sua mensagem"
                required
              />
            </div>
            {erro && <span className="text-sm text-yellow-400">{erro}</span>}
            <button
              type="submit"
              className="mt-2 rounded-lg bg-yellow-400 p-2 font-bold text-black transition hover:bg-yellow-500"
              disabled={enviando || enviado}
            >
              {enviando ? (
                <span className="flex animate-pulse items-center justify-center gap-2">
                  <FaCheckCircle className="text-yellow-500" /> Enviando...
                </span>
              ) : enviado ? (
                <span className="flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-500" /> Enviado com
                  sucesso!
                </span>
              ) : (
                "Enviar mensagem"
              )}
            </button>
          </form>

          {/* Canais diretos */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-neutral-900 p-4 shadow">
            <h2 className="mb-2 text-lg font-bold text-white md:text-xl">
              Canais Diretos
            </h2>
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              <a
                href="mailto:contato@fut7pro.com.br"
                className="flex items-center gap-2 text-yellow-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enviar e-mail"
              >
                <FaEnvelope /> contato@fut7pro.com.br
              </a>
              <a
                href="https://wa.me/5599999999999"
                className="flex items-center gap-2 text-yellow-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
              >
                <FaWhatsapp /> WhatsApp Comercial
              </a>
            </div>
            <div className="mt-2 flex gap-4">
              <a
                href="https://instagram.com/fut7pro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-2xl text-yellow-400 hover:text-white"
              >
                <FaInstagram />
              </a>
              <a
                href="https://facebook.com/fut7pro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-2xl text-yellow-400 hover:text-white"
              >
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Bloco Patrocínio e Mídia */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-yellow-400 bg-neutral-950 p-4 shadow">
            <div className="mb-1 flex items-center gap-2">
              <FaBuilding className="text-yellow-400" />
              <h3 className="text-base font-bold text-yellow-400 md:text-lg">
                Sua marca em destaque no nosso Racha
              </h3>
            </div>
            <p className="mb-1 text-sm text-white md:text-base">
              Empresas e patrocinadores podem divulgar sua marca nos jogos e
              eventos parceiros do Racha Fut7Pro, com exposição em banners,
              páginas e posts oficiais. Peça nosso Media Kit ou solicite mais
              informações pelo formulário ou pelos canais diretos!
            </p>
          </div>

          {/* Endereço ou Sede */}
          <div className="text-center text-sm text-zinc-400">
            Racha Fut7pro – São Paulo/SP
          </div>
        </div>
      </main>
    </>
  );
}

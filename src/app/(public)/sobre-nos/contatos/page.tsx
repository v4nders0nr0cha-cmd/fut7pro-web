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

      <main className="w-full pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          {/* TÍTULO AMARELO */}
          <h1 className="text-2xl md:text-4xl font-bold text-center text-yellow-400 mb-3">
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
            {erro && <span className="text-yellow-400 text-sm">{erro}</span>}
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg p-2 font-bold transition mt-2"
              disabled={enviando || enviado}
            >
              {enviando ? (
                <span className="flex items-center gap-2 justify-center animate-pulse">
                  <FaCheckCircle className="text-yellow-500" /> Enviando...
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
            <div className="flex gap-4 mt-2">
              <a
                href="https://www.instagram.com/fut7pro_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-yellow-400 hover:text-white text-2xl"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/Fut7Pro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-yellow-400 hover:text-white text-2xl"
              >
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Bloco Patrocínio e Mídia */}
          <div className="bg-neutral-950 border border-yellow-400 rounded-2xl shadow p-4 flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FaBuilding className="text-yellow-400" />
              <h3 className="font-bold text-yellow-400 text-base md:text-lg">
                Sua marca em destaque no nosso Racha
              </h3>
            </div>
            <p className="text-sm md:text-base text-white mb-1">
              Empresas e patrocinadores podem divulgar sua marca nos jogos e eventos parceiros do
              Racha Fut7Pro, com exposição em banners, páginas e posts oficiais. Peça nosso Media
              Kit ou solicite mais informações pelo formulário ou pelos canais diretos!
            </p>
          </div>

          {/* Endereço ou Sede */}
          <div className="text-center text-zinc-400 text-sm">Racha Fut7pro – São Paulo/SP</div>
        </div>
      </main>
    </>
  );
}

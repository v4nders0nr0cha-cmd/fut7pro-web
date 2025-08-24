"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaSave,
  FaTimes,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

type RedeNome = "facebook" | "whatsapp" | "instagram" | "youtube" | "blog";

interface RedeSocial {
  nome: RedeNome;
  label: string;
  icon: JSX.Element;
  placeholder: string;
  value: string;
}

const redesIniciais: RedeSocial[] = [
  {
    nome: "facebook",
    label: "Facebook",
    icon: <FaFacebookF size={26} className="text-blue-500" />,
    placeholder: "Link da página do Facebook",
    value: "",
  },
  {
    nome: "whatsapp",
    label: "WhatsApp",
    icon: <FaWhatsapp size={26} className="text-green-400" />,
    placeholder: "Número com DDD ou link wa.me",
    value: "",
  },
  {
    nome: "instagram",
    label: "Instagram",
    icon: <FaInstagram size={26} className="text-pink-400" />,
    placeholder: "Link do Instagram",
    value: "",
  },
  {
    nome: "youtube",
    label: "YouTube",
    icon: <FaYoutube size={26} className="text-red-500" />,
    placeholder: "Link do canal ou vídeo do YouTube",
    value: "",
  },
  {
    nome: "blog",
    label: "Blog/Site",
    icon: <FaGlobe size={26} className="text-yellow-300" />,
    placeholder: "Link do blog ou site do racha",
    value: "",
  },
];

export default function RedesSociaisPage() {
  const [redes, setRedes] = useState<RedeSocial[]>(redesIniciais);
  const [salvo, setSalvo] = useState(false);

  function handleChange(idx: number, value: string) {
    setRedes((redes) => {
      const arr = [...redes];
      arr[idx] = { ...arr[idx], value };
      return arr;
    });
    setSalvo(false);
  }

  function handleClear(idx: number) {
    setRedes((redes) => {
      const arr = [...redes];
      arr[idx] = { ...arr[idx], value: "" };
      return arr;
    });
    setSalvo(false);
  }

  function handleSalvar() {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  function getPreviewLink(rede: RedeSocial) {
    if (!rede.value) return "#";
    if (rede.nome === "whatsapp") {
      if (rede.value.startsWith("http")) return rede.value;
      const num = rede.value.replace(/\D/g, "");
      if (num.length >= 10) return `https://wa.me/${num}`;
      return "#";
    }
    return rede.value;
  }

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
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-2xl font-bold text-yellow-400 md:text-3xl">
          🌐 Redes Sociais do Seu Racha
        </h1>
        <p className="mb-8 text-gray-300">
          Preencha os campos abaixo para exibir os ícones das redes sociais do
          seu racha no site. Deixe em branco para ocultar uma rede específica.
        </p>
        <form className="space-y-7">
          {redes.map((rede, idx) => (
            <div
              key={rede.nome}
              className="flex items-center gap-3 rounded-lg bg-[#202328] px-4 py-3 shadow"
            >
              <span>{rede.icon}</span>
              <input
                type="text"
                className="flex-1 rounded border border-yellow-800 bg-[#181a1e] px-3 py-2 text-white focus:outline-none"
                placeholder={rede.placeholder}
                value={rede.value}
                onChange={(e) => handleChange(idx, e.target.value)}
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
              />
              {rede.value && (
                <a
                  href={getPreviewLink(rede)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-yellow-300 underline"
                  title="Visualizar"
                >
                  Preview
                </a>
              )}
              {rede.value && (
                <button
                  type="button"
                  className="ml-2 text-red-400 hover:text-red-600"
                  title="Remover rede social"
                  onClick={() => handleClear(idx)}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-yellow-400 px-6 py-2 font-bold text-black transition hover:bg-yellow-300"
              onClick={handleSalvar}
            >
              <FaSave /> Salvar redes sociais
            </button>
          </div>
          {salvo && (
            <div className="mt-2 flex items-center gap-3 rounded border-l-4 border-green-400 bg-green-700 px-4 py-2 text-green-100">
              <FaSave /> Redes sociais salvas com sucesso!
            </div>
          )}
        </form>
      </div>
    </>
  );
}

"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaRegThumbsUp, FaShareAlt, FaDownload, FaMapMarkedAlt, FaMedal } from "react-icons/fa";
import { useAboutPublic } from "@/hooks/useAbout";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

export default function NossaHistoriaPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { publicHref } = usePublicLinks();
  const { about } = useAboutPublic(slug);
  const { racha } = useRachaPublic(slug);
  const { rankings: rankingGeral } = usePublicPlayerRankings({
    slug,
    type: "geral",
    period: "all",
    limit: 50,
  });
  const data = about || {};

  const marcos = data.marcos || [];
  const curiosidades = data.curiosidades || [];
  const depoimentos = data.depoimentos || [];
  const categoriasFotos = data.categoriasFotos || [];
  const videos = data.videos || [];
  const camposHistoricos = data.camposHistoricos || [];
  const campoAtual = data.campoAtual
    ? { ...data.campoAtual, tipo: "Atual", cor: "text-green-400", tag: "text-xs text-green-300" }
    : null;
  const todosCampos = [
    ...camposHistoricos.map((campo) => ({
      ...campo,
      tipo: "Historico",
      cor: "text-brand-soft",
      tag: "text-xs text-neutral-400",
    })),
    ...(campoAtual ? [campoAtual] : []),
  ];
  const membrosAntigos = [...rankingGeral]
    .sort((a, b) => (b.jogos ?? 0) - (a.jogos ?? 0) || (b.pontos ?? 0) - (a.pontos ?? 0))
    .slice(0, 5);
  const campeoesHistoricos = [...rankingGeral]
    .sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0) || (b.jogos ?? 0) - (a.jogos ?? 0))
    .slice(0, 5);

  const diretoria = (() => {
    const admins = (racha?.admins ?? []).filter((admin) => admin.status !== "inativo");
    if (!admins.length) return [];
    const resolveName = (admin: (typeof admins)[number]) =>
      admin.nome?.trim() || admin.email?.trim() || "Administrador";
    const resolvePhoto = () => DEFAULT_AVATAR;
    const byRole = (role: string) => admins.find((admin) => admin.role === role);
    const presidente = byRole("presidente") ?? admins[0];

    const mapped: { nome: string; cargo: string; foto?: string }[] = [];
    if (presidente) {
      mapped.push({ nome: resolveName(presidente), cargo: "Presidente", foto: resolvePhoto() });
    }

    const vice = byRole("vicepresidente");
    if (vice) {
      mapped.push({ nome: resolveName(vice), cargo: "Vice-Presidente", foto: resolvePhoto() });
    }

    const diretorFutebol = byRole("diretorfutebol");
    if (diretorFutebol) {
      mapped.push({
        nome: resolveName(diretorFutebol),
        cargo: "Diretor de Futebol",
        foto: resolvePhoto(),
      });
    }

    const diretorFinanceiro = byRole("diretorfinanceiro");
    if (diretorFinanceiro) {
      mapped.push({
        nome: resolveName(diretorFinanceiro),
        cargo: "Diretor Financeiro",
        foto: resolvePhoto(),
      });
    }

    return mapped;
  })();

  const handleDownload = () => {
    alert("Funcao de download/compartilhar ainda nao implementada.");
  };

  return (
    <>
      <Head>
        <title>Nossa Historia | Sobre Nos | Fut7Pro</title>
        <meta
          name="description"
          content="Linha do tempo, fotos, videos, curiosidades e depoimentos sobre a historia do racha. Conteudo dinamicado por tenant."
        />
      </Head>
      <main className="w-full flex flex-col gap-10 pt-20">
        <section className="w-full max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-brand mb-4">Nossa Historia</h1>
          <p className="text-white text-base md:text-lg mb-4">
            {data.descricao ||
              "Conte sua origem, missao e marcos do racha. Edite no painel para personalizar por tenant."}
          </p>
        </section>

        <section className="w-full max-w-5xl mx-auto px-4 flex flex-wrap gap-4 mb-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand text-black font-bold px-4 py-2 rounded-xl hover:brightness-110 transition"
          >
            <FaDownload /> Baixar Linha do Tempo
          </button>
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({ title: "Nossa Historia - Fut7Pro", url: window.location.href })
                : handleDownload()
            }
            className="flex items-center gap-2 bg-neutral-800 text-brand font-bold px-4 py-2 rounded-xl hover:bg-neutral-700 transition"
          >
            <FaShareAlt /> Compartilhar Historia
          </button>
        </section>

        {marcos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Linha do Tempo</h2>
            <div className="space-y-6 relative border-l-4 border-brand pl-8">
              {marcos.map((marco, idx) => (
                <div
                  key={`${marco.ano}-${idx}`}
                  className="relative flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 group"
                >
                  <div className="absolute -left-9 md:-left-11 bg-brand text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-md border-4 border-black">
                    {marco.ano?.substring(2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{marco.titulo}</span>
                      {marco.conquista && <span className="text-2xl ml-1">{marco.conquista}</span>}
                    </div>
                    <div className="text-neutral-300 text-sm">{marco.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {categoriasFotos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Galeria de Fotos</h2>
            <div className="flex flex-wrap gap-6">
              {categoriasFotos.map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="font-bold text-white mb-2">{cat.nome}</div>
                  <div className="flex flex-wrap gap-4">
                    {cat.fotos?.map((foto, i) => (
                      <div
                        key={i}
                        className="bg-neutral-800 rounded-xl p-2 shadow-md w-40 flex flex-col items-center"
                      >
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          width={140}
                          height={100}
                          className="rounded-lg object-cover w-full h-[100px]"
                        />
                        <span className="text-xs text-neutral-300 mt-2">{foto.alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Videos Historicos</h2>
            <div className="flex flex-wrap gap-6">
              {videos.map((video, idx) => (
                <div
                  key={idx}
                  className="w-full md:w-1/2 aspect-video bg-neutral-800 rounded-xl overflow-hidden"
                >
                  <iframe
                    src={video.url}
                    title={video.titulo}
                    allowFullScreen
                    className="w-full h-full min-h-[200px] rounded-xl"
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        {curiosidades.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Curiosidades do Racha</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curiosidades
                .slice()
                .sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))
                .map((item, idx) => (
                  <li
                    key={idx}
                    className="bg-neutral-900 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">{item.icone}</span>
                    <span className="text-white flex-1">{item.texto}</span>
                    <button
                      title="Curtir curiosidade"
                      className="flex items-center gap-1 text-brand hover:text-brand-soft"
                    >
                      <FaRegThumbsUp /> {item.curtidas ?? 0}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {depoimentos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4">Depoimentos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {depoimentos.map((dep, idx) => (
                <div
                  key={idx}
                  className={`bg-neutral-900 rounded-2xl p-4 flex flex-col items-center ${dep.destaque ? "border-2 border-brand" : ""}`}
                >
                  {dep.foto && (
                    <Image
                      src={dep.foto}
                      alt={dep.nome}
                      width={64}
                      height={64}
                      className="rounded-full mb-2 border-2 border-brand"
                    />
                  )}
                  <div className="italic text-neutral-200 text-center mb-2">{dep.texto}</div>
                  <div className="text-brand-soft font-semibold">{dep.nome}</div>
                  <div className="text-neutral-400 text-xs">{dep.cargo}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {todosCampos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4 flex items-center gap-2">
              <FaMapMarkedAlt /> Campos Historicos e Atual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todosCampos.map((campo, idx) => (
                <div key={idx} className="bg-neutral-900 rounded-xl p-3 flex flex-col">
                  <div className={`font-bold mb-2 ${campo.cor}`}>
                    {campo.nome} <span className={campo.tag}>({campo.tipo})</span>
                  </div>
                  {campo.endereco && (
                    <div className="text-neutral-300 text-xs mb-2">Endereço: {campo.endereco}</div>
                  )}
                  <iframe
                    src={campo.mapa}
                    width="100%"
                    height="220"
                    loading="lazy"
                    className="rounded-xl mb-2 border-0"
                    allowFullScreen
                  ></iframe>
                  <div className="text-white text-sm">{campo.descricao}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {membrosAntigos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-soft mb-4 flex items-center gap-2">
              <FaMedal /> Membros Mais Antigos
            </h2>
            <div className="flex flex-wrap gap-4">
              {membrosAntigos.map((membro, idx) => (
                <Link
                  href={publicHref(`/atletas/${membro.slug}`)}
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-36 hover:border-brand border border-neutral-700"
                >
                  <Image
                    src={membro.foto || DEFAULT_AVATAR}
                    alt={membro.nome}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-brand mb-2"
                  />
                  <div className="font-semibold text-white text-center">{membro.nome}</div>
                  <div className="text-brand text-xs">Assiduidade</div>
                  <div className="text-neutral-300 text-xs">{membro.jogos} jogos</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {campeoesHistoricos.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand mb-4 flex items-center gap-2">
              <FaMedal className="text-brand" /> Campeoes Historicos (Top 5 Pontuadores de todos os
              tempos)
            </h2>
            <div className="flex flex-wrap gap-4">
              {campeoesHistoricos.map((jogador, idx) => (
                <Link
                  href={publicHref(`/atletas/${jogador.slug}`)}
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-40 hover:border-brand border border-neutral-700 transition"
                >
                  <div className="text-brand-soft text-lg font-extrabold mb-1">#{idx + 1}</div>
                  {jogador.foto && (
                    <Image
                      src={jogador.foto}
                      alt={jogador.nome}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-brand mb-2"
                    />
                  )}
                  <div className="font-semibold text-white text-center">{jogador.nome}</div>
                  <div className="text-brand text-xs mb-1">{jogador.posicao}</div>
                  <div className="text-brand-soft text-base font-bold">{jogador.pontos} pts</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {diretoria.length > 0 && (
          <section className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand mb-4 mt-10 flex items-center gap-2">
              <FaMedal className="text-brand" /> Presidencia e Diretoria
            </h2>
            <div className="flex flex-wrap gap-4">
              {diretoria.map((membro, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center w-48 hover:border-brand border border-neutral-700 transition"
                >
                  {membro.foto && (
                    <Image
                      src={membro.foto}
                      alt={membro.nome}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-brand mb-2"
                    />
                  )}
                  <div className="font-semibold text-white text-center">{membro.nome}</div>
                  <div className="text-brand text-sm font-bold text-center">{membro.cargo}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

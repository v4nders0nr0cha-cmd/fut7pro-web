"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  FaRegThumbsUp,
  FaShareAlt,
  FaDownload,
  FaMapMarkedAlt,
  FaMedal,
} from "react-icons/fa";

// MOCKS (colados completos):

const categoriasFotos: {
  nome: string;
  fotos: { src: string; alt: string }[];
}[] = [
  {
    nome: "Fundação",
    fotos: [
      {
        src: "/images/historia/foto_antiga_01.png",
        alt: "Primeiro time do Racha Fut7Pro",
      },
      {
        src: "/images/historia/foto_antiga_02.png",
        alt: "Primeiro gol registrado do racha",
      },
    ],
  },
  {
    nome: "Torneios",
    fotos: [
      {
        src: "/images/historia/foto_antiga_03.png",
        alt: "Primeiro campeonato interno",
      },
    ],
  },
  {
    nome: "Confraternizações",
    fotos: [
      {
        src: "/images/historia/foto_antiga_04.png",
        alt: "Churrasco de final de ano",
      },
    ],
  },
];

const marcos: {
  ano: string;
  titulo: string;
  descricao: string;
  conquista: string;
}[] = [
  {
    ano: "2018",
    titulo: "Fundação do Racha Fut7Pro",
    descricao:
      "Em junho de 2018, um grupo de amigos se reuniu para o primeiro racha oficial. Nascia ali o Racha Fut7Pro.",
    conquista: "🏅",
  },
  {
    ano: "2019",
    titulo: "Primeiro Gol Registrado",
    descricao:
      "Pedro Oliveira marcou o primeiro gol registrado oficialmente. Um momento histórico!",
    conquista: "⚽",
  },
  {
    ano: "2020",
    titulo: "Primeiro Campeonato Interno",
    descricao:
      "O time Leões venceu o primeiro torneio interno entre os 6 times fundados.",
    conquista: "🏆",
  },
  {
    ano: "2022",
    titulo: "Criação do Sistema Fut7Pro",
    descricao:
      "Digitalizamos o ranking, partidas e história do racha. Mais organização, mais evolução.",
    conquista: "",
  },
  {
    ano: "2023",
    titulo: "Expansão e Novos Patrocinadores",
    descricao:
      "O racha dobrou de tamanho, tornou-se referência e ganhou patrocinadores regionais.",
    conquista: "💰",
  },
];

const curiosidades: {
  icone: string;
  texto: string;
  curtidas: number;
  autor: string;
  data: string;
}[] = [
  {
    icone: "⚽",
    texto: "O primeiro gol foi de cabeça após escanteio.",
    curtidas: 9,
    autor: "Carlos",
    data: "2018-06-10",
  },
  {
    icone: "🏟️",
    texto: "Já tivemos um cachorro invadindo o campo durante a final.",
    curtidas: 7,
    autor: "Rafael",
    data: "2019-08-03",
  },
  {
    icone: "🟨",
    texto: "O cartão amarelo mais rápido saiu aos 15 segundos.",
    curtidas: 12,
    autor: "Lucas",
    data: "2020-03-15",
  },
];

const depoimentos: {
  nome: string;
  cargo: string;
  texto: string;
  foto: string;
  destaque: boolean;
  audio: string | null;
}[] = [
  {
    nome: "Vanderson Rocha",
    cargo: "Fundador",
    texto:
      "“Ver o Racha Fut7Pro crescer é motivo de orgulho. Somos uma família!”",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    destaque: true,
    audio: null,
  },
  {
    nome: "Rafael Matos",
    cargo: "Veterano",
    texto:
      "“Nunca perdi um jogo desde a fundação. Aqui vivi grandes momentos.”",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    destaque: false,
    audio: null,
  },
];

const videos: { titulo: string; url: string }[] = [
  {
    titulo: "Gol Mais Bonito de 2022",
    url: "https://www.youtube.com/embed/uSUeYncjhXU",
  },
];

const camposHistoricos: { nome: string; mapa: string; descricao: string }[] = [
  {
    nome: "Campo Jardim União",
    mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.073713482226!2d-43.20937268504163!3d-22.90244928501295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997f5b3ce43b09%3A0x5296e6ac24514bbd!2sCampo%20de%20Futebol%20Jardim%20Uni%C3%A3o!5e0!3m2!1spt-BR!2sbr!4v1687466554214!5m2!1spt-BR!2sbr",
    descricao: "Onde tudo começou em 2018.",
  },
];

const campoAtual = {
  nome: "Arena Central Fut7Pro",
  mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.7854290502484!2d-46.65301768440736!3d-23.577971368479876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c3a2ff23a3%3A0x8b7ba3c3e9e8b4db!2sParque%20Ibirapuera!5e0!3m2!1spt-BR!2sbr!4v1687466554214!5m2!1spt-BR!2sbr",
  descricao: "Campo oficial atual do Racha Fut7Pro.",
};

const todosCampos: {
  nome: string;
  mapa: string;
  descricao: string;
  tipo: string;
  cor: string;
  tag: string;
}[] = [
  ...camposHistoricos.map((campo) => ({
    ...campo,
    tipo: "Histórico",
    cor: "text-yellow-300",
    tag: "text-xs text-neutral-400",
  })),
  {
    ...campoAtual,
    tipo: "Atual",
    cor: "text-green-400",
    tag: "text-xs text-green-300",
  },
];

const membrosAntigos: {
  nome: string;
  status: string;
  desde: number;
  foto: string;
}[] = [
  {
    nome: "Vanderson Rocha",
    status: "Fundador",
    desde: 2018,
    foto: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    nome: "Rafael Matos",
    status: "Veterano",
    desde: 2018,
    foto: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    nome: "Lucas Souza",
    status: "Veterano",
    desde: 2019,
    foto: "/images/jogadores/jogador_padrao_03.jpg",
  },
  {
    nome: "Matheus Silva",
    status: "Veterano",
    desde: 2019,
    foto: "/images/jogadores/jogador_padrao_04.jpg",
  },
  {
    nome: "Daniel Ribeiro",
    status: "Veterano",
    desde: 2020,
    foto: "/images/jogadores/jogador_padrao_05.jpg",
  },
];

const campeoesHistoricos: {
  nome: string;
  slug: string;
  foto: string;
  pontos: number;
  posicao: string;
}[] = [
  {
    nome: "Matheus Silva",
    slug: "matheus-silva",
    foto: "/images/jogadores/jogador_padrao_04.jpg",
    pontos: 2200,
    posicao: "Meia",
  },
  {
    nome: "Vanderson Rocha",
    slug: "vanderson-rocha",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    pontos: 2100,
    posicao: "Atacante",
  },
  {
    nome: "Rafael Matos",
    slug: "rafael-matos",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    pontos: 2070,
    posicao: "Atacante",
  },
  {
    nome: "Lucas Souza",
    slug: "lucas-souza",
    foto: "/images/jogadores/jogador_padrao_03.jpg",
    pontos: 2005,
    posicao: "Zagueiro",
  },
  {
    nome: "Daniel Ribeiro",
    slug: "daniel-ribeiro",
    foto: "/images/jogadores/jogador_padrao_05.jpg",
    pontos: 1988,
    posicao: "Goleiro",
  },
];

const diretoria: { nome: string; cargo: string; foto: string }[] = [
  {
    nome: "Vanderson Rocha",
    cargo: "Presidente",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    nome: "Matheus Silva",
    cargo: "Vice-Presidente",
    foto: "/images/jogadores/jogador_padrao_04.jpg",
  },
  {
    nome: "Rafael Matos",
    cargo: "Diretor de Futebol",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    nome: "Daniel Ribeiro",
    cargo: "Diretor Financeiro",
    foto: "/images/jogadores/jogador_padrao_05.jpg",
  },
];

// --------------- COMPONENTE PRINCIPAL ---------------

export default function NossaHistoriaPage() {
  const handleDownload = () => {
    alert("Função de download/compartilhar ainda não implementada.");
  };

  return (
    <>
      <Head>
        <title>Nossa História | Sobre Nós | Fut7Pro</title>
        <meta
          name="description"
          content="Linha do tempo, fotos, vídeos, curiosidades e depoimentos sobre a história do racha. Exemplo pronto para personalizar e destacar o legado do seu grupo."
        />
        <meta
          name="keywords"
          content="história do racha, origem, linha do tempo, fotos antigas, vídeos, curiosidades, depoimentos, futebol 7, racha fut7pro, fut7pro"
        />
      </Head>
      <main className="flex w-full flex-col gap-10 pt-20">
        <section className="mx-auto w-full max-w-5xl px-4">
          <h1 className="mb-4 text-3xl font-bold text-yellow-400 md:text-4xl">
            Nossa História
          </h1>
          <p className="mb-4 text-base text-white md:text-lg">
            O Racha Fut7Pro nasceu em 2018 da amizade e da paixão pelo futebol.
            Fundado por Vanderson Rocha, o racha começou pequeno, mas logo se
            tornou referência. Nossa história é feita de gols, amizade, tradição
            e momentos inesquecíveis — sempre com espírito esportivo e união!
          </p>
        </section>

        {/* Botões de compartilhar e download */}
        <section className="mx-auto mb-2 flex w-full max-w-5xl flex-wrap gap-4 px-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-bold text-black transition hover:brightness-110"
          >
            <FaDownload /> Baixar Linha do Tempo
          </button>
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({
                    title: "Nossa História - Fut7Pro",
                    url: window.location.href,
                  })
                : handleDownload()
            }
            className="flex items-center gap-2 rounded-xl bg-neutral-800 px-4 py-2 font-bold text-yellow-400 transition hover:bg-neutral-700"
          >
            <FaShareAlt /> Compartilhar História
          </button>
        </section>

        {/* Linha do Tempo Interativa */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-yellow-300">
            Linha do Tempo
          </h2>
          <div className="relative space-y-6 border-l-4 border-yellow-400 pl-8">
            {marcos.map((marco: (typeof marcos)[0], idx: number) => (
              <div
                key={marco.ano}
                className="group relative flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-4"
              >
                <div className="absolute -left-9 flex h-8 w-8 items-center justify-center rounded-full border-4 border-black bg-yellow-400 text-lg font-bold text-black shadow-md md:-left-11">
                  {marco.ano.substring(2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {marco.titulo}
                    </span>
                    {marco.conquista && (
                      <span className="ml-1 text-2xl">{marco.conquista}</span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {marco.descricao}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galeria de Fotos por Categoria */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-yellow-300">
            Galeria de Fotos
          </h2>
          <div className="flex flex-wrap gap-6">
            {categoriasFotos.map(
              (cat: (typeof categoriasFotos)[0], idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="mb-2 font-bold text-white">{cat.nome}</div>
                  <div className="flex flex-wrap gap-4">
                    {cat.fotos.map((foto: (typeof cat.fotos)[0], i: number) => (
                      <div
                        key={i}
                        className="flex w-40 flex-col items-center rounded-xl bg-neutral-800 p-2 shadow-md"
                      >
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          width={140}
                          height={100}
                          className="h-[100px] w-full rounded-lg object-cover"
                        />
                        <span className="mt-2 text-xs text-neutral-300">
                          {foto.alt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Vídeos Históricos */}
        {videos.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4">
            <h2 className="mb-4 text-2xl font-bold text-yellow-300">
              Vídeos Históricos
            </h2>
            <div className="flex flex-wrap gap-6">
              {videos.map((video: (typeof videos)[0], idx: number) => (
                <div
                  key={idx}
                  className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-800 md:w-1/2"
                >
                  <iframe
                    src={video.url}
                    title={video.titulo}
                    allowFullScreen
                    className="h-full min-h-[200px] w-full rounded-xl"
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curiosidades Dinâmicas */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-yellow-300">
            Curiosidades do Racha
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {curiosidades
              .sort(
                (a: (typeof curiosidades)[0], b: (typeof curiosidades)[0]) =>
                  b.curtidas - a.curtidas,
              )
              .map((item: (typeof curiosidades)[0], idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3"
                >
                  <span className="text-2xl">{item.icone}</span>
                  <span className="flex-1 text-white">{item.texto}</span>
                  <button
                    title="Curtir curiosidade"
                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
                  >
                    <FaRegThumbsUp /> {item.curtidas}
                  </button>
                </li>
              ))}
          </ul>
        </section>

        {/* Depoimentos em Destaque */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-yellow-300">
            Depoimentos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {depoimentos.map((dep: (typeof depoimentos)[0], idx: number) => (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-2xl bg-neutral-900 p-4 ${dep.destaque ? "border-2 border-yellow-400" : ""}`}
              >
                <Image
                  src={dep.foto}
                  alt={dep.nome}
                  width={64}
                  height={64}
                  className="mb-2 rounded-full border-2 border-yellow-400"
                />
                <div className="mb-2 text-center italic text-neutral-200">
                  {dep.texto}
                </div>
                <div className="font-semibold text-yellow-300">{dep.nome}</div>
                <div className="text-xs text-neutral-400">{dep.cargo}</div>
                {dep.audio && (
                  <audio controls className="mt-2 w-full">
                    <source src={dep.audio} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Campos Históricos e Atual em Grid */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-yellow-300">
            <FaMapMarkedAlt /> Campos Históricos e Atual
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {todosCampos.map((campo: (typeof todosCampos)[0], idx: number) => (
              <div
                key={idx}
                className="flex flex-col rounded-xl bg-neutral-900 p-3"
              >
                <div className={`mb-2 font-bold ${campo.cor}`}>
                  {campo.nome} <span className={campo.tag}>({campo.tipo})</span>
                </div>
                <iframe
                  src={campo.mapa}
                  width="100%"
                  height="220"
                  loading="lazy"
                  className="mb-2 rounded-xl border-0"
                  allowFullScreen
                ></iframe>
                <div className="text-sm text-white">{campo.descricao}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Membros Mais Antigos */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-yellow-300">
            <FaMedal /> Membros Mais Antigos
          </h2>
          <div className="flex flex-wrap gap-4">
            {membrosAntigos
              .slice(0, 5)
              .map((membro: (typeof membrosAntigos)[0], idx: number) => (
                <Link
                  href={`/atletas/${membro.nome.toLowerCase().replace(/\s/g, "-")}`}
                  key={idx}
                  className="flex w-36 flex-col items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4 hover:border-yellow-400"
                >
                  <Image
                    src={membro.foto}
                    alt={membro.nome}
                    width={60}
                    height={60}
                    className="mb-2 rounded-full border-2 border-yellow-400"
                  />
                  <div className="text-center font-semibold text-white">
                    {membro.nome}
                  </div>
                  <div className="text-xs text-yellow-400">{membro.status}</div>
                  <div className="text-xs text-neutral-300">
                    Desde {membro.desde}
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Campeões Históricos */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-yellow-400">
            <FaMedal className="text-yellow-400" /> Campeões Históricos (Top 5
            Pontuadores de todos os tempos)
          </h2>
          <div className="flex flex-wrap gap-4">
            {campeoesHistoricos.map(
              (jogador: (typeof campeoesHistoricos)[0], idx: number) => (
                <Link
                  href={`/atletas/${jogador.slug}`}
                  key={idx}
                  className="flex w-40 flex-col items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4 transition hover:border-yellow-400"
                >
                  <div className="mb-1 text-lg font-extrabold text-yellow-300">
                    #{idx + 1}
                  </div>
                  <Image
                    src={jogador.foto}
                    alt={jogador.nome}
                    width={64}
                    height={64}
                    className="mb-2 rounded-full border-2 border-yellow-400"
                  />
                  <div className="text-center font-semibold text-white">
                    {jogador.nome}
                  </div>
                  <div className="mb-1 text-xs text-yellow-400">
                    {jogador.posicao}
                  </div>
                  <div className="text-base font-bold text-yellow-300">
                    {jogador.pontos} pts
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Presidência e Diretoria */}
        <section className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-4 mt-10 flex items-center gap-2 text-2xl font-bold text-yellow-400">
            <FaMedal className="text-yellow-400" /> Presidência e Diretoria
          </h2>
          <div className="flex flex-wrap gap-4">
            {diretoria.map((membro: (typeof diretoria)[0], idx: number) => (
              <div
                key={idx}
                className="flex w-48 flex-col items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4 transition hover:border-yellow-400"
              >
                <Image
                  src={membro.foto}
                  alt={membro.nome}
                  width={64}
                  height={64}
                  className="mb-2 rounded-full border-2 border-yellow-400"
                />
                <div className="text-center font-semibold text-white">
                  {membro.nome}
                </div>
                <div className="text-center text-sm font-bold text-yellow-400">
                  {membro.cargo}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

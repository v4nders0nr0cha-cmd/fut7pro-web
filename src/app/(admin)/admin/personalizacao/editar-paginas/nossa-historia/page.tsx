"use client";

import Head from "next/head";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FaPlus, FaTrash, FaMapMarkedAlt, FaMedal, FaSave } from "react-icons/fa";
import Image from "next/image";

// Scrollbar dark global
const scrollbarStyle = `
  ::-webkit-scrollbar { width: 8px; background: #111; }
  ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #333; }
`;

const JOGADORES_CADASTRADOS = [
  { id: "1", nome: "Vanderson Rocha", foto: "/images/jogadores/jogador_padrao_01.jpg" },
  { id: "2", nome: "Rafael Matos", foto: "/images/jogadores/jogador_padrao_02.jpg" },
  { id: "3", nome: "Lucas Souza", foto: "/images/jogadores/jogador_padrao_03.jpg" },
  { id: "4", nome: "Matheus Silva", foto: "/images/jogadores/jogador_padrao_04.jpg" },
  { id: "5", nome: "Daniel Ribeiro", foto: "/images/jogadores/jogador_padrao_05.jpg" },
  { id: "6", nome: "Pedro Oliveira", foto: "/images/jogadores/jogador_padrao_06.jpg" },
];

interface Marco {
  ano: string;
  titulo: string;
  descricao: string;
  conquista?: string;
}
interface Foto {
  src: string;
  alt: string;
}
interface CategoriaFoto {
  nome: string;
  fotos: Foto[];
}
interface Video {
  titulo: string;
  url: string;
}
interface Curiosidade {
  icone: string;
  texto: string;
  curtidas: number;
}
interface Depoimento {
  nome: string;
  cargo: string;
  texto: string;
  foto: string;
  destaque: boolean;
  audio?: string | null;
}
type TipoCampo = "Histórico" | "Atual";
interface Campo {
  nome: string;
  mapa: string;
  descricao: string;
  tipo: TipoCampo;
}
interface MembroAntigo {
  jogadorId: string;
  status: string;
  desde: number;
}

const MOCK_DADOS = {
  textoHistoria:
    "O Racha Fut7Pro nasceu em 2018 da amizade e da paixão pelo futebol. Fundado por Vanderson Rocha, o racha começou pequeno, mas logo se tornou referência. Nossa história é feita de gols, amizade, tradição e momentos inesquecíveis — sempre com espírito esportivo e união!",
  marcos: [
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
      descricao: "O time Leões venceu o primeiro torneio interno entre os 6 times fundados.",
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
  ],
  categoriasFotos: [
    {
      nome: "Fundação",
      fotos: [
        { src: "/images/historia/foto_antiga_01.png", alt: "Primeiro time do Racha Fut7Pro" },
        { src: "/images/historia/foto_antiga_02.png", alt: "Primeiro gol registrado do racha" },
      ],
    },
    {
      nome: "Torneios",
      fotos: [{ src: "/images/historia/foto_antiga_03.png", alt: "Primeiro campeonato interno" }],
    },
    {
      nome: "Confraternizações",
      fotos: [{ src: "/images/historia/foto_antiga_04.png", alt: "Churrasco de final de ano" }],
    },
  ],
  videos: [{ titulo: "Gol Mais Bonito de 2022", url: "https://www.youtube.com/embed/uSUeYncjhXU" }],
  curiosidades: [
    { icone: "⚽", texto: "O primeiro gol foi de cabeça após escanteio.", curtidas: 9 },
    {
      icone: "🏟️",
      texto: "Já tivemos um cachorro invadindo o campo durante a final.",
      curtidas: 7,
    },
    { icone: "🟨", texto: "O cartão amarelo mais rápido saiu aos 15 segundos.", curtidas: 12 },
  ],
  depoimentos: [
    {
      nome: "Vanderson Rocha",
      cargo: "Fundador",
      texto: "“Ver o Racha Fut7Pro crescer é motivo de orgulho. Somos uma família!”",
      foto: "/images/jogadores/jogador_padrao_01.jpg",
      destaque: true,
    },
    {
      nome: "Rafael Matos",
      cargo: "Veterano",
      texto: "“Nunca perdi um jogo desde a fundação. Aqui vivi grandes momentos.”",
      foto: "/images/jogadores/jogador_padrao_02.jpg",
      destaque: false,
    },
  ],
  campos: [
    {
      nome: "Campo Jardim União",
      mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.073713482226!2d-43.20937268504163!3d-22.90244928501295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997f5b3ce43b09%3A0x5296e6ac24514bbd!2sCampo%20de%20Futebol%20Jardim%20Uni%C3%A3o!5e0!3m2!1spt-BR!2sbr!4v1687466554214!5m2!1spt-BR!2sbr",
      descricao: "Onde tudo começou em 2018.",
      tipo: "Histórico" as TipoCampo,
    },
    {
      nome: "Arena Central Fut7Pro",
      mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.7854290502484!2d-46.65301768440736!3d-23.577971368479876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c3a2ff23a3%3A0x8b7ba3c3e9e8b4db!2sParque%20Ibirapuera!5e0!3m2!1spt-BR!2sbr!4v1687466554214!5m2!1spt-BR!2sbr",
      descricao: "Campo oficial atual do Racha Fut7Pro.",
      tipo: "Atual" as TipoCampo,
    },
  ],
  membrosAntigos: [
    { jogadorId: "1", status: "Fundador", desde: 2018 },
    { jogadorId: "2", status: "Veterano", desde: 2018 },
  ],
};

// Autocomplete customizado para buscar jogadores
function AutocompleteJogador({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
  options: { id: string; nome: string; foto: string }[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((j) => j.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className={`bg-neutral-800 text-white rounded-lg p-2 border border-neutral-700 w-full outline-none focus:border-yellow-400 ${disabled ? "opacity-60" : ""}`}
        value={value ? options.find((j) => j.id === value)?.nome || search : search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Buscar jogador por nome"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg custom-scroll">
          {filtered.map((j) => (
            <li
              key={j.id}
              className="px-3 py-2 cursor-pointer hover:bg-yellow-400 hover:text-black transition"
              onMouseDown={() => {
                setOpen(false);
                setSearch(j.nome);
                onChange(j.id);
                setTimeout(() => inputRef.current?.blur(), 100);
              }}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={j.foto}
                  alt={j.nome}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-yellow-400"
                />
                <span>{j.nome}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <style jsx global>
        {scrollbarStyle}
      </style>
    </div>
  );
}

// Preview da imagem local/base64
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function EditarNossaHistoriaAdmin() {
  const [textoHistoria, setTextoHistoria] = useState(MOCK_DADOS.textoHistoria);
  const [marcos, setMarcos] = useState<Marco[]>(MOCK_DADOS.marcos);
  const [categoriasFotos, setCategoriasFotos] = useState<CategoriaFoto[]>(
    MOCK_DADOS.categoriasFotos
  );
  const [videos, setVideos] = useState<Video[]>(MOCK_DADOS.videos);
  const [curiosidades, setCuriosidades] = useState<Curiosidade[]>(MOCK_DADOS.curiosidades);
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>(MOCK_DADOS.depoimentos);
  const [campos, setCampos] = useState<Campo[]>(MOCK_DADOS.campos);
  const [membrosAntigos, setMembrosAntigos] = useState<MembroAntigo[]>(MOCK_DADOS.membrosAntigos);

  const getJogador = (id: string) => JOGADORES_CADASTRADOS.find((j) => j.id === id);

  const handleUploadFoto = async (e: ChangeEvent<HTMLInputElement>, cidx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await getBase64(file);
    setCategoriasFotos(
      categoriasFotos.map((c, i) =>
        i === cidx
          ? {
              ...c,
              fotos: [...c.fotos, { src, alt: "" }],
            }
          : c
      )
    );
  };

  const MAX_FOTOS = { Fundação: 2, Torneios: 2, Confraternizações: 2 };

  const handleSalvar = () => {
    alert("Alterações salvas! (implementar integração real com backend)");
  };

  return (
    <>
      <Head>
        <title>Editar Nossa História | Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Painel administrativo para personalizar a página institucional Nossa História do racha. Edite textos, linha do tempo, fotos, vídeos, curiosidades, depoimentos, campos e membros mais antigos."
        />
        <meta
          name="keywords"
          content="editar história, admin fut7pro, painel racha, personalização, fotos antigas, vídeos, curiosidades, depoimentos, campos, membros mais antigos"
        />
      </Head>
      <style jsx global>
        {scrollbarStyle}
      </style>
      <main className={`max-w-6xl mx-auto pt-20 pb-24 md:pt-6 md:pb-8 px-4 flex flex-col gap-10`}>
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
          Editar Página: Nossa História
        </h1>

        {/* Texto institucional */}
        <section>
          <label className="block font-semibold text-yellow-300 mb-2">Texto Institucional</label>
          <textarea
            className="bg-neutral-900 text-white rounded-lg p-4 w-full min-h-[80px] border border-neutral-700 focus:border-yellow-400"
            value={textoHistoria}
            onChange={(e) => setTextoHistoria(e.target.value)}
          />
        </section>

        {/* Linha do Tempo (marcos) */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300">Linha do Tempo</h2>
            {marcos.length < 7 && (
              <button
                className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded-md text-sm flex items-center gap-1"
                onClick={() =>
                  setMarcos([...marcos, { ano: "", titulo: "", descricao: "", conquista: "" }])
                }
              >
                <FaPlus /> Marco
              </button>
            )}
          </div>
          <div className="mb-2 text-yellow-300 text-xs">
            Para usar emojis no campo &quot;Emoji&quot;, copie de{" "}
            <a
              href="https://emojipedia.org/"
              target="_blank"
              className="underline hover:text-yellow-200"
            >
              emojipedia.org
            </a>{" "}
            ou{" "}
            <a
              href="https://getemoji.com/"
              target="_blank"
              className="underline hover:text-yellow-200"
            >
              getemoji.com
            </a>
            , ou utilize o teclado de emojis do seu sistema operacional.
            <br />
            <span className="text-neutral-300">
              (Não utilize imagens externas, apenas emoji Unicode padrão.)
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {marcos.map((marco, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-2 bg-neutral-900 rounded-xl p-3 border border-neutral-700"
              >
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 w-20 border border-neutral-700"
                  placeholder="Ano"
                  value={marco.ano}
                  onChange={(e) =>
                    setMarcos(marcos.map((m, i) => (i === idx ? { ...m, ano: e.target.value } : m)))
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 flex-1 border border-neutral-700"
                  placeholder="Título"
                  value={marco.titulo}
                  onChange={(e) =>
                    setMarcos(
                      marcos.map((m, i) => (i === idx ? { ...m, titulo: e.target.value } : m))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 flex-1 border border-neutral-700"
                  placeholder="Descrição"
                  value={marco.descricao}
                  onChange={(e) =>
                    setMarcos(
                      marcos.map((m, i) => (i === idx ? { ...m, descricao: e.target.value } : m))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 w-16 border border-neutral-700"
                  placeholder="Emoji"
                  value={marco.conquista || ""}
                  onChange={(e) =>
                    setMarcos(
                      marcos.map((m, i) => (i === idx ? { ...m, conquista: e.target.value } : m))
                    )
                  }
                  maxLength={2}
                />
                <button
                  onClick={() => setMarcos(marcos.filter((_, i) => i !== idx))}
                  className="text-red-500 ml-2"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Galeria de Fotos */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300">Galeria de Fotos</h2>
          </div>
          <div className="flex flex-col gap-6">
            {categoriasFotos.map((cat, cidx) => {
              const maxFotos = MAX_FOTOS[cat.nome as keyof typeof MAX_FOTOS] || 2;
              return (
                <div
                  key={cidx}
                  className="bg-neutral-900 rounded-xl p-3 border border-neutral-700 mb-2"
                >
                  <input
                    className="bg-neutral-800 text-white rounded-lg p-2 mb-2 w-full border border-neutral-700"
                    placeholder="Nome da Categoria"
                    value={cat.nome}
                    onChange={(e) =>
                      setCategoriasFotos(
                        categoriasFotos.map((c, i) =>
                          i === cidx ? { ...c, nome: e.target.value } : c
                        )
                      )
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    {cat.fotos.map((foto, fidx) => (
                      <div key={fidx} className="relative">
                        <div className="w-40 h-[120px] rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                          <Image
                            src={foto.src}
                            alt={foto.alt}
                            width={160}
                            height={100}
                            className="object-cover w-full h-full"
                            style={{ aspectRatio: "4/3" }}
                          />
                        </div>
                        <input
                          className="bg-neutral-800 text-white rounded-lg p-1 mt-1 w-36 border border-neutral-700 text-xs"
                          placeholder="Legenda"
                          value={foto.alt}
                          onChange={(e) =>
                            setCategoriasFotos(
                              categoriasFotos.map((c, i) =>
                                i === cidx
                                  ? {
                                      ...c,
                                      fotos: c.fotos.map((f, j) =>
                                        j === fidx ? { ...f, alt: e.target.value } : f
                                      ),
                                    }
                                  : c
                              )
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            setCategoriasFotos(
                              categoriasFotos.map((c, i) =>
                                i === cidx
                                  ? {
                                      ...c,
                                      fotos: c.fotos.filter((_, j) => j !== fidx),
                                    }
                                  : c
                              )
                            )
                          }
                          className="absolute top-0 right-0 bg-red-500 text-xs text-white rounded-full p-1"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {cat.fotos.length < maxFotos && (
                      <label className="w-40 h-[120px] flex flex-col items-center justify-center bg-neutral-800 text-yellow-400 border-2 border-dashed border-yellow-400 rounded-lg cursor-pointer hover:bg-neutral-900 transition">
                        <FaPlus /> Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadFoto(e, cidx)}
                        />
                      </label>
                    )}
                  </div>
                  <button
                    onClick={() => setCategoriasFotos(categoriasFotos.filter((_, i) => i !== cidx))}
                    className="text-red-500 mt-2"
                  >
                    <FaTrash /> Remover Categoria
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vídeos */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300">Vídeos Históricos</h2>
            {videos.length < 2 && (
              <button
                className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded-md text-sm flex items-center gap-1"
                onClick={() => setVideos([...videos, { titulo: "", url: "" }])}
              >
                <FaPlus /> Vídeo
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-xl p-3 border border-neutral-700 flex flex-col md:flex-row items-center gap-2"
              >
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 flex-1 border border-neutral-700"
                  placeholder="Título"
                  value={video.titulo}
                  onChange={(e) =>
                    setVideos(
                      videos.map((vid, i) => (i === idx ? { ...vid, titulo: e.target.value } : vid))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 flex-1 border border-neutral-700"
                  placeholder="URL do vídeo (YouTube embed)"
                  value={video.url}
                  onChange={(e) =>
                    setVideos(
                      videos.map((vid, i) => (i === idx ? { ...vid, url: e.target.value } : vid))
                    )
                  }
                />
                <button
                  onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Curiosidades */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300">Curiosidades do Racha</h2>
            <button
              className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded-md text-sm flex items-center gap-1"
              onClick={() =>
                setCuriosidades([...curiosidades, { icone: "", texto: "", curtidas: 0 }])
              }
            >
              <FaPlus /> Curiosidade
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {curiosidades.map((curio, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-xl p-3 border border-neutral-700 flex items-center gap-2"
              >
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 w-16 border border-neutral-700"
                  placeholder="Emoji"
                  value={curio.icone}
                  onChange={(e) =>
                    setCuriosidades(
                      curiosidades.map((c, i) => (i === idx ? { ...c, icone: e.target.value } : c))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 flex-1 border border-neutral-700"
                  placeholder="Curiosidade"
                  value={curio.texto}
                  onChange={(e) =>
                    setCuriosidades(
                      curiosidades.map((c, i) => (i === idx ? { ...c, texto: e.target.value } : c))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 w-16 border border-neutral-700"
                  type="number"
                  placeholder="Curtidas"
                  value={curio.curtidas}
                  onChange={(e) =>
                    setCuriosidades(
                      curiosidades.map((c, i) =>
                        i === idx ? { ...c, curtidas: parseInt(e.target.value) || 0 } : c
                      )
                    )
                  }
                />
                <button
                  onClick={() => setCuriosidades(curiosidades.filter((_, i) => i !== idx))}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Depoimentos */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300">Depoimentos</h2>
            {depoimentos.length < 4 && (
              <button
                className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded-md text-sm flex items-center gap-1"
                onClick={() =>
                  setDepoimentos([
                    ...depoimentos,
                    {
                      nome: "",
                      cargo: "",
                      texto: "",
                      foto: "/images/jogadores/jogador_padrao_01.jpg",
                      destaque: false,
                    },
                  ])
                }
              >
                <FaPlus /> Depoimento
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {depoimentos.map((dep, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-2xl p-4 flex flex-col items-center border border-neutral-700"
              >
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 mb-2 w-full border border-neutral-700"
                  placeholder="Nome"
                  value={dep.nome}
                  onChange={(e) =>
                    setDepoimentos(
                      depoimentos.map((d, i) => (i === idx ? { ...d, nome: e.target.value } : d))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 mb-2 w-full border border-neutral-700"
                  placeholder="Cargo"
                  value={dep.cargo}
                  onChange={(e) =>
                    setDepoimentos(
                      depoimentos.map((d, i) => (i === idx ? { ...d, cargo: e.target.value } : d))
                    )
                  }
                />
                <textarea
                  className="bg-neutral-800 text-white rounded-lg p-2 mb-2 w-full border border-neutral-700"
                  placeholder="Depoimento"
                  value={dep.texto}
                  onChange={(e) =>
                    setDepoimentos(
                      depoimentos.map((d, i) => (i === idx ? { ...d, texto: e.target.value } : d))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 mb-2 w-full border border-neutral-700"
                  placeholder="URL da Foto"
                  value={dep.foto}
                  onChange={(e) =>
                    setDepoimentos(
                      depoimentos.map((d, i) => (i === idx ? { ...d, foto: e.target.value } : d))
                    )
                  }
                />
                <div className="flex items-center gap-2">
                  <label className="text-yellow-300 text-xs">
                    <input
                      type="checkbox"
                      checked={dep.destaque}
                      onChange={(e) =>
                        setDepoimentos(
                          depoimentos.map((d, i) =>
                            i === idx ? { ...d, destaque: e.target.checked } : d
                          )
                        )
                      }
                    />{" "}
                    Destaque
                  </label>
                  <button
                    onClick={() => setDepoimentos(depoimentos.filter((_, i) => i !== idx))}
                    className="text-red-500 ml-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Campos históricos e atual */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
              <FaMapMarkedAlt /> Campos Históricos e Atual
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campos.slice(0, 2).map((campo, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-xl p-3 border border-neutral-700 flex flex-col gap-2"
              >
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 border border-neutral-700"
                  placeholder="Nome"
                  value={campo.nome}
                  onChange={(e) =>
                    setCampos(
                      campos.map((c, i) => (i === idx ? { ...c, nome: e.target.value } : c))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 border border-neutral-700"
                  placeholder="Iframe Google Maps (src)"
                  value={campo.mapa}
                  onChange={(e) =>
                    setCampos(
                      campos.map((c, i) => (i === idx ? { ...c, mapa: e.target.value } : c))
                    )
                  }
                />
                <input
                  className="bg-neutral-800 text-white rounded-lg p-2 border border-neutral-700"
                  placeholder="Descrição"
                  value={campo.descricao}
                  onChange={(e) =>
                    setCampos(
                      campos.map((c, i) => (i === idx ? { ...c, descricao: e.target.value } : c))
                    )
                  }
                />
                <select
                  className="bg-neutral-800 text-white rounded-lg p-2 border border-neutral-700"
                  value={campo.tipo}
                  onChange={(e) =>
                    setCampos(
                      campos.map((c, i) =>
                        i === idx ? { ...c, tipo: e.target.value as TipoCampo } : c
                      )
                    )
                  }
                >
                  <option value="Histórico">Histórico</option>
                  <option value="Atual">Atual</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Membros mais antigos */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
              <FaMedal /> Membros Mais Antigos
            </h2>
            {membrosAntigos.length < 5 && (
              <button
                className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded-md text-sm flex items-center gap-1"
                onClick={() =>
                  setMembrosAntigos([...membrosAntigos, { jogadorId: "", status: "", desde: 2024 }])
                }
              >
                <FaPlus /> Membro
              </button>
            )}
          </div>
          <div className="text-yellow-200 text-sm mb-4">
            Selecione até <b>5 dos jogadores mais antigos</b> do seu racha para exibir nesta seção.
          </div>
          <div className="flex flex-wrap gap-4">
            {membrosAntigos.map((membro, idx) => {
              const jogador = getJogador(membro.jogadorId);
              return (
                <div
                  key={idx}
                  className="bg-neutral-900 rounded-xl p-4 flex flex-col items-center w-56 border border-neutral-700"
                >
                  <AutocompleteJogador
                    value={membro.jogadorId}
                    onChange={(id: string) =>
                      setMembrosAntigos(
                        membrosAntigos.map((m, i) => (i === idx ? { ...m, jogadorId: id } : m))
                      )
                    }
                    options={JOGADORES_CADASTRADOS}
                    disabled={false}
                  />
                  {jogador && (
                    <Image
                      src={jogador.foto}
                      alt={jogador.nome}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-yellow-400 my-2"
                    />
                  )}
                  <input
                    className="bg-neutral-800 text-white rounded-lg p-2 mb-1 w-full border border-neutral-700"
                    placeholder="Status"
                    value={membro.status}
                    onChange={(e) =>
                      setMembrosAntigos(
                        membrosAntigos.map((m, i) =>
                          i === idx ? { ...m, status: e.target.value } : m
                        )
                      )
                    }
                  />
                  <input
                    type="number"
                    className="bg-neutral-800 text-white rounded-lg p-2 mb-1 w-full border border-neutral-700"
                    placeholder="Desde"
                    value={membro.desde}
                    onChange={(e) =>
                      setMembrosAntigos(
                        membrosAntigos.map((m, i) =>
                          i === idx ? { ...m, desde: parseInt(e.target.value) || 0 } : m
                        )
                      )
                    }
                  />
                  <button
                    onClick={() => setMembrosAntigos(membrosAntigos.filter((_, i) => i !== idx))}
                    className="text-red-500 mt-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Salvar tudo */}
        <div className="flex justify-end mt-8">
          <button
            className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition shadow-lg"
            onClick={handleSalvar}
          >
            <FaSave /> Salvar Alterações
          </button>
        </div>
      </main>
    </>
  );
}

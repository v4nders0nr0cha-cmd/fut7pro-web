"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaPoll,
  FaSearch,
  FaPlus,
  FaCalendarCheck,
  FaUserCheck,
  FaUser,
  FaTimesCircle,
  FaCheckCircle,
  FaChartBar,
  FaTrashAlt,
  FaTrophy,
} from "react-icons/fa";

type Opcao = { texto: string; votos: number };

type Enquete = {
  id: number;
  titulo: string;
  descricao: string;
  criadaEm: string;
  criadaPor: string;
  opcoes: Opcao[];
  status: "Aberta" | "Fechada";
  totalVotos: number;
  publico: string;
  encerradaEm?: string;
};

const MOCK_ENQUETES: Enquete[] = [
  {
    id: 1,
    titulo: "Qual melhor horário para o próximo racha?",
    descricao:
      "Escolha o melhor horário para a maioria dos jogadores. Enquete válida até sexta-feira.",
    criadaEm: "15/07/2025",
    criadaPor: "Admin",
    opcoes: [
      { texto: "19:00", votos: 8 },
      { texto: "20:00", votos: 14 },
      { texto: "21:00", votos: 2 },
    ],
    status: "Aberta",
    totalVotos: 24,
    publico: "Todos os jogadores",
  },
  {
    id: 2,
    titulo: "Quem foi o melhor jogador do último jogo?",
    descricao: "Vote no destaque da última partida!",
    criadaEm: "10/07/2025",
    criadaPor: "Carlos Silva",
    opcoes: [
      { texto: "Marcos Souza", votos: 7 },
      { texto: "Lucas Tavares", votos: 3 },
      { texto: "Gustavo Nunes", votos: 5 },
    ],
    status: "Fechada",
    encerradaEm: "12/07/2025",
    totalVotos: 15,
    publico: "Jogadores ativos",
  },
];

const SEGMENTACOES = [
  "Todos os jogadores",
  "Mensalistas",
  "Jogadores ativos",
  "Jogadores inativos",
  "Time Campeão do Dia",
  "Goleiros",
  "Administradores",
  "Faltosos",
  "Jogadores do Dia",
  "Jogadores sem foto",
  "Aniversariantes do mês",
];

export default function EnquetesPage() {
  const [enquetes, setEnquetes] = useState<Enquete[]>(MOCK_ENQUETES);
  const [busca, setBusca] = useState("");
  const [modalNova, setModalNova] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [opcoes, setOpcoes] = useState<string[]>(["", ""]);
  const [criando, setCriando] = useState(false);
  const [publico, setPublico] = useState<string>("Todos os jogadores");
  const [filtroStatus, setFiltroStatus] = useState<
    "Todas" | "Aberta" | "Fechada"
  >("Todas");
  const [modalDetalhe, setModalDetalhe] = useState<Enquete | null>(null);
  const [modalExcluir, setModalExcluir] = useState<Enquete | null>(null);

  const enquetesFiltradas = enquetes.filter(
    (e) =>
      (filtroStatus === "Todas" || e.status === filtroStatus) &&
      (e.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        e.descricao.toLowerCase().includes(busca.toLowerCase())),
  );

  function abrirModalNova() {
    setTitulo("");
    setDescricao("");
    setOpcoes(["", ""]);
    setPublico("Todos os jogadores");
    setModalNova(true);
  }

  function adicionarOpcao() {
    setOpcoes([...opcoes, ""]);
  }

  function atualizarOpcao(i: number, valor: string) {
    setOpcoes(opcoes.map((op, idx) => (idx === i ? valor : op)));
  }

  function removerOpcao(i: number) {
    if (opcoes.length > 2) setOpcoes(opcoes.filter((_, idx) => idx !== i));
  }

  function criarEnquete() {
    setCriando(true);
    setTimeout(() => {
      setEnquetes([
        {
          id: enquetes.length + 1,
          titulo,
          descricao,
          criadaEm: new Date().toLocaleDateString(),
          criadaPor: "Admin",
          opcoes: opcoes.map((op) => ({ texto: op, votos: 0 })),
          status: "Aberta",
          totalVotos: 0,
          publico,
        },
        ...enquetes,
      ]);
      setCriando(false);
      setModalNova(false);
    }, 800);
  }

  function fecharEnquete(id: number) {
    setEnquetes((enquetes) =>
      enquetes.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "Fechada",
              encerradaEm: new Date().toLocaleDateString(),
            }
          : e,
      ),
    );
  }

  function excluirEnquete(id: number) {
    setEnquetes((enquetes) => enquetes.filter((e) => e.id !== id));
    setModalExcluir(null);
  }

  return (
    <>
      <Head>
        <title>Enquetes | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Crie e gerencie enquetes/votações rápidas entre os jogadores do seu racha."
        />
        <meta
          name="keywords"
          content="Fut7, racha, enquetes, votação, SaaS, admin"
        />
      </Head>
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-3 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaPoll /> Enquetes
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Ferramenta para enquetes e votações rápidas.
          </b>
          <br />
          Crie enquetes para decidir horários, eventos, melhores do jogo ou
          qualquer tema relevante para o grupo. Veja resultados em tempo real,
          encerre votações e envolva seus jogadores na gestão!
        </div>

        {/* Barra de busca/filtros/novo */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center rounded border border-yellow-400 bg-[#181818]">
            <FaSearch className="mx-3 text-yellow-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar enquetes por título, descrição…"
              className="w-full border-none bg-transparent py-2 pr-3 text-gray-200 outline-none"
              autoComplete="off"
            />
          </div>
          <select
            className="rounded border border-yellow-400 bg-[#181818] px-3 py-2 font-bold text-yellow-300"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
          >
            <option value="Todas">Todas</option>
            <option value="Aberta">Abertas</option>
            <option value="Fechada">Fechadas</option>
          </select>
          <button
            className="flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-bold text-[#181818] shadow transition hover:bg-yellow-500"
            onClick={abrirModalNova}
          >
            <FaPlus /> Nova Enquete
          </button>
        </div>

        {/* Listagem de enquetes */}
        <div>
          {enquetesFiltradas.length === 0 && (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <FaCalendarCheck className="mb-2 text-5xl" />
              Nenhuma enquete encontrada para este filtro.
            </div>
          )}
          <div className="grid grid-cols-1 gap-6">
            {enquetesFiltradas.map((e) => (
              <div
                key={e.id}
                className={`animate-fadeIn rounded-lg border-l-4 bg-[#232323] p-4 shadow ${e.status === "Aberta" ? "border-yellow-400" : "border-green-600"}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-bold text-yellow-300">
                    {e.titulo}
                    {e.status === "Fechada" && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-green-800 px-2 py-1 text-xs font-bold text-green-300">
                        <FaCheckCircle /> Fechada
                      </span>
                    )}
                    {e.status === "Aberta" && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-yellow-800 px-2 py-1 text-xs font-bold text-yellow-300">
                        <FaPoll /> Aberta
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-xs text-gray-400">
                    <span>
                      {e.criadaPor} &bull; {e.criadaEm}
                    </span>
                    <span className="font-semibold text-yellow-300">
                      {e.publico}
                    </span>
                  </div>
                </div>
                <div className="mb-4 text-sm text-gray-200">{e.descricao}</div>
                {/* Resultados */}
                <div className="mb-3">
                  <div className="flex flex-col gap-1">
                    {e.opcoes.map((op, idx) => {
                      const percent = e.totalVotos
                        ? Math.round((op.votos / e.totalVotos) * 100)
                        : 0;
                      const maiorVoto = e.opcoes.reduce(
                        (max, cur) => (cur.votos > max ? cur.votos : max),
                        0,
                      );
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex min-w-[80px] items-center gap-1 rounded bg-[#181818] px-2 py-1 text-xs text-gray-200">
                            {op.texto}
                            {e.status === "Fechada" &&
                              op.votos === maiorVoto &&
                              maiorVoto > 0 && (
                                <FaTrophy
                                  className="ml-1 text-yellow-300"
                                  title="Opção vencedora"
                                />
                              )}
                          </span>
                          <div className="relative mx-2 h-4 flex-1 rounded-full bg-[#181818]">
                            <div
                              className="h-4 rounded-full bg-yellow-400 transition-all"
                              style={{ width: `${percent}%` }}
                            ></div>
                            <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-bold text-black">
                              {percent}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {op.votos} votos
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex gap-3">
                  {e.status === "Aberta" && (
                    <button
                      className="flex items-center gap-1 rounded bg-green-700 px-3 py-1 text-xs font-bold text-white hover:bg-green-600"
                      onClick={() => fecharEnquete(e.id)}
                    >
                      <FaTimesCircle /> Fechar enquete
                    </button>
                  )}
                  <button
                    className="flex items-center gap-1 rounded bg-[#181818] px-3 py-1 text-xs font-bold text-yellow-400 hover:bg-gray-700"
                    onClick={() => setModalDetalhe(e)}
                  >
                    <FaChartBar /> Ver detalhes
                  </button>
                  <button
                    className="flex items-center gap-1 rounded bg-red-700 px-3 py-1 text-xs font-bold text-white hover:bg-red-800"
                    onClick={() => setModalExcluir(e)}
                  >
                    <FaTrashAlt /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal nova enquete */}
        {modalNova && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md rounded-lg border-2 border-yellow-400 bg-[#232323] p-6 shadow-lg">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-yellow-400">
                <FaPlus /> Criar Nova Enquete
              </h2>
              {/* SELECT DE SEGMENTAÇÃO */}
              <label
                className="mb-1 block text-xs font-bold text-yellow-300"
                htmlFor="publico"
              >
                Enviar para:
              </label>
              <select
                id="publico"
                className="mb-3 w-full rounded border border-yellow-400 bg-[#181818] p-2 font-bold text-gray-100"
                value={publico}
                onChange={(e) => setPublico(e.target.value)}
              >
                {SEGMENTACOES.map((opt) => (
                  <option value={opt} key={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                className="mb-2 w-full rounded border border-yellow-400 bg-[#181818] p-2 text-gray-100"
                placeholder="Título da enquete"
                maxLength={60}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <textarea
                className="mb-2 w-full rounded border border-yellow-400 bg-[#181818] p-2 text-gray-100"
                placeholder="Descrição da enquete (opcional)"
                maxLength={200}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <div className="mb-3">
                <b className="text-xs text-yellow-300">Opções de resposta</b>
                {opcoes.map((op, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input
                      className="flex-1 rounded border border-yellow-400 bg-[#181818] p-2 text-gray-100"
                      placeholder={`Opção ${i + 1}`}
                      maxLength={35}
                      value={op}
                      onChange={(e) => atualizarOpcao(i, e.target.value)}
                    />
                    {opcoes.length > 2 && (
                      <button
                        className="text-xl text-red-400 hover:text-red-600"
                        onClick={() => removerOpcao(i)}
                        type="button"
                        tabIndex={-1}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="mt-1 rounded bg-[#181818] px-3 py-1 text-xs font-bold text-yellow-400 hover:bg-gray-700"
                  onClick={adicionarOpcao}
                  type="button"
                >
                  + Adicionar opção
                </button>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                  onClick={() => setModalNova(false)}
                  disabled={criando}
                >
                  Cancelar
                </button>
                <button
                  className="rounded bg-yellow-400 px-4 py-1 font-bold text-[#181818] hover:bg-yellow-500"
                  onClick={criarEnquete}
                  disabled={
                    criando ||
                    titulo.trim().length < 5 ||
                    opcoes.some((op) => !op.trim())
                  }
                >
                  {criando ? "Criando..." : "Criar Enquete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalhe de resultado */}
        {modalDetalhe && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-lg rounded-lg border border-yellow-500 bg-[#232323] p-7 shadow-lg">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-yellow-400">
                <FaChartBar /> Resultado da Enquete
              </h2>
              <div className="mb-1 text-lg font-bold text-yellow-200">
                {modalDetalhe.titulo}
              </div>
              <div className="mb-3 text-sm text-gray-300">
                {modalDetalhe.descricao}
              </div>
              <div className="mb-3 text-xs text-gray-400">
                {modalDetalhe.publico} &middot; Criada por{" "}
                {modalDetalhe.criadaPor} em {modalDetalhe.criadaEm}
                {modalDetalhe.status === "Fechada" &&
                  modalDetalhe.encerradaEm && (
                    <> &middot; Fechada em {modalDetalhe.encerradaEm}</>
                  )}
              </div>
              <div className="mb-4 flex flex-col gap-3">
                {modalDetalhe.opcoes.map((op, idx) => {
                  const percent = modalDetalhe.totalVotos
                    ? Math.round((op.votos / modalDetalhe.totalVotos) * 100)
                    : 0;
                  const maiorVoto = modalDetalhe.opcoes.reduce(
                    (max, cur) => (cur.votos > max ? cur.votos : max),
                    0,
                  );
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex min-w-[80px] items-center gap-1 rounded bg-[#181818] px-2 py-1 text-xs text-gray-200">
                        {op.texto}
                        {modalDetalhe.status === "Fechada" &&
                          op.votos === maiorVoto &&
                          maiorVoto > 0 && (
                            <FaTrophy
                              className="ml-1 text-yellow-300"
                              title="Opção vencedora"
                            />
                          )}
                      </span>
                      <div className="relative mx-2 h-4 flex-1 rounded-full bg-[#181818]">
                        <div
                          className="h-4 rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-bold text-black">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {op.votos} votos
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-right">
                <button
                  className="rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                  onClick={() => setModalDetalhe(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de exclusão */}
        {modalExcluir && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md rounded-lg border border-red-500 bg-[#232323] p-6 shadow-lg">
              <h2 className="mb-2 flex items-center gap-2 font-bold text-red-400">
                <FaTrashAlt /> Excluir Enquete
              </h2>
              <div className="mb-3 text-sm text-gray-200">
                Tem certeza que deseja excluir a enquete{" "}
                <b className="text-yellow-300">"{modalExcluir.titulo}"</b>?
                <br />
                Esta ação não pode ser desfeita.
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  className="rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                  onClick={() => setModalExcluir(null)}
                >
                  Cancelar
                </button>
                <button
                  className="rounded bg-red-700 px-4 py-1 font-bold text-white hover:bg-red-800"
                  onClick={() => excluirEnquete(modalExcluir.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.25s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}

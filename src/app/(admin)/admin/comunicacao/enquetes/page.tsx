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
  const [filtroStatus, setFiltroStatus] = useState<"Todas" | "Aberta" | "Fechada">("Todas");
  const [modalDetalhe, setModalDetalhe] = useState<Enquete | null>(null);
  const [modalExcluir, setModalExcluir] = useState<Enquete | null>(null);

  const enquetesFiltradas = enquetes.filter(
    (e) =>
      (filtroStatus === "Todas" || e.status === filtroStatus) &&
      (e.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        e.descricao.toLowerCase().includes(busca.toLowerCase()))
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
        e.id === id ? { ...e, status: "Fechada", encerradaEm: new Date().toLocaleDateString() } : e
      )
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
        <meta name="keywords" content="Fut7, racha, enquetes, votação, SaaS, admin" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
          <FaPoll /> Enquetes
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm animate-fadeIn">
          <b className="text-yellow-300">Ferramenta para enquetes e votações rápidas.</b>
          <br />
          Crie enquetes para decidir horários, eventos, melhores do jogo ou qualquer tema relevante
          para o grupo. Veja resultados em tempo real, encerre votações e envolva seus jogadores na
          gestão!
        </div>

        {/* Barra de busca/filtros/novo */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center rounded bg-[#181818] border border-yellow-400">
            <FaSearch className="mx-3 text-yellow-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar enquetes por título, descrição…"
              className="bg-transparent border-none outline-none py-2 pr-3 w-full text-gray-200"
              autoComplete="off"
            />
          </div>
          <select
            className="bg-[#181818] border border-yellow-400 rounded px-3 py-2 text-yellow-300 font-bold"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
          >
            <option value="Todas">Todas</option>
            <option value="Aberta">Abertas</option>
            <option value="Fechada">Fechadas</option>
          </select>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-[#181818] font-bold px-4 py-2 rounded flex items-center gap-2 transition shadow"
            onClick={abrirModalNova}
          >
            <FaPlus /> Nova Enquete
          </button>
        </div>

        {/* Listagem de enquetes */}
        <div>
          {enquetesFiltradas.length === 0 && (
            <div className="text-gray-400 py-10 flex flex-col items-center">
              <FaCalendarCheck className="text-5xl mb-2" />
              Nenhuma enquete encontrada para este filtro.
            </div>
          )}
          <div className="grid grid-cols-1 gap-6">
            {enquetesFiltradas.map((e) => (
              <div
                key={e.id}
                className={`bg-[#232323] rounded-lg p-4 shadow border-l-4 animate-fadeIn ${e.status === "Aberta" ? "border-yellow-400" : "border-green-600"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-yellow-300 text-lg flex gap-2 items-center">
                    {e.titulo}
                    {e.status === "Fechada" && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded bg-green-800 text-green-300 text-xs font-bold gap-1">
                        <FaCheckCircle /> Fechada
                      </span>
                    )}
                    {e.status === "Aberta" && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded bg-yellow-800 text-yellow-300 text-xs font-bold gap-1">
                        <FaPoll /> Aberta
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex flex-col items-end">
                    <span>
                      {e.criadaPor} &bull; {e.criadaEm}
                    </span>
                    <span className="text-yellow-300 font-semibold">{e.publico}</span>
                  </div>
                </div>
                <div className="text-gray-200 text-sm mb-4">{e.descricao}</div>
                {/* Resultados */}
                <div className="mb-3">
                  <div className="flex flex-col gap-1">
                    {e.opcoes.map((op, idx) => {
                      const percent = e.totalVotos
                        ? Math.round((op.votos / e.totalVotos) * 100)
                        : 0;
                      const maiorVoto = e.opcoes.reduce(
                        (max, cur) => (cur.votos > max ? cur.votos : max),
                        0
                      );
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="bg-[#181818] text-gray-200 rounded px-2 py-1 min-w-[80px] text-xs flex items-center gap-1">
                            {op.texto}
                            {e.status === "Fechada" && op.votos === maiorVoto && maiorVoto > 0 && (
                              <FaTrophy className="text-yellow-300 ml-1" title="Opção vencedora" />
                            )}
                          </span>
                          <div className="flex-1 bg-[#181818] rounded-full h-4 mx-2 relative">
                            <div
                              className="bg-yellow-400 h-4 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            ></div>
                            <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-black font-bold">
                              {percent}%
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs">{op.votos} votos</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  {e.status === "Aberta" && (
                    <button
                      className="bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-1 rounded text-xs flex items-center gap-1"
                      onClick={() => fecharEnquete(e.id)}
                    >
                      <FaTimesCircle /> Fechar enquete
                    </button>
                  )}
                  <button
                    className="bg-[#181818] hover:bg-gray-700 text-yellow-400 font-bold px-3 py-1 rounded text-xs flex items-center gap-1"
                    onClick={() => setModalDetalhe(e)}
                  >
                    <FaChartBar /> Ver detalhes
                  </button>
                  <button
                    className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1 rounded text-xs flex items-center gap-1"
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#232323] rounded-lg max-w-md w-full p-6 shadow-lg border-2 border-yellow-400">
              <h2 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <FaPlus /> Criar Nova Enquete
              </h2>
              {/* SELECT DE SEGMENTAÇÃO */}
              <label className="block text-yellow-300 font-bold mb-1 text-xs" htmlFor="publico">
                Enviar para:
              </label>
              <select
                id="publico"
                className="w-full mb-3 p-2 rounded bg-[#181818] border border-yellow-400 text-gray-100 font-bold"
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
                className="w-full mb-2 p-2 rounded bg-[#181818] border border-yellow-400 text-gray-100"
                placeholder="Título da enquete"
                maxLength={60}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <textarea
                className="w-full mb-2 p-2 rounded bg-[#181818] border border-yellow-400 text-gray-100"
                placeholder="Descrição da enquete (opcional)"
                maxLength={200}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <div className="mb-3">
                <b className="text-yellow-300 text-xs">Opções de resposta</b>
                {opcoes.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      className="flex-1 p-2 rounded bg-[#181818] border border-yellow-400 text-gray-100"
                      placeholder={`Opção ${i + 1}`}
                      maxLength={35}
                      value={op}
                      onChange={(e) => atualizarOpcao(i, e.target.value)}
                    />
                    {opcoes.length > 2 && (
                      <button
                        className="text-red-400 hover:text-red-600 text-xl"
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
                  className="bg-[#181818] hover:bg-gray-700 text-yellow-400 font-bold px-3 py-1 rounded text-xs mt-1"
                  onClick={adicionarOpcao}
                  type="button"
                >
                  + Adicionar opção
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="bg-gray-700 text-gray-200 px-4 py-1 rounded hover:bg-gray-600"
                  onClick={() => setModalNova(false)}
                  disabled={criando}
                >
                  Cancelar
                </button>
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-[#181818] font-bold px-4 py-1 rounded"
                  onClick={criarEnquete}
                  disabled={criando || titulo.trim().length < 5 || opcoes.some((op) => !op.trim())}
                >
                  {criando ? "Criando..." : "Criar Enquete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalhe de resultado */}
        {modalDetalhe && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#232323] rounded-lg max-w-lg w-full p-7 shadow-lg border border-yellow-500">
              <h2 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <FaChartBar /> Resultado da Enquete
              </h2>
              <div className="mb-1 text-lg font-bold text-yellow-200">{modalDetalhe.titulo}</div>
              <div className="mb-3 text-gray-300 text-sm">{modalDetalhe.descricao}</div>
              <div className="mb-3 text-gray-400 text-xs">
                {modalDetalhe.publico} &middot; Criada por {modalDetalhe.criadaPor} em{" "}
                {modalDetalhe.criadaEm}
                {modalDetalhe.status === "Fechada" && modalDetalhe.encerradaEm && (
                  <> &middot; Fechada em {modalDetalhe.encerradaEm}</>
                )}
              </div>
              <div className="flex flex-col gap-3 mb-4">
                {modalDetalhe.opcoes.map((op, idx) => {
                  const percent = modalDetalhe.totalVotos
                    ? Math.round((op.votos / modalDetalhe.totalVotos) * 100)
                    : 0;
                  const maiorVoto = modalDetalhe.opcoes.reduce(
                    (max, cur) => (cur.votos > max ? cur.votos : max),
                    0
                  );
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="bg-[#181818] text-gray-200 rounded px-2 py-1 min-w-[80px] text-xs flex items-center gap-1">
                        {op.texto}
                        {modalDetalhe.status === "Fechada" &&
                          op.votos === maiorVoto &&
                          maiorVoto > 0 && (
                            <FaTrophy className="text-yellow-300 ml-1" title="Opção vencedora" />
                          )}
                      </span>
                      <div className="flex-1 bg-[#181818] rounded-full h-4 mx-2 relative">
                        <div
                          className="bg-yellow-400 h-4 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-black font-bold">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">{op.votos} votos</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-right">
                <button
                  className="bg-gray-700 text-gray-200 px-4 py-1 rounded hover:bg-gray-600"
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#232323] rounded-lg max-w-md w-full p-6 shadow-lg border border-red-500">
              <h2 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                <FaTrashAlt /> Excluir Enquete
              </h2>
              <div className="mb-3 text-gray-200 text-sm">
                Tem certeza que deseja excluir a enquete{" "}
                <b className="text-yellow-300">"{modalExcluir.titulo}"</b>?
                <br />
                Esta ação não pode ser desfeita.
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  className="bg-gray-700 text-gray-200 px-4 py-1 rounded hover:bg-gray-600"
                  onClick={() => setModalExcluir(null)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1 rounded"
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

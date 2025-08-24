"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaSearch,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaPaperPlane,
  FaRegCommentDots,
  FaInbox,
} from "react-icons/fa";

type StatusSugestao = "Nova" | "Respondida" | "Recusada";

type Sugestao = {
  id: number;
  autor: string;
  data: string;
  mensagem: string;
  resposta?: string;
  status: StatusSugestao;
};

type SugestaoSistema = {
  id: number;
  data: string;
  mensagem: string;
  resposta?: string;
  status: "Aguardando" | "Respondida";
};

// Mocks separados: Atletas x Admin->Sistema
const sugestoesAtletas: Sugestao[] = [
  {
    id: 1,
    autor: "Carlos Silva",
    data: "15/07/2025",
    mensagem:
      "Poderiam adicionar mais opções de temas visuais personalizados para cada racha.",
    status: "Nova",
  },
  {
    id: 2,
    autor: "Marcos Souza",
    data: "10/07/2025",
    mensagem: "O sistema de notificações poderia ter opção de agendar envios.",
    resposta: "Estamos avaliando essa possibilidade. Obrigado pela sugestão!",
    status: "Respondida",
  },
  {
    id: 3,
    autor: "Ana Paula",
    data: "03/07/2025",
    mensagem: "Seria legal mostrar aniversariantes do mês na tela inicial.",
    status: "Nova",
  },
];

const sugestoesAdminParaSistema: SugestaoSistema[] = [
  {
    id: 1,
    data: "14/07/2025",
    mensagem:
      "Gostaria que o Fut7Pro tivesse integração direta com o WhatsApp.",
    resposta:
      "Sua sugestão foi encaminhada para nossa equipe. Assim que houver novidades, avisaremos aqui!",
    status: "Respondida",
  },
  {
    id: 2,
    data: "05/07/2025",
    mensagem:
      "Sugiro criar relatórios financeiros em formato Excel além do PDF.",
    status: "Aguardando",
  },
];

export default function SugestoesPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusSugestao | "Todas">(
    "Todas",
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [sugestaoSelecionada, setSugestaoSelecionada] =
    useState<Sugestao | null>(null);
  const [resposta, setResposta] = useState("");
  const [envioAberto, setEnvioAberto] = useState(false);
  const [novaSugestao, setNovaSugestao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucessoEnvio, setSucessoEnvio] = useState(false);

  // Filtrar sugestões de atletas
  const sugestoesAtletasFiltradas = sugestoesAtletas.filter(
    (s) =>
      (filtroStatus === "Todas" || s.status === filtroStatus) &&
      (s.mensagem.toLowerCase().includes(busca.toLowerCase()) ||
        s.autor.toLowerCase().includes(busca.toLowerCase())),
  );

  // Filtrar sugestões enviadas ao sistema (admin > equipe Fut7Pro)
  const sugestoesSistemaFiltradas = sugestoesAdminParaSistema.filter((s) =>
    s.mensagem.toLowerCase().includes(busca.toLowerCase()),
  );

  function abrirModalResposta(s: Sugestao) {
    setSugestaoSelecionada(s);
    setResposta(s.resposta ?? "");
    setModalAberto(true);
  }

  function enviarResposta() {
    setModalAberto(false);
    setSugestaoSelecionada(null);
    setResposta("");
    // Aqui entraria a integração com API de sugestões.
  }

  function abrirEnvioSugestao() {
    setEnvioAberto(true);
    setNovaSugestao("");
    setSucessoEnvio(false);
  }

  async function enviarSugestao() {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setSucessoEnvio(true);
      setNovaSugestao("");
    }, 900);
  }

  return (
    <>
      <Head>
        <title>Sugestões e Feedback | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Receba sugestões dos jogadores e envie feedback direto à equipe Fut7Pro."
        />
        <meta
          name="keywords"
          content="Fut7, racha, sugestões, feedback, SaaS, admin"
        />
      </Head>
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaRegCommentDots className="text-2xl" /> Sugestões e Feedback
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Canal profissional de sugestões para evoluir o Fut7Pro!
          </b>
          <br />
          Veja sugestões enviadas pelos jogadores do seu racha <b>e</b>{" "}
          acompanhe sugestões que você enviou para a equipe do Fut7Pro.
          <br />
          Assim você engaja seu grupo e ainda contribui para evolução do
          sistema!
        </div>

        {/* Barra superior: busca + filtros + botão de sugestão */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por palavra, autor ou data…"
            className="flex-1 rounded border border-yellow-400 bg-[#181818] px-4 py-2 font-bold text-yellow-300 outline-none"
            autoComplete="off"
          />
          <select
            className="rounded border border-yellow-400 bg-[#181818] px-3 py-2 font-bold text-yellow-300"
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(e.target.value as StatusSugestao | "Todas")
            }
          >
            <option value="Todas">Todas</option>
            <option value="Nova">Novas</option>
            <option value="Respondida">Respondidas</option>
            <option value="Recusada">Recusadas</option>
          </select>
          <button
            onClick={abrirEnvioSugestao}
            className="flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-bold text-[#181818] shadow transition hover:bg-yellow-500"
          >
            <FaPaperPlane /> Enviar sugestão à equipe Fut7Pro
          </button>
        </div>

        {/* SUGESTÕES DOS ATLETAS */}
        <div className="mb-12">
          <div className="mb-2 mt-6 text-lg font-bold text-yellow-300">
            Sugestões Recebidas dos Atletas
          </div>
          {sugestoesAtletasFiltradas.length === 0 && (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <FaInbox className="mb-3 text-5xl" />
              Nenhuma sugestão encontrada para este filtro.
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sugestoesAtletasFiltradas.map((s) => (
              <div
                key={s.id}
                className={`rounded-lg border-l-4 bg-[#232323] p-4 shadow ${
                  s.status === "Respondida"
                    ? "border-green-500"
                    : s.status === "Recusada"
                      ? "border-red-500"
                      : "border-yellow-400"
                } animate-fadeIn`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="font-bold text-yellow-300">
                    {s.autor}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {s.data}
                    </span>
                  </div>
                  <div>
                    {s.status === "Respondida" && (
                      <span className="inline-flex items-center gap-1 rounded bg-green-800 px-2 py-1 text-xs font-bold text-green-300">
                        <FaRegCheckCircle /> Respondida
                      </span>
                    )}
                    {s.status === "Recusada" && (
                      <span className="inline-flex items-center gap-1 rounded bg-red-800 px-2 py-1 text-xs font-bold text-red-300">
                        <FaRegTimesCircle /> Recusada
                      </span>
                    )}
                    {s.status === "Nova" && (
                      <span className="inline-flex items-center gap-1 rounded bg-yellow-800 px-2 py-1 text-xs font-bold text-yellow-300">
                        <FaInbox /> Nova
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-2 text-sm text-gray-200">{s.mensagem}</div>
                {s.resposta && (
                  <div className="mb-2 rounded bg-[#181818] p-2 text-sm text-green-400">
                    <b>Resposta:</b> {s.resposta}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  {s.status === "Nova" && (
                    <>
                      <button
                        className="rounded bg-green-700 px-3 py-1 text-xs font-bold text-white hover:bg-green-600"
                        onClick={() => abrirModalResposta(s)}
                      >
                        Responder
                      </button>
                      <button
                        className="rounded bg-red-700 px-3 py-1 text-xs font-bold text-white hover:bg-red-600"
                        onClick={() =>
                          alert("Marcar como recusada (conecte API real).")
                        }
                      >
                        Recusar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUGESTÕES ENVIADAS AO SISTEMA FUT7PRO */}
        <div className="mb-12">
          <div className="mb-2 mt-6 text-lg font-bold text-yellow-300">
            Sugestões Enviadas para o Fut7Pro (Equipe/SuperAdmin)
          </div>
          {sugestoesSistemaFiltradas.length === 0 && (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <FaInbox className="mb-3 text-5xl" />
              Você ainda não enviou nenhuma sugestão para a equipe Fut7Pro.
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sugestoesSistemaFiltradas.map((s) => (
              <div
                key={s.id}
                className={`rounded-lg border-l-4 bg-[#232323] p-4 shadow ${s.status === "Respondida" ? "border-green-500" : "border-yellow-400"} animate-fadeIn`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="font-bold text-yellow-200">
                    Você
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {s.data}
                    </span>
                  </div>
                  <div>
                    {s.status === "Respondida" && (
                      <span className="inline-flex items-center gap-1 rounded bg-green-800 px-2 py-1 text-xs font-bold text-green-300">
                        <FaRegCheckCircle /> Respondida
                      </span>
                    )}
                    {s.status === "Aguardando" && (
                      <span className="inline-flex items-center gap-1 rounded bg-yellow-800 px-2 py-1 text-xs font-bold text-yellow-300">
                        <FaInbox /> Aguardando resposta
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-2 text-sm text-gray-200">{s.mensagem}</div>
                {s.resposta && (
                  <div className="mb-2 rounded bg-[#181818] p-2 text-sm text-green-400">
                    <b>Resposta da equipe Fut7Pro:</b> {s.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal de resposta rápida */}
        {modalAberto && sugestaoSelecionada && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md rounded-lg border border-yellow-500 bg-[#222] p-6 shadow-lg">
              <h2 className="mb-2 flex items-center gap-2 font-bold text-yellow-400">
                <FaRegCommentDots /> Responder Sugestão
              </h2>
              <div className="mb-2 text-sm text-gray-200">
                {sugestaoSelecionada.mensagem}
              </div>
              <textarea
                className="mb-2 min-h-[90px] w-full rounded border border-yellow-400 bg-[#181818] p-2 text-gray-100"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta aqui..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  className="rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarResposta}
                  className="rounded bg-green-700 px-4 py-1 font-bold text-white hover:bg-green-600"
                >
                  Enviar resposta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de envio de sugestão */}
        {envioAberto && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md rounded-lg border border-yellow-500 bg-[#232323] p-6 shadow-lg">
              <h2 className="mb-2 flex items-center gap-2 font-bold text-yellow-400">
                <FaPaperPlane /> Enviar Sugestão à Equipe Fut7Pro
              </h2>
              <div className="mb-3 text-sm text-gray-200">
                Mande uma ideia ou sugestão de melhoria para o Fut7Pro! Seja
                objetivo, a equipe irá analisar e pode implementar nas próximas
                versões.
              </div>
              {sucessoEnvio ? (
                <div className="rounded bg-green-900 p-3 text-center text-green-300">
                  <b>Sugestão enviada com sucesso!</b>
                  <br />
                  Agradecemos sua colaboração, admin!
                  <button
                    className="mt-4 rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                    onClick={() => setEnvioAberto(false)}
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    className="mb-2 min-h-[90px] w-full rounded border border-yellow-400 bg-[#181818] p-2 text-gray-100"
                    value={novaSugestao}
                    onChange={(e) => setNovaSugestao(e.target.value)}
                    placeholder="Digite sua sugestão para o Fut7Pro..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEnvioAberto(false)}
                      className="rounded bg-gray-700 px-4 py-1 text-gray-200 hover:bg-gray-600"
                      disabled={enviando}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={enviarSugestao}
                      className="rounded bg-yellow-400 px-4 py-1 font-bold text-[#181818] hover:bg-yellow-500"
                      disabled={enviando || novaSugestao.length < 8}
                    >
                      {enviando ? "Enviando..." : "Enviar Sugestão"}
                    </button>
                  </div>
                </>
              )}
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

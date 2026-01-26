"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaPaperPlane,
  FaRegCommentDots,
  FaInbox,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRacha } from "@/context/RachaContext";

type StatusSugestao = "Nova" | "Respondida" | "Recusada";

type Sugestao = {
  id: string;
  autor: string;
  email?: string;
  data: string;
  mensagem: string;
  resposta?: string;
  status: StatusSugestao;
};

type SugestaoSistema = {
  id: string;
  data: string;
  mensagem: string;
  resposta?: string;
  status: "Aguardando" | "Respondida";
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt?: string;
};

export default function SugestoesPage() {
  const { user } = useAuth();
  const { tenantSlug } = useRacha();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusSugestao | "Todas">("Todas");
  const [envioAberto, setEnvioAberto] = useState(false);
  const [novaSugestao, setNovaSugestao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucessoEnvio, setSucessoEnvio] = useState(false);
  const [envioErro, setEnvioErro] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarMensagens = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/contact/messages?limit=200", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Erro ao carregar sugestoes");
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setMensagens(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar sugestoes");
      setMensagens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMensagens();
  }, []);

  const sugestoesAtletas = useMemo<Sugestao[]>(() => {
    return mensagens
      .filter((msg) => {
        const subject = (msg.subject || "").toLowerCase();
        const isSugestao = subject.includes("sugestao");
        const isAdmin = subject.includes("admin");
        return isSugestao && !isAdmin;
      })
      .map((msg) => ({
        id: msg.id,
        autor: msg.name || "Atleta",
        email: msg.email,
        data: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("pt-BR") : "--",
        mensagem: msg.message,
        status: "Nova",
      }));
  }, [mensagens]);

  const sugestoesAtletasFiltradas = useMemo(() => {
    const search = busca.toLowerCase();
    return sugestoesAtletas.filter(
      (s) =>
        (filtroStatus === "Todas" || s.status === filtroStatus) &&
        (s.mensagem.toLowerCase().includes(search) || s.autor.toLowerCase().includes(search))
    );
  }, [sugestoesAtletas, busca, filtroStatus]);

  const sugestoesSistema = useMemo<SugestaoSistema[]>(() => {
    return mensagens
      .filter((msg) => {
        const subject = (msg.subject || "").toLowerCase();
        return subject.includes("sugestao") && subject.includes("admin");
      })
      .map((msg) => ({
        id: msg.id,
        data: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("pt-BR") : "--",
        mensagem: msg.message,
        status: "Aguardando",
      }));
  }, [mensagens]);

  const sugestoesSistemaFiltradas = useMemo(() => {
    const search = busca.toLowerCase();
    return sugestoesSistema.filter((s) => s.mensagem.toLowerCase().includes(search));
  }, [sugestoesSistema, busca]);

  function abrirEnvioSugestao() {
    setEnvioAberto(true);
    setNovaSugestao("");
    setSucessoEnvio(false);
    setEnvioErro(null);
  }

  async function enviarSugestao() {
    if (!novaSugestao.trim()) return;

    const slug = tenantSlug || user?.tenantId || "";
    if (!slug) {
      setEnvioErro("Racha sem identificacao.");
      return;
    }

    if (!user?.email) {
      setEnvioErro("Email do administrador nao encontrado.");
      return;
    }

    setEnviando(true);
    setEnvioErro(null);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: user?.name || "Admin",
          email: user.email,
          phone: "",
          subject: "Sugestao Admin",
          message: novaSugestao.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Erro ao enviar sugestao.");
      }

      setSucessoEnvio(true);
      setNovaSugestao("");
      await carregarMensagens();
    } catch (err) {
      setEnvioErro(err instanceof Error ? err.message : "Erro ao enviar sugestao.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sugestões e Feedback | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Receba sugestões dos jogadores e envie feedback direto à equipe Fut7Pro."
        />
        <meta name="keywords" content="Fut7, racha, sugestões, feedback, SaaS, admin" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <FaRegCommentDots className="text-2xl" /> Sugestões e Feedback
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm animate-fadeIn">
          <b className="text-yellow-300">Canal profissional de sugestões para evoluir o Fut7Pro!</b>
          <br />
          Veja sugestões enviadas pelos jogadores do seu racha <b>e</b> acompanhe sugestões que você
          enviou para a equipe do Fut7Pro.
          <br />
          Assim você engaja seu grupo e ainda contribui para evolução do sistema!
        </div>

        {/* Barra superior: busca + filtros + botão de sugestão */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por palavra, autor ou data…"
            className="flex-1 bg-[#181818] border border-yellow-400 rounded px-4 py-2 text-yellow-300 font-bold outline-none"
            autoComplete="off"
          />
          <select
            className="bg-[#181818] border border-yellow-400 rounded px-3 py-2 text-yellow-300 font-bold"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusSugestao | "Todas")}
          >
            <option value="Todas">Todas</option>
            <option value="Nova">Novas</option>
            <option value="Respondida">Respondidas</option>
            <option value="Recusada">Recusadas</option>
          </select>
          <button
            onClick={abrirEnvioSugestao}
            className="bg-yellow-400 hover:bg-yellow-500 text-[#181818] font-bold px-4 py-2 rounded flex items-center gap-2 transition shadow"
          >
            <FaPaperPlane /> Enviar sugestão à equipe Fut7Pro
          </button>
        </div>

        {/* SUGESTÕES DOS ATLETAS */}
        <div className="mb-12">
          <div className="font-bold text-lg text-yellow-300 mb-2 mt-6">
            Sugestões Recebidas dos Atletas
          </div>
          {loading ? (
            <div className="text-gray-400 py-12 flex flex-col items-center">Carregando...</div>
          ) : error ? (
            <div className="text-red-400 py-12 text-center">
              Falha ao carregar sugestões.
              {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
            </div>
          ) : sugestoesAtletasFiltradas.length === 0 ? (
            <div className="text-gray-400 py-12 flex flex-col items-center">
              <FaInbox className="text-5xl mb-3" />
              Nenhuma sugestão encontrada para este filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sugestoesAtletasFiltradas.map((s) => (
                <div
                  key={s.id}
                  className={`bg-[#232323] rounded-lg p-4 shadow border-l-4 ${
                    s.status === "Respondida"
                      ? "border-green-500"
                      : s.status === "Recusada"
                        ? "border-red-500"
                        : "border-yellow-400"
                  } animate-fadeIn`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-yellow-300">
                      {s.autor}
                      <span className="ml-2 text-xs text-gray-400 font-normal">{s.data}</span>
                    </div>
                    <div>
                      {s.status === "Respondida" && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-800 text-green-300 text-xs font-bold gap-1">
                          <FaRegCheckCircle /> Respondida
                        </span>
                      )}
                      {s.status === "Recusada" && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-800 text-red-300 text-xs font-bold gap-1">
                          <FaRegTimesCircle /> Recusada
                        </span>
                      )}
                      {s.status === "Nova" && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-800 text-yellow-300 text-xs font-bold gap-1">
                          <FaInbox /> Nova
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-200 text-sm mb-2">{s.mensagem}</div>
                  {s.resposta && (
                    <div className="bg-[#181818] text-green-400 text-sm rounded p-2 mb-2">
                      <b>Resposta:</b> {s.resposta}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {s.status === "Nova" && s.email && (
                      <button
                        className="bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-1 rounded text-xs"
                        onClick={() => window.open(`mailto:${s.email}`, "_blank")}
                      >
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* SUGESTÕES ENVIADAS AO SISTEMA FUT7PRO */}
        <div className="mb-12">
          <div className="font-bold text-lg text-yellow-300 mb-2 mt-6">
            Sugestões Enviadas para o Fut7Pro (Equipe/SuperAdmin)
          </div>
          {loading ? (
            <div className="text-gray-400 py-8 flex flex-col items-center">Carregando...</div>
          ) : error ? (
            <div className="text-red-400 py-8 text-center">
              Falha ao carregar sugestões enviadas.
              {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
            </div>
          ) : sugestoesSistemaFiltradas.length === 0 ? (
            <div className="text-gray-400 py-8 flex flex-col items-center">
              <FaInbox className="text-5xl mb-3" />
              Você ainda não enviou nenhuma sugestão para a equipe Fut7Pro.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sugestoesSistemaFiltradas.map((s) => (
                <div
                  key={s.id}
                  className={`bg-[#232323] rounded-lg p-4 shadow border-l-4 ${
                    s.status === "Respondida" ? "border-green-500" : "border-yellow-400"
                  } animate-fadeIn`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-yellow-200">
                      Você
                      <span className="ml-2 text-xs text-gray-400 font-normal">{s.data}</span>
                    </div>
                    <div>
                      {s.status === "Respondida" && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-800 text-green-300 text-xs font-bold gap-1">
                          <FaRegCheckCircle /> Respondida
                        </span>
                      )}
                      {s.status === "Aguardando" && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-800 text-yellow-300 text-xs font-bold gap-1">
                          <FaInbox /> Aguardando resposta
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-200 text-sm mb-2">{s.mensagem}</div>
                  {s.resposta && (
                    <div className="bg-[#181818] text-green-400 text-sm rounded p-2 mb-2">
                      <b>Resposta da equipe Fut7Pro:</b> {s.resposta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal de envio de sugestão */}
        {envioAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#232323] rounded-lg max-w-md w-full p-6 shadow-lg border border-yellow-500">
              <h2 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <FaPaperPlane /> Enviar Sugestão à Equipe Fut7Pro
              </h2>
              <div className="text-gray-200 mb-3 text-sm">
                Mande uma ideia ou sugestão de melhoria para o Fut7Pro! Seja objetivo, a equipe irá
                analisar e pode implementar nas próximas versões.
              </div>
              {sucessoEnvio ? (
                <div className="bg-green-900 text-green-300 rounded p-3 text-center">
                  <b>Sugestão enviada com sucesso!</b>
                  <br />
                  Agradecemos sua colaboração, admin!
                  <button
                    className="mt-4 bg-gray-700 text-gray-200 px-4 py-1 rounded hover:bg-gray-600"
                    onClick={() => setEnvioAberto(false)}
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {envioErro && (
                    <div className="bg-red-900 text-red-200 rounded p-2 mb-2 text-sm">
                      {envioErro}
                    </div>
                  )}
                  <textarea
                    className="w-full min-h-[90px] p-2 rounded bg-[#181818] text-gray-100 border border-yellow-400 mb-2"
                    value={novaSugestao}
                    onChange={(e) => setNovaSugestao(e.target.value)}
                    placeholder="Digite sua sugestão para o Fut7Pro..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEnvioAberto(false)}
                      className="bg-gray-700 text-gray-200 px-4 py-1 rounded hover:bg-gray-600"
                      disabled={enviando}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={enviarSugestao}
                      className="bg-yellow-400 hover:bg-yellow-500 text-[#181818] font-bold px-4 py-1 rounded"
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

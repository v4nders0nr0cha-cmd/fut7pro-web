"use client";

import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaHeadset, FaPlus, FaCheckCircle, FaTimesCircle, FaClock, FaReply } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRacha } from "@/context/RachaContext";

type Status = "aguardando" | "respondido" | "finalizado";

type Chamado = {
  id: string;
  assunto: string;
  mensagem: string;
  tipo: "Problema Tecnico" | "Financeiro" | "Duvida" | "Sugestao" | "Outro";
  status: Status;
  data: string;
  resposta?: string;
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

const tiposChamado: Chamado["tipo"][] = [
  "Problema Tecnico",
  "Financeiro",
  "Duvida",
  "Sugestao",
  "Outro",
];

const parseSubject = (subject: string) => {
  const normalized = subject.replace(/\s+/g, " ").trim();
  const cleaned = normalized.replace(/^suporte\s*[-:]*\s*/i, "");
  const parts = cleaned
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  const tipo = parts.length > 0 ? parts[0] : "Outro";
  const assunto = parts.length > 1 ? parts.slice(1).join(" - ") : normalized || "Suporte";

  return { tipo, assunto };
};

export default function SuportePage() {
  const { user } = useAuth();
  const { tenantSlug } = useRacha();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState({
    assunto: "",
    mensagem: "",
    tipo: "Problema Tecnico" as Chamado["tipo"],
  });
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const carregarChamados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/contact/messages?limit=200", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Erro ao carregar chamados");
      }
      const data = await response.json();
      const list: ContactMessage[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      const chamadosNormalizados: Chamado[] = list
        .filter((msg) => (msg.subject || "").toLowerCase().includes("suporte"))
        .map((msg) => {
          const { tipo, assunto } = parseSubject(msg.subject || "");
          const tipoNormalizado = tiposChamado.includes(tipo as Chamado["tipo"])
            ? (tipo as Chamado["tipo"])
            : "Outro";
          return {
            id: msg.id,
            assunto,
            mensagem: msg.message,
            tipo: tipoNormalizado,
            status: "aguardando",
            data: msg.createdAt || "",
          };
        });

      setChamados(chamadosNormalizados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chamados");
      setChamados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  const chamadosOrdenados = useMemo(() => {
    return [...chamados].sort((a, b) => {
      const aTime = a.data ? new Date(a.data).getTime() : 0;
      const bTime = b.data ? new Date(b.data).getTime() : 0;
      return bTime - aTime;
    });
  }, [chamados]);

  async function handleNovoChamado() {
    if (!novo.assunto.trim() || !novo.mensagem.trim()) {
      setFeedback({ success: false, message: "Preencha todos os campos." });
      return;
    }

    const slug = tenantSlug || user?.tenantId || "";
    if (!slug) {
      setFeedback({ success: false, message: "Racha sem identificacao." });
      return;
    }

    if (!user?.email) {
      setFeedback({ success: false, message: "Email do administrador nao encontrado." });
      return;
    }

    setEnviando(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: user?.name || "Admin",
          email: user.email,
          phone: "",
          subject: `Suporte - ${novo.tipo} - ${novo.assunto}`,
          message: novo.mensagem.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Erro ao enviar chamado.");
      }

      setNovo({ assunto: "", mensagem: "", tipo: "Problema Tecnico" as Chamado["tipo"] });
      setShowForm(false);
      setFeedback({
        success: true,
        message: "Chamado aberto com sucesso! Nossa equipe vai te responder em breve.",
      });
      await carregarChamados();
    } catch (err) {
      setFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Erro ao enviar chamado.",
      });
    } finally {
      setEnviando(false);
    }
  }

  function statusColor(status: Status) {
    return status === "aguardando"
      ? "text-yellow-300"
      : status === "respondido"
        ? "text-green-400"
        : "text-gray-400";
  }

  function statusLabel(status: Status) {
    return status === "aguardando" ? (
      <>
        <FaClock className="inline mr-1" /> Aguardando resposta
      </>
    ) : status === "respondido" ? (
      <>
        <FaReply className="inline mr-1" /> Respondido
      </>
    ) : (
      <>
        <FaCheckCircle className="inline mr-1" /> Finalizado
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Suporte | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Abra chamados, tire dúvidas e acompanhe o atendimento dedicado ao administrador Fut7Pro."
        />
        <meta name="keywords" content="Fut7, racha, suporte, chamado, atendimento, SaaS" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaHeadset /> Suporte
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <span className="font-bold text-yellow-300">Como funciona?</span>
          <br />
          Abra chamados para relatar problemas, tirar dúvidas ou enviar sugestões. Nossa equipe
          responderá diretamente por aqui, e você pode acompanhar o status de cada atendimento. O
          suporte do Fut7Pro é 100% dedicado ao administrador.
          <br />
        </div>

        {/* Botão Novo Chamado */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 flex items-center gap-2 bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300 transition shadow"
          >
            <FaPlus /> Abrir chamado
          </button>
        )}

        {/* Formulário Novo Chamado */}
        {showForm && (
          <div className="mb-8 bg-[#222] rounded-lg p-5 shadow animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-gray-300 font-semibold">Assunto</label>
                <input
                  type="text"
                  className="bg-[#111] border border-yellow-400 rounded px-3 py-2 w-full text-yellow-300 font-bold"
                  maxLength={50}
                  placeholder="Descreva o assunto"
                  value={novo.assunto}
                  onChange={(e) => setNovo((v) => ({ ...v, assunto: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-gray-300 font-semibold">Tipo</label>
                <select
                  className="bg-[#111] border border-yellow-400 rounded px-3 py-2 w-full text-yellow-300 font-bold"
                  value={novo.tipo}
                  onChange={(e) =>
                    setNovo((v) => ({ ...v, tipo: e.target.value as Chamado["tipo"] }))
                  }
                >
                  {tiposChamado.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="text-gray-300 font-semibold">Mensagem</label>
              <textarea
                className="bg-[#111] border border-yellow-400 rounded px-3 py-2 w-full text-gray-200 min-h-[56px] custom-scroll"
                maxLength={400}
                placeholder="Descreva o problema, dúvida ou sugestão com detalhes"
                value={novo.mensagem}
                onChange={(e) => setNovo((v) => ({ ...v, mensagem: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleNovoChamado}
                disabled={enviando || !novo.assunto.trim() || !novo.mensagem.trim()}
                className="bg-yellow-400 text-black font-bold px-5 py-2 rounded hover:bg-yellow-300 transition"
              >
                Enviar chamado
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={enviando}
                className="bg-[#333] text-gray-300 px-5 py-2 rounded hover:bg-[#222] transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-8 flex items-center gap-2 px-4 py-3 rounded font-bold shadow
                        ${feedback.success ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
          >
            {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
            {feedback.message}
            <button className="ml-4 text-white text-lg" onClick={() => setFeedback(null)}>
              ×
            </button>
          </div>
        )}

        {/* Histórico de chamados */}
        <div className="mt-4">
          <div className="font-bold text-gray-300 mb-2 text-lg flex items-center gap-2">
            <FaHeadset /> Histórico de chamados
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-400 text-center py-10">Carregando...</div>
            ) : error ? (
              <div className="text-red-400 text-center py-10">
                Falha ao carregar chamados.
                {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
              </div>
            ) : chamadosOrdenados.length === 0 ? (
              <div className="text-gray-400 text-center py-10">Nenhum chamado aberto ainda.</div>
            ) : (
              chamadosOrdenados.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#181818] rounded-lg p-4 shadow border-l-4 border-yellow-400 animate-fadeIn"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-yellow-300">{ch.assunto}</div>
                      <div className="text-xs text-gray-400">
                        {ch.tipo} • {ch.data ? new Date(ch.data).toLocaleString() : "--"}
                      </div>
                      <div className="mt-1 text-gray-200">{ch.mensagem}</div>
                    </div>
                    <div
                      className={`mt-3 md:mt-0 md:text-right font-bold ${statusColor(ch.status)}`}
                    >
                      {statusLabel(ch.status)}
                    </div>
                  </div>
                  {ch.resposta && (
                    <div className="mt-4 bg-[#232323] p-3 rounded-lg border-l-4 border-green-400">
                      <div className="text-green-400 font-semibold mb-1">Resposta Fut7Pro:</div>
                      <div className="text-gray-100">{ch.resposta}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #222;
                    border-radius: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #181818;
                }
                .custom-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #222 #181818;
                }
                .animate-fadeIn { animation: fadeIn 0.35s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}

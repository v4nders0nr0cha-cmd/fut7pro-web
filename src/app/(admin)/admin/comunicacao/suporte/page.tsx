"use client";

import Head from "next/head";
import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  FaHeadset,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaReply,
  FaTrash,
} from "react-icons/fa";

type Status = "aguardando" | "respondido" | "finalizado";

type Chamado = {
  id: number;
  assunto: string;
  mensagem: string;
  tipo: "Problema Técnico" | "Financeiro" | "Dúvida" | "Sugestão" | "Outro";
  status: Status;
  data: string;
  resposta?: string;
  imagem?: string; // base64
};

const chamadosMock: Chamado[] = [
  {
    id: 1,
    assunto: "Erro ao cadastrar jogador",
    mensagem: "Ao tentar cadastrar um novo jogador, aparece uma mensagem de erro.",
    tipo: "Problema Técnico",
    status: "respondido",
    data: "2025-07-12T10:00:00Z",
    resposta:
      "Olá! Esse erro já foi corrigido na última atualização. Por favor, tente novamente e nos avise se persistir.",
    imagem: "",
  },
  {
    id: 2,
    assunto: "Como alterar a identidade visual?",
    mensagem: "Gostaria de trocar as cores do meu racha, como faço?",
    tipo: "Dúvida",
    status: "aguardando",
    data: "2025-07-13T16:30:00Z",
  },
];

const tiposChamado = ["Problema Técnico", "Financeiro", "Dúvida", "Sugestão", "Outro"];

export default function SuportePage() {
  const [chamados, setChamados] = useState<Chamado[]>(chamadosMock);
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState({
    assunto: "",
    mensagem: "",
    tipo: "Problema Técnico" as Chamado["tipo"],
    imagem: "" as string,
  });
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  function handleNovoChamado() {
    if (!novo.assunto.trim() || !novo.mensagem.trim()) {
      setFeedback({ success: false, message: "Preencha todos os campos." });
      return;
    }
    setChamados((prev) => [
      {
        id: Math.max(...prev.map((c) => c.id)) + 1,
        assunto: novo.assunto,
        mensagem: novo.mensagem,
        tipo: novo.tipo,
        status: "aguardando",
        data: new Date().toISOString(),
        imagem: novo.imagem || "",
      },
      ...prev,
    ]);
    setNovo({ assunto: "", mensagem: "", tipo: "Problema Técnico", imagem: "" });
    setImagemPreview("");
    setShowForm(false);
    setFeedback({
      success: true,
      message: "Chamado aberto com sucesso! Nossa equipe vai te responder em breve.",
    });
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

  function handleImagem(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback({ success: false, message: "Envie apenas imagens (png, jpg, jpeg, gif, webp)." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ success: false, message: "Imagem deve ter até 5MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNovo((v) => ({ ...v, imagem: ev.target?.result as string }));
      setImagemPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removerImagem() {
    setNovo((v) => ({ ...v, imagem: "" }));
    setImagemPreview("");
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
          <span className="text-gray-300">
            Você pode anexar uma imagem/print para facilitar o atendimento (formatos aceitos: png,
            jpg, jpeg, gif, webp, até 5MB).
          </span>
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
            {/* Upload de imagem */}
            <div className="mt-5">
              <label className="text-gray-300 font-semibold mb-2 block">
                Anexar imagem (opcional)
              </label>
              {!imagemPreview && (
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-gray-300"
                  onChange={handleImagem}
                />
              )}
              {imagemPreview && (
                <div className="flex items-center gap-4 mt-2">
                  <img
                    src={imagemPreview}
                    alt="Preview do anexo"
                    className="max-h-32 rounded border border-yellow-400"
                    style={{ maxWidth: 160 }}
                  />
                  <button
                    onClick={removerImagem}
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition flex items-center gap-1 font-bold"
                    title="Remover imagem"
                  >
                    <FaTrash /> Remover
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleNovoChamado}
                className="bg-yellow-400 text-black font-bold px-5 py-2 rounded hover:bg-yellow-300 transition"
              >
                Enviar chamado
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setImagemPreview("");
                  setNovo((v) => ({ ...v, imagem: "" }));
                }}
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
            {chamados.length === 0 && (
              <div className="text-gray-400 text-center py-10">Nenhum chamado aberto ainda.</div>
            )}
            {chamados.map((ch) => (
              <div
                key={ch.id}
                className="bg-[#181818] rounded-lg p-4 shadow border-l-4 border-yellow-400 animate-fadeIn"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold text-yellow-300">{ch.assunto}</div>
                    <div className="text-xs text-gray-400">
                      {ch.tipo} • {new Date(ch.data).toLocaleString()}
                    </div>
                    <div className="mt-1 text-gray-200">{ch.mensagem}</div>
                    {ch.imagem && (
                      <div className="mt-2">
                        <img
                          src={ch.imagem}
                          alt="Anexo"
                          className="max-h-32 rounded border border-yellow-400"
                          style={{ maxWidth: 160 }}
                        />
                      </div>
                    )}
                  </div>
                  <div className={`mt-3 md:mt-0 md:text-right font-bold ${statusColor(ch.status)}`}>
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
            ))}
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

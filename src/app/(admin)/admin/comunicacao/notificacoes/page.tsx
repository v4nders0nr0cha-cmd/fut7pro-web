"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaPaperPlane, FaCheckCircle, FaTimesCircle, FaUsers, FaFilter } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { notificacoesApi } from "@/lib/api";

type HistoryEntry = {
  id: string;
  destinatario: string;
  grupo: string;
  mensagem: string;
  canais: string[];
  data: string;
  status: "enviado" | "erro";
};

const gruposPorCategoria = [
  {
    label: "Todos / Gerais",
    options: [
      { label: "Todos os Jogadores", value: "todos" },
      { label: "Jogadores Ativos", value: "ativos" },
      { label: "Jogadores Inativos", value: "inativos" },
      { label: "Recém-Cadastrados", value: "novos" },
    ],
  },
  {
    label: "Presença / Participação",
    options: [
      { label: "Mensalistas", value: "mensalistas" },
      { label: "Faltosos", value: "faltosos" },
      { label: "Suspensos", value: "suspensos" },
    ],
  },
  {
    label: "Função / Posição",
    options: [
      { label: "Goleiros", value: "goleiros" },
      { label: "Administradores", value: "admins" },
    ],
  },
  {
    label: "Times & Eventos",
    options: [
      { label: "Jogadores no Time do Dia", value: "time_do_dia" },
      { label: "Jogadores sem Foto", value: "sem_foto" },
      { label: "Aniversariantes do Dia", value: "aniversariantes_dia" },
    ],
  },
];

const canaisExplicacao = [
  {
    value: "badge",
    label: "🛎️ Badge (Painel)",
    desc: "Aviso visual no painel do jogador assim que ele acessa o sistema. Todos visualizam.",
  },
  {
    value: "push",
    label: "📱 Push",
    desc: "Notificação que aparece direto na tela do celular, mesmo fora do site/app. Só para quem aceitou receber.",
  },
  {
    value: "email",
    label: "✉️ E-mail",
    desc: "Mensagem enviada para a caixa de entrada de e-mail do jogador. Só recebe quem cadastrou e-mail.",
  },
  {
    value: "whatsapp",
    label: "💬 WhatsApp",
    desc: "Mensagem enviada para o WhatsApp do jogador. Só recebe quem cadastrou o número corretamente.",
  },
];

export default function NotificacoesPage() {
  const { user } = useAuth();
  const { notificacoes, isLoading, isError, error, mutate } = useNotifications({});
  const [grupo, setGrupo] = useState("todos");
  const [mensagem, setMensagem] = useState("");
  const [canais, setCanais] = useState<string[]>(["badge", "push"]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  function getGrupoLabel(valor: string) {
    for (const cat of gruposPorCategoria) {
      const opt = cat.options.find((o) => o.value === valor);
      if (opt) return opt.label;
    }
    return "Personalizado";
  }

  const historico = useMemo<HistoryEntry[]>(() => {
    return notificacoes
      .filter((notif) => {
        const meta = (notif.metadata || {}) as Record<string, unknown>;
        const category = (meta.category || meta.categoria || "").toString().toLowerCase();
        const kind = (meta.kind || meta.tipo || "").toString().toLowerCase();
        return (
          category.includes("notificacao") || category.includes("mensagem") || kind.includes("mass")
        );
      })
      .map((notif) => {
        const meta = (notif.metadata || {}) as Record<string, unknown>;
        const badge =
          meta.badge === true || meta.badge === "true" || meta.badge === "1" || meta.badge === 1;
        const channels = (notif.channels || [])
          .map((channel) => channel.toString().toLowerCase())
          .filter(Boolean);
        if (badge) {
          channels.unshift("badge");
        }
        const statusValue = (meta.status || meta.statusEnvio || "").toString().toLowerCase();
        return {
          id: notif.id,
          destinatario: (meta.audienceLabel || meta.audience || "Todos os Jogadores").toString(),
          grupo: (meta.audience || meta.grupo || "todos").toString(),
          mensagem: (notif.mensagem || notif.message || "").toString(),
          canais: channels,
          data: notif.data || "",
          status: statusValue === "erro" ? "erro" : "enviado",
        };
      })
      .sort((a, b) => {
        const aTime = a.data ? new Date(a.data).getTime() : 0;
        const bTime = b.data ? new Date(b.data).getTime() : 0;
        return bTime - aTime;
      });
  }, [notificacoes]);

  function handleCanalToggle(canal: string) {
    setCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal]
    );
  }

  async function handleEnviarNotificacao() {
    if (!mensagem.trim()) {
      setFeedback({ success: false, message: "Digite uma mensagem para enviar." });
      return;
    }
    if (canais.length === 0) {
      setFeedback({ success: false, message: "Selecione ao menos um canal de envio." });
      return;
    }

    setEnviando(true);
    setFeedback(null);

    try {
      const badgeEnabled = canais.includes("badge");
      const channelMap: Record<string, string> = {
        push: "PUSH",
        email: "EMAIL",
        whatsapp: "WHATSAPP",
      };
      const channelsPayload = canais
        .filter((canal) => canal !== "badge")
        .map((canal) => channelMap[canal])
        .filter(Boolean);
      const groupLabel = getGrupoLabel(grupo);

      const response = await notificacoesApi.create({
        title: `Mensagem para ${groupLabel}`,
        message: mensagem.trim(),
        type: "PERSONALIZADA",
        channels: channelsPayload,
        metadata: {
          category: "notificacao",
          kind: "mass",
          badge: badgeEnabled,
          audience: grupo,
          audienceLabel: groupLabel,
          autor: user?.name || "Administração",
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setMensagem("");
      setCanais(["badge", "push"]);
      setFeedback({ success: true, message: "Notificacao enviada com sucesso!" });
      await mutate();
    } catch (err) {
      setFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Erro ao enviar notificacao.",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Notificações | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Envie notificações em massa, push, e-mails ou mensagens diretas para grupos de jogadores no Fut7Pro."
        />
        <meta name="keywords" content="Fut7, racha, notificações, mensagens em massa, SaaS" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
          Notificações / Mensagens em Massa
        </h1>
        {/* Bloco explicativo */}
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <div className="font-bold text-yellow-300 mb-1 flex items-center gap-2">
            ✉️ O que são Notificações / Mensagens em Massa?
          </div>
          <p className="text-gray-200 text-sm mb-2">
            Envie mensagens em massa para grupos específicos ou para todos os jogadores. Só recebem
            os jogadores com cadastro completo para cada canal. Use para avisos urgentes, lembretes
            de mensalidade ou mudanças de horário.
          </p>
          <div className="font-bold text-yellow-300 mb-1 mt-2 flex items-center gap-2">
            🔔 Como funciona cada canal de envio?
          </div>
          <ul className="list-disc pl-4 text-gray-200 space-y-1">
            <li>
              <span className="font-semibold">🛎️ Badge (Painel):</span> Aviso visual dentro do
              painel do jogador, destacado até ser lido.
            </li>
            <li>
              <span className="font-semibold">📱 Push:</span> Notificação instantânea na tela do
              celular (igual WhatsApp, Instagram). Só recebe quem aceitou.
            </li>
            <li>
              <span className="font-semibold">✉️ E-mail:</span> Mensagem enviada para o e-mail do
              jogador. Só recebe quem cadastrou o e-mail.
            </li>
            <li>
              <span className="font-semibold">💬 WhatsApp:</span> Mensagem enviada para o WhatsApp
              do jogador. Só recebe quem cadastrou corretamente.
            </li>
          </ul>
        </div>
        {/* Formulário */}
        <form
          className="bg-[#232323] rounded-lg p-6 shadow mb-10 animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviarNotificacao();
          }}
        >
          <div className="flex flex-col gap-3">
            <label className="text-gray-300 font-semibold" htmlFor="grupo">
              <FaFilter className="inline mr-2" /> Selecionar grupo
            </label>
            <select
              id="grupo"
              className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
            >
              {gruposPorCategoria.map((cat) => (
                <optgroup key={cat.label} label={cat.label}>
                  {cat.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-gray-300 font-semibold" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              className="bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2 min-h-[44px] max-h-[120px] custom-scroll"
              maxLength={240}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite a mensagem a ser enviada para o grupo selecionado"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-gray-300 font-semibold">Canais de envio</label>
            <div className="flex flex-col gap-2">
              {canaisExplicacao.map((canal) => (
                <label
                  key={canal.value}
                  className="flex items-center gap-2 group cursor-pointer hover:text-yellow-400 transition"
                  title={canal.desc}
                >
                  <input
                    type="checkbox"
                    checked={canais.includes(canal.value)}
                    onChange={() => handleCanalToggle(canal.value)}
                    className="accent-yellow-400"
                  />
                  <span className="font-bold text-yellow-300 group-hover:underline">
                    {canal.label}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{canal.desc}</span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={enviando || !mensagem.trim() || canais.length === 0}
              className={`flex items-center gap-2 px-4 py-2 font-bold rounded transition mt-4
                                ${
                                  enviando || !mensagem.trim() || canais.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-yellow-400 hover:bg-yellow-300 text-black shadow"
                                }`}
            >
              <FaPaperPlane /> Enviar
            </button>
          </div>
        </form>

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

        {/* Histórico de notificações */}
        <div>
          <div className="font-bold text-gray-300 mb-2 flex items-center gap-2 text-lg">
            <FaUsers /> Histórico de notificações
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-gray-400 text-center py-10">Carregando...</div>
            ) : isError ? (
              <div className="text-red-400 text-center py-10">
                Falha ao carregar notificacoes.
                {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
              </div>
            ) : historico.length === 0 ? (
              <div className="text-gray-400 text-center py-10">
                Nenhuma notificacao enviada ainda.
              </div>
            ) : (
              historico.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-[#181818] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between shadow border-l-4 border-yellow-400 animate-fadeIn"
                >
                  <div className="flex-1">
                    <div className="font-bold text-yellow-300">{notif.destinatario}</div>
                    <div className="text-gray-200">{notif.mensagem}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Enviado em {notif.data ? new Date(notif.data).toLocaleString() : "--"}
                      <span className="ml-1">
                        Canais:{" "}
                        {notif.canais
                          .map((c) =>
                            c === "badge"
                              ? "???"
                              : c === "push"
                                ? "??"
                                : c === "email"
                                  ? "??"
                                  : c === "whatsapp"
                                    ? "??"
                                    : c
                          )
                          .join(" ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    {notif.status === "enviado" ? (
                      <span className="flex items-center gap-1 text-green-400 font-semibold text-sm">
                        <FaCheckCircle /> Enviado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-semibold text-sm">
                        <FaTimesCircle /> Erro
                      </span>
                    )}
                  </div>
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

"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaFilter,
  FaEnvelope,
  FaBell,
  FaWhatsapp,
} from "react-icons/fa";

type Notificacao = {
  id: number;
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

const notificacoesMock: Notificacao[] = [
  {
    id: 1,
    destinatario: "Todos os Jogadores",
    grupo: "todos",
    mensagem: "Lembrete: confirme sua presença para o jogo de sábado!",
    canais: ["badge", "push"],
    data: "2025-07-13T14:00:00Z",
    status: "enviado",
  },
  {
    id: 2,
    destinatario: "Mensalistas",
    grupo: "mensalistas",
    mensagem: "Atenção: prazo final para pagamento da mensalidade é dia 10.",
    canais: ["badge"],
    data: "2025-07-10T17:40:00Z",
    status: "enviado",
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
  const [notificacoes, setNotificacoes] =
    useState<Notificacao[]>(notificacoesMock);
  const [grupo, setGrupo] = useState("todos");
  const [mensagem, setMensagem] = useState("");
  const [canais, setCanais] = useState<string[]>(["badge", "push"]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function getGrupoLabel(valor: string) {
    for (const cat of gruposPorCategoria) {
      const opt = cat.options.find((o) => o.value === valor);
      if (opt) return opt.label;
    }
    return "Personalizado";
  }

  function handleCanalToggle(canal: string) {
    setCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal],
    );
  }

  function handleEnviarNotificacao() {
    if (!mensagem.trim()) {
      setFeedback({
        success: false,
        message: "Digite uma mensagem para enviar.",
      });
      return;
    }
    if (canais.length === 0) {
      setFeedback({
        success: false,
        message: "Selecione ao menos um canal de envio.",
      });
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setNotificacoes((prev) => [
        {
          id: Math.max(...prev.map((n) => n.id)) + 1,
          destinatario: getGrupoLabel(grupo),
          grupo,
          mensagem,
          canais,
          data: new Date().toISOString(),
          status: "enviado",
        },
        ...prev,
      ]);
      setMensagem("");
      setCanais(["badge", "push"]);
      setFeedback({
        success: true,
        message: "Notificação enviada com sucesso!",
      });
      setEnviando(false);
    }, 1100);
  }

  return (
    <>
      <Head>
        <title>Notificações | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Envie notificações em massa, push, e-mails ou mensagens diretas para grupos de jogadores no Fut7Pro."
        />
        <meta
          name="keywords"
          content="Fut7, racha, notificações, mensagens em massa, SaaS"
        />
      </Head>
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          Notificações / Mensagens em Massa
        </h1>
        {/* Bloco explicativo */}
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <div className="mb-1 flex items-center gap-2 font-bold text-yellow-300">
            ✉️ O que são Notificações / Mensagens em Massa?
          </div>
          <p className="mb-2 text-sm text-gray-200">
            Envie mensagens em massa para grupos específicos ou para todos os
            jogadores. Só recebem os jogadores com cadastro completo para cada
            canal. Use para avisos urgentes, lembretes de mensalidade ou
            mudanças de horário.
          </p>
          <div className="mb-1 mt-2 flex items-center gap-2 font-bold text-yellow-300">
            🔔 Como funciona cada canal de envio?
          </div>
          <ul className="list-disc space-y-1 pl-4 text-gray-200">
            <li>
              <span className="font-semibold">🛎️ Badge (Painel):</span> Aviso
              visual dentro do painel do jogador, destacado até ser lido.
            </li>
            <li>
              <span className="font-semibold">📱 Push:</span> Notificação
              instantânea na tela do celular (igual WhatsApp, Instagram). Só
              recebe quem aceitou.
            </li>
            <li>
              <span className="font-semibold">✉️ E-mail:</span> Mensagem enviada
              para o e-mail do jogador. Só recebe quem cadastrou o e-mail.
            </li>
            <li>
              <span className="font-semibold">💬 WhatsApp:</span> Mensagem
              enviada para o WhatsApp do jogador. Só recebe quem cadastrou
              corretamente.
            </li>
          </ul>
        </div>
        {/* Formulário */}
        <form
          className="animate-fadeIn mb-10 grid grid-cols-1 gap-6 rounded-lg bg-[#232323] p-6 shadow md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviarNotificacao();
          }}
        >
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-gray-300" htmlFor="grupo">
              <FaFilter className="mr-2 inline" /> Selecionar grupo
            </label>
            <select
              id="grupo"
              className="rounded border border-yellow-400 bg-[#111] px-3 py-2 font-bold text-yellow-300"
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
            <label className="font-semibold text-gray-300" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              className="custom-scroll max-h-[120px] min-h-[44px] rounded border border-yellow-400 bg-[#111] px-3 py-2 text-gray-200"
              maxLength={240}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite a mensagem a ser enviada para o grupo selecionado"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-gray-300">
              Canais de envio
            </label>
            <div className="flex flex-col gap-2">
              {canaisExplicacao.map((canal) => (
                <label
                  key={canal.value}
                  className="group flex cursor-pointer items-center gap-2 transition hover:text-yellow-400"
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
                  <span className="ml-1 text-xs text-gray-400">
                    {canal.desc}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={enviando || !mensagem.trim() || canais.length === 0}
              className={`mt-4 flex items-center gap-2 rounded px-4 py-2 font-bold transition ${
                enviando || !mensagem.trim() || canais.length === 0
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-yellow-400 text-black shadow hover:bg-yellow-300"
              }`}
            >
              <FaPaperPlane /> Enviar
            </button>
          </div>
        </form>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-8 flex items-center gap-2 rounded px-4 py-3 font-bold shadow ${feedback.success ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
          >
            {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
            {feedback.message}
            <button
              className="ml-4 text-lg text-white"
              onClick={() => setFeedback(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Histórico de notificações */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-300">
            <FaUsers /> Histórico de notificações
          </div>
          <div className="space-y-4">
            {notificacoes.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Nenhuma notificação enviada ainda.
              </div>
            )}
            {notificacoes.map((notif) => (
              <div
                key={notif.id}
                className="animate-fadeIn flex flex-col justify-between rounded-lg border-l-4 border-yellow-400 bg-[#181818] p-4 shadow md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="font-bold text-yellow-300">
                    {notif.destinatario}
                  </div>
                  <div className="text-gray-200">{notif.mensagem}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Enviado em {new Date(notif.data).toLocaleString()} •
                    <span className="ml-1">
                      Canais:{" "}
                      {notif.canais
                        .map((c) =>
                          c === "badge"
                            ? "🛎️"
                            : c === "push"
                              ? "📱"
                              : c === "email"
                                ? "✉️"
                                : c === "whatsapp"
                                  ? "💬"
                                  : c,
                        )
                        .join(" ")}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 md:mt-0">
                  {notif.status === "enviado" ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-green-400">
                      <FaCheckCircle /> Enviado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-semibold text-red-400">
                      <FaTimesCircle /> Erro
                    </span>
                  )}
                </div>
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

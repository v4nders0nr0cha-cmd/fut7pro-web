"use client";

import Head from "next/head";
import { useMemo, useState, type ReactNode } from "react";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaFilter,
  FaEnvelope,
  FaBell,
  FaWhatsapp,
  FaTrashAlt,
  FaInbox,
} from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationAnalytics } from "@/hooks/useNotificationAnalytics";
import { NOTIFICATION_CHANNEL_LABELS } from "@/constants/notification-templates";
import type { Notification, NotificationChannel, NotificationType } from "@/types/notificacao";

type ManualChannel = "badge" | "push" | "email" | "whatsapp";

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

const canaisExplicacao: Array<{
  value: ManualChannel;
  label: string;
  desc: string;
  icon: ReactNode;
  backend: NotificationChannel | null;
}> = [
  {
    value: "badge",
    label: "Badge (Painel)",
    desc: "Aviso visual dentro do painel do jogador. Fica em destaque até ser marcado como lido.",
    icon: <FaBell aria-hidden className="text-yellow-300" />,
    backend: null,
  },
  {
    value: "push",
    label: "Push",
    desc: "Notificação instantânea enviada para quem aceitou receber alertas no celular.",
    icon: <FaBell aria-hidden className="text-blue-300" />,
    backend: "PUSH",
  },
  {
    value: "email",
    label: "E-mail",
    desc: "Mensagem enviada para a caixa de entrada dos atletas com e-mail cadastrado.",
    icon: <FaEnvelope aria-hidden className="text-green-300" />,
    backend: "EMAIL",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    desc: "Disparo automatizado para quem informou o número corretamente.",
    icon: <FaWhatsapp aria-hidden className="text-emerald-400" />,
    backend: "WHATSAPP",
  },
];

const tipoNotificacaoOptions: Array<{ value: NotificationType; label: string; hint: string }> = [
  {
    value: "PERSONALIZADA",
    label: "Personalizada",
    hint: "Mensagens pontuais criadas manualmente.",
  },
  { value: "ALERTA", label: "Alerta", hint: "Comunicados urgentes ou importantes para o racha." },
  { value: "SISTEMA", label: "Sistema", hint: "Fluxos automáticos disparados pelo Fut7Pro." },
];

const manualChannelMap: Record<ManualChannel, NotificationChannel | null> = {
  badge: null,
  push: "PUSH",
  email: "EMAIL",
  whatsapp: "WHATSAPP",
};

const tipoLabels: Record<NotificationType, string> = {
  ALERTA: "Alerta",
  SISTEMA: "Sistema",
  PERSONALIZADA: "Personalizada",
};

const ANALYTICS_PERIODS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatInputDate(date: Date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function getInputDateFromOffset(offsetDays: number) {
  const reference = new Date();
  reference.setHours(12, 0, 0, 0);
  reference.setDate(reference.getDate() + offsetDays);
  return formatInputDate(reference);
}

export default function NotificacoesPage() {
  const [listaTipoFiltro, setListaTipoFiltro] = useState<NotificationType | "todos">("todos");
  const [listaCanalFiltro, setListaCanalFiltro] = useState<ManualChannel | "todos">("todos");
  const [listaAudienceFiltro, setListaAudienceFiltro] = useState("todos");
  const [listaBusca, setListaBusca] = useState("");
  const [historicoStart, setHistoricoStart] = useState(() => getInputDateFromOffset(-29));
  const [historicoEnd, setHistoricoEnd] = useState(() => getInputDateFromOffset(0));
  const [rangePreset, setRangePreset] = useState<7 | 30 | 90 | "custom">(30);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportandoHistorico, setExportandoHistorico] = useState(false);

  const notificationsFilters = useMemo(
    () => ({
      limit: 200,
      type: listaTipoFiltro === "todos" ? undefined : listaTipoFiltro,
      start: historicoStart || undefined,
      end: historicoEnd || undefined,
      search: listaBusca.trim() || undefined,
    }),
    [historicoEnd, historicoStart, listaBusca, listaTipoFiltro]
  );

  const {
    notificacoes,
    isLoading,
    isValidating,
    isError,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
  } = useNotifications({ filters: notificationsFilters });

  const [analyticsDays, setAnalyticsDays] = useState<number>(30);
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<NotificationType | "todos">(
    "todos"
  );
  const {
    analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    error: analyticsErrorMessage,
  } = useNotificationAnalytics({
    days: analyticsDays,
    type: analyticsTypeFilter === "todos" ? undefined : analyticsTypeFilter,
  });

  const [grupo, setGrupo] = useState("todos");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState<NotificationType>("PERSONALIZADA");
  const [canais, setCanais] = useState<ManualChannel[]>(["badge", "push"]);
  const [enviando, setEnviando] = useState(false);
  const [pendenteId, setPendenteId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const notificacoesOrdenadas = useMemo(
    () =>
      [...notificacoes].sort((a, b) => {
        const dataA = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
        const dataB = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
        return dataB - dataA;
      }),
    [notificacoes]
  );

  const notificacoesFiltradas = useMemo(
    () =>
      notificacoesOrdenadas.filter((notif) => {
        if (listaTipoFiltro !== "todos" && notif.type !== listaTipoFiltro) {
          return false;
        }
        if (!matchesAudienceFilter(notif.metadata)) {
          return false;
        }
        if (!matchesChannelFilter(notif.metadata)) {
          return false;
        }
        if (listaBusca.trim().length > 0) {
          const alvo = `${notif.title} ${notif.message}`.toLowerCase();
          if (!alvo.includes(listaBusca.trim().toLowerCase())) {
            return false;
          }
        }
        return true;
      }),
    [notificacoesOrdenadas, listaAudienceFiltro, listaBusca, listaCanalFiltro, listaTipoFiltro]
  );

  const possuiDados = notificacoesOrdenadas.length > 0;
  const carregandoLista = !possuiDados && isLoading;
  const filtrosAtivos =
    listaAudienceFiltro !== "todos" ||
    listaCanalFiltro !== "todos" ||
    listaTipoFiltro !== "todos" ||
    listaBusca.trim().length > 0;

  function getGrupoLabel(valor: string) {
    for (const cat of gruposPorCategoria) {
      const opt = cat.options.find((o) => o.value === valor);
      if (opt) return opt.label;
    }
    return "Grupo personalizado";
  }

  function resolveChannelsMetadata(metadata?: Notification["metadata"]) {
    const selected = metadata?.channels ?? [];
    const labels = selected.map((channel) => NOTIFICATION_CHANNEL_LABELS[channel] ?? channel);
    const record = (metadata ?? {}) as Record<string, unknown>;
    if (record.badge === true || record.badge === "true" || record.badge === "1") {
      labels.unshift("Badge (Painel)");
    }
    return labels;
  }

  function resolveAudience(metadata?: Notification["metadata"]) {
    const record = (metadata ?? {}) as Record<string, unknown>;
    if (typeof record.audienceLabel === "string" && record.audienceLabel.trim().length > 0) {
      return record.audienceLabel;
    }
    if (typeof record.audience === "string" && record.audience.trim().length > 0) {
      return getGrupoLabel(record.audience);
    }
    return "Todos os jogadores";
  }

  function matchesAudienceFilter(metadata?: Notification["metadata"]) {
    if (listaAudienceFiltro === "todos") return true;
    const record = (metadata ?? {}) as Record<string, unknown>;
    if (typeof record.audience === "string" && record.audience === listaAudienceFiltro) {
      return true;
    }
    if (
      typeof record.audienceLabel === "string" &&
      record.audienceLabel.trim().toLowerCase() ===
        getGrupoLabel(listaAudienceFiltro).trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  }

  function matchesChannelFilter(metadata?: Notification["metadata"]) {
    if (listaCanalFiltro === "todos") return true;
    const record = (metadata ?? {}) as Record<string, unknown>;
    if (listaCanalFiltro === "badge") {
      return record.badge === true || record.badge === "true" || record.badge === "1";
    }
    const backendChannel = manualChannelMap[listaCanalFiltro];
    const declared = Array.isArray(record.channels) ? record.channels : [];
    return backendChannel ? declared.includes(backendChannel) : false;
  }

  function handleRangePresetChange(days: 7 | 30 | 90) {
    setRangePreset(days);
    setHistoricoStart(getInputDateFromOffset(-(days - 1)));
    setHistoricoEnd(getInputDateFromOffset(0));
  }

  function handleStartDateChange(value: string) {
    setRangePreset("custom");
    setHistoricoStart(value);
    if (historicoEnd && value && value > historicoEnd) {
      setHistoricoEnd(value);
    }
  }

  function handleEndDateChange(value: string) {
    setRangePreset("custom");
    setHistoricoEnd(value);
    if (historicoStart && value && value < historicoStart) {
      setHistoricoStart(value);
    }
  }

  function handleLimparFiltros() {
    setListaTipoFiltro("todos");
    setListaCanalFiltro("todos");
    setListaAudienceFiltro("todos");
    setListaBusca("");
    setRangePreset(30);
    setHistoricoStart(getInputDateFromOffset(-29));
    setHistoricoEnd(getInputDateFromOffset(0));
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "Data indisponível";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleCanalToggle(canal: ManualChannel) {
    setCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal]
    );
  }

  async function handleEnviarNotificacao() {
    if (!titulo.trim()) {
      setFeedback({ success: false, message: "Informe um título para a notificação." });
      return;
    }
    if (!mensagem.trim()) {
      setFeedback({ success: false, message: "Digite a mensagem que será enviada." });
      return;
    }
    if (canais.length === 0) {
      setFeedback({ success: false, message: "Selecione pelo menos um canal de envio." });
      return;
    }

    setEnviando(true);
    setFeedback(null);

    const backendChannels = canais
      .map((canal) => manualChannelMap[canal])
      .filter((canal): canal is NotificationChannel => canal !== null);

    const metadata: Record<string, unknown> = {
      channels: backendChannels.length > 0 ? backendChannels : undefined,
      badge: canais.includes("badge"),
      audience: grupo,
      audienceLabel: getGrupoLabel(grupo),
      adhoc: true,
    };

    const resultado = await createNotification({
      title: titulo.trim(),
      message: mensagem.trim(),
      type: tipo,
      metadata,
    });

    setEnviando(false);

    if (resultado) {
      setFeedback({ success: true, message: "Notificação enviada e registrada no histórico." });
      setMensagem("");
      setTitulo("");
      setCanais(["badge", "push"]);
    } else {
      setFeedback({
        success: false,
        message: "Não foi possível enviar a notificação. Tente novamente.",
      });
    }
  }

  async function handleMarcarComoLida(id: string) {
    setPendenteId(id);
    const resposta = await markAsRead(id);
    setPendenteId(null);

    if (resposta) {
      setFeedback({ success: true, message: "Notificação marcada como lida." });
    } else {
      setFeedback({ success: false, message: "Falha ao marcar como lida. Tente novamente." });
    }
  }

  async function handleExcluir(id: string) {
    setPendenteId(id);
    const resposta = await deleteNotificacao(id);
    setPendenteId(null);

    if (resposta !== null) {
      setFeedback({ success: true, message: "Notificação removida do histórico." });
    } else {
      setFeedback({ success: false, message: "Erro ao excluir notificação." });
    }
  }

  async function handleMarcarTodasComoLidas() {
    setBulkLoading(true);
    const resultado = await markAllAsRead();
    setBulkLoading(false);

    if (resultado) {
      const mensagem =
        resultado.failed && resultado.failed > 0
          ? `Algumas notificações não puderam ser atualizadas (${resultado.failed}).`
          : `Marcamos ${resultado.updated} notificações como lidas.`;
      setFeedback({ success: !resultado.failed, message: mensagem });
    } else {
      setFeedback({ success: false, message: "Não foi possível marcar como lidas." });
    }
  }

  function normalizeExportValue(value: string | null | undefined) {
    if (!value) return "";
    return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  }

  function buildCsvContent(rows: Array<Record<string, string>>) {
    if (rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(";"),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const raw = normalizeExportValue(row[header]);
            return /[;"\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
          })
          .join(";")
      ),
    ];
    return lines.join("\r\n");
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExportHistorico() {
    if (notificacoesFiltradas.length === 0) {
      setFeedback({ success: false, message: "Nenhuma notifica��o para exportar." });
      return;
    }
    setExportandoHistorico(true);
    try {
      const rows = notificacoesFiltradas.map((notif) => ({
        id: notif.id,
        data: new Date(notif.createdAt).toISOString(),
        titulo: notif.title,
        mensagem: notif.message ?? "",
        tipo: tipoLabels[notif.type] ?? notif.type,
        status: notif.isRead ? "Lida" : "Pendente",
        canais: resolveChannelsMetadata(notif.metadata).join(" | ") || "-",
        destinatario: resolveAudience(notif.metadata),
      }));
      const safeStart = historicoStart || "todos";
      const safeEnd = historicoEnd || "hoje";
      const filenameBase = `notificacoes-${safeStart}-a-${safeEnd}`;
      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
          type: "application/json;charset=utf-8;",
        });
        downloadBlob(blob, `${filenameBase}.json`);
      } else {
        const csv = buildCsvContent(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, `${filenameBase}.csv`);
      }
      setFeedback({
        success: true,
        message: `Export gerado (${exportFormat.toUpperCase()}).`,
      });
    } catch (error) {
      setFeedback({
        success: false,
        message: "Falha ao exportar o hist�rico de notifica��es.",
      });
    } finally {
      setExportandoHistorico(false);
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
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <div className="font-bold text-yellow-300 mb-1 flex items-center gap-2">
            O que são Notificações / Mensagens em Massa?
          </div>
          <p className="text-gray-200 text-sm mb-2">
            Envie mensagens em massa para grupos específicos ou para todos os jogadores. Só recebem
            os jogadores com cadastro completo em cada canal. Use para avisos urgentes, lembretes de
            mensalidade ou mudanças de horário.
          </p>
          <div className="font-bold text-yellow-300 mb-1 mt-2 flex items-center gap-2">
            Como funciona cada canal de envio?
          </div>
          <ul className="list-disc pl-4 text-gray-200 space-y-1">
            <li>
              <span className="font-semibold">Badge (Painel):</span> Aviso visual dentro do painel
              do jogador, destacado até ser lido.
            </li>
            <li>
              <span className="font-semibold">Push:</span> Notificação instantânea no celular. Só
              recebe quem aceitou.
            </li>
            <li>
              <span className="font-semibold">E-mail:</span> Mensagem enviada para o e-mail do
              jogador cadastrado.
            </li>
            <li>
              <span className="font-semibold">WhatsApp:</span> Mensagem enviada para o número
              informado no cadastro.
            </li>
          </ul>
        </div>
        <section className="bg-[#151515] border border-neutral-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FaFilter className="text-yellow-300" />
                Filtros do histórico
              </h2>

              <p className="text-xs text-gray-400">
                Filtre por tipo, canal, destinatário e período antes de exportar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                value={listaTipoFiltro}
                onChange={(event) =>
                  setListaTipoFiltro(event.target.value as NotificationType | "todos")
                }
              >
                <option value="todos">Todos os tipos</option>

                {tipoNotificacaoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                value={listaCanalFiltro}
                onChange={(event) =>
                  setListaCanalFiltro(event.target.value as ManualChannel | "todos")
                }
              >
                <option value="todos">Todos os canais</option>

                <option value="badge">Badge (painel)</option>

                <option value="push">Push</option>

                <option value="email">E-mail</option>

                <option value="whatsapp">WhatsApp</option>
              </select>

              <select
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                value={listaAudienceFiltro}
                onChange={(event) => setListaAudienceFiltro(event.target.value)}
              >
                <option value="todos">Todos os grupos</option>

                {gruposPorCategoria.map((grupoCategoria) => (
                  <optgroup key={grupoCategoria.label} label={grupoCategoria.label}>
                    {grupoCategoria.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-sm text-gray-300">
              Busca por título/mensagem
              <input
                type="search"
                placeholder="Digite um termo"
                value={listaBusca}
                onChange={(event) => setListaBusca(event.target.value)}
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-white placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-300">
              Data inicial
              <input
                type="date"
                value={historicoStart}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-white"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-300">
              Data final
              <input
                type="date"
                value={historicoEnd}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span className="uppercase tracking-wide">Período rápido:</span>
              {[7, 30, 90].map((dias) => (
                <button
                  key={dias}
                  type="button"
                  onClick={() => handleRangePresetChange(dias as 7 | 30 | 90)}
                  className={`px-3 py-1 rounded-full border text-xs transition ${
                    rangePreset === dias
                      ? "bg-yellow-500 text-black border-yellow-400"
                      : "border-neutral-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-200"
                  }`}
                >
                  Últ. {dias} dias
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="text-xs text-gray-400 hover:text-gray-200 underline decoration-dotted"
              >
                Limpar filtros
              </button>

              <select
                className="bg-[#101010] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value as "csv" | "json")}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>

              <button
                type="button"
                onClick={handleExportHistorico}
                disabled={exportandoHistorico || notificacoesFiltradas.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  exportandoHistorico || notificacoesFiltradas.length === 0
                    ? "bg-zinc-800 text-gray-500 cursor-not-allowed border border-neutral-700"
                    : "bg-yellow-500 text-black hover:bg-yellow-400 border border-yellow-400"
                }`}
              >
                {exportandoHistorico ? "Gerando..." : "Exportar"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-[#151515] border border-neutral-800 rounded-lg p-4 space-y-4 mt-10">
          <div>
            <h2 className="text-xl font-bold text-yellow-300">Analytics recentes</h2>
            <p className="text-sm text-gray-400">
              Acompanhe o desempenho das últimas campanhas por canal e tipo de notificação.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="bg-[#111] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
              value={analyticsDays}
              onChange={(event) => setAnalyticsDays(Number(event.target.value))}
            >
              {ANALYTICS_PERIODS.map((periodo) => (
                <option key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </option>
              ))}
            </select>
            <select
              className="bg-[#111] border border-neutral-700 rounded px-3 py-2 text-sm text-white"
              value={analyticsTypeFilter}
              onChange={(event) =>
                setAnalyticsTypeFilter(event.target.value as NotificationType | "todos")
              }
            >
              <option value="todos">Todos os tipos</option>
              {tipoNotificacaoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6">
            {analyticsLoading ? (
              <div className="text-gray-400 py-6 text-sm">Carregando analytics...</div>
            ) : analyticsError ? (
              <div className="text-red-300 text-sm">
                {analyticsErrorMessage ?? "Não foi possível carregar os indicadores."}
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Enviadas"
                    value={analytics.totals.sent}
                    accent="text-yellow-300"
                  />
                  <StatCard label="Lidas" value={analytics.totals.read} accent="text-green-300" />
                  <StatCard
                    label="Pendentes"
                    value={analytics.totals.unread}
                    accent="text-red-300"
                  />
                  <StatCard
                    label="Automatizações"
                    value={analytics.totals.automations}
                    accent="text-cyan-300"
                    description={`Manuais: ${numberFormatter.format(analytics.totals.manual)}`}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#161616] rounded-xl border border-neutral-800 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Uso por canal</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analytics.totals.channels).map(([channel, count]) => (
                        <span
                          key={channel}
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-700 px-3 py-1 text-xs text-gray-200"
                        >
                          {channel === "email" && <FaEnvelope className="text-green-300" />}
                          {channel === "push" && <FaBell className="text-blue-300" />}
                          {channel === "whatsapp" && <FaWhatsapp className="text-emerald-400" />}
                          {channel === "badge" && <FaBell className="text-yellow-300" />}
                          <span className="uppercase tracking-wide text-yellow-300">{channel}</span>
                          <strong className="text-white">{numberFormatter.format(count)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#161616] rounded-xl border border-neutral-800 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">
                      Principais audiências
                    </h3>
                    {analytics.audiences.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem histórico no período.</p>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-200">
                        {analytics.audiences.slice(0, 5).map((aud) => (
                          <li
                            key={aud.label}
                            className="flex items-center justify-between border-b border-neutral-800 pb-1"
                          >
                            <span>{aud.label}</span>
                            <strong className="text-yellow-300">
                              {numberFormatter.format(aud.count)}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#161616] rounded-xl border border-neutral-800 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">
                      Tendência (últimos envios)
                    </h3>
                    {analytics.trend.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados suficientes.</p>
                    ) : (
                      <ul className="text-sm text-gray-300 space-y-2">
                        {analytics.trend
                          .slice(-5)
                          .reverse()
                          .map((trend) => (
                            <li
                              key={trend.bucket}
                              className="flex items-center justify-between border-b border-neutral-800 pb-1"
                            >
                              <span>{new Date(trend.bucket).toLocaleDateString("pt-BR")}</span>
                              <span className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="text-yellow-300">
                                  {numberFormatter.format(trend.sent)} enviadas
                                </span>
                                <span>|</span>
                                <span className="text-green-300">
                                  {numberFormatter.format(trend.read)} lidas
                                </span>
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-[#161616] rounded-xl border border-neutral-800 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Últimas campanhas</h3>
                    {analytics.latest.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma campanha registrada.</p>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-300 max-h-48 overflow-y-auto custom-scroll">
                        {analytics.latest.slice(0, 5).map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col border-b border-neutral-800 pb-2 last:border-0"
                          >
                            <span className="font-semibold text-white">{item.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleString("pt-BR")} ·{" "}
                              {tipoLabels[item.type] ?? item.type}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {item.message || "Sem mensagem"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Nenhum dado registrado para o período.</p>
            )}
          </div>
        </section>
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
            <label className="text-gray-300 font-semibold" htmlFor="titulo">
              Assunto
            </label>
            <input
              id="titulo"
              className="bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2"
              maxLength={140}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Lembrete para confirmar presença"
            />
            <label className="text-gray-300 font-semibold" htmlFor="tipo">
              Tipo da notificação
            </label>
            <select
              id="tipo"
              className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as NotificationType)}
            >
              {tipoNotificacaoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} · {opt.hint}
                </option>
              ))}
            </select>
            <label className="text-gray-300 font-semibold" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              className="bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2 min-h-[90px] max-h-[160px] custom-scroll"
              maxLength={360}
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
                  className="flex items-start gap-2 group cursor-pointer hover:text-yellow-400 transition"
                  title={canal.desc}
                >
                  <input
                    type="checkbox"
                    checked={canais.includes(canal.value)}
                    onChange={() => handleCanalToggle(canal.value)}
                    className="accent-yellow-400 mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-yellow-300 group-hover:underline">
                      {canal.icon}
                      {canal.label}
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{canal.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={enviando || !mensagem.trim() || canais.length === 0 || !titulo.trim()}
              className={`flex items-center justify-center gap-2 px-4 py-2 font-bold rounded transition mt-auto ${
                enviando || !mensagem.trim() || canais.length === 0 || !titulo.trim()
                  ? "bg-gray-500/70 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black shadow"
              }`}
            >
              {enviando ? "Enviando..." : "Enviar"}
              <FaPaperPlane />
            </button>
          </div>
        </form>

        {feedback && (
          <div
            className={`mb-8 flex items-center gap-2 px-4 py-3 rounded font-bold shadow ${
              feedback.success ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
            {feedback.message}
            <button
              type="button"
              className="ml-4 text-white text-lg"
              onClick={() => setFeedback(null)}
            >
              ×
            </button>
          </div>
        )}

        {isError && (
          <div className="mb-6 flex items-center gap-2 rounded border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            <FaTimesCircle /> {error ?? "Não foi possível carregar o histórico de notificações."}
          </div>
        )}

        <div>
          <div className="font-bold text-gray-300 mb-2 flex items-center gap-2 text-lg">
            <FaUsers /> Histórico de notificações
            {isValidating && (
              <span className="text-xs font-normal text-gray-400">(atualizando...)</span>
            )}
            {possuiDados && (
              <button
                type="button"
                onClick={handleMarcarTodasComoLidas}
                disabled={bulkLoading}
                className="ml-auto text-xs font-semibold text-yellow-300 hover:text-yellow-200 disabled:opacity-40"
              >
                {bulkLoading ? "Processando..." : "Marcar todas como lidas"}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {carregandoLista && (
              <div className="text-gray-400 text-center py-10">Carregando notificações...</div>
            )}
            {!carregandoLista && notificacoesFiltradas.length === 0 && (
              <div className="text-gray-400 text-center py-10 flex flex-col items-center gap-2">
                <FaInbox className="text-3xl text-gray-500" />

                {filtrosAtivos
                  ? "Nenhuma notifica��o corresponde aos filtros aplicados."
                  : "Nenhuma notifica��o enviada ainda."}
              </div>
            )}

            {notificacoesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className="bg-[#181818] rounded-lg p-4 flex flex-col gap-3 shadow border-l-4 border-yellow-400 animate-fadeIn"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-yellow-300 text-lg">{notif.title}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        notif.isRead
                          ? "bg-green-600/30 text-green-200"
                          : "bg-yellow-600/30 text-yellow-100"
                      }`}
                    >
                      {notif.isRead ? "Lida" : "Pendente"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tipoLabels[notif.type] ?? notif.type}
                    </span>
                  </div>
                  <div className="text-gray-200">{notif.message}</div>
                  <div className="text-xs text-gray-500">
                    Enviada em {formatDate(notif.createdAt)} · Destinatário:{" "}
                    {resolveAudience(notif.metadata)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                    Canais:
                    {resolveChannelsMetadata(notif.metadata).length === 0 ? (
                      <span className="text-gray-500">Não informado</span>
                    ) : (
                      resolveChannelsMetadata(notif.metadata).map((label) => (
                        <span
                          key={`${notif.id}-${label}`}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-600 px-2 py-0.5 text-[11px]"
                        >
                          {label === "Badge (Painel)" && <FaBell aria-hidden />}
                          {label === "E-mail" && <FaEnvelope aria-hidden />}
                          {label === "Push" && <FaBell aria-hidden />}
                          {label === "WhatsApp" && <FaWhatsapp aria-hidden />}
                          {label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarcarComoLida(notif.id)}
                      disabled={pendenteId === notif.id}
                      className="flex items-center gap-1 rounded px-3 py-1 bg-green-600/20 text-green-200 hover:bg-green-600/30 disabled:opacity-50"
                    >
                      <FaCheckCircle />
                      {pendenteId === notif.id ? "Atualizando..." : "Marcar como lida"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleExcluir(notif.id)}
                    disabled={pendenteId === notif.id}
                    className="flex items-center gap-1 rounded px-3 py-1 bg-red-700/30 text-red-200 hover:bg-red-700/40 disabled:opacity-50"
                  >
                    <FaTrashAlt />
                    {pendenteId === notif.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </div>
            ))}
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
      </div>
    </>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  accent?: string;
  description?: string;
};

function StatCard({ label, value, accent = "text-white", description }: StatCardProps) {
  return (
    <div className="bg-[#161616] rounded-xl border border-neutral-800 p-4 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className={`text-2xl font-bold ${accent}`}>{numberFormatter.format(value)}</div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

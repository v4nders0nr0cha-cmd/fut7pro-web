"use client";

import { useMemo, useState } from "react";
import { FaCheckCircle, FaFilter, FaPaperPlane, FaTimesCircle } from "react-icons/fa";
import useSWR from "swr";
import { useBroadcastGroupsPreview, useBroadcastHistory } from "@/hooks/useBroadcasts";
import type { BroadcastChannel, BroadcastHistoryItem } from "@/types/broadcast";

const channelOptions: Array<{
  key: BroadcastChannel;
  label: string;
  desc: string;
  locked?: boolean;
}> = [
  {
    key: "BADGE",
    label: "Badge (Painel)",
    desc: "Aviso visual dentro do painel do atleta ate ser lido.",
    locked: true,
  },
  {
    key: "PUSH",
    label: "Push",
    desc: "Notificacao no celular para quem aceitou receber.",
  },
  {
    key: "EMAIL",
    label: "E-mail",
    desc: "Mensagem enviada para quem tem e-mail valido.",
  },
  {
    key: "WHATSAPP",
    label: "WhatsApp",
    desc: "Mensagem enviada para quem tem telefone valido.",
  },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(body?.error || body?.message || "Falha ao carregar");
  }
  return body;
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

const shortMessage = (message: string, limit = 80) => {
  if (!message) return "";
  if (message.length <= limit) return message;
  return `${message.slice(0, limit)}...`;
};

const resolveAvailabilityLabel = (reason?: string | null) => {
  if (reason === "TENANT_DISABLED") return "Desativado no racha";
  if (reason === "PROVIDER_NOT_CONFIGURED") return "Provedor nao configurado";
  return "Indisponivel";
};

const sumByChannel = (channels: BroadcastChannel[], values: Record<BroadcastChannel, number>) =>
  channels.reduce((total, channel) => total + (values?.[channel] ?? 0), 0);

export default function NotificacoesClient() {
  const [groupKey, setGroupKey] = useState("ALL_PLAYERS");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [channels, setChannels] = useState<BroadcastChannel[]>(["BADGE"]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [sending, setSending] = useState(false);
  const [historyGroup, setHistoryGroup] = useState("");
  const [historyChannel, setHistoryChannel] = useState("");
  const [historyPeriod, setHistoryPeriod] = useState("30d");
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);

  const {
    data: previewData,
    isLoading: previewLoading,
    mutate: refreshPreview,
  } = useBroadcastGroupsPreview(groupKey);

  const periodRange = useMemo(() => {
    if (historyPeriod === "all") return { from: undefined, to: undefined };
    const now = new Date();
    const to = now.toISOString();
    const fromDate = new Date(now);
    const days = historyPeriod === "7d" ? 7 : historyPeriod === "90d" ? 90 : 30;
    fromDate.setDate(fromDate.getDate() - days);
    return { from: fromDate.toISOString(), to };
  }, [historyPeriod]);

  const {
    data: historyData,
    isLoading: historyLoading,
    mutate: refreshHistory,
  } = useBroadcastHistory({
    groupKey: historyGroup || undefined,
    channel: historyChannel || undefined,
    from: periodRange.from,
    to: periodRange.to,
    limit: 20,
  });

  const selectedPreview = useMemo(() => {
    if (!previewData?.groups?.length) return null;
    return previewData.groups.find((group) => group.key === groupKey) ?? null;
  }, [previewData, groupKey]);

  const groupedOptions = useMemo(() => {
    const groups = previewData?.groups ?? [];
    const map = new Map<string, { section: string; groups: typeof groups }>();
    groups.forEach((group) => {
      const existing = map.get(group.section) ?? { section: group.section, groups: [] };
      existing.groups.push(group);
      map.set(group.section, existing);
    });
    return Array.from(map.values());
  }, [previewData]);

  const historyResults = historyData?.results ?? [];

  const { data: broadcastDetail, isLoading: detailLoading } = useSWR<BroadcastHistoryItem>(
    selectedBroadcastId ? `/api/admin/comunicacao/notificacoes/${selectedBroadcastId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const toggleChannel = (channel: BroadcastChannel, locked?: boolean) => {
    if (locked) return;
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((item) => item !== channel) : [...prev, channel]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setFeedback({ type: "error", message: "Digite uma mensagem para enviar." });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/comunicacao/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupKey,
          title: title.trim() || undefined,
          message: message.trim(),
          channels,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "Falha ao enviar notificacao");
      }

      setMessage("");
      setTitle("");
      setChannels(["BADGE"]);
      setFeedback({ type: "success", message: "Notificacao enviada com sucesso." });
      await Promise.all([refreshHistory(), refreshPreview()]);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Falha ao enviar notificacao.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
        Notificacoes / Mensagens em Massa
      </h1>

      <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
        <div className="font-bold text-yellow-300 mb-1">Como funciona</div>
        <p className="text-gray-200 text-sm">
          Envie mensagens para grupos especificos de atletas. O canal Badge e entregue imediatamente
          no painel do atleta. Push, E-mail e WhatsApp ficam preparados e registram status mesmo
          quando o provedor nao esta configurado.
        </p>
      </div>

      <form
        className="bg-[#232323] rounded-lg p-6 shadow mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <div className="flex flex-col gap-3">
          <label className="text-gray-300 font-semibold" htmlFor="grupo">
            <FaFilter className="inline mr-2" /> Selecionar grupo
          </label>
          <select
            id="grupo"
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={groupKey}
            onChange={(event) => setGroupKey(event.target.value)}
          >
            {groupedOptions.map((section) => (
              <optgroup key={section.section} label={section.section}>
                {section.groups.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="text-xs text-gray-400">
            {previewLoading ? "Carregando contagem..." : null}
            {!previewLoading && selectedPreview ? (
              <div className="mt-2">
                Envio para <span className="text-yellow-300">{selectedPreview.previewCount}</span>{" "}
                jogadores.
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-gray-300 font-semibold" htmlFor="title">
            Titulo (opcional)
          </label>
          <input
            id="title"
            className="bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2"
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Aviso de horario"
          />

          <label className="text-gray-300 font-semibold" htmlFor="mensagem">
            Mensagem
          </label>
          <textarea
            id="mensagem"
            className="bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2 min-h-[120px]"
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Digite a mensagem a ser enviada"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-gray-300 font-semibold">Canais de envio</label>
          <div className="flex flex-col gap-3">
            {channelOptions.map((channel) => {
              const channelAvailability = previewData?.channelAvailability?.[channel.key];
              const isAvailable = channelAvailability?.available ?? false;
              const eligibleCount = selectedPreview?.eligibleByChannel?.[channel.key] ?? 0;
              return (
                <label key={channel.key} className="flex flex-col gap-1 text-sm text-gray-200">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={channels.includes(channel.key)}
                      onChange={() => toggleChannel(channel.key, channel.locked)}
                      disabled={channel.locked}
                      className="accent-yellow-400"
                    />
                    <span className="font-semibold text-yellow-300">{channel.label}</span>
                    {!isAvailable && channel.key !== "BADGE" ? (
                      <span className="text-xs text-yellow-400">
                        {resolveAvailabilityLabel(channelAvailability?.reason)}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-gray-400">{channel.desc}</span>
                  <span className="text-xs text-gray-500">
                    Elegiveis: <span className="text-yellow-300">{eligibleCount}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded transition mt-4
              ${
                sending || !message.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black shadow"
              }`}
          >
            <FaPaperPlane /> Enviar
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={`mb-8 flex items-center gap-2 px-4 py-3 rounded font-bold shadow
            ${feedback.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {feedback.message}
          <button className="ml-4 text-white text-lg" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      <div className="bg-[#1b1b1b] rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-300 mb-3 font-semibold">Filtros do historico</div>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={historyGroup}
            onChange={(event) => setHistoryGroup(event.target.value)}
          >
            <option value="">Todos os grupos</option>
            {previewData?.groups?.map((group) => (
              <option key={group.key} value={group.key}>
                {group.label}
              </option>
            ))}
          </select>
          <select
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={historyChannel}
            onChange={(event) => setHistoryChannel(event.target.value)}
          >
            <option value="">Todos os canais</option>
            {channelOptions.map((channel) => (
              <option key={channel.key} value={channel.key}>
                {channel.label}
              </option>
            ))}
          </select>
          <select
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={historyPeriod}
            onChange={(event) => setHistoryPeriod(event.target.value)}
          >
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="90d">Ultimos 90 dias</option>
            <option value="all">Todo periodo</option>
          </select>
        </div>
      </div>

      <div>
        <div className="font-bold text-gray-300 mb-2 text-lg">Historico de notificacoes</div>
        <div className="space-y-4">
          {historyLoading ? (
            <div className="text-gray-400 text-center py-10">Carregando...</div>
          ) : historyResults.length === 0 ? (
            <div className="text-gray-400 text-center py-10">Nenhuma notificacao enviada.</div>
          ) : (
            historyResults.map((item) => (
              <div
                key={item.id}
                className="bg-[#181818] rounded-lg p-4 shadow border-l-4 border-yellow-400"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-300">{item.groupLabel}</div>
                    <div className="text-gray-200">{shortMessage(item.message)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(item.createdAt)}
                      <span className="ml-2">Canais: {item.channels.join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                    <span>Status: {item.status}</span>
                    <span>Entregues: {sumByChannel(item.channels, item.counts.sentByChannel)}</span>
                    <span>Falhas: {sumByChannel(item.channels, item.counts.failedByChannel)}</span>
                    <span>Skips: {sumByChannel(item.channels, item.counts.skippedByChannel)}</span>
                    <span>Lidas: {item.readCount ?? 0}</span>
                  </div>
                  <button
                    type="button"
                    className="text-yellow-300 text-sm underline"
                    onClick={() => setSelectedBroadcastId(item.id)}
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedBroadcastId ? (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1d1d1d] rounded-xl p-6 max-w-xl w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-300">Detalhes do envio</h2>
              <button
                type="button"
                className="text-gray-300 text-xl"
                onClick={() => setSelectedBroadcastId(null)}
              >
                ×
              </button>
            </div>
            {detailLoading || !broadcastDetail ? (
              <div className="text-gray-400">Carregando...</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-200">
                <div>
                  <span className="text-gray-400">Grupo:</span> {broadcastDetail.groupLabel}
                </div>
                <div>
                  <span className="text-gray-400">Mensagem:</span> {broadcastDetail.message}
                </div>
                <div>
                  <span className="text-gray-400">Status:</span> {broadcastDetail.status}
                </div>
                <div>
                  <span className="text-gray-400">Enviado em:</span>{" "}
                  {formatDate(broadcastDetail.createdAt)}
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block">Disponibilidade por canal:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {broadcastDetail.channels.map((channel) => {
                      const availability = previewData?.channelAvailability?.[channel];
                      const available = availability?.available ?? true;
                      const label = available
                        ? "Disponivel"
                        : resolveAvailabilityLabel(availability?.reason);
                      return (
                        <div key={channel} className="flex items-center gap-2">
                          <span className="text-yellow-300">{channel}</span>
                          <span className={available ? "text-green-400" : "text-yellow-400"}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">Total:</span> {broadcastDetail.counts.total}
                  </div>
                  <div>
                    <span className="text-gray-400">Lidas:</span> {broadcastDetail.readCount ?? 0}
                  </div>
                  <div>
                    <span className="text-gray-400">Falhas:</span>{" "}
                    {sumByChannel(broadcastDetail.channels, broadcastDetail.counts.failedByChannel)}
                  </div>
                  <div>
                    <span className="text-gray-400">Skips:</span>{" "}
                    {sumByChannel(
                      broadcastDetail.channels,
                      broadcastDetail.counts.skippedByChannel
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

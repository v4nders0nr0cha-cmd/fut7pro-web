"use client";

import React, { useMemo, useState } from "react";
import Head from "next/head";
import { FaEye, FaCopy, FaRedo, FaPlus, FaBan } from "react-icons/fa";
import { ModalNovaNotificacao } from "@/components/superadmin/ModalNovaNotificacao";
import { ModalNotificacaoPreview } from "@/components/superadmin/ModalNotificacaoPreview";
import { useBranding } from "@/hooks/useBranding";
import { useSuperAdminNotificationCampaigns } from "@/hooks/useSuperAdminNotificationCampaigns";
import type {
  NotificationCampaign,
  NotificationCampaignRecipient,
} from "@/types/notification-campaign";

const TIPOS_NOTIFICACAO = [
  "Cobranca/Financeiro",
  "Renovacao de Plano",
  "Upgrade de Plano",
  "Promocoes e Ofertas",
  "Gamificacao e Conquistas",
  "Atualizacoes de Sistema",
  "Onboarding/Boas-vindas",
  "Alertas de Seguranca",
  "Relatorios e Desempenho",
  "Novidades/Novos Recursos",
  "Suporte/Ajuda",
  "Eventos e Torneios",
  "Parcerias e Patrocinios",
  "Avisos Institucionais",
];

const STATUS_OPTIONS = [
  { value: "todos", label: "Status: Todos" },
  { value: "PENDING", label: "Pendente" },
  { value: "SENT", label: "Enviado" },
  { value: "ERROR", label: "Erro" },
  { value: "CANCELED", label: "Cancelado" },
];

const DESTINO_OPTIONS = [
  { value: "todos", label: "Destino: Todos" },
  { value: "ALL_ADMINS", label: "Todos Admins" },
  { value: "PRESIDENTS_ACTIVE", label: "Presidentes Ativos" },
  { value: "NEW_TENANTS", label: "Novos" },
];

const DESTINO_LABELS: Record<string, string> = {
  ALL_ADMINS: "Todos Admins",
  PRESIDENTS_ACTIVE: "Presidentes Ativos",
  NEW_TENANTS: "Novos",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  ERROR: "Erro",
  CANCELED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  SENT: "text-green-400",
  ERROR: "text-red-400",
  PENDING: "text-yellow-300",
  CANCELED: "text-zinc-400",
};

export default function SuperAdminNotificacoesPage() {
  const { brandText } = useBranding({ scope: "superadmin" });
  const [busca, setBusca] = useState<string>("");
  const [status, setStatus] = useState<string>("todos");
  const [destino, setDestino] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [modalDefaults, setModalDefaults] = useState<NotificationCampaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<NotificationCampaign | null>(null);
  const [previewRecipients, setPreviewRecipients] = useState<NotificationCampaignRecipient[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: busca.trim() || undefined,
      status: status !== "todos" ? status : undefined,
      destination: destino !== "todos" ? destino : undefined,
      category: tipo !== "todos" ? tipo : undefined,
    }),
    [busca, status, destino, tipo]
  );

  const {
    campaigns,
    isLoading,
    isError,
    error,
    previewCampaign: previewRequest,
    createCampaign,
    sendTestCampaign,
    getCampaign,
    getRecipients,
    resendCampaign,
    cancelCampaign,
  } = useSuperAdminNotificationCampaigns(filters);

  const handleOpenPreview = async (campaign: NotificationCampaign) => {
    setActionError(null);
    setPreviewLoading(true);
    try {
      const [detail, recipients] = await Promise.all([
        getCampaign(campaign.id),
        getRecipients(campaign.id),
      ]);
      if (!detail) {
        setActionError("Falha ao carregar detalhes da campanha");
      }
      if (!recipients) {
        setActionError("Falha ao carregar destinatarios");
      }
      setPreviewCampaign((detail as NotificationCampaign) || campaign);
      setPreviewRecipients((recipients as any)?.recipients || []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao carregar detalhes");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDuplicate = (campaign: NotificationCampaign) => {
    setModalDefaults(campaign);
    setModalAberto(true);
  };

  const handleResend = async (campaign: NotificationCampaign) => {
    setActionError(null);
    try {
      const result = await resendCampaign(campaign.id);
      if (!result) {
        setActionError("Falha ao reenviar campanha");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao reenviar campanha");
    }
  };

  const handleCancel = async (campaign: NotificationCampaign) => {
    setActionError(null);
    try {
      const result = await cancelCampaign(campaign.id);
      if (!result) {
        setActionError("Falha ao cancelar campanha");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao cancelar campanha");
    }
  };

  const closeModal = () => {
    setModalDefaults(null);
    setModalAberto(false);
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });

  const getDestinationLabel = (campaign: NotificationCampaign) => {
    if (campaign.destination === "NEW_TENANTS") {
      const days =
        campaign.newTenantDays && campaign.newTenantDays > 0 ? campaign.newTenantDays : 14;
      return `Novos (${days} dias)`;
    }
    return DESTINO_LABELS[campaign.destination] || campaign.destination;
  };

  return (
    <>
      <Head>
        <title>{brandText("Notificacoes e Mensagens em Massa - Fut7Pro SuperAdmin")}</title>
        <meta
          name="description"
          content={brandText(
            "Controle e envie campanhas para administradores dos rachas do Fut7Pro."
          )}
        />
      </Head>
      <div className="px-4 py-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Notificacoes e Mensagens em Massa
          </h1>
          <button
            className="flex items-center gap-2 bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-xl hover:bg-yellow-300 transition"
            onClick={() => setModalAberto(true)}
            aria-label="Nova Campanha"
          >
            <FaPlus /> Nova Campanha
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            className="w-full md:w-1/3 px-3 py-2 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none"
            placeholder="Buscar mensagem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar mensagem"
          />
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar status"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            aria-label="Filtrar destino"
          >
            {DESTINO_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar tipo"
          >
            <option value="todos">Tipo: Todos</option>
            {TIPOS_NOTIFICACAO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {actionError && <div className="mb-3 text-sm text-red-400">{actionError}</div>}

        <div className="overflow-x-auto rounded-xl shadow-lg bg-zinc-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3">Campanha</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">Data/Hora</th>
                <th className="px-2 py-3">Destino</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Canais</th>
                <th className="px-2 py-3">Enviado por</th>
                <th className="px-2 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-zinc-500">
                    Carregando campanhas...
                  </td>
                </tr>
              )}
              {!isLoading && (isError || error) && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-red-400">
                    Falha ao carregar campanhas.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && sortedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-zinc-500">
                    Nenhuma campanha encontrada.
                  </td>
                </tr>
              ) : (
                sortedCampaigns.map((campaign) => {
                  const statusLabel = STATUS_LABELS[campaign.status] || campaign.status;
                  const destinationLabel = getDestinationLabel(campaign);
                  const createdAt = campaign.createdAt
                    ? new Date(campaign.createdAt).toLocaleString("pt-BR")
                    : "-";
                  const channels = campaign.channels || [];
                  const badgeEnabled = campaign.badge !== false;

                  return (
                    <tr key={campaign.id} className="hover:bg-zinc-800">
                      <td className="px-4 py-3 max-w-xs truncate">
                        <button
                          onClick={() => handleOpenPreview(campaign)}
                          className="hover:underline text-yellow-400"
                          title="Ver detalhes"
                        >
                          {campaign.title}
                        </button>
                        <div className="text-xs text-zinc-500 truncate">{campaign.message}</div>
                      </td>
                      <td className="px-2 py-3">{campaign.category || "-"}</td>
                      <td className="px-2 py-3">{createdAt}</td>
                      <td className="px-2 py-3">{destinationLabel}</td>
                      <td className={`px-2 py-3 font-bold ${STATUS_COLORS[campaign.status]}`}>
                        {statusLabel}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-1">
                          {badgeEnabled && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300">
                              Badge
                            </span>
                          )}
                          {channels.map((channel) => (
                            <span
                              key={channel}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300"
                            >
                              {channel}
                            </span>
                          ))}
                          {!badgeEnabled && channels.length === 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300">
                              Sem canais
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        {campaign.createdBy?.name || campaign.createdBy?.email || "Sistema"}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPreview(campaign)}
                            aria-label="Ver"
                            title="Ver"
                            className="text-yellow-300"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDuplicate(campaign)}
                            aria-label="Duplicar"
                            title="Duplicar"
                            className="text-zinc-200"
                          >
                            <FaCopy />
                          </button>
                          {campaign.status === "ERROR" && (
                            <button
                              onClick={() => handleResend(campaign)}
                              aria-label="Reenviar"
                              title="Reenviar"
                              className="text-zinc-200"
                            >
                              <FaRedo />
                            </button>
                          )}
                          {campaign.status === "PENDING" && (
                            <button
                              onClick={() => handleCancel(campaign)}
                              aria-label="Cancelar"
                              title="Cancelar"
                              className="text-red-400"
                            >
                              <FaBan />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {modalAberto && (
          <ModalNovaNotificacao
            onClose={closeModal}
            onPreview={previewRequest}
            onCreate={createCampaign}
            onTest={sendTestCampaign}
            defaultValues={
              modalDefaults
                ? {
                    title: modalDefaults.title,
                    message: modalDefaults.message,
                    category: modalDefaults.category || undefined,
                    destination: modalDefaults.destination,
                    priority: modalDefaults.priority,
                    channels: modalDefaults.channels || [],
                    badge: modalDefaults.badge ?? true,
                    ctaLabel: modalDefaults.ctaLabel || undefined,
                    ctaUrl: modalDefaults.ctaUrl || undefined,
                    expiresAt: modalDefaults.expiresAt || undefined,
                    newTenantDays: modalDefaults.newTenantDays || undefined,
                  }
                : undefined
            }
          />
        )}

        {previewCampaign && (
          <ModalNotificacaoPreview
            campaign={previewCampaign}
            recipients={previewRecipients}
            onClose={() => {
              setPreviewCampaign(null);
              setPreviewRecipients([]);
            }}
          />
        )}

        {previewLoading && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center text-zinc-200">
            Carregando detalhes...
          </div>
        )}
      </div>
    </>
  );
}

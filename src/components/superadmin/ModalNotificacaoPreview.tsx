"use client";

import type { FC } from "react";
import type {
  NotificationCampaign,
  NotificationCampaignRecipient,
} from "@/types/notification-campaign";

interface ModalNotificacaoPreviewProps {
  campaign: NotificationCampaign;
  recipients?: NotificationCampaignRecipient[];
  onClose: () => void;
}

const destinationLabels: Record<string, string> = {
  ALL_ADMINS: "Todos Admins",
  PRESIDENTS_ACTIVE: "Presidentes Ativos",
  NEW_TENANTS: "Novos",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  ERROR: "Erro",
  CANCELED: "Cancelado",
};

const priorityLabels: Record<string, string> = {
  NORMAL: "Normal",
  HIGH: "Alta",
};

export const ModalNotificacaoPreview: FC<ModalNotificacaoPreviewProps> = ({
  campaign,
  recipients,
  onClose,
}) => {
  const channels = campaign.channels || [];
  const badgeEnabled = campaign.badge !== false;
  const expiresAt = campaign.expiresAt ? new Date(campaign.expiresAt).toLocaleString("pt-BR") : "-";
  const createdAt = campaign.createdAt ? new Date(campaign.createdAt).toLocaleString("pt-BR") : "-";
  const destinationLabel =
    campaign.destination === "NEW_TENANTS"
      ? `Novos (${campaign.newTenantDays && campaign.newTenantDays > 0 ? campaign.newTenantDays : 14} dias)`
      : destinationLabels[campaign.destination] || campaign.destination;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Detalhe da Campanha</h2>
          <button onClick={onClose} className="text-sm text-zinc-300 hover:text-white transition">
            Fechar
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-zinc-400">Titulo</div>
            <div className="text-zinc-100 font-semibold">{campaign.title}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Mensagem</div>
            <div className="text-zinc-100">{campaign.message}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-400">Tipo</div>
              <div className="text-zinc-100">{campaign.category || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Destino</div>
              <div className="text-zinc-100">{destinationLabel}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Status</div>
              <div className="text-zinc-100">
                {statusLabels[campaign.status] || campaign.status}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Prioridade</div>
              <div className="text-zinc-100">
                {priorityLabels[campaign.priority] || campaign.priority}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Criada em</div>
              <div className="text-zinc-100">{createdAt}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Expira em</div>
              <div className="text-zinc-100">{expiresAt}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-400 mb-1">Canais</div>
            <div className="flex flex-wrap gap-2">
              {badgeEnabled && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-gray-300">
                  Badge
                </span>
              )}
              {channels.map((channel) => (
                <span
                  key={channel}
                  className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-gray-300"
                >
                  {channel}
                </span>
              ))}
              {!badgeEnabled && channels.length === 0 && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-gray-300">
                  Nenhum canal selecionado
                </span>
              )}
            </div>
          </div>

          {campaign.ctaUrl && (
            <div>
              <div className="text-xs text-zinc-400">CTA</div>
              <div className="text-zinc-100">
                {campaign.ctaLabel || "Abrir"} - {campaign.ctaUrl}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Rachas</div>
              <div className="text-lg text-white font-semibold">
                {campaign.totalTenants ?? campaign.tenantCount ?? "-"}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Admins</div>
              <div className="text-lg text-white font-semibold">{campaign.totalAdmins ?? "-"}</div>
            </div>
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Enviadas</div>
              <div className="text-lg text-white font-semibold">{campaign.sentCount ?? "-"}</div>
            </div>
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Lidas</div>
              <div className="text-lg text-white font-semibold">{campaign.readCount ?? "-"}</div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm text-zinc-200 font-semibold mb-2">Destinatarios</div>
          {!recipients || recipients.length === 0 ? (
            <div className="text-xs text-zinc-500">Sem dados de destinatarios.</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.tenantId}
                  className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
                >
                  <div>
                    <div className="font-semibold">{recipient.name}</div>
                    <div className="text-zinc-400">{recipient.slug}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Envio: {recipient.sent}</span>
                    <span>Lidas: {recipient.read}</span>
                    <span>Nao lidas: {recipient.unread}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

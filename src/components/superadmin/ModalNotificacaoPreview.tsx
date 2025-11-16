"use client";

import { NOTIFICATION_CHANNEL_LABELS } from "@/constants/notification-templates";
import type { Notification } from "@/types/notificacao";

type ModalNotificacaoPreviewProps = {
  notificacao: Notification;
  onClose: () => void;
};

export function ModalNotificacaoPreview({ notificacao, onClose }: ModalNotificacaoPreviewProps) {
  const channels = notificacao.metadata?.channels ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-3 text-yellow-400">Pré-visualização</h2>

        <div className="mb-4 border border-zinc-800 rounded-lg p-3 bg-zinc-950">
          <p className="text-sm font-semibold text-zinc-200">{notificacao.title}</p>
          <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{notificacao.message}</p>
          <div className="text-xs text-zinc-500 mt-3 space-y-1">
            <div>
              <b>Tipo:</b> {notificacao.type}
            </div>
            <div>
              <b>Data/Hora:</b> {new Date(notificacao.createdAt).toLocaleString("pt-BR")}
            </div>
            <div>
              <b>Status:</b> {notificacao.isRead ? "Lida" : "Não lida"}
            </div>
          </div>
        </div>

        {channels.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Canais</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <span
                  key={channel}
                  className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 font-semibold"
                >
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </span>
              ))}
            </div>
          </div>
        )}

        {notificacao.metadata?.email && (
          <ChannelCard title="E-mail" borderColor="border-blue-500">
            <div className="text-sm text-zinc-300 mb-2">
              <b>Assunto:</b> {notificacao.metadata.email.subject || "(sem assunto)"}
            </div>
            <pre className="text-sm text-zinc-200 whitespace-pre-wrap bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              {notificacao.metadata.email.body || "(sem corpo)"}
            </pre>
          </ChannelCard>
        )}

        {notificacao.metadata?.push && (
          <ChannelCard title="Push" borderColor="border-green-500">
            <div className="text-sm text-zinc-300 mb-1">
              <b>Título:</b> {notificacao.metadata.push.title || "(sem título)"}
            </div>
            <div className="text-sm text-zinc-300">
              <b>Mensagem:</b> {notificacao.metadata.push.body || "(sem mensagem)"}
            </div>
          </ChannelCard>
        )}

        {notificacao.metadata?.whatsapp && (
          <ChannelCard title="WhatsApp" borderColor="border-emerald-500">
            <pre className="text-sm text-zinc-200 whitespace-pre-wrap bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              {notificacao.metadata.whatsapp.message || "(sem mensagem)"}
            </pre>
          </ChannelCard>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({
  title,
  borderColor,
  children,
}: {
  title: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mb-4 border ${borderColor} rounded-lg p-3 bg-zinc-950`}>
      <p className="text-sm font-semibold text-zinc-100 mb-2">{title}</p>
      {children}
    </div>
  );
}

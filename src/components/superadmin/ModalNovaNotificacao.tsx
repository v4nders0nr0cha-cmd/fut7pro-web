"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_TEMPLATES,
} from "@/constants/notification-templates";
import type {
  CreateNotificationInput,
  NotificationChannel,
  NotificationType,
} from "@/types/notificacao";
import type { NotificationTemplate } from "@/types/notification-template";

interface ModalNovaNotificacaoProps {
  onClose: () => void;
  onSubmit: (payload: CreateNotificationInput) => Promise<void>;
}

type ComposeMode = "template" | "custom";

const CHANNELS: NotificationChannel[] = ["EMAIL", "PUSH", "WHATSAPP"];

export function ModalNovaNotificacao({ onClose, onSubmit }: ModalNovaNotificacaoProps) {
  const [mode, setMode] = useState<ComposeMode>("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    NOTIFICATION_TEMPLATES[0]?.id ?? null
  );
  const [type, setType] = useState<NotificationType>("SISTEMA");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<Record<NotificationChannel, boolean>>({
    EMAIL: true,
    PUSH: true,
    WHATSAPP: false,
  });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate: NotificationTemplate | null = useMemo(
    () =>
      mode === "template"
        ? (NOTIFICATION_TEMPLATES.find((tpl) => tpl.id === selectedTemplateId) ?? null)
        : null,
    [mode, selectedTemplateId]
  );

  useEffect(() => {
    if (mode === "template" && selectedTemplate) {
      setType(selectedTemplate.type);
      setTitle(
        selectedTemplate.push?.title ?? selectedTemplate.email?.subject ?? selectedTemplate.name
      );
      setMessage(
        selectedTemplate.push?.body ?? selectedTemplate.email?.body ?? selectedTemplate.description
      );
      setChannels({
        EMAIL: selectedTemplate.defaultChannels.includes("EMAIL"),
        PUSH: selectedTemplate.defaultChannels.includes("PUSH"),
        WHATSAPP: selectedTemplate.defaultChannels.includes("WHATSAPP"),
      });
      setEmailSubject(selectedTemplate.email?.subject ?? selectedTemplate.name);
      setEmailBody(selectedTemplate.email?.body ?? selectedTemplate.description);
      setPushTitle(selectedTemplate.push?.title ?? selectedTemplate.name);
      setPushBody(selectedTemplate.push?.body ?? selectedTemplate.description);
      setWhatsappMessage(selectedTemplate.whatsapp?.message ?? selectedTemplate.description);
      const values = selectedTemplate.tokens.reduce<Record<string, string>>((acc, token) => {
        acc[token.key] = "";
        return acc;
      }, {});
      setTokenValues(values);
    } else if (mode === "custom") {
      setType("PERSONALIZADA");
      setChannels({ EMAIL: true, PUSH: true, WHATSAPP: false });
      setTitle("");
      setMessage("");
      setEmailSubject("");
      setEmailBody("");
      setPushTitle("");
      setPushBody("");
      setWhatsappMessage("");
      setTokenValues({});
    }
  }, [mode, selectedTemplate]);

  const templatesByCategory = useMemo(() => {
    return NOTIFICATION_TEMPLATES.reduce<Record<string, NotificationTemplate[]>>(
      (groups, template) => {
        if (!groups[template.category]) {
          groups[template.category] = [];
        }
        groups[template.category].push(template);
        return groups;
      },
      {}
    );
  }, []);

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleTokenChange = (key: string, value: string) => {
    setTokenValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Preencha título e mensagem base.");
      return;
    }

    const channelsSelecionados = CHANNELS.filter((channel) => channels[channel]);
    if (channelsSelecionados.length === 0) {
      setError("Selecione ao menos um canal (e-mail, push ou WhatsApp).");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const metadata = {
      templateId: mode === "template" ? selectedTemplate?.id : undefined,
      channels: channelsSelecionados,
      email: channels.EMAIL
        ? {
            subject: emailSubject.trim() || title.trim(),
            body: emailBody.trim() || message.trim(),
          }
        : undefined,
      push: channels.PUSH
        ? {
            title: pushTitle.trim() || title.trim(),
            body: pushBody.trim() || message.trim(),
          }
        : undefined,
      whatsapp: channels.WHATSAPP
        ? {
            message: whatsappMessage.trim() || message.trim(),
          }
        : undefined,
      tokens:
        mode === "template" && selectedTemplate?.tokens.length
          ? Object.fromEntries(
              Object.entries(tokenValues).filter(([, value]) =>
                Boolean(value && value.trim().length)
              )
            )
          : undefined,
    };

    const payload: CreateNotificationInput = {
      title: title.trim(),
      message: message.trim(),
      type,
      metadata,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar notificação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplateSelector = () => (
    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        <div key={category}>
          <p className="text-xs font-semibold uppercase text-zinc-400 mb-1">{category}</p>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`text-left rounded-lg border px-3 py-2 transition ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-zinc-700 bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-100">{template.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{template.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.defaultChannels.map((channel) => (
                      <span
                        key={channel}
                        className="text-[10px] font-semibold uppercase tracking-wide rounded-full bg-zinc-800 text-zinc-200 px-2 py-0.5"
                      >
                        {NOTIFICATION_CHANNEL_LABELS[channel]}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTokenInputs = () => {
    if (mode !== "template" || !selectedTemplate?.tokens.length) {
      return null;
    }

    return (
      <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-900">
        <p className="text-xs font-semibold text-zinc-300 mb-2">Variáveis disponíveis</p>
        <div className="space-y-2">
          {selectedTemplate.tokens.map((token) => (
            <div key={token.key}>
              <label className="text-[11px] text-zinc-400 mb-1 block">
                {token.label} ({`{{${token.key}}}`}){" "}
                <span className="text-zinc-500">ex: {token.example}</span>
              </label>
              <input
                type="text"
                value={tokenValues[token.key] ?? ""}
                onChange={(event) => handleTokenChange(token.key, event.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100"
                placeholder={token.example}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChannelEditors = () => (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((channel) => (
          <button
            key={channel}
            type="button"
            onClick={() => toggleChannel(channel)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
              channels[channel]
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-200"
                : "border-zinc-700 bg-zinc-900 text-zinc-300"
            }`}
          >
            {NOTIFICATION_CHANNEL_LABELS[channel]}
          </button>
        ))}
      </div>

      {channels.EMAIL && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-200">Conteúdo de E-mail</p>
          <input
            className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="Assunto"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <textarea
            className="w-full h-32 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="Corpo do e-mail"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
        </div>
      )}

      {channels.PUSH && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-200">Conteúdo de Push</p>
          <input
            className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="Título"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
          />
          <textarea
            className="w-full h-20 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="Mensagem do push"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
          />
        </div>
      )}

      {channels.WHATSAPP && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-200">Conteúdo de WhatsApp</p>
          <textarea
            className="w-full h-20 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="Mensagem do WhatsApp"
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Nova notificação</h2>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold border transition ${
              mode === "template"
                ? "border-yellow-400 text-yellow-200"
                : "border-zinc-700 text-zinc-400"
            }`}
            onClick={() => setMode("template")}
          >
            Usar template
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold border transition ${
              mode === "custom"
                ? "border-yellow-400 text-yellow-200"
                : "border-zinc-700 text-zinc-400"
            }`}
            onClick={() => setMode("custom")}
          >
            Mensagem personalizada
          </button>
        </div>

        {mode === "template" && renderTemplateSelector()}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Título base</label>
            <input
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
            <select
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
            >
              <option value="SISTEMA">Sistema</option>
              <option value="ALERTA">Alerta</option>
              <option value="PERSONALIZADA">Personalizada</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs text-zinc-400 mb-1 block">Mensagem base (in-app/push)</label>
          <textarea
            className="w-full h-24 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={600}
          />
        </div>

        {renderTokenInputs()}
        {renderChannelEditors()}

        {error && <div className="text-sm text-red-400 mt-3">{error}</div>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
            type="button"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 rounded bg-yellow-400 text-zinc-900 font-bold hover:bg-yellow-300 transition disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

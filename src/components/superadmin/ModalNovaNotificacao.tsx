"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import type { NotificationCampaignPreview } from "@/types/notification-campaign";

type CampaignDestination = "ALL_ADMINS" | "PRESIDENTS_ACTIVE" | "NEW_TENANTS";
type CampaignPriority = "NORMAL" | "HIGH";

interface ModalNovaNotificacaoProps {
  onClose: () => void;
  onPreview: (payload: {
    destination: CampaignDestination;
    newTenantDays?: number;
  }) => Promise<any>;
  onCreate: (payload: {
    title: string;
    message: string;
    category?: string;
    destination: CampaignDestination;
    priority: CampaignPriority;
    channels: string[];
    badge: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    expiresAt?: string;
    newTenantDays?: number;
  }) => Promise<any>;
  onTest: (payload: {
    tenantSlug?: string;
    title?: string;
    message?: string;
    category?: string;
    channels?: string[];
    badge?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    expiresAt?: string;
  }) => Promise<any>;
  defaultValues?: Partial<{
    title: string;
    message: string;
    category: string;
    destination: CampaignDestination;
    priority: CampaignPriority;
    channels: string[];
    badge: boolean;
    ctaLabel: string;
    ctaUrl: string;
    expiresAt: string;
    newTenantDays: number;
  }>;
}

const TIPOS_NOTIFICACAO = [
  "Cobrança/Financeiro",
  "Renovação de Plano",
  "Upgrade de Plano",
  "Promoções e Ofertas",
  "Gamificação e Conquistas",
  "Atualizações de Sistema",
  "Onboarding/Boas-vindas",
  "Alertas de Segurança",
  "Relatórios e Desempenho",
  "Novidades/Novos Recursos",
  "Suporte/Ajuda",
  "Eventos e Torneios",
  "Parcerias e Patrocínios",
  "Avisos Institucionais",
];

const DESTINOS: Array<{ value: CampaignDestination; label: string }> = [
  { value: "ALL_ADMINS", label: "Todos Admins" },
  { value: "PRESIDENTS_ACTIVE", label: "Presidentes Ativos" },
  { value: "NEW_TENANTS", label: "Novos" },
];

const PRIORIDADES: Array<{ value: CampaignPriority; label: string }> = [
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta" },
];

const CANAIS = [
  { value: "EMAIL", label: "E-mail" },
  { value: "PUSH", label: "Push" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export const ModalNovaNotificacao: FC<ModalNovaNotificacaoProps> = ({
  onClose,
  onPreview,
  onCreate,
  onTest,
  defaultValues,
}) => {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [message, setMessage] = useState(defaultValues?.message || "");
  const [category, setCategory] = useState(defaultValues?.category || TIPOS_NOTIFICACAO[0]);
  const [destination, setDestination] = useState<CampaignDestination>(
    defaultValues?.destination || "ALL_ADMINS"
  );
  const [priority, setPriority] = useState<CampaignPriority>(defaultValues?.priority || "NORMAL");
  const [badge, setBadge] = useState<boolean>(defaultValues?.badge ?? true);
  const [channels, setChannels] = useState<string[]>(defaultValues?.channels || []);
  const [ctaLabel, setCtaLabel] = useState(defaultValues?.ctaLabel || "");
  const [ctaUrl, setCtaUrl] = useState(defaultValues?.ctaUrl || "");
  const [expiresAt, setExpiresAt] = useState(defaultValues?.expiresAt || "");
  const [newTenantDays, setNewTenantDays] = useState<number>(defaultValues?.newTenantDays || 14);
  const [confirmText, setConfirmText] = useState("");
  const [testTenantSlug, setTestTenantSlug] = useState("");
  const [preview, setPreview] = useState<NotificationCampaignPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(null);
  }, [destination, newTenantDays]);

  const confirmationRequired = destination === "ALL_ADMINS";
  const confirmationOk = !confirmationRequired || confirmText.trim().toUpperCase() === "ENVIAR";
  const hasChannel = badge || channels.length > 0;

  const payload = useMemo(
    () => ({
      title: title.trim(),
      message: message.trim(),
      category,
      destination,
      priority,
      channels,
      badge,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      expiresAt: expiresAt || undefined,
      newTenantDays: destination === "NEW_TENANTS" ? newTenantDays : undefined,
    }),
    [
      title,
      message,
      category,
      destination,
      priority,
      channels,
      badge,
      ctaLabel,
      ctaUrl,
      expiresAt,
      newTenantDays,
    ]
  );

  const handleToggleChannel = (value: string) => {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handlePreview = async () => {
    setError(null);
    setLoadingPreview(true);
    try {
      const result = await onPreview({
        destination,
        newTenantDays: destination === "NEW_TENANTS" ? newTenantDays : undefined,
      });
      if (!result) {
        setError("Falha ao gerar prévia");
        return;
      }
      setPreview(result as NotificationCampaignPreview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar prévia");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    if (!payload.title || !payload.message) {
      setError("Informe título e mensagem.");
      return;
    }

    if (!hasChannel) {
      setError("Selecione badge ou um canal.");
      return;
    }

    if (!preview) {
      setError("Gere a prévia antes de enviar.");
      return;
    }

    if (!confirmationOk) {
      setError("Confirme digitando ENVIAR.");
      return;
    }

    setError(null);
    setLoadingSend(true);
    try {
      const result = await onCreate(payload);
      if (!result) {
        setError("Falha ao enviar campanha");
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar campanha");
    } finally {
      setLoadingSend(false);
    }
  };

  const handleTest = async () => {
    setError(null);
    if (!testTenantSlug.trim()) {
      setError("Informe o slug do racha para teste.");
      return;
    }
    if (!hasChannel) {
      setError("Selecione badge ou um canal.");
      return;
    }

    setLoadingTest(true);
    try {
      const result = await onTest({
        tenantSlug: testTenantSlug.trim(),
        title: payload.title,
        message: payload.message,
        category: payload.category,
        channels: payload.channels,
        badge: payload.badge,
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
        expiresAt: payload.expiresAt,
      });
      if (!result) {
        setError("Falha ao enviar teste");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar teste");
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Nova Campanha</h2>
          <button onClick={onClose} className="text-sm text-zinc-300 hover:text-white transition">
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-400">Título</label>
            <input
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
              placeholder="Título da campanha"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-zinc-400">Mensagem</label>
            <textarea
              className="w-full h-28 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 p-2"
              placeholder="Mensagem principal"
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">Tipo</label>
            <select
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {TIPOS_NOTIFICACAO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Destino</label>
            <select
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 p-2"
              value={destination}
              onChange={(e) => setDestination(e.target.value as CampaignDestination)}
            >
              {DESTINOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {destination === "NEW_TENANTS" && (
            <div>
              <label className="text-xs text-zinc-400">Novos (dias)</label>
              <input
                type="number"
                min={1}
                className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
                value={newTenantDays}
                onChange={(e) => setNewTenantDays(Number(e.target.value))}
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Novos = rachas criados nos últimos X dias.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400">Prioridade</label>
            <select
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 p-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value as CampaignPriority)}
            >
              {PRIORIDADES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Validade (opcional)</label>
            <input
              type="datetime-local"
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-zinc-400">Canais</label>
            <div className="flex flex-wrap gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={badge}
                  onChange={(e) => setBadge(e.target.checked)}
                />
                Badge (padrão)
              </label>
              {CANAIS.map((canal) => (
                <label key={canal.value} className="flex items-center gap-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={channels.includes(canal.value)}
                    onChange={() => handleToggleChannel(canal.value)}
                  />
                  {canal.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">CTA (texto)</label>
            <input
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
              placeholder="Ex: Ir para Financeiro"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">CTA (link interno)</label>
            <input
              className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
              placeholder="/admin/financeiro"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-zinc-800/70 border border-zinc-700">
          <div className="text-sm text-zinc-200 font-semibold mb-2">Segurança e validação</div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button
              onClick={handlePreview}
              className="px-3 py-2 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition text-sm"
              disabled={loadingPreview}
            >
              {loadingPreview ? "Gerando prévia..." : "Gerar prévia"}
            </button>
            <div className="text-xs text-zinc-400">
              {preview
                ? `Você vai enviar para ${preview.admins} admins de ${preview.tenants} rachas.`
                : "Gere a prévia para validar o alcance."}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Teste (slug do racha)</label>
              <input
                className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
                placeholder="rachaslug"
                value={testTenantSlug}
                onChange={(e) => setTestTenantSlug(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleTest}
                className="w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition text-sm"
                disabled={loadingTest}
              >
                {loadingTest ? "Enviando teste..." : "Enviar teste para mim"}
              </button>
            </div>
            {confirmationRequired && (
              <div>
                <label className="text-xs text-zinc-400">Digite ENVIAR</label>
                <input
                  className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2"
                  placeholder="ENVIAR"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
            disabled={loadingSend}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded bg-yellow-400 text-zinc-900 font-bold hover:bg-yellow-300 transition disabled:opacity-60"
            disabled={
              !payload.title ||
              !payload.message ||
              !hasChannel ||
              loadingSend ||
              (confirmationRequired && !confirmationOk) ||
              !preview
            }
          >
            {loadingSend ? "Enviando..." : "Enviar campanha"}
          </button>
        </div>
      </div>
    </div>
  );
};

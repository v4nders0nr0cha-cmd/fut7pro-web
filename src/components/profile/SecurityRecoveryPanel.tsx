"use client";

import { useMemo, useState } from "react";
import type { GlobalProfileResponse } from "@/types/global-profile";

type SecurityRecoveryData = NonNullable<GlobalProfileResponse["securityRecovery"]>;

type SecurityRecoveryPanelProps = {
  initialStatus?: SecurityRecoveryData | null;
};

function formatDatetime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function normalizeCode(value: string) {
  return value.replace(/\D+/g, "").slice(0, 6);
}

export default function SecurityRecoveryPanel({ initialStatus }: SecurityRecoveryPanelProps) {
  const [status, setStatus] = useState<SecurityRecoveryData | null>(initialStatus ?? null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const [codesLoading, setCodesLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const methods = useMemo(
    () =>
      status?.methods ?? {
        recoveryEmail: { configured: false, verified: false, maskedValue: null, verifiedAt: null },
        whatsapp: { configured: false, verified: false, maskedValue: null, verifiedAt: null },
        recoveryCodes: { configured: false, activeCount: 0, rotatedAt: null },
      },
    [status]
  );

  const handleError = (message: string) => {
    setSuccess("");
    setError(message || "Falha na operacao de seguranca da conta.");
  };

  const readJson = async (res: Response) => {
    const payload = await res.json().catch(() => null);
    return payload as Record<string, any> | null;
  };

  const refreshStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/perfil/security/recovery", { cache: "no-store" });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Falha ao atualizar status de seguranca."
        );
      }
      if (payload && typeof payload === "object") {
        const nextStatus = payload as Record<string, any> as SecurityRecoveryData;
        setStatus(nextStatus);
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao atualizar status de seguranca.");
    } finally {
      setLoadingStatus(false);
    }
  };

  const requestEmailCode = async () => {
    setEmailLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/perfil/security/recovery/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Falha ao enviar codigo para e-mail."
        );
      }
      setSuccess(payload?.message || "Se estiver tudo certo, enviamos seu codigo.");
      await refreshStatus();
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao enviar codigo para e-mail.");
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    setEmailLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/perfil/security/recovery/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizeCode(emailCode) }),
      });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Falha ao verificar codigo de e-mail."
        );
      }
      setEmailCode("");
      const nextStatus = payload?.securityRecovery as SecurityRecoveryData | undefined;
      if (nextStatus) setStatus(nextStatus);
      setSuccess(payload?.message || "E-mail de recuperacao verificado.");
      if (!nextStatus) {
        await refreshStatus();
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao verificar codigo de e-mail.");
    } finally {
      setEmailLoading(false);
    }
  };

  const requestWhatsappCode = async () => {
    setWhatsappLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/perfil/security/recovery/whatsapp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp }),
      });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Falha ao enviar codigo para WhatsApp."
        );
      }
      setSuccess(payload?.message || "Se estiver tudo certo, enviamos seu codigo.");
      await refreshStatus();
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao enviar codigo para WhatsApp.");
    } finally {
      setWhatsappLoading(false);
    }
  };

  const verifyWhatsappCode = async () => {
    setWhatsappLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/perfil/security/recovery/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizeCode(whatsappCode) }),
      });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Falha ao verificar codigo do WhatsApp."
        );
      }
      setWhatsappCode("");
      const nextStatus = payload?.securityRecovery as SecurityRecoveryData | undefined;
      if (nextStatus) setStatus(nextStatus);
      setSuccess(payload?.message || "WhatsApp de recuperacao verificado.");
      if (!nextStatus) {
        await refreshStatus();
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao verificar codigo do WhatsApp.");
    } finally {
      setWhatsappLoading(false);
    }
  };

  const regenerateCodes = async () => {
    setCodesLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/perfil/security/recovery/codes/regenerate", {
        method: "POST",
      });
      const payload = await readJson(res);
      if (!res.ok) {
        throw new Error(payload?.message || payload?.error || "Falha ao gerar recovery codes.");
      }
      const nextCodes = Array.isArray(payload?.codes)
        ? payload.codes.filter((item: unknown) => typeof item === "string")
        : [];
      setGeneratedCodes(nextCodes);
      const nextStatus = payload?.securityRecovery as SecurityRecoveryData | undefined;
      if (nextStatus) setStatus(nextStatus);
      setSuccess(payload?.message || "Recovery codes gerados com sucesso.");
      if (!nextStatus) {
        await refreshStatus();
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Falha ao gerar recovery codes.");
    } finally {
      setCodesLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/60 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-[0.16em]">
          Metodos de Recuperacao
        </h3>
        <button
          type="button"
          onClick={refreshStatus}
          disabled={loadingStatus}
          className="text-xs rounded-full border border-white/20 px-3 py-1 text-zinc-300 hover:bg-white/5 disabled:opacity-60"
        >
          {loadingStatus ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {status ? (
        <div className="text-xs text-zinc-400 space-y-1">
          <p>
            Conformidade:{" "}
            <span className={status.enabled ? "text-green-300" : "text-amber-300"}>
              {status.enabled ? "Ativa" : "Pendente"}
            </span>
          </p>
          <p>Prazo de obrigatoriedade: {formatDatetime(status.requiredAt)}</p>
        </div>
      ) : (
        <p className="text-xs text-zinc-400">Carregue o status para configurar os metodos.</p>
      )}

      <div className="rounded-lg border border-white/10 p-3 space-y-3">
        <div className="text-xs text-zinc-300">
          E-mail de recuperacao:{" "}
          {methods.recoveryEmail.verified ? (
            <span className="text-green-300">
              Verificado ({methods.recoveryEmail.maskedValue || "-"})
            </span>
          ) : methods.recoveryEmail.configured ? (
            <span className="text-amber-300">
              Pendente ({methods.recoveryEmail.maskedValue || "-"})
            </span>
          ) : (
            <span className="text-zinc-400">Nao configurado</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="email.recuperacao@dominio.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={requestEmailCode}
            disabled={emailLoading || !email.trim()}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Enviar codigo
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Codigo de 6 digitos"
            value={emailCode}
            onChange={(event) => setEmailCode(normalizeCode(event.target.value))}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={verifyEmailCode}
            disabled={emailLoading || normalizeCode(emailCode).length !== 6}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Verificar email
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 p-3 space-y-3">
        <div className="text-xs text-zinc-300">
          WhatsApp verificado:{" "}
          {methods.whatsapp.verified ? (
            <span className="text-green-300">
              Verificado ({methods.whatsapp.maskedValue || "-"})
            </span>
          ) : methods.whatsapp.configured ? (
            <span className="text-amber-300">Pendente ({methods.whatsapp.maskedValue || "-"})</span>
          ) : (
            <span className="text-zinc-400">Nao configurado</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="+55 11 99999-9999"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={requestWhatsappCode}
            disabled={whatsappLoading || !whatsapp.trim()}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Enviar codigo
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Codigo de 6 digitos"
            value={whatsappCode}
            onChange={(event) => setWhatsappCode(normalizeCode(event.target.value))}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={verifyWhatsappCode}
            disabled={whatsappLoading || normalizeCode(whatsappCode).length !== 6}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Verificar WhatsApp
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 p-3 space-y-3">
        <div className="text-xs text-zinc-300">
          Recovery codes ativos:{" "}
          <span className="text-white">{methods.recoveryCodes.activeCount}</span>
        </div>
        <div className="text-xs text-zinc-400">
          Ultima rotacao: {formatDatetime(methods.recoveryCodes.rotatedAt)}
        </div>
        <button
          type="button"
          onClick={regenerateCodes}
          disabled={codesLoading}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {codesLoading ? "Gerando..." : "Gerar novos recovery codes"}
        </button>
        {generatedCodes.length > 0 ? (
          <div className="rounded-lg bg-black/40 border border-white/10 p-3">
            <div className="text-xs text-amber-300 mb-2">
              Guarde estes codigos em local seguro. Eles sao exibidos apenas agora.
            </div>
            <pre className="text-xs text-zinc-200 whitespace-pre-wrap">
              {generatedCodes.join("\n")}
            </pre>
          </div>
        ) : null}
      </div>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
      {success ? <div className="text-sm text-green-300">{success}</div> : null}
    </div>
  );
}

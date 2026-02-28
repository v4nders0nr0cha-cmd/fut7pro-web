"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/hooks/useBranding";
import QRCode from "qrcode";

type MfaSetupStartResponse = {
  ok: boolean;
  setupToken: string;
  manualEntryKey: string;
  otpauthUrl: string;
  expiresInSec: number;
};

type AuthAttemptResult = { ok: true } | { ok: false; errorCode: string; rawError?: string | null };

export default function SuperAdminLoginClient() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();
  const { nome } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";

  useEffect(() => {
    let mounted = true;

    async function buildQrCode() {
      if (!setupMode || !otpauthUrl) {
        if (mounted) setQrCodeDataUrl("");
        return;
      }

      try {
        const url = await QRCode.toDataURL(otpauthUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 220,
        });
        if (mounted) setQrCodeDataUrl(url);
      } catch {
        if (mounted) setQrCodeDataUrl("");
      }
    }

    void buildQrCode();

    return () => {
      mounted = false;
    };
  }, [setupMode, otpauthUrl]);

  function extractAuthCode(raw?: string | null) {
    const value = String(raw || "").toUpperCase();
    if (value.includes("SUPERADMIN_MFA_SETUP_REQUIRED")) {
      return "SUPERADMIN_MFA_SETUP_REQUIRED";
    }
    if (value.includes("SUPERADMIN_MFA_REQUIRED")) {
      return "SUPERADMIN_MFA_REQUIRED";
    }
    if (value.includes("SUPERADMIN_MFA_INVALID")) {
      return "SUPERADMIN_MFA_INVALID";
    }
    if (value.includes("CREDENTIALSSIGNIN") || value.includes("AUTH_FAILED")) {
      return "AUTH_FAILED";
    }
    return "UNKNOWN";
  }

  function mapAuthError(code: string) {
    if (code === "SUPERADMIN_MFA_REQUIRED") {
      return "Informe o codigo MFA de 6 digitos para continuar.";
    }
    if (code === "SUPERADMIN_MFA_INVALID") {
      return "Codigo MFA invalido.";
    }
    if (code === "AUTH_FAILED") {
      return "Credenciais invalidas.";
    }
    return "Nao foi possivel autenticar no painel SuperAdmin.";
  }

  async function performLogin(codeOverride?: string): Promise<AuthAttemptResult> {
    const normalizedCode = String(codeOverride ?? mfaCode).trim();
    setErro("");
    setInfo("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
        mfaCode: normalizedCode || undefined,
        callbackUrl: "/superadmin/dashboard",
      });

      if (!res?.ok) {
        return { ok: false, errorCode: extractAuthCode(res?.error), rawError: res?.error };
      }

      router.push("/superadmin/dashboard");
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoStartMfaSetup() {
    setErro("");
    setInfo("");
    setLoading(true);

    try {
      const challengeRes = await fetch("/api/superadmin/mfa/setup/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });

      if (!challengeRes.ok) {
        setErro("Nao foi possivel iniciar a configuracao segura do MFA.");
        return;
      }

      const res = await fetch("/api/superadmin/mfa/setup/start", {
        method: "POST",
        cache: "no-store",
      });

      const body = (await res.json().catch(() => ({}))) as Partial<MfaSetupStartResponse> & {
        message?: string;
      };

      if (!res.ok) {
        setErro(body.message || "Nao foi possivel iniciar a configuracao segura do MFA.");
        return;
      }

      setSetupToken(String(body.setupToken || ""));
      setManualEntryKey(String(body.manualEntryKey || ""));
      setOtpauthUrl(String(body.otpauthUrl || ""));
      setQrCodeDataUrl("");
      setSetupMode(true);
      setInfo(
        "Conta sem MFA configurado. Finalize o setup com o app autenticador para concluir o login."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await performLogin();
    if (result.ok) {
      return;
    }

    if (result.errorCode === "SUPERADMIN_MFA_SETUP_REQUIRED") {
      await handleAutoStartMfaSetup();
      return;
    }

    setErro(mapAuthError(result.errorCode));
  }

  async function handleConfirmMfaSetup() {
    setErro("");
    setInfo("");

    if (!setupToken || !setupCode.trim()) {
      setErro("Informe o codigo do autenticador para concluir o setup do MFA.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/mfa/setup/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken, code: setupCode.trim() }),
      });

      const body = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setErro(body.message || "Codigo MFA invalido para confirmar setup.");
        return;
      }

      setMfaCode(setupCode.trim());
      setSetupMode(false);
      setInfo("MFA habilitado com sucesso. Realizando login...");
      const result = await performLogin(setupCode.trim());
      if (!result.ok) {
        setErro(mapAuthError(result.errorCode));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700 space-y-4"
        autoComplete="off"
      >
        <h1 className="text-xl font-bold mb-6 text-center text-white">
          Painel SuperAdmin {brandName}
        </h1>

        {erro && (
          <div className="bg-red-600 text-white text-sm rounded p-2 text-center">{erro}</div>
        )}

        {info && (
          <div className="bg-emerald-700 text-white text-sm rounded p-2 text-center">{info}</div>
        )}

        <input
          type="email"
          placeholder="E-mail"
          className="block w-full p-2 mb-4 border rounded bg-zinc-700 text-white border-zinc-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="block w-full p-2 mb-6 border rounded bg-zinc-700 text-white border-zinc-600"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="Codigo MFA (6 digitos)"
          className="block w-full p-2 border rounded bg-zinc-700 text-white border-zinc-600"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 font-bold transition disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {setupMode && (
          <div className="rounded-lg border border-zinc-600 bg-zinc-900 p-4 space-y-3">
            <p className="text-sm text-zinc-200 font-semibold">Setup MFA (SuperAdmin)</p>
            <p className="text-xs text-zinc-400">1) Abra Google Authenticator/Authy.</p>
            <p className="text-xs text-zinc-400">2) Escaneie o QR code (ou use a chave manual).</p>

            <div className="rounded-lg border border-zinc-700 bg-white p-3">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR code para configuracao do MFA SuperAdmin"
                  className="mx-auto h-52 w-52 rounded"
                />
              ) : (
                <p className="text-center text-xs text-zinc-700">Gerando QR code...</p>
              )}
            </div>

            <code className="block break-all rounded bg-zinc-950 p-2 text-xs text-emerald-300">
              {manualEntryKey}
            </code>
            <p className="text-xs text-zinc-500">URI (opcional): {otpauthUrl}</p>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="Codigo do autenticador"
              className="block w-full p-2 border rounded bg-zinc-700 text-white border-zinc-600"
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmMfaSetup}
              className="w-full bg-emerald-500 text-black py-2 rounded hover:bg-emerald-400 font-bold transition disabled:opacity-60"
            >
              Confirmar MFA
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

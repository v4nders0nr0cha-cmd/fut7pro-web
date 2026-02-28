"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/hooks/useBranding";

type MfaSetupStartResponse = {
  ok: boolean;
  setupToken: string;
  manualEntryKey: string;
  otpauthUrl: string;
  expiresInSec: number;
};

export default function SuperAdminLoginClient() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();
  const { nome } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";

  function mapAuthError(raw?: string | null) {
    const value = String(raw || "").toUpperCase();
    if (value.includes("SUPERADMIN_MFA_SETUP_REQUIRED")) {
      return "MFA obrigatorio ainda nao foi configurado. Use o botao de configuracao abaixo.";
    }
    if (value.includes("SUPERADMIN_MFA_REQUIRED")) {
      return "Informe o codigo MFA de 6 digitos para continuar.";
    }
    if (value.includes("SUPERADMIN_MFA_INVALID")) {
      return "Codigo MFA invalido.";
    }
    if (value.includes("CREDENTIALSSIGNIN") || value.includes("AUTH_FAILED")) {
      return "Credenciais invalidas.";
    }
    return "Nao foi possivel autenticar no painel SuperAdmin.";
  }

  async function performLogin(codeOverride?: string) {
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
        basePath: "/api/superadmin-auth",
        callbackUrl: "/superadmin/dashboard",
      });

      if (!res?.ok) {
        setErro(mapAuthError(res?.error));
        return false;
      }

      router.push("/superadmin/dashboard");
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await performLogin();
  }

  async function handleStartMfaSetup() {
    setErro("");
    setInfo("");

    if (!email.trim() || !senha.trim()) {
      setErro("Informe e-mail e senha para iniciar a configuracao do MFA.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/mfa/setup/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });

      const body = (await res.json().catch(() => ({}))) as Partial<MfaSetupStartResponse> & {
        code?: string;
        message?: string;
      };

      if (!res.ok) {
        setErro(body.message || "Falha ao iniciar setup do MFA.");
        return;
      }

      setSetupToken(String(body.setupToken || ""));
      setManualEntryKey(String(body.manualEntryKey || ""));
      setOtpauthUrl(String(body.otpauthUrl || ""));
      setSetupMode(true);
      setInfo(
        "MFA iniciado. Cadastre a chave no autenticador e confirme com o codigo de 6 digitos."
      );
    } finally {
      setLoading(false);
    }
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
      await performLogin(setupCode.trim());
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

        <button
          type="button"
          disabled={loading}
          onClick={handleStartMfaSetup}
          className="w-full border border-zinc-500 text-zinc-100 py-2 rounded hover:bg-zinc-700 font-semibold transition disabled:opacity-60"
        >
          Configurar MFA obrigatorio
        </button>

        {setupMode && (
          <div className="rounded-lg border border-zinc-600 bg-zinc-900 p-4 space-y-3">
            <p className="text-sm text-zinc-200 font-semibold">Setup MFA (SuperAdmin)</p>
            <p className="text-xs text-zinc-400">
              1) Abra Google Authenticator/Authy. 2) Adicione conta manualmente com a chave abaixo.
            </p>
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

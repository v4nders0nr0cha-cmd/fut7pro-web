"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type VerifyStatus = "loading" | "success" | "error";

export default function VerificarEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token invalido ou ausente.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok || !data?.ok) {
          setStatus("error");
          setMessage(data?.message || "Token expirado ou invalido.");
          return;
        }

        setStatus("success");
        setMessage("E-mail confirmado com sucesso.");
        const verifiedEmail = (data?.email || "").toString().trim();
        if (verifiedEmail) {
          setConfirmedEmail(verifiedEmail);
        }
        const params = new URLSearchParams();
        if (verifiedEmail) params.set("email", verifiedEmail);
        params.set("verified", "1");
        redirectTimer = setTimeout(() => {
          router.replace(`/admin/login?${params.toString()}`);
        }, 1200);
      } catch {
        if (!active) return;
        setStatus("error");
        setMessage("Nao foi possivel validar o token.");
      }
    };

    void verify();

    return () => {
      active = false;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [router, token]);

  const handleResend = async () => {
    const email = resendEmail.trim().toLowerCase();
    if (!email) {
      setMessage("Informe o e-mail para reenviar.");
      setStatus("error");
      return;
    }

    setResendStatus("loading");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setMessage(data?.message || "Nao foi possivel reenviar.");
        setStatus("error");
        return;
      }

      router.push(`/cadastrar-racha/confirmar-email?email=${encodeURIComponent(email)}`);
    } catch {
      setMessage("Falha ao reenviar o e-mail.");
      setStatus("error");
    } finally {
      setResendStatus("idle");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16 pt-4">
      <section className="rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300">
            Ativação do painel
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {status === "success" ? "E-mail confirmado!" : "Confirmando seu e-mail"}
          </h1>
          <p className="text-sm text-gray-300">
            {status === "loading" && "Aguarde enquanto validamos seu link de confirmação."}
            {status !== "loading" && message}
          </p>
        </div>

        {status === "loading" && (
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-yellow-400" />
          </div>
        )}

        {status === "success" && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (confirmedEmail) params.set("email", confirmedEmail);
                params.set("verified", "1");
                router.push(`/admin/login?${params.toString()}`);
              }}
              className="w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black shadow-lg hover:bg-yellow-300"
            >
              Ir para o login do painel
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-red-500/50 bg-red-600/20 px-3 py-2 text-xs text-red-200">
              {message}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Reenviar e-mail
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === "loading"}
                className="w-full rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:border-yellow-300 hover:text-yellow-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resendStatus === "loading" ? "Enviando..." : "Reenviar confirmação"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

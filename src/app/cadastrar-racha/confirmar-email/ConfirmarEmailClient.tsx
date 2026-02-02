"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ResendStatus = "idle" | "loading" | "sent" | "error";

export default function ConfirmarEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => (searchParams.get("email") || "").trim(), [searchParams]);
  const slug = useMemo(() => (searchParams.get("slug") || "").trim(), [searchParams]);

  const [status, setStatus] = useState<ResendStatus>("idle");
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Informe o e-mail para reenviar a confirmação.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMessage(data?.message || "Não foi possível reenviar agora.");
        return;
      }

      setStatus("sent");
      setMessage("E-mail reenviado! Verifique sua caixa de entrada e o spam.");
    } catch {
      setStatus("error");
      setMessage("Falha ao reenviar o e-mail. Tente novamente.");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16 pt-4">
      <section className="rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300">
            Confirmação de e-mail
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Confirme seu e-mail para ativar seu painel
          </h1>
          <p className="text-sm text-gray-300">
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold text-white">{email || "seu e-mail"}</span>. Clique no
            link para liberar o acesso.
          </p>
        </div>

        {message && (
          <div
            role="alert"
            aria-live="polite"
            className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
              status === "error"
                ? "border-red-500/50 bg-red-600/20 text-red-200"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleResend}
            disabled={status === "loading"}
            className="w-full rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:border-yellow-300 hover:text-yellow-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Reenviando..." : "Reenviar e-mail"}
          </button>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (email) params.set("email", email);
              params.set("verified", "1");
              router.push(`/admin/login?${params.toString()}`);
            }}
            className="w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black shadow-lg hover:bg-yellow-300"
          >
            Já confirmei
          </button>
        </div>

        <div className="mt-5 space-y-2 text-xs text-gray-400">
          <p>
            Não encontrou o e-mail? Verifique também as pastas Spam, Lixo eletrônico ou Promoções.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/cadastrar-racha${slug ? `?slug=${slug}` : ""}`)}
            className="text-yellow-300 underline hover:text-yellow-200"
          >
            Trocar e-mail ou corrigir cadastro
          </button>
        </div>
      </section>
    </main>
  );
}

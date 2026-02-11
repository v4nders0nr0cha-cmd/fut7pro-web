"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type ResendStatus = "idle" | "loading" | "sent" | "error";

export default function ConfirmarEmailPublicClient() {
  const searchParams = useSearchParams();
  const { publicHref } = usePublicLinks();

  const initialEmail = useMemo(
    () => (searchParams.get("email") || "").trim().toLowerCase(),
    [searchParams]
  );

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<ResendStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const loginHref = useMemo(() => {
    const query = new URLSearchParams();
    if (email.trim()) {
      query.set("email", email.trim().toLowerCase());
    }
    query.set("verified", "1");
    return `${publicHref("/login")}?${query.toString()}`;
  }, [email, publicHref]);

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Informe o e-mail para reenviar a confirmação.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        setStatus("error");
        setMessage(body?.message || "Não foi possível reenviar agora.");
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
            Verificação de e-mail
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Confirme seu e-mail para ativar sua conta
          </h1>
          <p className="text-sm text-gray-300">
            O acesso por senha só é liberado depois da confirmação de segurança no e-mail.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            E-mail da conta
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </label>
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
          <Link
            href={loginHref}
            className="inline-flex w-full items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black shadow-lg hover:bg-yellow-300"
          >
            Já confirmei, entrar
          </Link>
        </div>

        <div className="mt-5 space-y-2 text-xs text-gray-400">
          <p>
            Não encontrou o e-mail? Verifique também as pastas Spam, Lixo eletrônico ou Promoções.
          </p>
          <Link
            href={publicHref("/entrar")}
            className="text-yellow-300 underline hover:text-yellow-200"
          >
            Voltar para a entrada do racha
          </Link>
        </div>
      </section>
    </main>
  );
}

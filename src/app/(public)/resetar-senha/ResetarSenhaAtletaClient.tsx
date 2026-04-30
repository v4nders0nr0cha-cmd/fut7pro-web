"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";

type Status = "idle" | "loading" | "success" | "error";

function validatePassword(password: string, confirmPassword: string) {
  if (password !== confirmPassword) {
    return "A senha precisa combinar nos dois campos.";
  }
  const strongEnough =
    password.length >= 10 &&
    password.length <= 72 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!strongEnough) {
    return "A senha precisa ter entre 10 e 72 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.";
  }
  return "";
}

export default function ResetarSenhaAtletaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicHref } = usePublicLinks();
  const { nome } = useTema();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage(
        "Este link de redefinição expirou. Solicite um novo link para criar uma nova senha."
      );
      return;
    }

    const validationMessage = validatePassword(password, confirmPassword);
    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMessage(
          data?.message ||
            "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link."
        );
        return;
      }

      setStatus("success");
      setMessage(
        "Senha redefinida com sucesso. Agora você já pode entrar no Fut7Pro com sua nova senha."
      );
    } catch {
      setStatus("error");
      setMessage(
        "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes."
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0b0f16] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c111d]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-soft">
              Nova senha
            </div>
            <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
            <p className="text-sm text-gray-300">
              Crie uma nova senha para acessar sua conta de atleta no{" "}
              <span className="font-semibold text-brand-soft">{nome || "Fut7Pro"}</span>.
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Nova senha
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-soft"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Confirmar senha
              <div className="relative mt-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-soft"
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  title={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-xs text-gray-400">
            <button
              type="button"
              onClick={() => router.push(publicHref("/login"))}
              className="text-brand-soft underline hover:text-brand"
            >
              Voltar para o login
            </button>
            {status === "error" && (
              <div>
                <button
                  type="button"
                  onClick={() => router.push(publicHref("/esqueci-senha"))}
                  className="text-brand-soft underline hover:text-brand"
                >
                  Solicitar novo link
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

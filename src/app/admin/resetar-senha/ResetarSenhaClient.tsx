"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

type Status = "idle" | "loading" | "success" | "error";

type ResetarSenhaClientProps = {
  description?: string;
  loginHref?: string;
  forgotHref?: string;
};

export default function ResetarSenhaClient({
  description = "Crie uma nova senha para acessar sua conta Fut7Pro.",
  loginHref = "/admin/login",
  forgotHref = "/admin/esqueci-senha",
}: ResetarSenhaClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setMessage("Este link não é mais válido. Solicite um novo link para continuar.");
      return;
    }

    if (!password || password.length < 8) {
      setStatus("error");
      setMessage("A senha precisa ter pelo menos 8 caracteres e combinar nos dois campos.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("A senha precisa ter pelo menos 8 caracteres e combinar nos dois campos.");
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
          getHumanAuthErrorMessage(
            data,
            "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link."
          )
        );
        return;
      }

      setStatus("success");
      setMessage(
        "Senha redefinida com sucesso. Agora você já pode entrar no Fut7Pro com sua nova senha."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        getHumanAuthErrorMessage(
          error,
          "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link."
        )
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0b0f16] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c111d]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-300">
              Nova senha
            </div>
            <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
            <p className="text-sm text-gray-300">{description}</p>
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-300"
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-300"
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  title={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-gray-400">
            <button
              type="button"
              onClick={() => router.push(loginHref)}
              className="text-yellow-300 underline hover:text-yellow-200"
            >
              Voltar para o login
            </button>
            {status === "error" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => router.push(forgotHref)}
                  className="text-yellow-300 underline hover:text-yellow-200"
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

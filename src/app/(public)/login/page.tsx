"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { rachaMap } from "@/config/rachaMap";

export default function LoginPage() {
  const { rachaId } = useRacha();
  // Nome do racha dinâmico pelo mapa, fallback para "Fut7Pro"
  const nomeDoRacha = rachaMap[rachaId]?.nome || "Fut7Pro";

  const [tab, setTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) router.push("/");
    else alert("Login inválido");
  };

  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-center pb-10 pt-8 md:pt-16">
      <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-6 shadow-lg">
        <h1 className="mb-4 text-center text-xl font-bold">Acesse sua Conta</h1>
        <p className="mb-6 text-center text-base font-medium leading-snug text-gray-300">
          Acesse sua conta para editar seu perfil, participar de discussões e
          enquetes que melhoram nosso racha, e ficar por dentro de todas as
          novidades do{" "}
          <span className="font-bold text-yellow-400">{nomeDoRacha}</span>.
        </p>

        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => setTab("google")}
            className={`rounded px-3 py-1 font-semibold transition ${tab === "google" ? "bg-yellow-400 text-black" : "bg-zinc-700 text-white"}`}
          >
            Google
          </button>
          <button
            onClick={() => setTab("email")}
            className={`rounded px-3 py-1 font-semibold transition ${tab === "email" ? "bg-yellow-400 text-black" : "bg-zinc-700 text-white"}`}
          >
            E-mail e Senha
          </button>
        </div>

        {tab === "google" && (
          <button
            onClick={() => signIn("google")}
            className="w-full rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300"
          >
            Entrar com Google
          </button>
        )}

        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              required
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <button
              type="submit"
              className="w-full rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300"
            >
              Entrar
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          Ainda não tem conta?{" "}
          <a href="/register" className="text-yellow-400 hover:underline">
            Cadastre-se
          </a>
        </div>
      </div>
    </main>
  );
}

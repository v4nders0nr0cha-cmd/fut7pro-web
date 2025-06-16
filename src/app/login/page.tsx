// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Entrar no Fut7Pro</h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setTab("google")}
            className={`px-3 py-1 rounded font-semibold transition ${
              tab === "google" ? "bg-yellow-400 text-black" : "bg-zinc-700"
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setTab("email")}
            className={`px-3 py-1 rounded font-semibold transition ${
              tab === "email" ? "bg-yellow-400 text-black" : "bg-zinc-700"
            }`}
          >
            E-mail e Senha
          </button>
        </div>

        {tab === "google" && (
          <button
            onClick={() => signIn("google")}
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
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
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
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
    </div>
  );
}

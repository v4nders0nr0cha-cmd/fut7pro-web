"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/hooks/useBranding";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();
  const { nome } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password: senha,
      basePath: "/api/superadmin-auth",
      callbackUrl: "/superadmin/dashboard",
    });

    if (!res?.ok) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/superadmin/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-xs border border-zinc-700"
        autoComplete="off"
      >
        <h1 className="text-xl font-bold mb-6 text-center text-white">
          Painel SuperAdmin {brandName}
        </h1>

        {erro && (
          <div className="bg-red-600 text-white text-sm rounded p-2 mb-4 text-center">{erro}</div>
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
        <button
          type="submit"
          className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 font-bold transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

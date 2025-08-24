// src/app/superadmin/login/page.tsx
"use client";
import { useState } from "react";
import { rachaConfig } from "@/config/racha.config";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Autenticação de SuperAdmin será implementada com NextAuth e validação de roles
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Validar login e redirecionar
    alert("Login de SuperAdmin simulado!");
    window.location.href = "/superadmin/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-xs rounded-xl border border-zinc-700 bg-zinc-800 p-8 shadow-lg"
        autoComplete="off"
      >
        <h1 className="mb-6 text-center text-xl font-bold text-white">
          Painel SuperAdmin {rachaConfig.nome}
        </h1>
        <input
          type="email"
          placeholder="E-mail"
          className="mb-4 block w-full rounded border border-zinc-600 bg-zinc-700 p-2 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="mb-6 block w-full rounded border border-zinc-600 bg-zinc-700 p-2 text-white"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

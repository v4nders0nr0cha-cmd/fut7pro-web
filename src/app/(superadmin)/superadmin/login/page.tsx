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
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-xs border border-zinc-700"
        autoComplete="off"
      >
        <h1 className="text-xl font-bold mb-6 text-center text-white">
          Painel SuperAdmin {rachaConfig.nome}
        </h1>
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

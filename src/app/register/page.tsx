// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nome.length > 10 || apelido.length > 10) {
      alert("Nome e Apelido devem ter no máximo 10 letras.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, apelido, email, senha }),
    });

    if (res.ok) {
      alert("Conta criada com sucesso!");
      router.push("/login");
    } else {
      const erro = await res.text();
      alert("Erro ao cadastrar: " + erro);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center">Criar Conta</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={10}
            required
            placeholder="Nome (máx. 10 letras)"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="text"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            maxLength={10}
            required
            placeholder="Apelido (máx. 10 letras)"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="E-mail"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Senha"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Entrar
          </a>
        </div>
      </div>
    </div>
  );
}

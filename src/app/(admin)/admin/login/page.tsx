"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      senha: senha,
    });
    if (res?.ok) router.push("/admin/dashboard");
    else setErro("E-mail ou senha inválidos.");
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-6 shadow-lg">
        <h1 className="mb-4 text-center text-xl font-bold">
          Painel do Administrador
        </h1>
        <p className="mb-6 text-center text-base font-medium leading-snug text-gray-300">
          Acesso restrito para presidentes e administradores de racha.
          <br />
          Insira suas credenciais para acessar o painel administrativo do
          Fut7Pro.
        </p>

        {erro && (
          <div className="mb-4 rounded bg-red-600 p-2 text-center text-sm text-white">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="E-mail do administrador"
            className="w-full rounded bg-zinc-800 p-2 text-white"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Senha"
            className="w-full rounded bg-zinc-800 p-2 text-white"
          />
          <button
            type="submit"
            className="w-full rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Ainda não cadastrou seu racha?{" "}
          <a href="/admin/register" className="text-yellow-400 hover:underline">
            Cadastre-se
          </a>
        </div>
      </div>
    </main>
  );
}

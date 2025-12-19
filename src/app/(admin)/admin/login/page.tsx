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
      password: senha,
    });
    if (res?.ok) {
      router.push("/admin/dashboard");
      return;
    }

    const errorMessage = res?.error || "";
    const blocked =
      errorMessage.toLowerCase().includes("bloqueado") ||
      errorMessage.toLowerCase().includes("blocked") ||
      errorMessage.toLowerCase().includes("blocked");

    if (blocked) {
      setErro(
        "Acesso ao Painel Administrativo Bloqueado\n\nEste racha está temporariamente bloqueado pelo Fut7Pro e, no momento, não é possível acessar o painel administrativo.\n\nPara solicitar o desbloqueio e receber mais informações, entre em contato com a nossa equipe pelo e-mail: social@fut7pro.com.br.\n\nSe possível, informe no e-mail: nome do racha, slug do racha e o e-mail do administrador."
      );
    } else {
      setErro("E-mail ou senha invalidos.");
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Painel do Administrador</h1>
        <p className="text-gray-300 text-center mb-6 text-base font-medium leading-snug">
          Acesso restrito para presidentes e administradores de racha.
          <br />
          Insira suas credenciais para acessar o painel administrativo do Fut7Pro.
        </p>

        {erro && (
          <div className="bg-red-600 text-white text-sm rounded p-2 mb-4 whitespace-pre-line text-center">
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
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Ainda nao cadastrou seu racha?{" "}
          <a href="/cadastrar-racha" className="text-yellow-400 hover:underline">
            Cadastre-se
          </a>
        </div>
      </div>
    </main>
  );
}

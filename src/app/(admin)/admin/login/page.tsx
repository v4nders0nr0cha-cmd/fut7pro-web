"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");
  const router = useRouter();
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "https://api.fut7pro.com.br";
  const loginPath = process.env.AUTH_LOGIN_PATH || "/auth/login";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setBlockedMessage("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password: senha,
    });
    if (res?.ok) {
      router.push("/admin/dashboard");
      return;
    }

    // Fallback: consultar mensagem do backend diretamente para diferenciar bloqueio vs credenciais
    try {
      const resp = await fetch(`${apiBase}${loginPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });
      const body = await resp.json().catch(() => ({}) as any);
      const message = (body as any)?.message?.toString?.() ?? "";
      const blocked =
        message.toLowerCase().includes("bloque") ||
        message.toLowerCase().includes("blocked") ||
        message.toLowerCase().includes("paused");

      if (blocked) {
        setBlockedMessage(
          "Acesso ao Painel Administrativo Bloqueado\n\nEste racha está temporariamente bloqueado pelo Fut7Pro e, no momento, não é possível acessar o painel administrativo.\n\nPara solicitar o desbloqueio e receber mais informações, entre em contato com a nossa equipe pelo e-mail: social@fut7pro.com.br.\n\nSe possível, informe no e-mail: nome do racha, slug do racha e o e-mail do administrador."
        );
        return;
      }
    } catch {
      // ignore
    }

    setErro("E-mail ou senha invalidos.");
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

      {blockedMessage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 text-white rounded-xl shadow-2xl p-6 max-w-lg w-full space-y-4">
            <h2 className="text-xl font-bold text-center">
              Acesso ao Painel Administrativo Bloqueado
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-center">
              {blockedMessage}
            </p>
            <button
              className="mt-2 w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
              onClick={() => setBlockedMessage("")}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

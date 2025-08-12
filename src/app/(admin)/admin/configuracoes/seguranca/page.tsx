"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaShieldAlt,
  FaLock,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaQuestionCircle,
} from "react-icons/fa";

type Status = "ativo" | "em-breve";

const recursos = [
  {
    nome: "Autenticação em Dois Fatores (2FA)",
    descricao:
      "Proteja seu acesso ao painel exigindo confirmação no celular ou e-mail ao fazer login.",
    status: "em-breve" as Status,
  },
  {
    nome: "Histórico de acessos e logs",
    descricao: "Veja a lista de acessos e alterações feitas no painel, por usuário e data.",
    status: "ativo" as Status,
  },
  {
    nome: "Bloqueio automático por tentativas inválidas",
    descricao:
      "Seu painel bloqueia acesso temporário ao detectar muitas tentativas de senha incorreta.",
    status: "ativo" as Status,
  },
  {
    nome: "Permissões Granulares",
    descricao: "Defina o que cada administrador pode ou não pode acessar no painel.",
    status: "ativo" as Status,
  },
];

export default function SegurancaPage() {
  // Simulação de campo de troca de senha
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [msg, setMsg] = useState("");
  const [alterada, setAlterada] = useState(false);

  const handleTrocarSenha = () => {
    setMsg("");
    setAlterada(false);
    if (senha.length < 6 || novaSenha.length < 8) {
      setMsg("Preencha a senha atual e defina uma nova senha com pelo menos 8 caracteres.");
      return;
    }
    setTimeout(() => {
      setAlterada(true);
      setMsg("Senha alterada com sucesso!");
      setSenha("");
      setNovaSenha("");
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Segurança & Privacidade | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Aumente a segurança do seu painel do Fut7Pro: permissões, logs, autenticação 2FA, bloqueios e privacidade."
        />
        <meta
          name="keywords"
          content="Fut7, segurança, privacidade, 2FA, autenticação, logs, SaaS, admin"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaShieldAlt /> Segurança & Privacidade
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Seu painel protegido, seus dados seguros.</b>
          <br />
          Gerencie regras de segurança, privacidade e permissões para todos os administradores do
          racha.
          <br />
          <span className="text-gray-300">
            Acompanhe os acessos, defina políticas de senha, altere sua senha, ative logs e aguarde
            recursos avançados como 2FA.
          </span>
        </div>

        {/* Cards de recursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {recursos.map((rec) => (
            <div
              key={rec.nome}
              className={`bg-[#232323] rounded-lg p-5 shadow border-l-4 ${rec.status === "ativo" ? "border-green-500" : "border-yellow-700"} flex flex-col gap-2 animate-fadeIn`}
            >
              <div className="flex items-center gap-2">
                {rec.status === "ativo" ? (
                  <FaCheckCircle className="text-green-400 text-lg" />
                ) : (
                  <FaTimesCircle className="text-yellow-400 text-lg" />
                )}
                <span className="font-bold text-yellow-300 text-lg">{rec.nome}</span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded ${
                    rec.status === "ativo"
                      ? "bg-green-700 text-green-200"
                      : "bg-yellow-800 text-yellow-200"
                  }`}
                >
                  {rec.status === "ativo" ? "Ativado" : "Em breve"}
                </span>
              </div>
              <div className="text-gray-200 text-sm">{rec.descricao}</div>
            </div>
          ))}
        </div>

        {/* Área para troca de senha */}
        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-10">
          <div className="flex items-center gap-2 font-bold text-yellow-300 mb-2">
            <FaKey /> Alterar Senha do Administrador
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrocarSenha();
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type={senhaVisivel ? "text" : "password"}
                className="p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100 font-mono flex-1"
                placeholder="Senha atual"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                autoComplete="current-password"
              />
              <input
                type={senhaVisivel ? "text" : "password"}
                className="p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100 font-mono flex-1"
                placeholder="Nova senha (mín. 8 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 rounded transition"
                onClick={() => setSenhaVisivel((v) => !v)}
                tabIndex={-1}
                title={senhaVisivel ? "Ocultar senha" : "Exibir senha"}
              >
                {senhaVisivel ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-6 py-2 rounded w-fit mt-2 transition"
            >
              Trocar senha
            </button>
            {msg && (
              <div
                className={`mt-2 text-sm ${alterada ? "text-green-400" : "text-red-400"} flex items-center gap-2`}
              >
                {alterada ? <FaCheckCircle /> : <FaTimesCircle />} {msg}
              </div>
            )}
          </form>
        </div>

        {/* FAQ */}
        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Como alterar a senha?</b> Preencha o formulário acima e clique em Trocar senha.
            </li>
            <li>
              <b>Quando estará disponível 2FA?</b> Em breve! Assim que liberado, avisaremos a todos
              os administradores.
            </li>
            <li>
              <b>O que faço se perder o acesso?</b> Solicite recuperação pelo suporte do Fut7Pro.
            </li>
            <li>
              <b>Como saber quem acessou o painel?</b> Consulte o histórico de acessos na área
              Administração &gt; Logs/Admin.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                Abrir chamado
              </a>
            </li>
          </ul>
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.3s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}

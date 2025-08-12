"use client";

import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import {
  FaGlobe,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegQuestionCircle,
  FaCopy,
  FaHeadset,
} from "react-icons/fa";

const CNAME_TARGET = "custom.fut7pro.com.br.";

export default function DominioProprioPage() {
  const [dominio, setDominio] = useState("");
  const [status, setStatus] = useState<"vazio" | "aguardando" | "aprovado" | "erro">("vazio");
  const [mensagem, setMensagem] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSalvar = () => {
    setMensagem("");
    setStatus("aguardando");

    // Simulação de integração futura
    setTimeout(() => {
      if (!dominio.endsWith(".com.br") && !dominio.endsWith(".com")) {
        setStatus("erro");
        setMensagem(
          "Domínio inválido. Use apenas domínios próprios (ex: meuaracha.com.br). Não são aceitos domínios gratuitos."
        );
      } else if (dominio.includes("fut7pro.com.br")) {
        setStatus("erro");
        setMensagem(
          "Não é permitido usar subdomínios do próprio Fut7Pro. Cadastre um domínio próprio."
        );
      } else {
        setStatus("aprovado");
        setMensagem(
          "Domínio cadastrado com sucesso! Assim que o DNS for propagado, seu painel ficará disponível no domínio configurado."
        );
      }
    }, 1600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CNAME_TARGET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <Head>
        <title>Domínio Próprio | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Configure seu domínio próprio para acessar o painel do Fut7Pro com identidade exclusiva."
        />
        <meta
          name="keywords"
          content="Fut7, domínio próprio, white label, SaaS, admin, DNS, racha"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaGlobe /> Domínio Próprio
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Configure seu domínio personalizado!</b>
          <br />
          Use seu próprio domínio (ex: <b>suaracha.com.br</b>) para acessar o painel e página
          pública do seu racha, reforçando sua identidade visual e profissionalismo.
          <div className="text-gray-400 mt-2">
            Disponível para todos os planos pagos. Após o cadastro, siga as instruções de DNS para
            validar.
          </div>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700 mb-8">
          <label htmlFor="dominio" className="block text-yellow-300 font-bold mb-2">
            Domínio desejado
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="dominio"
              type="text"
              className="flex-1 p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100 font-mono"
              placeholder="ex: meuaracha.com.br"
              value={dominio}
              onChange={(e) => {
                setDominio(e.target.value.trim());
                setStatus("vazio");
                setMensagem("");
              }}
              maxLength={50}
              autoComplete="off"
            />
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 py-2 rounded transition disabled:opacity-60"
              onClick={handleSalvar}
              disabled={!dominio || dominio.length < 6}
            >
              Salvar
            </button>
          </div>
          <span className="text-xs text-gray-400">
            Apenas domínios próprios (ex: meuaracha.com.br). Não aceitamos domínios gratuitos tipo
            .tk, .ml, .ga.
          </span>

          {status === "aguardando" && (
            <div className="flex items-center gap-2 mt-3 text-yellow-300 font-bold animate-pulse">
              <FaRegQuestionCircle /> Aguardando validação DNS...
            </div>
          )}
          {status === "aprovado" && (
            <div className="flex items-center gap-2 mt-3 text-green-400 font-bold">
              <FaCheckCircle /> Domínio validado e ativo!
            </div>
          )}
          {status === "erro" && (
            <div className="flex items-center gap-2 mt-3 text-red-400 font-bold">
              <FaExclamationCircle /> {mensagem}
            </div>
          )}
          {status === "vazio" && mensagem && (
            <div className="flex items-center gap-2 mt-3 text-yellow-300 font-bold">
              <FaRegQuestionCircle /> {mensagem}
            </div>
          )}
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700 mb-8">
          <div className="font-bold text-yellow-300 mb-1">Instruções para configuração do DNS:</div>
          <ol className="list-decimal ml-6 text-gray-200 text-sm mb-2">
            <li>
              <b>Registre ou acesse</b> o seu domínio próprio em seu provedor de domínios.
            </li>
            <li>
              <b>Crie um registro CNAME</b> apontando para:{" "}
              <span className="bg-[#181818] rounded px-2 py-1 font-mono text-yellow-200 select-all">
                {CNAME_TARGET}
              </span>
              <button
                className="ml-2 text-xs bg-yellow-400 hover:bg-yellow-500 text-[#232323] rounded px-2 py-1 font-bold"
                onClick={handleCopy}
                type="button"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </li>
            <li>
              Aguarde até <b>24 horas</b> para propagação (normalmente em poucos minutos).
            </li>
            <li>
              Volte aqui e clique em <b>Salvar</b>. O sistema validará o DNS e ativará o domínio.
            </li>
          </ol>
          <div className="text-xs text-gray-400 mt-2">
            <b>Dica:</b> O endereço do painel/admin também será alterado para seu domínio.
          </div>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2">Dúvidas Frequentes</div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Quanto tempo leva para ativar?</b> Normalmente de 15min a 2h após o DNS ser
              propagado.
            </li>
            <li>
              <b>Posso usar domínio gratuito?</b> Não. Apenas domínios próprios (.com.br, .com,
              etc).
            </li>
            <li>
              <b>Se der erro, o que faço?</b> Verifique se o CNAME está correto e aguarde a
              propagação. Persistindo, entre em contato pelo suporte abaixo.
            </li>
            <li>
              <b>Meu site vai ficar offline?</b> Não! O domínio Fut7Pro padrão segue funcionando
              normalmente até o domínio próprio ser validado.
            </li>
            <li className="flex items-center gap-3">
              <b>Suporte:</b>
              <a
                href="mailto:suporte@fut7pro.com.br"
                className="underline text-yellow-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                suporte@fut7pro.com.br
              </a>
              <span>|</span>
              <Link
                href="/admin/comunicacao/suporte"
                className="text-yellow-400 flex items-center gap-1 underline hover:text-yellow-300"
                title="Abrir chamado no suporte Fut7Pro"
              >
                <FaHeadset className="inline text-base" />
                Abrir chamado
              </Link>
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

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
  const [status, setStatus] = useState<
    "vazio" | "aguardando" | "aprovado" | "erro"
  >("vazio");
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
          "Domínio inválido. Use apenas domínios próprios (ex: meuaracha.com.br). Não são aceitos domínios gratuitos.",
        );
      } else if (dominio.includes("fut7pro.com.br")) {
        setStatus("erro");
        setMensagem(
          "Não é permitido usar subdomínios do próprio Fut7Pro. Cadastre um domínio próprio.",
        );
      } else {
        setStatus("aprovado");
        setMensagem(
          "Domínio cadastrado com sucesso! Assim que o DNS for propagado, seu painel ficará disponível no domínio configurado.",
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
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaGlobe /> Domínio Próprio
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Configure seu domínio personalizado!
          </b>
          <br />
          Use seu próprio domínio (ex: <b>suaracha.com.br</b>) para acessar o
          painel e página pública do seu racha, reforçando sua identidade visual
          e profissionalismo.
          <div className="mt-2 text-gray-400">
            Disponível para todos os planos pagos. Após o cadastro, siga as
            instruções de DNS para validar.
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow-lg">
          <label
            htmlFor="dominio"
            className="mb-2 block font-bold text-yellow-300"
          >
            Domínio desejado
          </label>
          <div className="mb-2 flex gap-2">
            <input
              id="dominio"
              type="text"
              className="flex-1 rounded border border-yellow-400 bg-[#181818] p-3 font-mono text-gray-100"
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
              className="rounded bg-yellow-400 px-4 py-2 font-bold text-[#232323] transition hover:bg-yellow-500 disabled:opacity-60"
              onClick={handleSalvar}
              disabled={!dominio || dominio.length < 6}
            >
              Salvar
            </button>
          </div>
          <span className="text-xs text-gray-400">
            Apenas domínios próprios (ex: meuaracha.com.br). Não aceitamos
            domínios gratuitos tipo .tk, .ml, .ga.
          </span>

          {status === "aguardando" && (
            <div className="mt-3 flex animate-pulse items-center gap-2 font-bold text-yellow-300">
              <FaRegQuestionCircle /> Aguardando validação DNS...
            </div>
          )}
          {status === "aprovado" && (
            <div className="mt-3 flex items-center gap-2 font-bold text-green-400">
              <FaCheckCircle /> Domínio validado e ativo!
            </div>
          )}
          {status === "erro" && (
            <div className="mt-3 flex items-center gap-2 font-bold text-red-400">
              <FaExclamationCircle /> {mensagem}
            </div>
          )}
          {status === "vazio" && mensagem && (
            <div className="mt-3 flex items-center gap-2 font-bold text-yellow-300">
              <FaRegQuestionCircle /> {mensagem}
            </div>
          )}
        </div>

        <div className="mb-8 rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow-lg">
          <div className="mb-1 font-bold text-yellow-300">
            Instruções para configuração do DNS:
          </div>
          <ol className="mb-2 ml-6 list-decimal text-sm text-gray-200">
            <li>
              <b>Registre ou acesse</b> o seu domínio próprio em seu provedor de
              domínios.
            </li>
            <li>
              <b>Crie um registro CNAME</b> apontando para:{" "}
              <span className="select-all rounded bg-[#181818] px-2 py-1 font-mono text-yellow-200">
                {CNAME_TARGET}
              </span>
              <button
                className="ml-2 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-[#232323] hover:bg-yellow-500"
                onClick={handleCopy}
                type="button"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </li>
            <li>
              Aguarde até <b>24 horas</b> para propagação (normalmente em poucos
              minutos).
            </li>
            <li>
              Volte aqui e clique em <b>Salvar</b>. O sistema validará o DNS e
              ativará o domínio.
            </li>
          </ol>
          <div className="mt-2 text-xs text-gray-400">
            <b>Dica:</b> O endereço do painel/admin também será alterado para
            seu domínio.
          </div>
        </div>

        <div className="rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow-lg">
          <div className="mb-2 font-bold text-yellow-300">
            Dúvidas Frequentes
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <b>Quanto tempo leva para ativar?</b> Normalmente de 15min a 2h
              após o DNS ser propagado.
            </li>
            <li>
              <b>Posso usar domínio gratuito?</b> Não. Apenas domínios próprios
              (.com.br, .com, etc).
            </li>
            <li>
              <b>Se der erro, o que faço?</b> Verifique se o CNAME está correto
              e aguarde a propagação. Persistindo, entre em contato pelo suporte
              abaixo.
            </li>
            <li>
              <b>Meu site vai ficar offline?</b> Não! O domínio Fut7Pro padrão
              segue funcionando normalmente até o domínio próprio ser validado.
            </li>
            <li className="flex items-center gap-3">
              <b>Suporte:</b>
              <a
                href="mailto:suporte@fut7pro.com.br"
                className="text-yellow-400 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                suporte@fut7pro.com.br
              </a>
              <span>|</span>
              <Link
                href="/admin/comunicacao/suporte"
                className="flex items-center gap-1 text-yellow-400 underline hover:text-yellow-300"
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

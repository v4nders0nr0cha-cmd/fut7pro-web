"use client";

import Head from "next/head";
import Link from "next/link";
import { FaGlobe, FaLock, FaWrench, FaCheckCircle, FaHeadset } from "react-icons/fa";

export default function DominioProprioPage() {
  return (
    <>
      <Head>
        <title>Domínio Próprio | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Página em modo mostruário. O módulo de domínio próprio será liberado com o plano Enterprise."
        />
        <meta
          name="keywords"
          content="Fut7Pro, domínio próprio, plano enterprise, white label, configurações"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaGlobe /> Domínio Próprio
        </h1>

        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
          <b className="text-yellow-300">Página exclusiva para o plano Enterprise.</b>
          <br />
          Esta tela está em modo mostruário e ainda não está disponível em produção.
          <span className="text-gray-300 block mt-2">
            Quando liberado, administradores do plano Enterprise poderão configurar domínio próprio
            para site público e painel do racha.
          </span>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700 mb-6">
          <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
            <FaLock /> Status atual
          </div>
          <p className="text-sm text-gray-200">
            O acesso por domínio próprio ainda não está habilitado para uso real.
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Enquanto isso, o acesso oficial continua em <b>app.fut7pro.com.br</b> com isolamento
            multi-tenant por racha.
          </p>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700 mb-6">
          <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
            <FaWrench /> O que estará disponível no Enterprise
          </div>
          <ul className="text-sm text-gray-200 space-y-2">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Cadastro e validação de domínio próprio.
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Configuração de DNS assistida no painel.
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Publicação do site e painel no domínio
              personalizado.
            </li>
          </ul>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2">Dúvidas Frequentes</div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Esta página já funciona em produção?</b> Ainda não. No momento, está disponível
              apenas como mostruário.
            </li>
            <li>
              <b>Quem terá acesso quando for liberado?</b> Rachas com assinatura do plano
              Enterprise.
            </li>
            <li>
              <b>Como solicitar prioridade nessa liberação?</b> Entre em contato com o suporte e
              informe o slug do seu racha.
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
            <li>
              <b>Planos:</b>{" "}
              <Link
                href="/admin/financeiro/planos-limites"
                className="underline text-yellow-400 hover:text-yellow-300"
              >
                Ver planos e limites
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

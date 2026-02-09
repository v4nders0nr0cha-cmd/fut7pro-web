"use client";

import Head from "next/head";
import Link from "next/link";
import { FaPuzzlePiece, FaGoogle, FaWhatsapp, FaLink, FaLock, FaWrench } from "react-icons/fa";

export default function IntegracoesPage() {
  return (
    <>
      <Head>
        <title>Integrações & Automação | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Página em modo mostruário. O módulo de integrações será liberado com o plano Enterprise."
        />
        <meta
          name="keywords"
          content="Fut7Pro, integrações, API, webhooks, plano enterprise, automação"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaPuzzlePiece /> Integrações & Automação
        </h1>

        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
          <b className="text-yellow-300">Página exclusiva para o plano Enterprise.</b>
          <br />
          Esta tela está em modo mostruário e ainda não está disponível em produção.
          <span className="text-gray-300 block mt-2">
            As configurações de integrações externas serão liberadas futuramente para assinaturas
            Enterprise.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <CardIntegracao
            icone={<FaGoogle className="text-yellow-400 text-xl" />}
            nome="Google Analytics"
            descricao="Conexão do tenant com propriedade de analytics para eventos e conversões."
          />
          <CardIntegracao
            icone={<FaWhatsapp className="text-green-400 text-xl" />}
            nome="WhatsApp API"
            descricao="Disparo de alertas e notificações automáticas com templates homologados."
          />
          <CardIntegracao
            icone={<FaLink className="text-yellow-400 text-xl" />}
            nome="Webhooks/API"
            descricao="Eventos em tempo real para integrar jogadores, partidas e financeiro com sistemas externos."
          />
          <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-yellow-300">
              <FaWrench />
              Status do módulo
            </div>
            <p className="text-sm text-gray-200">
              Implementação em andamento. Nenhuma integração pode ser ativada por aqui neste
              momento.
            </p>
            <div className="text-sm text-gray-300">
              Para prioridade de liberação, fale com o suporte pelo e-mail{" "}
              <a
                href="mailto:suporte@fut7pro.com.br?subject=Quero%20ativar%20o%20plano%20Enterprise"
                className="text-yellow-400 underline"
              >
                suporte@fut7pro.com.br
              </a>
              .
            </div>
          </div>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mt-8">
          <div className="font-bold text-yellow-300 mb-2">Dúvidas Frequentes</div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Esta página já está funcionando em produção?</b> Ainda não. Ela está disponível
              somente como mostruário.
            </li>
            <li>
              <b>Quem terá acesso quando for liberado?</b> Rachas com plano Enterprise ativo.
            </li>
            <li>
              <b>Como solicitar a liberação?</b> Abra um chamado de suporte com o slug do racha.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
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

function CardIntegracao({
  icone,
  nome,
  descricao,
}: {
  icone: React.ReactNode;
  nome: string;
  descricao: string;
}) {
  return (
    <div className="bg-[#232323] rounded-lg p-5 shadow border-l-4 border-yellow-700 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icone}
        <span className="font-bold text-yellow-300 text-lg">{nome}</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-yellow-800 text-yellow-200">
          Mostruário
        </span>
      </div>
      <div className="text-gray-200 text-sm">{descricao}</div>
      <div className="text-xs text-yellow-400 mt-2">
        <FaLock className="inline mr-1" /> Página exclusiva para o plano Enterprise.
      </div>
    </div>
  );
}

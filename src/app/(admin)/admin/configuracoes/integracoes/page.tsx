"use client";

import Head from "next/head";
import Link from "next/link";
import { FaGoogle, FaPuzzlePiece, FaWhatsapp, FaLink, FaHeadset } from "react-icons/fa";
import { useMe } from "@/hooks/useMe";
import useSubscription from "@/hooks/useSubscription";

type IntegrationCardProps = {
  name: string;
  icon: JSX.Element;
  description: string;
};

function IntegrationCard({ name, icon, description }: IntegrationCardProps) {
  return (
    <div className="rounded-lg border border-yellow-700 bg-[#232323] p-4 shadow">
      <div className="mb-2 flex items-center gap-2 text-yellow-300 font-semibold">
        {icon}
        {name}
      </div>
      <p className="text-sm text-zinc-200">{description}</p>
    </div>
  );
}

export default function IntegracoesPage() {
  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId;
  const { subscription, loading } = useSubscription(tenantId);
  const planKey = (subscription?.planKey || "").toLowerCase();
  const isEnterprise = planKey.includes("enterprise");

  return (
    <>
      <Head>
        <title>Integrações e Automação | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Status das integrações do seu racha, com validação de plano e abertura de chamado para ativação."
        />
        <meta
          name="keywords"
          content="Fut7Pro, integrações, API, webhooks, plano enterprise, automação"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <FaPuzzlePiece /> Integrações e Automação
        </h1>

        <div className="rounded-lg bg-[#232323] border-l-4 border-yellow-400 p-4 text-sm text-zinc-200">
          {loading ? (
            <p>Carregando dados do plano...</p>
          ) : isEnterprise ? (
            <p>
              Plano ativo: <b>{subscription?.planKey || "enterprise"}</b>. O time Fut7Pro pode
              habilitar integrações avançadas para este racha.
            </p>
          ) : (
            <p>
              Plano ativo: <b>{subscription?.planKey || "não identificado"}</b>. As integrações
              avançadas são liberadas para planos Enterprise.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IntegrationCard
            icon={<FaGoogle className="text-yellow-400" />}
            name="Google Analytics"
            description="Eventos e conversões do site público do racha."
          />
          <IntegrationCard
            icon={<FaWhatsapp className="text-green-400" />}
            name="WhatsApp API"
            description="Notificações automáticas para grupos e contatos autorizados."
          />
          <IntegrationCard
            icon={<FaLink className="text-yellow-400" />}
            name="Webhooks"
            description="Entrega de eventos para sistemas externos conectados ao seu fluxo."
          />
        </div>

        <div className="rounded-lg border border-yellow-700 bg-[#232323] p-5">
          <div className="font-bold text-yellow-300 mb-2">Ativar integrações</div>
          <p className="text-sm text-zinc-200 mb-4">
            Abra um chamado com o objetivo da integração e o slug do racha. A equipe Fut7Pro valida
            o escopo e retorna o plano de ativação.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/admin/comunicacao/suporte"
              className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 transition"
            >
              <FaHeadset />
              Abrir chamado
            </Link>
            <Link href="/admin/financeiro/planos-limites" className="underline text-yellow-400">
              Ver planos e limites
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import Head from "next/head";
import Link from "next/link";
import { FaCheckCircle, FaGlobe, FaHeadset } from "react-icons/fa";
import { useMe } from "@/hooks/useMe";
import useSubscription from "@/hooks/useSubscription";

export default function DominioProprioPage() {
  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId;
  const { subscription, loading } = useSubscription(tenantId);
  const planKey = (subscription?.planKey || "").toLowerCase();
  const isEnterprise = planKey.includes("enterprise");

  return (
    <>
      <Head>
        <title>Domínio Próprio | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Status do recurso de domínio próprio para o seu racha, com validação de plano e canal oficial para ativação."
        />
        <meta
          name="keywords"
          content="Fut7Pro, domínio próprio, plano enterprise, white label, configurações"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <FaGlobe /> Domínio Próprio
        </h1>

        <div className="rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow p-4 text-sm text-zinc-200">
          {loading ? (
            <p>Carregando dados do plano...</p>
          ) : isEnterprise ? (
            <p>
              Plano ativo: <b>{subscription?.planKey || "enterprise"}</b>. Seu racha pode solicitar
              ativação de domínio próprio pelo suporte.
            </p>
          ) : (
            <p>
              Plano ativo: <b>{subscription?.planKey || "não identificado"}</b>. O recurso de
              domínio próprio é exclusivo dos planos Enterprise.
            </p>
          )}
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700">
          <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
            Escopo do recurso
          </div>
          <ul className="text-sm text-gray-200 space-y-2">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Cadastro e validação do domínio do racha.
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Configuração de DNS com acompanhamento da
              equipe Fut7Pro.
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Publicação do site público no domínio
              personalizado.
            </li>
          </ul>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow-lg border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2">Próximo passo</div>
          <p className="text-sm text-gray-300 mb-4">
            Para iniciar a configuração, abra um chamado no suporte com o domínio desejado e o slug
            do racha.
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

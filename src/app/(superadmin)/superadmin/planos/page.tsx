"use client";

import { useMemo, useState, useCallback } from "react";
import Head from "next/head";
import { useBranding } from "@/hooks/useBranding";

type Plano = {
  nome: string;
  preco: string;
  destaque?: boolean;
  badge?: string;
  descricao: string;
  recursos: string[];
  limites: string[];
  botao: string;
};

const BRAND_TOKEN = "__BRAND__";
const ARMAZENAMENTO =
  "Armazenamento ilimitado: todos os dados, rankings, atletas e partidas ficam salvos para sempre, sem custo extra e sem limite de memoria. Nunca perca seu historico e nunca precisar migrar de plano por falta de memoria!";
const PERSONALIZACAO_VISUAL =
  "Personalizacao visual: escolha entre temas de cores e deixe seu racha com a identidade que mais combina com o grupo.";

const PLANOS_BASE: Record<"mensal" | "anual", Plano[]> = {
  mensal: [
    {
      nome: "Mensal Essencial",
      preco: "R$ 150/mes",
      destaque: true,
      badge: "Mais escolhido",
      descricao:
        "Ideal para grupos que querem controle total, profissionalizacao e monetizacao do racha com valor acessivel.",
      recursos: [
        `Acesso completo ao ${BRAND_TOKEN} (todas as funcionalidades)`,
        PERSONALIZACAO_VISUAL,
        ARMAZENAMENTO,
        "Teste gratis por 30 dias - experimente sem compromisso",
        "Cadastro ilimitado de atletas e jogos",
        "Gestao financeira completa do racha (opcionalmente visivel no site para transparencia ou privado para admins)",
        "Pagina dedicada e carrossel no rodape exclusivo para patrocinadores - gere receita e valorize seus apoiadores",
        "Sorteio inteligente de times, ranking automatico, feed de conquistas, estatisticas, tira-teima e mais",
        `Manual de Monetizacao: \"Aprenda como fechar patrocinio, deixar o patrocinador pagar pelo ${BRAND_TOKEN} e ainda colocar dinheiro no caixa do seu racha.\"`,
        "Ate 4 administradores (presidente, vice-presidente, diretor de futebol e diretor financeiro)",
        "Suporte basico por e-mail",
        "Painel administrativo completo",
        "Feed de notificacoes e conquistas",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Mensal Essencial",
    },
    {
      nome: "Mensal + Marketing",
      preco: "R$ 220/mes",
      badge: "Plano com Marketing",
      descricao:
        "Para rachas que querem crescer, atrair patrocinadores e se destacar nas redes sociais.",
      recursos: [
        "Tudo do Mensal Essencial",
        "Designer dedicado para criacao de kit patrocinador personalizado",
        "Especialista para estruturar e turbinar o Instagram do racha",
        "Seu site pronto entregue com layout, logo, textos, imagens e videos",
        "Suporte prioritario via WhatsApp",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Mensal + Marketing",
    },
    {
      nome: "Enterprise White Label",
      preco: "R$ 990/mes",
      badge: "Exclusivo",
      descricao: `Plano para clubes, ligas e grandes organizacoes que exigem exclusividade total. Nenhuma referencia ao ${BRAND_TOKEN}, sistema 100% com sua marca, dominio proprio, PDFs e e-mails personalizados, suporte premium e limites ampliados.`,
      recursos: [
        `Nenhuma referencia ao ${BRAND_TOKEN} (logo, frase, links, PDF, e-mails, favicon, etc)`,
        ARMAZENAMENTO,
        "Dominio proprio e e-mails personalizados",
        "Design, cores, frases e icones com personalizacao exclusiva",
        "PDFs e relatorios com a marca do cliente",
        "Powered by exclusivo para sua marca",
        "Suporte premium e SLA diferenciado",
        "Consultoria e onboarding exclusivo",
        "Limites ampliados (administradores, uploads)",
        "Contrato, nota fiscal e recursos especiais sob demanda",
        "Acesso antecipado a novas funcionalidades",
      ],
      limites: ["Racha, liga ou clube ilimitado"],
      botao: "Solicitar Enterprise",
    },
  ],
  anual: [
    {
      nome: "Anual Essencial",
      preco: "R$ 1.500/ano",
      destaque: true,
      badge: "Mais vantajoso",
      descricao:
        "Todos os recursos do plano Mensal Essencial, com economia maxima e acesso anual sem preocupacao.",
      recursos: [
        `Acesso completo ao ${BRAND_TOKEN} (todas as funcionalidades)`,
        PERSONALIZACAO_VISUAL,
        ARMAZENAMENTO,
        "1 mes de teste gratis na primeira assinatura + 2 meses gratis todo ano (economize R$ 450,00 no primeiro ano e R$ 300,00 nos anos seguintes)",
        "Cadastro ilimitado de atletas e jogos",
        "Gestao financeira completa do racha (controle de visibilidade publico ou privado)",
        "Pagina dedicada e carrossel no rodape exclusivo para patrocinadores - gere receita e valorize seus apoiadores",
        `Manual de Monetizacao: \"Aprenda como fechar patrocinio, deixar o patrocinador pagar pelo ${BRAND_TOKEN} e ainda colocar dinheiro no caixa do seu racha.\"`,
        "Painel administrativo, ranking, sorteios, feed de conquistas e muito mais",
        "Ate 4 administradores (presidente, vice-presidente, diretor de futebol e diretor financeiro)",
        "Suporte basico por e-mail",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Anual Essencial",
    },
    {
      nome: "Anual + Marketing",
      preco: "R$ 2.200/ano",
      badge: "Plano mais completo",
      descricao:
        "Plano premium para grupos que querem profissionalizar, atrair patrocinadores e crescer rapido.",
      recursos: [
        "Tudo do Anual Essencial",
        "Designer dedicado para criacao de kit patrocinador personalizado",
        "Especialista em Instagram",
        "Site pronto entregue com layout, logo, textos, imagens e videos",
        "Bonus: 1 hora de consultoria com especialista em monetizacao de rachas",
        "Suporte prioritario via WhatsApp",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Anual + Marketing",
    },
    {
      nome: "Enterprise White Label",
      preco: "R$ 9.900/ano",
      badge: "Exclusivo",
      descricao: `Plano para clubes, ligas e grandes organizacoes que exigem exclusividade total. Nenhuma referencia ao ${BRAND_TOKEN}, sistema 100% com sua marca, dominio proprio, PDFs e e-mails personalizados, suporte premium e limites ampliados.`,
      recursos: [
        `Nenhuma referencia ao ${BRAND_TOKEN} (logo, frase, links, PDF, e-mails, favicon, etc)`,
        ARMAZENAMENTO,
        "Dominio proprio e e-mails personalizados",
        "Design, cores, frases e icones com personalizacao exclusiva",
        "PDFs e relatorios com a marca do cliente",
        "Powered by exclusivo para sua marca",
        "Sem teste gratis. 2 meses gratis todo ano no plano anual (R$ 1.980,00/ano de economia). Onboarding e setup personalizado inclusos.",
        "Suporte premium e SLA diferenciado",
        "Consultoria e onboarding exclusivo",
        "Limites ampliados (administradores, uploads)",
        "Contrato, nota fiscal e recursos especiais sob demanda",
        "Acesso antecipado a novas funcionalidades",
      ],
      limites: ["Racha, liga ou clube ilimitado"],
      botao: "Solicitar Enterprise",
    },
  ],
};

export default function PlanosLimitesPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const applyBrand = useCallback(
    (text: string) => text.replace(/(__BRAND__|fut7pro)/gi, () => brand),
    [brand]
  );
  const planos = useMemo(() => {
    const mapPlan = (plano: Plano) => ({
      ...plano,
      nome: applyBrand(plano.nome),
      preco: applyBrand(plano.preco),
      descricao: applyBrand(plano.descricao),
      recursos: plano.recursos.map(applyBrand),
      limites: plano.limites.map(applyBrand),
      botao: applyBrand(plano.botao),
      badge: plano.badge ? applyBrand(plano.badge) : plano.badge,
    });
    return {
      mensal: PLANOS_BASE.mensal.map(mapPlan),
      anual: PLANOS_BASE.anual.map(mapPlan),
    };
  }, [applyBrand]);
  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");

  return (
    <>
      <Head>
        <title>{applyBrand("Planos & Precos | __BRAND__")}</title>
        <meta
          name="description"
          content={applyBrand(
            "Compare os planos __BRAND__ e escolha o melhor para seu racha. Controle, estatisticas, gestao financeira, patrocinadores, marketing, painel completo e suporte especializado."
          )}
        />
      </Head>
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">Planos & Precos</h1>
        <div className="mb-6 flex justify-center">
          <div className="bg-green-600/90 text-white font-semibold rounded-xl px-6 py-3 shadow-lg text-lg text-center w-full md:w-auto">
            Teste gratis por 30 dias:{" "}
            <span className="font-bold">acesse todas as funcoes sem compromisso</span> e descubra{" "}
            {applyBrand(
              "porque o __BRAND__ e o sistema mais completo para rachas e futebol entre amigos!"
            )}
          </div>
        </div>
        <div className="mb-6 flex justify-center">
          <p className="max-w-md mx-auto text-sm text-neutral-300 text-center leading-relaxed">
            {applyBrand("Gerencie os planos e limites do __BRAND__.")}
          </p>
        </div>
        <div className="flex justify-center mb-10">
          <button
            className={`px-6 py-2 rounded-l-xl font-bold transition border ${planoAtivo === "mensal" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
            onClick={() => setPlanoAtivo("mensal")}
          >
            Pagamento Mensal
          </button>
          <button
            className={`px-6 py-2 rounded-r-xl font-bold transition border-t border-b border-r ${planoAtivo === "anual" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
            onClick={() => setPlanoAtivo("anual")}
          >
            Pagamento Anual <span className="ml-1 text-xs">(2 meses gratis)</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {planos[planoAtivo].map((plano) => (
            <div
              key={plano.nome}
              className={`relative rounded-2xl p-8 flex flex-col shadow-xl border-2 transition ${plano.destaque ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-800 hover:border-yellow-300"}`}
            >
              {plano.badge && (
                <span
                  className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${plano.destaque ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"}`}
                >
                  {plano.badge}
                </span>
              )}
              <div className="text-2xl font-extrabold mb-1">{plano.nome}</div>
              <div className="text-xl font-bold mb-2">{plano.preco}</div>
              <div
                className={`mb-4 text-base ${plano.destaque ? "text-black/80" : "text-neutral-300"}`}
              >
                {plano.descricao}
              </div>
              <ul className="mb-4 space-y-1">
                {plano.recursos.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-base">
                    <span
                      className={`font-bold ${plano.destaque ? "text-yellow-900" : "text-yellow-400"}`}
                    >
                      V
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mb-4 flex flex-wrap gap-2">
                {plano.limites.map((limite, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${plano.destaque ? "bg-yellow-300 text-black" : "bg-neutral-700 text-yellow-200"}`}
                  >
                    {limite}
                  </span>
                ))}
                {plano.nome === "Enterprise White Label" ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-400 text-black">
                    Admins ilimitados
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-400 text-black">
                    4 administradores
                  </span>
                )}
              </div>
              <button
                className={`mt-auto px-6 py-2 rounded-xl font-bold ${plano.destaque ? "bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black border-2 border-black" : "bg-yellow-400 text-black hover:bg-yellow-500"} transition`}
              >
                {plano.botao}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

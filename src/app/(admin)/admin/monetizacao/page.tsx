// src/app/admin/monetizacao/page.tsx
"use client";

import Head from "next/head";
import {
  FaLightbulb,
  FaBullhorn,
  FaBeer,
  FaFutbol,
  FaDownload,
  FaMoneyBillWave,
  FaLock,
  FaTrophy,
  FaTshirt,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import Link from "next/link";

// ATUALIZE o tipo Plano incluindo o Enterprise White Label (mensal e anual)
type Plano =
  | "gratuito"
  | "mensal-essencial"
  | "anual-essencial"
  | "mensal-marketing"
  | "anual-marketing"
  | "mensal-enterprise"
  | "anual-enterprise";

// Troque aqui para simular o cenário desejado
let plano = "gratuito" as Plano; // Troque aqui para simular o cenário desejado
const premiumLiberado = plano !== "gratuito";
const observacaoExtras =
  "Os extras sugeridos podem exigir investimento adicional, conforme a ação combinada entre o racha e o patrocinador.";

const planosPatrocinioOficiais = [
  {
    nome: "Plano Básico",
    mensal: "R$ 15/mês",
    anual: "R$ 150/ano",
    beneficios: [
      "Logo no rodapé do site do racha",
      "Logo na página exclusiva de patrocinadores",
      "Link clicável do logo para rede social/WhatsApp do patrocinador",
      "Divulgação garantida nas redes do racha",
    ],
    extras: [
      "Menção semanal nos stories",
      "Cupom de desconto exclusivo para atletas",
    ],
  },
  {
    nome: "Plano Plus",
    mensal: "R$ 30/mês",
    anual: "R$ 300/ano",
    beneficios: [
      "Tudo do plano Básico, mais:",
      "Logo do patrocinador nos Destaques do Instagram do racha",
      "Marca no pré-jogo: logotipo no banner oficial das fotos dos times",
      "Logo nas fotos do Melhor Time do Dia (stories e feed)",
      "Logo nas fotos de Jogadores Destaques (artilheiro e mais)",
    ],
    extras: [
      "Sorteios quadrimestrais de brindes do patrocinador",
      "Cupom do patrocinador para atletas Campeões Anuais",
    ],
  },
  {
    nome: "Plano Naming Rights",
    mensal: "R$ 60/mês",
    anual: "R$ 600/ano",
    beneficios: [
      "Tudo dos planos anteriores, mais:",
      "Naming Rights de 1 time do racha",
      "Sua marca dá nome oficial a uma equipe (ex.: Time 01 -> Time [Nome da Marca])",
      "Uniforme/Colete com logo exclusiva do patrocinador na parte da frente",
      "Logo nas costas de todos os uniformes/coletes do racha",
      "Destaque de posição na página de patrocinadores (entre os primeiros)",
      "Time com uniforme personalizado nas cores do patrocinador",
    ],
    extras: [
      "Naming de torneio/quadrimestre (ex.: Copa [Sua Marca])",
      "Eventos do racha com brindes da marca patrocinadora",
    ],
  },
];

export default function MonetizacaoPage() {
  return (
    <>
      <Head>
        <title>Monetização | Como Lucrar Mais no Seu Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Descubra estratégias para lucrar mais, conquistar patrocinadores e usar um kit comercial completo para apresentar planos de patrocínio do seu racha."
        />
        <meta
          name="keywords"
          content="monetizar racha, patrocínio futebol amador, dicas de monetização, banners fut7pro, plataforma fut7, ganhar dinheiro futebol"
        />
      </Head>
      <div className="w-full max-w-5xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4 text-center">
          💰 Monetização – Lucre Mais com Seu Racha
        </h1>
        <p className="text-lg text-gray-300 text-center mb-10">
          Dicas, estratégias e materiais para <b>profissionalizar</b> e <b>lucrar mais</b> com o seu
          racha usando o Fut7Pro. Os valores dos planos são sugestivos e podem ser personalizados
          conforme a realidade do seu mercado local.
        </p>

        {/* Aviso para planos gratuitos */}
        {!premiumLiberado && (
          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 border-l-4 border-yellow-400 text-yellow-300 px-4 py-4 rounded-xl mb-8 flex items-center gap-4 shadow">
            <FaLock className="text-2xl" />
            <div>
              <b>Arquivos editáveis premium</b>
              <div className="text-yellow-200 mt-1 text-sm">
                Os PNGs do kit comercial já estão disponíveis nesta página. Os PSDs editáveis e
                personalizados ficam liberados nos planos com recursos avançados de marketing.
                <br />
                <Link href="/admin/config" className="text-yellow-300 underline font-bold">
                  Liberar agora
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dicas rápidas e argumentos de valor */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaLightbulb className="text-yellow-400" /> Dicas Rápidas & Valorize seu Racha
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaMoneyBillWave className="text-green-400 mt-1" />
              <span>
                Venda espaços no site, rodapé ou página de patrocinadores. Ofereça pacotes mensais
                (ex.: <b>R$15, R$30 e R$60</b>) ou anuais (<b>R$150, R$300 e R$600</b>).
              </span>
            </li>
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaBullhorn className="text-blue-400 mt-1" />
              <span>
                Monte uma apresentação simples e mostre relatórios de engajamento do racha para
                valorizar o patrocínio.
              </span>
            </li>
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaTrophy className="text-yellow-300 mt-1" />
              <span>
                Sistema profissional, rankings e premiações valorizam a mensalidade.{" "}
                <b>Jogadores pagam mais</b> por reconhecimento e status.
              </span>
            </li>
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaUsers className="text-cyan-400 mt-1" />
              <span>
                Limite as vagas de mensalistas. Mais disputa = mais valor. Concorrência saudável
                aumenta arrecadação e engajamento.
              </span>
            </li>
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaFutbol className="text-green-300 mt-1" />
              <span>
                Promova campeonatos especiais e cobre inscrição. Use parte para premiação e parte
                para o caixa do racha.
              </span>
            </li>
            <li className="bg-[#21272c] rounded-lg p-4 flex items-start gap-3 shadow">
              <FaTshirt className="text-yellow-200 mt-1" />
              <span>
                Venda camisas, chaveiros, squeezes e itens do racha. Produza em lote e revenda com
                margem de lucro.
              </span>
            </li>
          </ul>
        </section>

        {/* Estratégias para patrocinadores */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaBullhorn className="text-yellow-400" /> Monetize com Patrocinadores
          </h2>
          <ul className="space-y-4 text-gray-200">
            <li>
              Venda slots exclusivos no site, temos página exclusiva e um carrossel de
              patrocinadores implementado no rodapé como uma seção deslizante na página, mostrando
              vários logotipos de forma dinâmica.
            </li>
            <li>
              Acesse seus relatórios de engajamento no painel administrativo, e use-os para atrair
              patrocinadores, mantenha seu site ativo e movimentado para valorizar seus números.
            </li>
            <li>
              Negocie permutas: descontos no campo(o site possui mini mapa para endereço do campo,
              troque isso e mais benefícios por uma mensalidade grátis), benefícios para atletas,
              publicidade cruzada.
            </li>
            <li>
              Patrocínios de bets, cervejarias, lojas esportivas e bares são os mais buscados e
              rentáveis para o racha. Advogados, corretores, dentistas e empresários que fazem parte
              do seu racha são os mais fáceis de querer uma parceria. Comece pelas grandes empresas
              e, se não houver retorno, parta para negócios locais e menores.
            </li>
            <li>
              Monte pacotes premium para grandes patrocinadores e cobre um valor a mais: destaque no
              carrossel(rodapé do site) , posts no Instagram(stores em dias de jogos, feed e
              destaques), vagas fixas no topo da página de patrocinadores do site, logo no
              colete/uniforme do racha e outros benefícios. Como referência de proposta comercial,
              use Básico (R$ 15/mês), Plus (R$ 30/mês) e Naming Rights (R$ 60/mês), ajustando os
              valores conforme o porte do seu racha.
            </li>
          </ul>
        </section>

        {/* Referência oficial de planos de patrocínio */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaTrophy className="text-yellow-400" /> Referência Oficial dos Planos de Patrocínio
          </h2>
          <p className="text-gray-300 mb-4">
            Use esta base comercial para apresentar propostas com linguagem profissional e ajuste
            os valores conforme porte do racha, cidade, alcance real das redes sociais e capacidade
            de entrega.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {planosPatrocinioOficiais.map((planoOficial) => (
              <article
                key={planoOficial.nome}
                className="rounded-xl border border-zinc-700 bg-[#23272F] p-5 text-gray-100 shadow"
              >
                <h3 className="text-lg font-bold text-yellow-300">{planoOficial.nome}</h3>
                <p className="mt-2 text-xl font-bold text-white">{planoOficial.mensal}</p>
                <p className="text-sm text-zinc-300">{planoOficial.anual}</p>

                <div className="mt-4 space-y-2 text-sm text-zinc-200">
                  {planoOficial.beneficios.map((beneficio) => (
                    <p key={`${planoOficial.nome}-${beneficio}`}>• {beneficio}</p>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                  <p className="text-sm font-semibold text-yellow-300">Extras sugeridos</p>
                  {planoOficial.extras.map((extra) => (
                    <p key={`${planoOficial.nome}-${extra}`} className="mt-1 text-sm text-zinc-200">
                      • {extra}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-400">{observacaoExtras}</p>
        </section>

        {/* Valorize o racha para cobrar mais */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaLightbulb className="text-yellow-400" /> Valorize Seu Racha
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              O sistema Fut7Pro profissionaliza e permite você cobrar mensalidade ou uma diária
              maior sem muitas reclamações.
            </li>
            <li>
              Realize eventos quadrimestrais ou anuais com inscrição extra revertida em premiação
              real ou virtual.
            </li>
            <li>
              Arbitragem profissional: negocie valores e cobre um extra para trazer árbitro fixo,
              gerando menos trabalho e dor de cabeça para os administradores.
            </li>
            <li>Mais organização = mais vontade de pagar e menos faltas/inadimplência.</li>
            <li>
              Com um ranking atrativo e um site moderno, você pode dobrar a arrecadação abrindo um
              novo dia/horário. Afinal, quem vai querer faltar algum dia e deixar outro atleta subir
              no ranking?
            </li>
          </ul>
        </section>

        {/* Crie demanda e concorrência */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaUserCheck className="text-yellow-400" /> Aumente a Demanda e Crie Concorrência por
            Vagas
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>Limite as vagas e premie assiduidade, valorizando quem participa todo mês.</li>
            <li>Ofereça vagas extras para diaristas por valor maior ou taxa de reserva.</li>
            <li>Engaje atletas assíduos com destaque nos perfis, feeds e ranking.</li>
          </ul>
        </section>

        {/* Parcerias com campos */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaFutbol className="text-yellow-400" /> Parcerias e Permutas com Campos
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Troque divulgação (banner, rodapé, mapa do campo) por descontos ou isenção da taxa
              mensal do campo.
            </li>
            <li>
              Negocie benefícios para jogadores mensalistas: desconto em bar/lanchonete do campo,
              combos promocionais.
            </li>
          </ul>
        </section>

        {/* Marketing e Redes Sociais */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaBullhorn className="text-yellow-400" /> Use o Marketing para Arrecadar Mais
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Divulgue o site do racha, rankings e fotos em vez de só prints. Isso gera tráfego para
              seu painel.
            </li>
            <li>
              Atualize o Instagram com estatísticas, gols e melhores momentos para atrair novos
              patrocinadores.
            </li>
            <li>Use relatórios e prints do painel para fechar patrocínios maiores.</li>
          </ul>
        </section>

        {/* Outros métodos de arrecadação */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaLightbulb className="text-yellow-400" /> Outras Estratégias
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Organize rifas e sorteios de bola, kits e brindes dos patrocinadores (ex: barbearia,
              bar, lojas).
            </li>
            <li>
              Promova grandes torneios relâmpago pagos, cobrando inscrição individual ou por time.
            </li>
            <li>
              Venda de camisas exclusivas e itens personalizados do racha com margem de lucro.
            </li>
            <li>
              Implemente taxa de reserva prioritária e multas por falta para aumentar a receita e a
              frequência dos atletas.
            </li>
            <li>
              Planeje reajuste anual da mensalidade justificando melhorias e premiações extras.
            </li>
          </ul>
        </section>

        {/* Bolão Interno entre Atletas */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaTrophy className="text-yellow-400" /> Bolão Interno – Atenção Legal
          </h2>
          <div className="bg-[#23272F] border-l-4 border-yellow-600 p-5 rounded-xl text-gray-200 space-y-2">
            <b>Engaje jogadores com bolão entre atletas:</b> incentive apostas entre quem disputa a
            mesma posição, artilharia, campeão do quadrimestre ou do ano. Essas dinâmicas mantêm a
            assiduidade alta durante toda a temporada.
            <br />
            <span className="text-yellow-300 font-semibold">Atenção:</span> O valor arrecadado deve
            ser 100% revertido para o prêmio. O presidente não pode reter taxa ou comissão para não
            infringir a lei.
            <br />
            <span className="text-yellow-200">Recomendação Fut7Pro:</span> Dê preferência a
            premiações simbólicas (bolas, uniformes, troféus). Bolões com dinheiro real são
            responsabilidade exclusiva do presidente/organizador.
          </div>
        </section>

        {/* Bloco de Downloads */}
        <section id="downloads" className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaDownload className="text-yellow-400" /> Materiais para Download
          </h2>
          <p className="text-gray-300 mb-6">
            Kit comercial para captação de patrocinadores locais, com materiais prontos para
            personalizar a proposta dos planos Básico, Plus e Naming Rights.
          </p>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-700 bg-[#23272F] p-5">
              <h3 className="text-xl font-semibold text-yellow-300 mb-3">Planos de patrocínio</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 space-y-2">
                  <p className="text-sm font-semibold text-yellow-200">Plano Básico</p>
                  <a
                    href="/downloads/patrocinio/planos/basico/plano-patrocinio-basico.png"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arte pronta (PNG)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/basico/plano-patrocinio-basico-editavel.psd"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arquivo editável (PSD)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/basico/LEIA-ME-PLANO-BASICO.txt"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Guia comercial (TXT)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 space-y-2">
                  <p className="text-sm font-semibold text-yellow-200">Plano Plus</p>
                  <a
                    href="/downloads/patrocinio/planos/plus/plano-patrocinio-plus.png"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arte pronta (PNG)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/plus/plano-patrocinio-plus-editavel.psd"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arquivo editável (PSD)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/plus/LEIA-ME-PLANO-PLUS.txt"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Guia comercial (TXT)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 space-y-2">
                  <p className="text-sm font-semibold text-yellow-200">Plano Naming Rights</p>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/plano-patrocinio-naming-rights.png"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arte pronta (PNG)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/plano-patrocinio-naming-rights-editavel.psd"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Arquivo editável (PSD)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/LEIA-ME-PLANO-NAMING-RIGHTS.txt"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Guia comercial (TXT)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Materiais extras do plano Naming Rights
                    </p>
                  </div>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/caso-de-sucesso-naming-rights.png"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Caso de sucesso (PNG)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/aplicacao-visual-naming-rights-no-racha.png"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">Aplicação visual no racha (PNG)</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                  <a
                    href="/downloads/patrocinio/planos/naming-rights/uniforme-naming-rights-editavel.psd"
                    download
                    className="rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-100">PSD editável do uniforme/colete</span>
                    <span className="text-yellow-300 font-semibold">Baixar</span>
                  </a>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3">
                Índice geral dos planos:
                <a
                  href="/downloads/patrocinio/planos/LEIA-ME-PLANOS.txt"
                  download
                  className="ml-1 text-yellow-300 underline underline-offset-2 hover:text-yellow-200"
                >
                  LEIA-ME-PLANOS.txt
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-700 bg-[#23272F] p-5">
              <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                Materiais para redes sociais
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <a
                  href="/downloads/patrocinio/redes-sociais/destaque-instagram-patrocinador.png"
                  download
                  className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition flex items-center justify-between gap-4"
                >
                  <span className="text-gray-100">Destaque do Instagram (PNG)</span>
                  <span className="text-yellow-300 text-sm font-semibold">Download</span>
                </a>
                <a
                  href="/downloads/patrocinio/redes-sociais/post-instagram-patrocinador.png"
                  download
                  className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition flex items-center justify-between gap-4"
                >
                  <span className="text-gray-100">Post para Instagram (PNG)</span>
                  <span className="text-yellow-300 text-sm font-semibold">Download</span>
                </a>
                <a
                  href="/downloads/patrocinio/redes-sociais/post-facebook-patrocinador.png"
                  download
                  className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition flex items-center justify-between gap-4"
                >
                  <span className="text-gray-100">Post para Facebook (PNG)</span>
                  <span className="text-yellow-300 text-sm font-semibold">Download</span>
                </a>
                <div className="rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 flex items-center justify-between gap-4">
                  <span className="text-zinc-200">Arquivo editável de mídias sociais (PSD)</span>
                  <span className="text-amber-300 text-xs font-semibold uppercase">Em breve</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3">
                Material editável de redes sociais (PSD) em preparação para publicação:
                <code className="ml-1">midia-social-patrocinio-editavel.psd</code>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-700 bg-[#23272F] p-5">
              <h3 className="text-xl font-semibold text-yellow-300 mb-3">Kit completo</h3>
              <p className="text-sm text-zinc-300 mb-4">
                O kit completo reúne os materiais PNG atuais e o arquivo de instruções para
                substituição futura sem mexer no código.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <a
                  href="/downloads/patrocinio/kit-patrocinio-fut7pro.zip"
                  download
                  className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition flex items-center justify-between gap-4"
                >
                  <span className="text-gray-100">Baixar kit completo (ZIP)</span>
                  <span className="text-yellow-300 text-sm font-semibold">Download</span>
                </a>
                <a
                  href="/downloads/patrocinio/LEIA-ME-MATERIAIS.txt"
                  download
                  className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition flex items-center justify-between gap-4"
                >
                  <span className="text-gray-100">Baixar instruções (TXT)</span>
                  <span className="text-yellow-300 text-sm font-semibold">Download</span>
                </a>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-400">{observacaoExtras}</p>
        </section>

        {/* Benefícios de ser um racha profissionalizado */}
        <section className="mb-10">
          <h2 className="text-2xl text-yellow-300 font-semibold flex items-center gap-2 mb-3">
            <FaLightbulb className="text-yellow-400" /> Por que Monetizar?
          </h2>
          <ul className="list-disc ml-6 text-gray-200 space-y-2">
            <li>
              Ao monetizar seu racha e organizar melhor as finanças, você faz com que o Fut7Pro{" "}
              <b>“se pague sozinho”</b>: os apoiadores, patrocinadores e a própria arrecadação do
              grupo passam a custear o sistema, e tudo que entrar a mais vira <b>lucro direto</b>.
              Com uma gestão responsável, sobra dinheiro para investir, premiar os atletas e se
              divertir enquanto lucra.
            </li>
            <li>Dinheiro em caixa para investir em bolas, uniformes e eventos.</li>
            <li>Reduz inadimplência, aumenta engajamento e profissionaliza o grupo.</li>
            <li>Possibilidade de premiar atletas, reduzir custos de campo e melhorar estrutura.</li>
            <li>Mais diversão, motivação e prestígio para todos!</li>
          </ul>
        </section>

        {/* CTA para dúvidas e sugestões */}
        <section className="text-center mt-12">
          <div className="inline-block bg-[#21272c] px-6 py-5 rounded-xl border border-yellow-600">
            <span className="text-yellow-400 font-bold text-lg">
              Tem uma dica nova? Quer contribuir?
            </span>
            <br />
            <span className="text-gray-300">
              Fale com o suporte ou envie sua sugestão para aparecer aqui!
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

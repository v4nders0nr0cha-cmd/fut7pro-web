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
const planoMarketing =
  plano === "mensal-marketing" || plano === "anual-marketing";
const planoEnterprise =
  plano === "mensal-enterprise" || plano === "anual-enterprise";

export default function MonetizacaoPage() {
  return (
    <>
      <Head>
        <title>Monetização | Como Lucrar Mais no Seu Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Descubra estratégias para lucrar mais, conquistar patrocinadores, baixar banners e materiais editáveis, e transformar o seu racha em um sucesso financeiro no Fut7Pro."
        />
        <meta
          name="keywords"
          content="monetizar racha, patrocínio futebol amador, dicas de monetização, banners fut7pro, plataforma fut7, ganhar dinheiro futebol"
        />
      </Head>
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-4 text-center text-3xl font-bold text-yellow-400 md:text-4xl">
          💰 Monetização – Lucre Mais com Seu Racha
        </h1>
        <p className="mb-10 text-center text-lg text-gray-300">
          Dicas, estratégias e materiais para <b>profissionalizar</b> e{" "}
          <b>lucrar mais</b> com o seu racha usando o Fut7Pro.
        </p>

        {/* Aviso para planos gratuitos */}
        {!premiumLiberado && (
          <div className="mb-8 flex items-center gap-4 rounded-xl border-l-4 border-yellow-400 bg-gradient-to-br from-yellow-800 to-yellow-900 px-4 py-4 text-yellow-300 shadow">
            <FaLock className="text-2xl" />
            <div>
              <b>Conteúdo premium bloqueado!</b>
              <div className="mt-1 text-sm text-yellow-200">
                Assine qualquer plano para liberar dicas avançadas, arquivos
                editáveis, ferramentas de monetização e bônus exclusivos.
                <br />
                <Link
                  href="/admin/config"
                  className="font-bold text-yellow-300 underline"
                >
                  Liberar agora
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dicas rápidas e argumentos de valor */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaLightbulb className="text-yellow-400" /> Dicas Rápidas & Valorize
            seu Racha
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaMoneyBillWave className="mt-1 text-green-400" />
              <span>
                Venda espaços no site, rodapé ou página de patrocinadores.
                Ofereça pacotes mensais (ex: <b>R$30/mês</b>) ou anuais (
                <b>R$300</b> em até 2x).
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaBullhorn className="mt-1 text-blue-400" />
              <span>
                Monte uma apresentação simples e mostre relatórios de
                engajamento do racha para valorizar o patrocínio.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaTrophy className="mt-1 text-yellow-300" />
              <span>
                Sistema profissional, rankings e premiações valorizam a
                mensalidade. <b>Jogadores pagam mais</b> por reconhecimento e
                status.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaUsers className="mt-1 text-cyan-400" />
              <span>
                Limite as vagas de mensalistas. Mais disputa = mais valor.
                Concorrência saudável aumenta arrecadação e engajamento.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaFutbol className="mt-1 text-green-300" />
              <span>
                Promova campeonatos especiais e cobre inscrição. Use parte para
                premiação e parte para o caixa do racha.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-[#21272c] p-4 shadow">
              <FaTshirt className="mt-1 text-yellow-200" />
              <span>
                Venda camisas, chaveiros, squeezes e itens do racha. Produza em
                lote e revenda com margem de lucro.
              </span>
            </li>
          </ul>
        </section>

        {/* Estratégias para patrocinadores */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaBullhorn className="text-yellow-400" /> Monetize com
            Patrocinadores
          </h2>
          <ul className="space-y-4 text-gray-200">
            <li>
              Venda slots exclusivos no site, temos página exclusiva e um
              carrossel de patrocinadores implementado no rodapé como uma seção
              deslizante na página, mostrando vários logotipos de forma
              dinâmica.
            </li>
            <li>
              Acesse seus relatórios de engajamento no painel administrativo, e
              use-os para atrair patrocinadores, mantenha seu site ativo e
              movimentado para valorizar seus números.
            </li>
            <li>
              Negocie permutas: descontos no campo(o site possui mini mapa para
              endereço do campo, troque isso e mais benefícios por uma
              mensalidade grátis), benefícios para atletas, publicidade cruzada.
            </li>
            <li>
              Patrocínios de bets, cervejarias, lojas esportivas e bares são os
              mais buscados e rentáveis para o racha. Advogados, corretores,
              dentistas e empresários que fazem parte do seu racha são os mais
              fáceis de querer uma parceria. Comece pelas grandes empresas e, se
              não houver retorno, parta para negócios locais e menores.
            </li>
            <li>
              Monte pacotes premium para grandes patrocinadores e cobre um valor
              a mais: destaque no carrossel(rodapé do site) , posts no
              Instagram(stores em dias de jogos, feed e destaques), vagas fixas
              no topo da página de patrocinadores do site, logo no
              colete/uniforme do racha e outros benefícios.
            </li>
          </ul>
        </section>

        {/* Valorize o racha para cobrar mais */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaLightbulb className="text-yellow-400" /> Valorize Seu Racha
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              O sistema Fut7Pro profissionaliza e permite você cobrar
              mensalidade ou uma diária maior sem muitas reclamações.
            </li>
            <li>
              Realize eventos quadrimestrais ou anuais com inscrição extra
              revertida em premiação real ou virtual.
            </li>
            <li>
              Arbitragem profissional: negocie valores e cobre um extra para
              trazer árbitro fixo, gerando menos trabalho e dor de cabeça para
              os administradores.
            </li>
            <li>
              Mais organização = mais vontade de pagar e menos
              faltas/inadimplência.
            </li>
            <li>
              Com um ranking atrativo e um site moderno, você pode dobrar a
              arrecadação abrindo um novo dia/horário. Afinal, quem vai querer
              faltar algum dia e deixar outro atleta subir no ranking?
            </li>
          </ul>
        </section>

        {/* Crie demanda e concorrência */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaUserCheck className="text-yellow-400" /> Aumente a Demanda e Crie
            Concorrência por Vagas
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Limite as vagas e premie assiduidade, valorizando quem participa
              todo mês.
            </li>
            <li>
              Ofereça vagas extras para diaristas por valor maior ou taxa de
              reserva.
            </li>
            <li>
              Engaje atletas assíduos com destaque nos perfis, feeds e ranking.
            </li>
          </ul>
        </section>

        {/* Parcerias com campos */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaFutbol className="text-yellow-400" /> Parcerias e Permutas com
            Campos
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Troque divulgação (banner, rodapé, mapa do campo) por descontos ou
              isenção da taxa mensal do campo.
            </li>
            <li>
              Negocie benefícios para jogadores mensalistas: desconto em
              bar/lanchonete do campo, combos promocionais.
            </li>
          </ul>
        </section>

        {/* Marketing e Redes Sociais */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaBullhorn className="text-yellow-400" /> Use o Marketing para
            Arrecadar Mais
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Divulgue o site, rankings e fotos em vez de só prints no WhatsApp.
              Gere tráfego para seu painel.
            </li>
            <li>
              Atualize o Instagram com estatísticas, gols e melhores momentos
              para atrair novos patrocinadores.
            </li>
            <li>
              Use relatórios e prints do painel para fechar patrocínios maiores.
            </li>
          </ul>
        </section>

        {/* Outros métodos de arrecadação */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaLightbulb className="text-yellow-400" /> Outras Estratégias
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li>
              Organize rifas e sorteios de bola, kits e brindes dos
              patrocinadores (ex: barbearia, bar, lojas).
            </li>
            <li>
              Promova grandes torneios relâmpago pagos, cobrando inscrição
              individual ou por time.
            </li>
            <li>
              Venda de camisas exclusivas e itens personalizados do racha com
              margem de lucro.
            </li>
            <li>
              Implemente taxa de reserva prioritária e multas por falta para
              aumentar a receita e a frequência dos atletas.
            </li>
            <li>
              Planeje reajuste anual da mensalidade justificando melhorias e
              premiações extras.
            </li>
          </ul>
        </section>

        {/* Bolão Interno entre Atletas */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaTrophy className="text-yellow-400" /> Bolão Interno – Atenção
            Legal
          </h2>
          <div className="space-y-2 rounded-xl border-l-4 border-yellow-600 bg-[#23272F] p-5 text-gray-200">
            <b>Engaje jogadores com bolão entre atletas:</b> Engaje os jogadores
            com bolões entre atletas: incentive apostas entre quem disputa a
            mesma posição, artilharia, campeão do quadrimestre ou do ano. Essas
            dinâmicas mantêm a assiduidade alta durante toda a temporada.
            <br />
            <span className="font-semibold text-yellow-300">Atenção:</span> O
            valor arrecadado deve ser 100% revertido para o prêmio. O presidente
            não pode reter taxa ou comissão para não infringir a lei.
            <br />
            <span className="text-yellow-200">Recomendação Fut7Pro:</span> Dê
            preferência a premiações simbólicas (bolas, uniformes, troféus).
            Bolões com dinheiro real são responsabilidade exclusiva do
            presidente/organizador.
          </div>
        </section>

        {/* Bloco de Downloads */}
        <section id="downloads" className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaDownload className="text-yellow-400" /> Materiais para Download
          </h2>
          {!premiumLiberado && (
            <div className="mb-8 flex items-center gap-4 rounded-xl border-l-4 border-yellow-400 bg-gradient-to-br from-yellow-800 to-yellow-900 px-4 py-4 text-yellow-300 shadow">
              <FaLock className="text-2xl" />
              <div>
                <b>Área exclusiva para assinantes!</b>
                <div className="mt-1 text-sm text-yellow-200">
                  Faça upgrade para desbloquear todos os arquivos, dicas premium
                  e ferramentas de monetização.
                  <br />
                  <Link
                    href="/admin/config"
                    className="font-bold text-yellow-300 underline"
                  >
                    Liberar agora
                  </Link>
                </div>
              </div>
            </div>
          )}

          {premiumLiberado && (
            <div>
              {/* Marketing e Enterprise liberam personalizados */}
              {(planoMarketing || planoEnterprise) && (
                <div className="mb-6 flex items-center gap-4 rounded-xl border-l-4 border-green-400 bg-gradient-to-br from-green-800 to-green-600 px-4 py-4 text-green-200 shadow">
                  <FaMoneyBillWave className="text-2xl" />
                  <div>
                    <b>
                      {planoEnterprise
                        ? "Você está no Enterprise White Label!"
                        : "Você está no plano + Marketing!"}
                    </b>
                    <br />
                    <span className="text-sm text-green-100">
                      Aqui você recebe{" "}
                      <b>todos os arquivos já personalizados</b> com sua logo e
                      identidade visual, criados pela equipe Fut7Pro.
                      <br />
                      <span className="font-semibold">
                        Clique{" "}
                        <Link
                          href="/admin/personalizacao"
                          className="text-green-100 underline"
                        >
                          aqui
                        </Link>{" "}
                        para enviar sua logo ou acompanhar o status dos seus
                        materiais personalizados.
                      </span>
                      {planoEnterprise && (
                        <span className="mt-2 block text-xs font-semibold text-yellow-300">
                          Powered by exclusivo para sua marca. Identidade,
                          domínio próprio e todos os diferenciais liberados.
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Flyer */}
                <a
                  href={
                    planoMarketing || planoEnterprise
                      ? "/downloads/flyer-personalizado.pdf"
                      : "/downloads/flyer-editavel-fut7pro.psd"
                  }
                  download
                  className="group flex items-center gap-4 rounded-lg border border-yellow-700 bg-[#23272F] px-5 py-5 shadow transition hover:bg-[#212529]"
                >
                  <FaDownload className="text-3xl text-yellow-400 transition group-hover:scale-110" />
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {planoMarketing || planoEnterprise
                        ? "Flyer Personalizado (PDF)"
                        : "Flyer Editável (PSD)"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {planoMarketing || planoEnterprise
                        ? "Seu flyer já pronto com a logo do racha, editado pela equipe Fut7Pro."
                        : "Arte profissional para editar com sua marca e patrocinadores."}
                    </div>
                  </div>
                  <span className="ml-auto rounded bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                    Download
                  </span>
                </a>
                {/* Banner */}
                <a
                  href={
                    planoMarketing || planoEnterprise
                      ? "/downloads/banner-personalizado.png"
                      : "/downloads/banner-digital-fut7pro.png"
                  }
                  download
                  className="group flex items-center gap-4 rounded-lg border border-yellow-700 bg-[#23272F] px-5 py-5 shadow transition hover:bg-[#212529]"
                >
                  <FaDownload className="text-3xl text-yellow-400 transition group-hover:scale-110" />
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {planoMarketing || planoEnterprise
                        ? "Banner Personalizado (PNG)"
                        : "Banner Digital (PNG)"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {planoMarketing || planoEnterprise
                        ? "Banner pronto, personalizado com sua identidade visual."
                        : "Banner editável para redes sociais ou WhatsApp."}
                    </div>
                  </div>
                  <span className="ml-auto rounded bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                    Download
                  </span>
                </a>
              </div>
              {/* Incentivo upgrade, apenas se não for Marketing ou Enterprise */}
              {!(planoMarketing || planoEnterprise) && (
                <p className="mt-4 text-xs text-yellow-300">
                  Quer receber todos os arquivos já prontos e personalizados?{" "}
                  <Link href="/admin/config" className="underline">
                    Migre para o plano + Marketing
                  </Link>{" "}
                  ou{" "}
                  <Link href="/admin/config" className="underline">
                    Enterprise White Label
                  </Link>{" "}
                  e tenha este e mais benefícios exclusivos, aproveite!
                </p>
              )}
            </div>
          )}
        </section>

        {/* Benefícios de ser um racha profissionalizado */}
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-yellow-300">
            <FaLightbulb className="text-yellow-400" /> Por que Monetizar?
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-gray-200">
            <li>
              Ao monetizar seu racha e organizar melhor as finanças, você faz
              com que o Fut7Pro <b>“se pague sozinho”</b>: os apoiadores,
              patrocinadores e a própria arrecadação do grupo passam a custear o
              sistema, e tudo que entrar a mais vira <b>lucro direto</b>. Com
              uma gestão responsável, sobra dinheiro para investir, premiar os
              atletas e se divertir enquanto lucra.
            </li>
            <li>
              Dinheiro em caixa para investir em bolas, uniformes e eventos.
            </li>
            <li>
              Reduz inadimplência, aumenta engajamento e profissionaliza o
              grupo.
            </li>
            <li>
              Possibilidade de premiar atletas, reduzir custos de campo e
              melhorar estrutura.
            </li>
            <li>Mais diversão, motivação e prestígio para todos!</li>
          </ul>
        </section>

        {/* CTA para dúvidas e sugestões */}
        <section className="mt-12 text-center">
          <div className="inline-block rounded-xl border border-yellow-600 bg-[#21272c] px-6 py-5">
            <span className="text-lg font-bold text-yellow-400">
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

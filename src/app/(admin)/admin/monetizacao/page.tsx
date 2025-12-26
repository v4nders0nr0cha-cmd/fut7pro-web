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
const planoMarketing = plano === "mensal-marketing" || plano === "anual-marketing";
const planoEnterprise = plano === "mensal-enterprise" || plano === "anual-enterprise";

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
      <div className="w-full max-w-5xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4 text-center">
          💰 Monetização – Lucre Mais com Seu Racha
        </h1>
        <p className="text-lg text-gray-300 text-center mb-10">
          Dicas, estratégias e materiais para <b>profissionalizar</b> e <b>lucrar mais</b> com o seu
          racha usando o Fut7Pro.
        </p>

        {/* Aviso para planos gratuitos */}
        {!premiumLiberado && (
          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 border-l-4 border-yellow-400 text-yellow-300 px-4 py-4 rounded-xl mb-8 flex items-center gap-4 shadow">
            <FaLock className="text-2xl" />
            <div>
              <b>Conteúdo premium bloqueado!</b>
              <div className="text-yellow-200 mt-1 text-sm">
                Assine qualquer plano para liberar dicas avançadas, arquivos editáveis, ferramentas
                de monetização e bônus exclusivos.
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
                (ex: <b>R$30/mês</b>) ou anuais (<b>R$300</b> em até 2x).
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
              colete/uniforme do racha e outros benefícios.
            </li>
          </ul>
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
          {!premiumLiberado && (
            <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 border-l-4 border-yellow-400 text-yellow-300 px-4 py-4 rounded-xl mb-8 flex items-center gap-4 shadow">
              <FaLock className="text-2xl" />
              <div>
                <b>Área exclusiva para assinantes!</b>
                <div className="text-yellow-200 mt-1 text-sm">
                  Faça upgrade para desbloquear todos os arquivos, dicas premium e ferramentas de
                  monetização.
                  <br />
                  <Link href="/admin/config" className="text-yellow-300 underline font-bold">
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
                <div className="mb-6 bg-gradient-to-br from-green-800 to-green-600 border-l-4 border-green-400 text-green-200 px-4 py-4 rounded-xl shadow flex items-center gap-4">
                  <FaMoneyBillWave className="text-2xl" />
                  <div>
                    <b>
                      {planoEnterprise
                        ? "Você está no Enterprise White Label!"
                        : "Você está no plano + Marketing!"}
                    </b>
                    <br />
                    <span className="text-green-100 text-sm">
                      Aqui você recebe <b>todos os arquivos já personalizados</b> com sua logo e
                      identidade visual, criados pela equipe Fut7Pro.
                      <br />
                      <span className="font-semibold">
                        Clique{" "}
                        <Link href="/admin/personalizacao" className="underline text-green-100">
                          aqui
                        </Link>{" "}
                        para enviar sua logo ou acompanhar o status dos seus materiais
                        personalizados.
                      </span>
                      {planoEnterprise && (
                        <span className="block text-xs mt-2 text-yellow-300 font-semibold">
                          Powered by exclusivo para sua marca. Identidade, domínio próprio e todos
                          os diferenciais liberados.
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
                  className="bg-[#23272F] hover:bg-[#212529] border border-yellow-700 rounded-lg flex items-center gap-4 px-5 py-5 transition shadow group"
                >
                  <FaDownload className="text-yellow-400 text-3xl group-hover:scale-110 transition" />
                  <div>
                    <div className="font-semibold text-lg text-white">
                      {planoMarketing || planoEnterprise
                        ? "Flyer Personalizado (PDF)"
                        : "Flyer Editável (PSD)"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {planoMarketing || planoEnterprise
                        ? "Seu flyer já pronto com a logo do racha, editado pela equipe Fut7Pro."
                        : "Arte profissional para editar com sua marca e patrocinadores."}
                    </div>
                  </div>
                  <span className="ml-auto bg-yellow-400 text-black text-xs px-3 py-1 rounded font-bold">
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
                  className="bg-[#23272F] hover:bg-[#212529] border border-yellow-700 rounded-lg flex items-center gap-4 px-5 py-5 transition shadow group"
                >
                  <FaDownload className="text-yellow-400 text-3xl group-hover:scale-110 transition" />
                  <div>
                    <div className="font-semibold text-lg text-white">
                      {planoMarketing || planoEnterprise
                        ? "Banner Personalizado (PNG)"
                        : "Banner Digital (PNG)"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {planoMarketing || planoEnterprise
                        ? "Banner pronto, personalizado com sua identidade visual."
                        : "Banner editável para redes sociais ou WhatsApp."}
                    </div>
                  </div>
                  <span className="ml-auto bg-yellow-400 text-black text-xs px-3 py-1 rounded font-bold">
                    Download
                  </span>
                </a>
              </div>
              {/* Incentivo upgrade, apenas se não for Marketing ou Enterprise */}
              {!(planoMarketing || planoEnterprise) && (
                <p className="mt-4 text-yellow-300 text-xs">
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

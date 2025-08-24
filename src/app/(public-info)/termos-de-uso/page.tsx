"use client";
import Head from "next/head";

export default function TermosDeUsoPage() {
  return (
    <>
      <Head>
        <title>Termos de Uso | Fut7Pro</title>
        <meta
          name="description"
          content="Termos de Uso da plataforma Fut7Pro, sistema SaaS para gestão de rachas e campeonatos de Futebol 7. Leia atentamente nossas regras."
        />
        <meta
          name="keywords"
          content="Fut7Pro, termos de uso, racha, futebol, SaaS, plataforma esportiva"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Termos de Uso
        </h1>
        <p className="mb-6">
          A utilização do Fut7Pro implica na aceitação integral de todos os
          termos e condições estabelecidos nesta plataforma. O Fut7Pro é uma
          solução SaaS dedicada à gestão de rachas, campeonatos e grupos de
          Futebol 7, fornecendo ferramentas para organização, registro,
          premiação e acompanhamento de todos os aspectos esportivos e
          administrativos de cada grupo.
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Cadastro e Dados:</strong> Todos os usuários devem fornecer
            informações verdadeiras e atualizadas. O uso de nomes, fotos e dados
            falsos ou ofensivos pode resultar na suspensão ou banimento do
            sistema, sem aviso prévio.
          </li>
          <li>
            <strong>Conduta e Respeito:</strong> É proibido ofender, perseguir,
            difamar ou discriminar outros membros, seja por mensagens públicas,
            comentários, imagens ou qualquer interação dentro da plataforma. O
            respeito mútuo é regra básica para o convívio digital e presencial.
          </li>
          <li>
            <strong>Segurança da Conta:</strong> Cada usuário é responsável pela
            segurança da própria conta. Não compartilhe sua senha ou informações
            de acesso com terceiros. O Fut7Pro nunca solicitará sua senha por
            e-mail, WhatsApp ou redes sociais.
          </li>
          <li>
            <strong>Responsabilidade sobre Atos e Resultados:</strong> As
            decisões tomadas no âmbito do racha (punições, convocações,
            cobranças, premiações, etc.) são de inteira responsabilidade dos
            administradores locais. O Fut7Pro oferece apenas a infraestrutura e
            registro digital, não participando de decisões internas ou eventuais
            conflitos.
          </li>
          <li>
            <strong>Limitações de Responsabilidade:</strong> O Fut7Pro não se
            responsabiliza por danos, perdas financeiras, acidentes, problemas
            físicos, discussões ou qualquer ocorrência nas partidas e eventos
            organizados pelos rachas cadastrados.
          </li>
          <li>
            <strong>Uso Adequado das Ferramentas:</strong> Qualquer tentativa de
            manipular resultados, fraudar sorteios, burlar rankings, gerar
            múltiplas contas para obter vantagem, ou qualquer comportamento
            considerado antiético pela administração, poderá acarretar exclusão
            imediata.
          </li>
          <li>
            <strong>Atualizações de Termos:</strong> Os Termos de Uso podem ser
            alterados a qualquer momento para garantir o bom funcionamento da
            plataforma. Recomenda-se a leitura periódica desta seção.
          </li>
        </ul>
        <p>
          Ao prosseguir com o uso do Fut7Pro, o usuário declara ter lido,
          compreendido e aceitado todas as regras acima, sendo responsável por
          suas ações e pelo cumprimento das políticas aqui descritas.
        </p>
      </main>
    </>
  );
}

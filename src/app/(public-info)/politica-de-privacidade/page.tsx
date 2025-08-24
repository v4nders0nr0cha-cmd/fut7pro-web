"use client";
import Head from "next/head";

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Head>
        <title>Política de Privacidade | Fut7Pro</title>
        <meta
          name="description"
          content="Política de Privacidade da plataforma Fut7Pro. Entenda como protegemos, armazenamos e utilizamos seus dados no sistema de racha SaaS."
        />
        <meta
          name="keywords"
          content="Fut7Pro, política de privacidade, privacidade, LGPD, futebol, SaaS"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Política de Privacidade
        </h1>
        <p className="mb-6">
          Sua privacidade é uma prioridade para o Fut7Pro. Adotamos padrões
          avançados de segurança e transparência no tratamento das informações
          dos usuários. Comprometemo-nos a proteger seus dados e utilizá-los
          apenas para os fins essenciais ao funcionamento e evolução da
          plataforma. Veja como tratamos suas informações:
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Coleta de Dados:</strong> São coletados apenas os dados
            necessários para o cadastro, participação nos rachas e uso dos
            recursos do sistema (nome, apelido, foto, e-mail, desempenho
            esportivo, status, etc.). Dados sensíveis ou de terceiros não são
            solicitados.
          </li>
          <li>
            <strong>Uso das Informações:</strong> Os dados são usados
            exclusivamente para identificação no sistema, estatísticas
            esportivas, personalização da experiência, notificações relevantes e
            comunicação entre membros do mesmo racha. Nunca enviamos spam,
            promoções externas ou vendemos suas informações para terceiros.
          </li>
          <li>
            <strong>Armazenamento e Segurança:</strong> Utilizamos criptografia
            e servidores seguros para garantir que suas informações estejam
            protegidas contra acessos não autorizados, vazamentos ou qualquer
            tipo de uso indevido.
          </li>
          <li>
            <strong>Compartilhamento de Dados:</strong> Nenhum dado pessoal é
            compartilhado fora do contexto do próprio racha em que você
            participa. Somente administradores daquele grupo podem visualizar
            detalhes como presença, pontuação e dados de contato (caso você
            permita).
          </li>
          <li>
            <strong>Direitos do Usuário:</strong> Você pode, a qualquer momento,
            solicitar a exclusão ou atualização dos seus dados, revisar
            informações cadastradas e controlar quais notificações deseja
            receber.
          </li>
          <li>
            <strong>LGPD:</strong> O Fut7Pro cumpre integralmente a Lei Geral de
            Proteção de Dados (Lei nº 13.709/18), garantindo o direito à
            privacidade, à transparência e ao controle sobre seus dados.
          </li>
          <li>
            <strong>Retenção de Dados:</strong> Caso o usuário solicite exclusão
            da conta, todos os dados relacionados serão apagados
            definitivamente, exceto aqueles que forem obrigatórios por
            legislação vigente.
          </li>
        </ul>
        <p>
          Dúvidas sobre privacidade ou solicitações devem ser feitas pelo canal
          oficial do racha ou via suporte da plataforma. Segurança, respeito e
          transparência são compromissos do Fut7Pro com todos os usuários.
        </p>
      </main>
    </>
  );
}

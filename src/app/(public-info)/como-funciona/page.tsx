"use client";
import Head from "next/head";

export default function ComoFuncionaPage() {
  return (
    <>
      <Head>
        <title>Como Funciona | Fut7Pro</title>
        <meta
          name="description"
          content="Veja como funciona o Fut7Pro, o sistema mais completo para rachas de futebol 7 entre amigos. Entenda todas as funcionalidades disponíveis."
        />
        <meta
          name="keywords"
          content="Fut7Pro, como funciona, futebol 7, racha, SaaS, funcionalidades, gestão esportiva"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Como Funciona o Fut7Pro
        </h1>
        <p className="mb-6">
          O Fut7Pro é a plataforma mais completa e moderna para a gestão de
          rachas, campeonatos e grupos de Futebol 7 entre amigos. Conheça os
          principais recursos e descubra como transformar seu racha em uma
          experiência profissional:
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Gestão de Rachas:</strong> Crie e administre grupos
            personalizados com logotipo, cores, cadastro de jogadores, controle
            de presença e regras específicas.
          </li>
          <li>
            <strong>Organização de Partidas e Calendário:</strong> Programe
            jogos regulares, eventos especiais e torneios. Controle presenças,
            faltas, e mantenha o calendário sempre atualizado.
          </li>
          <li>
            <strong>Sorteio e Balanceamento Inteligente:</strong> Monte times
            equilibrados automaticamente, evitando favoritismos e promovendo
            partidas justas e competitivas.
          </li>
          <li>
            <strong>Rankings e Premiações:</strong> Rankings automáticos por
            posição, time, artilharia e assiduidade, além de premiações
            periódicas e galeria de conquistas digital.
          </li>
          <li>
            <strong>Painel de Patrocinadores:</strong> Exiba marcas parceiras,
            valorize patrocinadores e gere relatórios de engajamento.
          </li>
          <li>
            <strong>Perfil do Atleta:</strong> Cada jogador possui perfil
            próprio, histórico de jogos, conquistas, evolução e comparador
            (“Tira Teima”) com outros atletas.
          </li>
          <li>
            <strong>Notificações e Comunicação:</strong> Alertas automáticos
            sobre próximos jogos, rankings, aniversariantes, avisos e
            atualizações.
          </li>
          <li>
            <strong>Administração Completa:</strong> Cadastre, edite, aprove ou
            suspenda jogadores, controle premiações, configure regras e
            personalize detalhes do seu racha.
          </li>
          <li>
            <strong>Experiência Mobile First:</strong> Sistema 100% responsivo,
            adaptado para smartphones, tablets e desktops.
          </li>
        </ul>
        <p>
          O Fut7Pro transforma qualquer grupo de amigos em uma comunidade
          esportiva digital de alto nível, valorizando o futebol amador, a
          amizade e a competição saudável.
        </p>
      </main>
    </>
  );
}

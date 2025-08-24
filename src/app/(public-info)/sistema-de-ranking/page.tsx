"use client";
import Head from "next/head";

export default function SistemaDeRankingPage() {
  return (
    <>
      <Head>
        <title>Sistema de Ranking | Fut7Pro</title>
        <meta
          name="description"
          content="Entenda como funciona o Sistema de Ranking do Fut7Pro: critérios de pontuação, auditoria, filtros por quadrimestre, anual e histórico total. Transparência e motivação para todos."
        />
        <meta
          name="keywords"
          content="Fut7Pro, ranking, futebol 7, pontuação, sistema de ranking, racha, SaaS"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Sistema de Ranking
        </h1>
        <p className="mb-6">
          O ranking do Fut7Pro é um dos maiores diferenciais do sistema,
          projetado para motivar, engajar e reconhecer o desempenho dos atletas
          e times em cada racha. O sistema é automatizado, auditável e foi
          desenvolvido para garantir justiça e transparência.
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Cálculo de Pontuação Geral:</strong>
            <ul className="ml-6 mt-2 list-[circle] space-y-2">
              <li>
                <b>Vitória:</b> Cada jogador do time vencedor recebe{" "}
                <b>3 pontos</b> na tabela geral.
              </li>
              <li>
                <b>Empate:</b> Todos os atletas envolvidos recebem{" "}
                <b>1 ponto</b>.
              </li>
              <li>
                <b>Derrota:</b> Não são atribuídos pontos.
              </li>
              <li>
                <b>Gols e Assistências:</b> Não geram pontos extras no ranking
                geral, mas são contabilizados para rankings específicos de
                artilharia e assistência.
              </li>
              <li>
                <b>Cartões:</b> Amarelos e vermelhos não tiram pontos, mas podem
                causar suspensão conforme regra do racha.
              </li>
            </ul>
          </li>
          <li>
            <strong>Ranking por Posição:</strong> Os rankings são divididos por
            posição (Atacante, Meia, Zagueiro, Goleiro), permitindo avaliar quem
            mais se destacou em cada função.
          </li>
          <li>
            <strong>Ranking de Artilharia e Assistências:</strong> Gols e
            assistências contam para rankings específicos e são destacados em
            painéis visuais e premiações.
          </li>
          <li>
            <strong>Ranking de Times:</strong> Cada time formado no racha possui
            seu próprio histórico de pontos, vitórias, gols pró/contra e
            variação na classificação a cada rodada.
          </li>
          <li>
            <strong>Assiduidade:</strong> Atletas mais assíduos e participativos
            recebem destaque especial em rankings de assiduidade.
          </li>
          <li>
            <strong>Filtros por Período:</strong> Todos os rankings podem ser
            filtrados por <b>temporada anual</b>,{" "}
            <b>1º, 2º ou 3º quadrimestre</b> e <b>histórico total</b>,
            facilitando diferentes análises e premiações.
          </li>
          <li>
            <strong>Auditoria e Transparência:</strong> Todos os cálculos de
            pontuação são realizados de forma automática pelo sistema, sem
            interferência manual, garantindo imparcialidade e fácil conferência
            por qualquer membro.
          </li>
          <li>
            <strong>Atualização em Tempo Real:</strong> Os rankings são
            atualizados automaticamente após cada partida cadastrada.
          </li>
        </ul>
        <p>
          O objetivo do ranking é valorizar não só os grandes artilheiros, mas
          também os atletas regulares, times organizados e quem mais contribui
          para o crescimento e união do racha.
        </p>
      </main>
    </>
  );
}

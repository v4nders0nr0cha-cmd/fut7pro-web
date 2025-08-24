"use client";
import Head from "next/head";

export default function SistemaDeBalanceamentoPage() {
  return (
    <>
      <Head>
        <title>Sistema de Balanceamento | Fut7Pro</title>
        <meta
          name="description"
          content="Veja como o sistema de sorteio e balanceamento de times do Fut7Pro garante jogos equilibrados e justos, sem panelinhas e favoritismo."
        />
        <meta
          name="keywords"
          content="Fut7Pro, balanceamento, sorteio, times, futebol 7, racha, SaaS"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Sistema de Balanceamento
        </h1>
        <p className="mb-6">
          O Fut7Pro revoluciona a formação dos times dos rachas com um sistema
          inteligente de sorteio e balanceamento, eliminando distorções,
          “panelinhas” e favorecimentos. A tecnologia proporciona jogos mais
          justos e divertidos para todos. Conheça como funciona:
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Sorteio Inteligente:</strong> O sorteio dos times é
            automático, considerando ranking dos atletas, média de vitórias por
            partida, estrelas de desempenho, posição preferida e outros
            critérios configuráveis.
          </li>
          <li>
            <strong>Critérios de Equilíbrio:</strong> O sistema busca nivelar os
            times, separando atletas-chave, garantindo goleiros em times
            diferentes, evitando concentração de craques e priorizando a
            diversidade.
          </li>
          <li>
            <strong>Personalização pelo Admin:</strong> O administrador pode
            ajustar regras específicas, separar duplas, restringir “panelinhas”,
            limitar atletas por time e definir rodízio de jogadores.
          </li>
          <li>
            <strong>Transparência Total:</strong> O resultado e todos os
            critérios utilizados no sorteio ficam disponíveis para consulta
            pública, promovendo confiança e imparcialidade.
          </li>
          <li>
            <strong>Histórico de Balanceamentos:</strong> Todos os sorteios e
            times formados ficam registrados para conferência futura.
          </li>
          <li>
            <strong>Evolução Contínua:</strong> O algoritmo de balanceamento é
            atualizado periodicamente, acompanhando tendências do grupo e
            desempenho dos jogadores.
          </li>
        </ul>
        <p>
          O sistema de balanceamento do Fut7Pro proporciona partidas
          equilibradas, mais diversão e menos discussões, elevando o futebol
          amador ao padrão profissional.
        </p>
      </main>
    </>
  );
}

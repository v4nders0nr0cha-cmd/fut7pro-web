"use client";
import Head from "next/head";

export default function SistemaDePremiacoesPage() {
  return (
    <>
      <Head>
        <title>Sistema de Premiações | Fut7Pro</title>
        <meta
          name="description"
          content="Saiba como funcionam as premiações do Fut7Pro: títulos anuais, quadrimestrais, conquistas individuais, personalização por admin e hall da fama digital do seu racha."
        />
        <meta
          name="keywords"
          content="Fut7Pro, premiações, conquistas, futebol 7, hall da fama, racha, SaaS"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Sistema de Premiações
        </h1>
        <p className="mb-6">
          O Fut7Pro oferece um sistema robusto e transparente de premiações para
          reconhecer atletas e times que se destacam ao longo das temporadas. As
          premiações incentivam a participação, a regularidade e a busca por
          evolução técnica e coletiva. Veja como funciona:
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Premiações Anuais:</strong>
            <ul className="ml-6 mt-2 list-[circle] space-y-2">
              <li>
                <b>Time Campeão do Ano:</b> Equipe que somar mais pontos ao
                final da temporada recebe o título máximo, com destaque em
                páginas públicas e no perfil dos campeões.
              </li>
              <li>
                <b>Melhor do Ano por Posição:</b> Atacante, Meia, Zagueiro e
                Goleiro do Ano são reconhecidos pelo desempenho técnico e
                regularidade em suas funções.
              </li>
              <li>
                <b>Artilheiro e Rei das Assistências:</b> Atletas com mais gols
                e assistências recebem troféus e selos especiais, visíveis no
                perfil e nos rankings.
              </li>
            </ul>
          </li>
          <li>
            <strong>Premiações Quadrimestrais:</strong>
            <ul className="ml-6 mt-2 list-[circle] space-y-2">
              <li>
                O sistema identifica automaticamente, a cada 4 meses, o melhor
                time e os atletas de cada posição, criando oportunidades de
                reconhecimento frequente.
              </li>
            </ul>
          </li>
          <li>
            <strong>Conquistas Especiais:</strong>
            <ul className="ml-6 mt-2 list-[circle] space-y-2">
              <li>
                Participação em torneios, finais, recordes de presenças,
                campanhas invictas e outros feitos especiais são registrados
                como conquistas digitais permanentes.
              </li>
              <li>
                Conquistas visuais exibidas como ícones (🏆, 🥇, ⚽) no perfil
                do atleta, servindo como “hall da fama” pessoal.
              </li>
            </ul>
          </li>
          <li>
            <strong>Personalização das Premiações:</strong> O administrador pode
            criar e customizar prêmios internos, como Fair Play, Revelação,
            Destaque do Evento, Craque da Galera, entre outros.
          </li>
          <li>
            <strong>Histórico de Premiações:</strong> Todas as conquistas ficam
            salvas para consulta futura. O atleta pode acompanhar sua
            trajetória, evolução e galeria de troféus a qualquer momento.
          </li>
          <li>
            <strong>Premiações Automáticas e Auditoria:</strong> Todo o sistema
            é auditável e, ao final de cada ciclo (ano/quadrimestre), as
            conquistas são automaticamente atribuídas. Apenas o administrador
            pode editar premiações manuais.
          </li>
        </ul>
        <p>
          O sistema de premiações do Fut7Pro é o mais completo da categoria,
          eternizando quem faz a diferença e tornando cada racha mais motivador
          e inesquecível.
        </p>
      </main>
    </>
  );
}

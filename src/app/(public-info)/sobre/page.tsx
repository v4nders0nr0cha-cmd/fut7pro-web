"use client";
import Head from "next/head";

export default function SobrePage() {
  return (
    <>
      <Head>
        <title>Sobre o Fut7Pro</title>
        <meta
          name="description"
          content="Conheça o Fut7Pro: missão, visão, valores e os diferenciais da plataforma SaaS líder em gestão de rachas de Futebol 7 no Brasil."
        />
        <meta
          name="keywords"
          content="Fut7Pro, sobre, missão, valores, futebol 7, racha, SaaS, plataforma esportiva"
        />
      </Head>
      <main className="mx-auto min-h-screen max-w-3xl bg-[#111] px-4 pb-24 pt-20 text-zinc-100 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          Sobre o Fut7Pro
        </h1>
        <p className="mb-6">
          O Fut7Pro nasceu da paixão pelo futebol e tecnologia, com o propósito
          de digitalizar, organizar e elevar os rachas de Futebol 7 do Brasil a
          um novo patamar. Somos a primeira plataforma SaaS do país totalmente
          dedicada ao segmento, trazendo soluções únicas para atletas,
          administradores e patrocinadores.
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-4">
          <li>
            <strong>Missão:</strong> Democratizar o acesso à gestão profissional
            de rachas, oferecendo ferramentas completas, intuitivas e inovadoras
            para qualquer grupo de futebol amador.
          </li>
          <li>
            <strong>Visão:</strong> Ser a plataforma referência nacional em
            gestão de rachas, reconhecida pela inovação, confiança, comunidade
            engajada e suporte exemplar.
          </li>
          <li>
            <strong>Diferenciais:</strong>
            <ul className="ml-6 mt-2 list-[circle] space-y-2">
              <li>
                Sistema multi-tenant: cada grupo possui painel, regras e
                identidade visual própria.
              </li>
              <li>
                Gamificação avançada: conquistas, rankings, premiações, evolução
                e comparador.
              </li>
              <li>
                Personalização: logotipo, cores, banners e informações
                customizáveis por racha.
              </li>
              <li>
                Segurança e transparência: dados protegidos, histórico completo
                e auditoria dos rankings e sorteios.
              </li>
              <li>
                Integração com patrocinadores: valorize parceiros e monetize seu
                racha.
              </li>
              <li>
                Experiência mobile first: funciona perfeitamente em qualquer
                dispositivo.
              </li>
              <li>Equipe dedicada: suporte contínuo e evoluções constantes.</li>
            </ul>
          </li>
        </ul>
        <p>
          <strong>
            O Fut7Pro acredita que futebol é muito mais do que jogo – é
            comunidade, história e motivação. Seja bem-vindo à plataforma que
            transforma o futebol amador em experiência profissional!
          </strong>
        </p>
      </main>
    </>
  );
}

"use client";
import Head from "next/head";
import Image from "next/image";

const adminMock = {
  nome: "Rodrigo Oliveira",
  cargo: "Presidente",
  email: "rodrigo@fut7pro.com.br",
  avatar: "/images/jogadores/jogador_padrao_01.jpg",
};

export default function PerfilAdmin() {
  const { nome, cargo, email, avatar } = adminMock;

  return (
    <>
      <Head>
        <title>Perfil do Administrador | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Gerencie seu perfil administrativo no Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, perfil admin, administração, SaaS"
        />
      </Head>

      <section className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-4 text-2xl font-bold text-yellow-400">
          Perfil do Administrador
        </h1>

        <div className="flex flex-col items-center gap-6 rounded-lg border border-[#292929] bg-[#181818] p-6 shadow-md md:flex-row">
          <Image
            src={avatar}
            alt={`Avatar do administrador ${nome}`}
            width={120}
            height={120}
            className="rounded-full"
          />

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold text-white">{nome}</h2>
            <span className="mt-1 inline-block rounded bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
              {cargo}
            </span>
            <p className="mt-2 text-zinc-300">{email}</p>
          </div>
        </div>

        <button className="mt-6 rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-500">
          Editar Perfil
        </button>
      </section>
    </>
  );
}

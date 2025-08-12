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
        <meta name="description" content="Gerencie seu perfil administrativo no Fut7Pro." />
        <meta name="keywords" content="fut7, perfil admin, administração, SaaS" />
      </Head>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">Perfil do Administrador</h1>

        <div className="bg-[#181818] border border-[#292929] rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
          <Image
            src={avatar}
            alt={`Avatar do administrador ${nome}`}
            width={120}
            height={120}
            className="rounded-full"
          />

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold text-white">{nome}</h2>
            <span className="inline-block bg-yellow-400 text-black rounded px-3 py-1 font-bold text-sm mt-1">
              {cargo}
            </span>
            <p className="mt-2 text-zinc-300">{email}</p>
          </div>
        </div>

        <button className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition">
          Editar Perfil
        </button>
      </section>
    </>
  );
}

"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Administrador",
};

const POSITION_LABELS: Record<string, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

function formatPosition(value?: string | null) {
  if (!value) return "Nao informado";
  const normalized = value.toLowerCase();
  return POSITION_LABELS[normalized] ?? value;
}

export default function PerfilAdmin() {
  const { data: session } = useSession();
  const { me, isLoading, isError } = useMe();

  const displayName = me?.athlete?.firstName || session?.user?.name || "Administrador";
  const displayNickname = me?.athlete?.nickname;
  const displayAvatar = me?.athlete?.avatarUrl || session?.user?.image || DEFAULT_AVATAR;
  const displayEmail = me?.user?.email || session?.user?.email || "email@nao-informado";
  const roleLabel = me?.membership?.role ? ROLE_LABELS[me.membership.role] : null;
  const adminBadgeLabel = roleLabel ? `Administrador, ${roleLabel}` : "Administrador";
  const publicProfileHref = me?.athlete?.slug ? `/atletas/${me.athlete.slug}` : null;

  if (isLoading) {
    return (
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 text-zinc-200">
        Carregando perfil...
      </section>
    );
  }

  if (isError || !me?.athlete) {
    return (
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <div className="rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-sm text-red-200">
          Nao foi possivel carregar o perfil. Recarregue a pagina ou faca login novamente.
        </div>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>Meu Perfil | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Visualize os dados do seu perfil administrativo no painel Fut7Pro."
        />
      </Head>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">Meu Perfil</h1>

        <div className="bg-[#181818] border border-[#292929] rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Image
              src={displayAvatar}
              alt={`Avatar do administrador ${displayName}`}
              width={120}
              height={120}
              className="rounded-full border-2 border-yellow-400 object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-white">{displayName}</h2>
              {displayNickname && (
                <p className="text-yellow-300 font-semibold mt-1">Apelido: {displayNickname}</p>
              )}
              <span className="inline-block bg-yellow-400 text-black rounded px-3 py-1 font-bold text-sm mt-2">
                {adminBadgeLabel}
              </span>
              <p className="mt-2 text-zinc-300">{displayEmail}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Perfil publico do atleta exibido no site do racha.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-sm text-zinc-200">
              <span className="text-zinc-400">Posicao: </span>
              {formatPosition(me.athlete.position)}
            </div>
            <div className="rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-sm text-zinc-200">
              <span className="text-zinc-400">Status: </span>
              {me.athlete.status || "Nao informado"}
            </div>
            <div className="rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-sm text-zinc-200">
              <span className="text-zinc-400">Mensalista: </span>
              {me.athlete.mensalista ? "Ativo" : "Nao"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/perfil/editar"
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
          >
            Editar perfil
          </Link>
          {publicProfileHref && (
            <Link
              href={publicProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-yellow-400 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-400/10"
            >
              Ver perfil publico
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTema } from "@/hooks/useTema";

export default function Header() {
  const { logo, nome } = useTema();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const profileImage = session?.user?.image || "/images/jogadores/default.png";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-[#2a2a2a] shadow-sm"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo + Nome com link para Home */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-all"
          aria-label="Página inicial Fut7Pro"
        >
          <Image
            src={logo}
            alt="Logo do Racha"
            width={56}
            height={56}
            className="object-contain rounded"
          />
          <span className="text-xl font-bold text-yellow-400">{nome}</span>
        </Link>

        {/* Menu desktop */}
        <nav
          className="hidden md:flex gap-6 text-sm font-bold text-white uppercase items-center"
          aria-label="Menu principal"
        >
          <Link
            href="/partidas"
            title="Partidas do Racha"
            className="hover:text-yellow-400 transition-colors"
          >
            PARTIDAS
          </Link>
          <Link
            href="/estatisticas"
            title="Estatísticas gerais"
            className="hover:text-yellow-400 transition-colors"
          >
            ESTATÍSTICAS
          </Link>
          <Link
            href="/os-campeoes"
            title="Campeões do ano e por posição"
            className="hover:text-yellow-400 transition-colors"
          >
            OS CAMPEÕES
          </Link>
          <Link
            href="/grandes-torneios"
            title="Grandes torneios e competições"
            className="hover:text-yellow-400 transition-colors"
          >
            GRANDES TORNEIOS
          </Link>
          <Link
            href="/atletas"
            title="Perfis dos atletas"
            className="hover:text-yellow-400 transition-colors"
          >
            PERFIS DOS ATLETAS
          </Link>
          <Link
            href="/sobre"
            title="Informações sobre o projeto"
            className="hover:text-yellow-400 transition-colors"
          >
            SOBRE NÓS
          </Link>

          {!isLoggedIn ? (
            <Link
              href="/login"
              title="Acessar ou criar conta"
              className="ml-4 border border-yellow-400 text-yellow-400 px-3 py-0.5 text-xs rounded hover:bg-yellow-400 hover:text-black font-semibold transition-colors"
            >
              ENTRAR / REGISTRAR
            </Link>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Link href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition">
                <Image
                  src={profileImage}
                  alt={session.user?.name || "Usuário"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-yellow-400 font-medium text-sm uppercase">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-300 hover:text-red-500 transition"
              >
                SAIR
              </button>
            </div>
          )}
        </nav>

        {/* Botão mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div
          className="md:hidden bg-[#1a1a1a] px-4 py-3 space-y-3 text-white uppercase text-sm font-bold"
          aria-label="Menu mobile"
        >
          <Link href="/partidas" onClick={() => setMenuOpen(false)}>
            PARTIDAS
          </Link>
          <Link href="/estatisticas" onClick={() => setMenuOpen(false)}>
            ESTATÍSTICAS
          </Link>
          <Link href="/os-campeoes" onClick={() => setMenuOpen(false)}>
            OS CAMPEÕES
          </Link>
          <Link href="/grandes-torneios" onClick={() => setMenuOpen(false)}>
            GRANDES TORNEIOS
          </Link>
          <Link href="/atletas" onClick={() => setMenuOpen(false)}>
            PERFIS DOS ATLETAS
          </Link>
          <Link href="/sobre" onClick={() => setMenuOpen(false)}>
            SOBRE NÓS
          </Link>

          {!isLoggedIn ? (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-left text-yellow-400 border border-yellow-400 px-3 py-0.5 text-xs rounded hover:bg-yellow-400 hover:text-black font-semibold transition-colors"
            >
              ENTRAR / REGISTRAR
            </Link>
          ) : (
            <>
              <Link
                href="/perfil"
                className="flex items-center gap-3 mt-4 hover:opacity-80 transition"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src={profileImage}
                  alt={session.user?.name || "Usuário"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-yellow-400 font-medium text-sm uppercase">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="text-sm text-gray-300 hover:text-red-500 mt-2 transition"
              >
                SAIR
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaShieldAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const confirmed = window.confirm("Deseja encerrar a sessao do SuperAdmin?");
    if (!confirmed) return;
    setMenuOpen(false);
    try {
      await fetch("/api/superadmin/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Em caso de falha no backend, finaliza sessao local de qualquer forma.
    }
    await (signOut as any)({
      basePath: "/api/superadmin-auth",
      callbackUrl: "/superadmin/login",
    });
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-800 bg-zinc-950/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-lg font-bold tracking-wide text-yellow-400 sm:text-xl">
          Painel SuperAdmin
        </span>
        <div ref={menuRef} className="relative flex items-center gap-2 sm:gap-4">
          {session?.user ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left transition hover:border-zinc-500"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menu da conta SuperAdmin"
              >
                <FaUserCircle size={22} className="text-yellow-400" />
                <span className="max-w-[200px] truncate text-sm font-semibold sm:text-base">
                  {session.user.name || session.user.email || "SuperAdmin"}
                </span>
                <FaChevronDown className="text-zinc-300" size={12} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-14 z-50 min-w-[260px] rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl"
                >
                  <div className="mb-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Sessao ativa</p>
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {session.user.name || "SuperAdmin"}
                    </p>
                    {session.user.email ? (
                      <p className="truncate text-xs text-zinc-400">{session.user.email}</p>
                    ) : null}
                  </div>

                  <Link
                    href="/superadmin/config"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  >
                    <FaUserCircle size={14} />
                    Meu perfil
                  </Link>

                  <Link
                    href="/superadmin/config#seguranca"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  >
                    <FaShieldAlt size={14} />
                    Seguranca
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950/60"
                  >
                    <FaSignOutAlt size={14} />
                    Sair
                  </button>
                </div>
              )}
            </>
          ) : (
            <FaUserCircle size={24} className="text-zinc-300" />
          )}
        </div>
      </div>
    </header>
  );
}

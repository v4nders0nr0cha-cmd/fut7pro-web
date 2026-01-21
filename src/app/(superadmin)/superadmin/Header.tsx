"use client";

import { FaUserCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-800 bg-zinc-950/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-lg font-bold tracking-wide text-yellow-400 sm:text-xl">
          Painel SuperAdmin
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          {session?.user ? (
            <span className="flex items-center gap-2">
              <FaUserCircle size={24} className="text-yellow-400" />
              <span className="text-sm font-semibold sm:text-base">{session.user.name}</span>
            </span>
          ) : (
            <FaUserCircle size={24} className="text-zinc-300" />
          )}
        </div>
      </div>
    </header>
  );
}

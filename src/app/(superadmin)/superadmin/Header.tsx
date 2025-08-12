"use client";

import { FaUserCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 h-16 flex items-center px-6 shadow">
      <div className="flex items-center gap-3 w-full justify-between">
        <span className="text-xl font-bold text-yellow-400 tracking-wide">Painel SuperAdmin</span>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <span className="flex items-center gap-2">
              <FaUserCircle size={24} className="text-yellow-400" />
              <span className="font-semibold">{session.user.name}</span>
            </span>
          ) : (
            <FaUserCircle size={24} className="text-zinc-300" />
          )}
        </div>
      </div>
    </header>
  );
}

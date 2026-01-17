"use client";

import Image from "next/image";
import { useAdminBirthdays } from "@/hooks/useAdminBirthdays";

export default function CardAniversariantes() {
  const { birthdays, isLoading } = useAdminBirthdays({ rangeDays: 30, limit: 3 });

  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col h-full min-h-[140px]">
      <span className="text-[#41b6e6] font-bold text-lg">Aniversariantes</span>
      <div className="flex flex-col gap-1 mt-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-5 bg-neutral-700 rounded w-5/6 animate-pulse" />
            ))}
          </div>
        ) : birthdays.length ? (
          birthdays.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-white text-sm">
              <Image
                src={a.photoUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                alt={`Foto de ${a.name}`}
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
              <span className="flex-1 truncate">{a.nickname || a.name}</span>
              <span className="font-semibold text-[#f0c97f]">
                {`${String(a.birthDay).padStart(2, "0")}/${String(a.birthMonth).padStart(2, "0")}`}
              </span>
            </div>
          ))
        ) : (
          <span className="text-xs text-gray-400">Nenhum aniversario proximo.</span>
        )}
      </div>
      <span className="text-xs text-gray-400 mt-2">Deseje parabens!</span>
    </div>
  );
}

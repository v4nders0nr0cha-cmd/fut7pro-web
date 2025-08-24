"use client";

import { useRef } from "react";
import CardTimeDoDia from "@/components/cards/CardTimeDoDia";
import { timesDoDiaMock } from "@/components/lists/mockTimesDoDia";
import ConfrontosDoDia from "@/components/lists/ConfrontosDoDia";

export default function TimesDoDiaClient() {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={gridRef}>
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {timesDoDiaMock.map((time) => (
            <CardTimeDoDia key={time.id} time={time} />
          ))}
        </section>
      </div>
      {/* Removido o botão de baixar/compartilhar times do dia */}
      <ConfrontosDoDia />
    </>
  );
}

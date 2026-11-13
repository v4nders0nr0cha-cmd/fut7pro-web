"use client";
import React from "react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

type Props = {
  onClose: () => void;
};

export default function ModalRegrasTimeCampeao({ onClose }: Props) {
  return (
    <Fut7DialogBase open title="Regras do Time Campeão" onClose={onClose} size="lg">
      <div className="space-y-4 text-sm leading-6 text-gray-200">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-semibold text-white">Confirme quem jogou</h3>
          <p className="mt-2 text-zinc-300">
            Marque “Jogador não compareceu ao racha” para quem faltou. Assim, esse atleta não recebe
            pontos, gols, assistências nem outras estatísticas do dia.
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-semibold text-white">Se houve substituição</h3>
          <p className="mt-2 text-zinc-300">
            Os gols e as assistências do substituto podem ser lançados no nome do titular ausente
            para completar o resultado do time. Marque a ausência do titular mesmo assim, para que
            esses números não entrem nos rankings individuais dele.
          </p>
        </section>
        <p className="rounded-xl border border-yellow-300/20 bg-yellow-400/[0.06] px-4 py-3 text-zinc-200">
          Antes de salvar, confira se as estatísticas individuais ficaram apenas com quem jogou.
        </p>
      </div>
    </Fut7DialogBase>
  );
}

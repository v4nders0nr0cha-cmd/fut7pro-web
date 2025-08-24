"use client";
import React from "react";

type Props = {
  onClose: () => void;
};

export default function ModalRegrasTimeCampeao({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full max-w-lg rounded-xl border-2 border-yellow-400 bg-zinc-900 p-6 shadow-lg">
        <button
          className="absolute right-4 top-3 text-xl font-bold text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="mb-3 text-center text-2xl font-bold text-yellow-400">
          Regras do Time Campeão
        </h2>
        <div className="text-base leading-relaxed text-gray-200">
          <p className="mb-3">
            <strong>Confirmação de Presença:</strong> Aqui você, administrador,
            confirma se cada jogador realmente compareceu ao racha neste dia.
          </p>
          <p className="mb-3">
            Caso algum jogador <b>não tenha comparecido</b>, marque a opção
            "Jogador não compareceu ao racha". Isso impede que esse atleta
            receba os pontos, gols, assistências e qualquer estatística deste
            dia.
          </p>
          <p className="mb-3">
            Se um jogador foi substituído por outro, todos os gols ou
            assistências do substituto podem ser lançados normalmente no nome do
            titular ausente apenas para completar o resultado coletivo.{" "}
            <b>Mesmo assim, marque a ausência do titular</b> para que nada seja
            contabilizado para ele nos rankings individuais.
          </p>
          <p>
            <b>Lembre-se:</b> apenas os jogadores realmente titulares devem ter
            suas estatísticas validadas. Essa checagem é fundamental para a
            justiça do ranking do racha!
          </p>
        </div>
      </div>
    </div>
  );
}

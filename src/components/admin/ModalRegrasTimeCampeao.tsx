"use client";
import React from "react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

type Props = {
  onClose: () => void;
};

export default function ModalRegrasTimeCampeao({ onClose }: Props) {
  return (
    <Fut7DialogBase open title="Regras do Time Campeão" onClose={onClose} size="lg">
      <div className="space-y-3 text-sm leading-6 text-gray-200">
        <p className="mb-3">
          <strong>Confirmação de Presença:</strong> Aqui você, administrador, confirma se cada
          jogador realmente compareceu ao racha neste dia.
        </p>
        <p className="mb-3">
          Caso algum jogador <b>não tenha comparecido</b>, marque a opção "Jogador não compareceu ao
          racha". Isso impede que esse atleta receba os pontos, gols, assistências e qualquer
          estatística deste dia.
        </p>
        <p className="mb-3">
          Se um jogador foi substituído por outro, todos os gols ou assistências do substituto podem
          ser lançados normalmente no nome do titular ausente apenas para completar o resultado
          coletivo. <b>Mesmo assim, marque a ausência do titular</b> para que nada seja
          contabilizado para ele nos rankings individuais.
        </p>
        <p>
          <b>Lembre-se:</b> apenas os jogadores realmente titulares devem ter suas estatísticas
          validadas. Essa checagem é fundamental para a justiça do ranking do racha!
        </p>
      </div>
    </Fut7DialogBase>
  );
}

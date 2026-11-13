"use client";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

type Props = { onClose: () => void };

export default function ModalRegrasDestaques({ onClose }: Props) {
  return (
    <Fut7DialogBase open title="Time Campeão e Destaques do Dia" onClose={onClose} size="lg">
      <ul className="text-sm text-gray-200 space-y-2">
        <li>
          <span className="font-bold text-yellow-300">Time Campeão do Dia:</span>É o time que soma
          mais pontos na rodada: 3 pontos por vitória, 1 por empate e 0 por derrota.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Atacante do Dia:</span>
          Entre os atletas do Time Campeão que atuaram como atacantes, vence quem marcou mais gols.
          Em caso de empate, o sistema considera assistências e critérios internos de desempate.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Meia do Dia:</span>
          Entre os atletas do Time Campeão que atuaram como meias, vence quem deu mais assistências.
          Em caso de empate, o sistema considera gols e critérios internos de desempate.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Goleiro do Dia:</span>É o goleiro que integrou
          o Time Campeão do Dia.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Zagueiro do Dia:</span>É escolhido pelo
          administrador entre os jogadores que atuaram como zagueiros no Time Campeão. A escolha
          continua manual porque o Fut7Pro ainda não registra estatísticas defensivas.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Artilheiro do Dia:</span>
          Jogador de qualquer time com mais gols no dia.
        </li>
        <li>
          <span className="font-bold text-yellow-300">Maestro do Dia:</span>
          Jogador de qualquer time com mais assistências no dia.
        </li>
        <li>
          Quando o Sorteio Inteligente reposiciona um atleta, os destaques consideram a posição em
          que ele efetivamente atuou naquela rodada.
        </li>
        <li>
          Apenas atletas reais que participaram da rodada recebem títulos e destaques. Ausentes e
          BOTs não recebem crédito em rankings ou conquistas.
        </li>
      </ul>
    </Fut7DialogBase>
  );
}

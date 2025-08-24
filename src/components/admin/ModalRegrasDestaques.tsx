"use client";
type Props = { onClose: () => void };

export default function ModalRegrasDestaques({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="animate-in fade-in relative w-full max-w-lg rounded-2xl bg-zinc-900 p-8 shadow-2xl">
        <button
          className="absolute right-6 top-4 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h3 className="mb-3 text-center text-xl font-bold text-yellow-400">
          Regras dos Destaques do Dia
        </h3>
        <ul className="space-y-2 text-sm text-gray-200">
          <li>
            <span className="font-bold text-yellow-300">Atacante do Dia:</span>
            Atacante do <b>Time Campeão do Dia</b> que fizer mais gols. Em caso
            de empate, pega o primeiro listado.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Meia do Dia:</span>
            Meia do <b>Time Campeão do Dia</b> que der mais assistências.
            Empate: pega o primeiro listado.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Goleiro do Dia:</span>
            Goleiro do <b>Time Campeão do Dia</b>. Se faltou, marcar “Jogador
            não compareceu”.
          </li>
          <li>
            <span className="font-bold text-yellow-300">
              Time Campeão do Dia:
            </span>
            Time que somar mais pontos no dia (3 vitória, 1 empate, 0 derrota).
          </li>
          <li>
            <span className="font-bold text-yellow-300">
              Artilheiro do Dia:
            </span>
            Jogador (de qualquer time/posição) que fizer mais gols no dia.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Maestro do Dia:</span>
            Jogador (de qualquer time/posição) com mais assistências no dia.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Zagueiro do Dia:</span>
            Sempre escolhido manualmente entre os zagueiros do{" "}
            <b>Time Campeão do Dia</b> pois nenhum racha costuma contabilizar
            desarmes. Você pode perguntar ao time quem eles consideraram o
            melhor zagueiro. Use o select para definir.
          </li>
        </ul>
        <div className="mt-5 rounded border-l-4 border-yellow-400 bg-zinc-800 p-3 text-sm text-yellow-300">
          Todos os cards de destaque de posição do time campeão têm a opção
          “Jogador não compareceu ao racha”. Se o jogador faltou(O goleiro por
          exemplo), marque para não ele não aparecer injustamente no card de
          Melhor do Dia.
        </div>
      </div>
    </div>
  );
}

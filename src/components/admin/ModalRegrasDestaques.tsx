"use client";

type Props = { onClose: () => void };

export default function ModalRegrasDestaques({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in">
        <button
          className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          x
        </button>
        <h3 className="text-xl font-bold text-yellow-400 text-center mb-3">
          Regras dos Destaques do Dia
        </h3>
        <ul className="text-sm text-gray-200 space-y-2">
          <li>
            <span className="font-bold text-yellow-300">Time Campeao do Dia:</span>
            Somatoria de pontos nas partidas finalizadas (3 vitoria, 1 empate, 0 derrota).
          </li>
          <li>
            <span className="font-bold text-yellow-300">Atacante do Dia:</span>
            Atacante do Time Campeao do Dia com mais gols. Desempate: mais assistencias, depois a
            primeira ordem do sistema.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Meia do Dia:</span>
            Meia do Time Campeao do Dia com mais assistencias. Desempate: mais gols, depois a
            primeira ordem do sistema.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Goleiro do Dia:</span>
            Goleiro do Time Campeao do Dia.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Zagueiro do Dia:</span>
            Escolha manual entre os zagueiros do Time Campeao do Dia (o sistema nao calcula
            desarmes).
          </li>
          <li>
            <span className="font-bold text-yellow-300">Artilheiro do Dia:</span>
            Jogador de qualquer time com mais gols no dia.
          </li>
          <li>
            <span className="font-bold text-yellow-300">Maestro do Dia:</span>
            Jogador de qualquer time com mais assistencias no dia.
          </li>
        </ul>
        <div className="mt-5 p-3 rounded bg-zinc-800 border-l-4 border-yellow-400 text-yellow-300 text-sm">
          Nos cards de posicao do Time Campeao do Dia existe a opcao "Jogador nao compareceu ao
          racha". Ao marcar, o sistema exibe o BOT correspondente e nao contabiliza rankings ou
          estatisticas do dia.
        </div>
      </div>
    </div>
  );
}

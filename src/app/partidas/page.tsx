import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partidas | Fut7Pro",
  description: "Acompanhe as partidas e resultados mais recentes do seu racha no Fut7Pro.",
};

export default function PartidasPage() {
  return (
    <main className="min-h-screen bg-fundo text-white pt-4 px-4">
      <h1 className="sr-only">Partidas e Resultados do Racha de Futebol 7</h1>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6 text-center">
          Partidas
        </h2>

        <p className="text-center text-gray-300 max-w-xl mx-auto mb-8">
          Aqui você encontrará o histórico completo de jogos, resultados e destaques das rodadas.
        </p>

        <div className="text-center text-gray-500 border border-yellow-600 rounded-xl p-8">
          Nenhuma partida registrada até o momento. Aguarde novidades!
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grandes Torneios | Fut7Pro",
  description: "Veja os torneios mais importantes do Fut7Pro e os campeões de cada edição.",
};

export default function GrandesTorneiosPage() {
  return (
    <main className="min-h-screen bg-fundo text-white pt-4 px-4">
      <h1 className="sr-only">Grandes Torneios de Futebol 7 - Campeões e Históricos</h1>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6 text-center">
          Grandes Torneios
        </h2>

        <p className="text-center text-gray-300 max-w-xl mx-auto mb-8">
          Explore os torneios mais disputados do ano e descubra quem levou a taça!
        </p>

        <div className="text-center text-gray-500 border border-yellow-600 rounded-xl p-8">
          Nenhum torneio registrado ainda. Em breve, os campeões estarão aqui.
        </div>
      </div>
    </main>
  );
}

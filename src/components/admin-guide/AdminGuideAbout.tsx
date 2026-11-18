"use client";
export default function AdminGuideAbout({ onBack }: { onBack: () => void }) {
  return (
    <section className="space-y-4 text-white" aria-labelledby="guide-about-title">
      <h2 id="guide-about-title" className="text-xl font-bold">
        Como funciona o Guia Interativo?
      </h2>
      <p>
        O Guia Interativo Fut7Pro ajuda você a configurar sua pelada e conhecer as principais
        ferramentas do painel administrativo.
      </p>
      <p>Na primeira parte, você prepara as informações básicas do grupo em poucos minutos.</p>
      <p>
        Na segunda, quando já houver jogadores suficientes, aprende a avaliar os atletas, preparar
        partidas, registrar resultados e publicar conquistas.
      </p>
      <p>
        Você pode avançar no seu ritmo, interromper quando quiser e continuar depois. Seu progresso
        fica salvo.
      </p>
      <button
        autoFocus
        type="button"
        onClick={onBack}
        className="min-h-11 rounded-lg border border-yellow-400/40 px-4 py-2 text-yellow-200"
      >
        Voltar ao guia
      </button>
    </section>
  );
}

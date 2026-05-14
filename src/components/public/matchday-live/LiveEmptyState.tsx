export function LiveEmptyState() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#161616] p-8 text-center">
      <p className="text-lg font-semibold text-white">Rodada não iniciada</p>
      <p className="mt-2 text-sm text-neutral-300">
        Quando houver partidas do dia publicadas, o placar ao vivo aparece aqui.
      </p>
    </div>
  );
}

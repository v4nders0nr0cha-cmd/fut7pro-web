"use client";

type Props = {
  visivel: boolean;
  onToggle: (visivel: boolean) => void;
};

export default function ToggleVisibilidadePublica({ visivel, onToggle }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg mb-6 border border-neutral-700 shadow-sm">
      <span className="font-medium text-sm text-gray-300">Página pública:</span>
      <button
        type="button"
        className={`w-14 h-8 rounded-full relative transition ${visivel ? "bg-green-500" : "bg-gray-500"}`}
        onClick={() => onToggle(!visivel)}
        aria-pressed={visivel}
        aria-label="Alternar visibilidade pública"
      >
        <span
          className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition-transform shadow ${
            visivel ? "translate-x-6" : ""
          }`}
        />
      </button>
      <span className={`text-sm font-bold ml-2 ${visivel ? "text-green-400" : "text-red-400"}`}>
        {visivel ? "Visível no site público" : "Privado (oculto no site público)"}
      </span>
    </div>
  );
}

"use client";
interface Props {
  visivel: boolean;
  onToggle: () => void;
}
export default function ToggleVisibilidadePublica({
  visivel,
  onToggle,
}: Props) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-300">
        Exibir patrocinadores no site público?
      </span>
      <button
        className={`relative flex h-6 w-10 items-center rounded-full bg-gray-700 transition focus:outline-none ${visivel ? "bg-green-500" : "bg-gray-700"}`}
        aria-pressed={visivel}
        onClick={onToggle}
        title={visivel ? "Ocultar no site público" : "Exibir no site público"}
      >
        <span
          className={`absolute block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${visivel ? "translate-x-4" : "translate-x-0"}`}
        ></span>
      </button>
      <span
        className={`ml-2 text-xs font-bold ${visivel ? "text-green-400" : "text-gray-500"}`}
      >
        {visivel ? "Visível" : "Oculto"}
      </span>
    </div>
  );
}

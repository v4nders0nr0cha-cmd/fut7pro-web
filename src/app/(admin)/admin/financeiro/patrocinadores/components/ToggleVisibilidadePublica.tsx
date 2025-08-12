"use client";
interface Props {
  visivel: boolean;
  onToggle: () => void;
}
export default function ToggleVisibilidadePublica({ visivel, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-gray-300 font-semibold">
        Exibir patrocinadores no site público?
      </span>
      <button
        className={`w-10 h-6 rounded-full transition bg-gray-700 relative flex items-center focus:outline-none ${visivel ? "bg-green-500" : "bg-gray-700"}`}
        aria-pressed={visivel}
        onClick={onToggle}
        title={visivel ? "Ocultar no site público" : "Exibir no site público"}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow absolute transition-transform duration-200 ${visivel ? "translate-x-4" : "translate-x-0"}`}
        ></span>
      </button>
      <span className={`text-xs font-bold ml-2 ${visivel ? "text-green-400" : "text-gray-500"}`}>
        {visivel ? "Visível" : "Oculto"}
      </span>
    </div>
  );
}

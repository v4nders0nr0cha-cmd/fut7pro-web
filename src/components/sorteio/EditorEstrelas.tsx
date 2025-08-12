"use client";

interface Props {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean; // Para casos futuros, se quiser travar edição
}

export default function EditorEstrelas({ value, onChange, disabled = false }: Props) {
  return (
    <div className="flex items-center space-x-1 editor-estrelas">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-xl transition-colors
                        ${star <= value ? "text-yellow-400" : "text-gray-400"}
                        focus:outline-none focus:ring-2 focus:ring-yellow-400
                        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-110"}
                    `}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) onChange(star);
          }}
          aria-label={`Dar ${star} estrela${star > 1 ? "s" : ""}`}
          tabIndex={disabled ? -1 : 0}
          disabled={disabled}
        >
          {star <= value ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

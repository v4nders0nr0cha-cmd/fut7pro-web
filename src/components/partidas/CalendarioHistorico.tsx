"use client";
import { useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";

type Props = {
  diasComPartida: Date[];
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
};

export default function CalendarioHistorico({
  diasComPartida,
  selected,
  onSelect,
  open,
  onClose,
  anchorRef,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora do popup
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, anchorRef]);

  // Custom style para marcar os dias com partidas (borda verde)
  const estilosCustom = {
    diasComPartida: {
      border: "2px solid #43A047",
      borderRadius: "8px",
      background: "#212121",
      color: "#fff",
    },
    selected: {
      backgroundColor: "#FFCC00",
      color: "#121212",
      borderRadius: "8px",
    },
  };

  const modifiers = {
    diasComPartida,
    selected,
  };
  const modifiersStyles = {
    diasComPartida: estilosCustom.diasComPartida,
    selected: estilosCustom.selected,
  };

  if (!open) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 mt-2 left-0 right-0 md:left-auto md:right-auto bg-[#1c1c1c] rounded-2xl shadow-xl border border-yellow-500/40 p-2"
      style={{
        width: 340,
        maxWidth: "95vw",
        top: 60,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2028}
        className="bg-[#1c1c1c] rounded-2xl p-3"
        locale={ptBR} // <-- Agora em português!
      />
    </div>
  );
}

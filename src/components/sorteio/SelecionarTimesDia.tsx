"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const mockTimes = [
  { id: "1", nome: "Leões", logo: "/images/times/time_padrao_01.png" },
  { id: "2", nome: "Tigres", logo: "/images/times/time_padrao_02.png" },
  { id: "3", nome: "Águias", logo: "/images/times/time_padrao_03.png" },
  { id: "4", nome: "Furacão", logo: "/images/times/time_padrao_04.png" },
  { id: "5", nome: "Tubarão", logo: "/images/times/time_padrao_05.png" },
  { id: "6", nome: "Gaviões", logo: "/images/times/time_padrao_06.png" },
  { id: "7", nome: "Panteras", logo: "/images/times/time_padrao_07.png" },
  { id: "8", nome: "Corujas", logo: "/images/times/time_padrao_08.png" },
];

interface Props {
  timesSelecionados: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  maxTimes?: number;
  shake?: boolean; // NOVO: prop do pai para animar o aviso!
}

export default function SelecionarTimesDia({
  timesSelecionados,
  onChange,
  disabled = false,
  maxTimes = 4,
  shake = false,
}: Props) {
  const [verMais, setVerMais] = useState(false);

  const timesPrincipais = mockTimes.slice(0, 4);
  const timesExtras = mockTimes.slice(4);

  // Bloqueia acima do limite, libera só para desmarcar
  function toggleTime(id: string) {
    if (disabled) return;
    const jaSelecionado = timesSelecionados.includes(id);
    if (jaSelecionado) {
      onChange(timesSelecionados.filter((tid) => tid !== id));
    } else {
      if (timesSelecionados.length < maxTimes) {
        onChange([...timesSelecionados, id]);
      }
    }
  }

  const limiteExato = timesSelecionados.length === maxTimes;
  const limiteAtingido = timesSelecionados.length >= maxTimes;

  // Mensagem de aviso dinâmico
  const avisoTimes = !limiteExato
    ? `Selecione exatamente ${maxTimes} time${maxTimes > 1 ? "s" : ""} para o racha.`
    : `Pronto! Você selecionou todos os times necessários.`;

  // Estado interno para shake, sincroniza quando o pai muda a prop "shake"
  const [avisoShake, setAvisoShake] = useState(false);

  useEffect(() => {
    if (shake) {
      setAvisoShake(true);
      const timer = setTimeout(() => setAvisoShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const fadeClasses = disabled
    ? "opacity-60 blur-[2px] pointer-events-none select-none transition-all duration-300"
    : "transition-all duration-300";

  return (
    <div className={`bg-[#202020] rounded-xl p-4 mb-6 ${fadeClasses}`}>
      <h2 className="text-lg font-bold text-yellow-400 mb-2 text-center">
        Selecione os Times do Dia
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {timesPrincipais.map((time) => {
          const checked = timesSelecionados.includes(time.id);
          const podeMarcar = checked || !limiteAtingido;
          return (
            <button
              type="button"
              key={time.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all font-bold
                                ${
                                  checked
                                    ? "bg-yellow-100 border-yellow-400 text-black shadow-md"
                                    : !podeMarcar
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                                      : "bg-zinc-800 border-zinc-700 text-white opacity-80 hover:opacity-100"
                                }`}
              onClick={() => podeMarcar && toggleTime(time.id)}
              disabled={disabled || !podeMarcar}
              tabIndex={disabled ? -1 : 0}
            >
              <Image src={time.logo} alt={`Logo do ${time.nome}`} width={32} height={32} />
              {time.nome}
              {checked && <span className="ml-1 text-green-500 text-lg">✔</span>}
            </button>
          );
        })}
        {timesExtras.length > 0 && (
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-yellow-400 bg-zinc-800 text-yellow-400 font-bold"
            onClick={() => !disabled && setVerMais(true)}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            Ver mais times
          </button>
        )}
      </div>
      {/* Modal de times extras */}
      {verMais && !disabled && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#202020] rounded-xl p-6 shadow-2xl min-w-[320px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-yellow-400">Outros Times Cadastrados</h3>
              <button
                className="text-yellow-400 text-2xl font-bold hover:text-yellow-500 px-2"
                onClick={() => setVerMais(false)}
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mb-2">
              {timesExtras.map((time) => {
                const checked = timesSelecionados.includes(time.id);
                const podeMarcar = checked || !limiteAtingido;
                return (
                  <button
                    type="button"
                    key={time.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all font-bold
                                            ${
                                              checked
                                                ? "bg-yellow-100 border-yellow-400 text-black shadow-md"
                                                : !podeMarcar
                                                  ? "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                                                  : "bg-zinc-800 border-zinc-700 text-white opacity-80 hover:opacity-100"
                                            }`}
                    onClick={() => podeMarcar && toggleTime(time.id)}
                    disabled={disabled || !podeMarcar}
                  >
                    <Image src={time.logo} alt={`Logo do ${time.nome}`} width={28} height={28} />
                    {time.nome}
                    {checked && <span className="ml-1 text-green-500 text-lg">✔</span>}
                  </button>
                );
              })}
            </div>
            <button
              className="block mt-4 mx-auto bg-yellow-400 hover:bg-yellow-500 text-black rounded px-5 py-2 font-bold"
              onClick={() => setVerMais(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      <div
        className={`text-xs mt-2 text-center font-bold transition-all duration-200 
                    ${avisoShake ? "animate-shake" : ""} 
                    ${limiteExato ? "text-green-500" : "text-red-400"}
                `}
      >
        {avisoTimes}
      </div>
    </div>
  );
}

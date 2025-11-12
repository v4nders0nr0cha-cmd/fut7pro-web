"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { POSITION_OPTIONS, type PositionValue } from "@/constants/positions";
import { usePerfil } from "./PerfilContext";

const MAX_NAME_LENGTH = 10;

export default function ModalEditarPerfil({ onClose }: { onClose: () => void }) {
  const { usuario, atualizarPerfil } = usePerfil();
  const [nome, setNome] = useState(usuario.nome || "");
  const [apelido, setApelido] = useState(usuario.apelido || "");
  const [posicao, setPosicao] = useState<PositionValue | "">(toPositionValue(usuario.posicao));
  const [foto, setFoto] = useState(usuario.foto || "");
  const [novaFoto, setNovaFoto] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function handleFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Envie apenas imagens.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNovaFoto(ev.target?.result as string);
      setErro("");
    };
    reader.readAsDataURL(file);
  }

  function handleSalvar() {
    if (!nome.trim() || !apelido.trim()) {
      setErro("Nome e apelido sao obrigatorios.");
      return;
    }
    if (nome.length > MAX_NAME_LENGTH || apelido.length > MAX_NAME_LENGTH) {
      setErro(`Maximo ${MAX_NAME_LENGTH} caracteres para nome e apelido.`);
      return;
    }
    if (!posicao) {
      setErro("Selecione uma posicao.");
      return;
    }

    setErro("");
    atualizarPerfil({
      nome,
      apelido,
      posicao,
      foto: novaFoto || foto,
    });
    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md relative border-2 border-yellow-400 shadow-xl flex flex-col gap-4">
        <button
          className="absolute right-4 top-4 text-yellow-400 text-xl"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Editar perfil</h2>

        <div className="flex flex-col items-center mb-2 gap-2">
          <div className="relative">
            <Image
              src={novaFoto || foto || "/images/jogadores/jogador_padrao_01.jpg"}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-2 border-yellow-400 object-cover"
            />
            <label
              htmlFor="upload-foto"
              className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 cursor-pointer border-2 border-white shadow text-xs"
              title="Alterar foto"
            >
              <svg width={18} height={18} fill="black" viewBox="0 0 24 24">
                <path d="M12 5.9a6.1 6.1 0 1 0 0 12.2 6.1 6.1 0 0 0 0-12.2Zm0-2a8.1 8.1 0 1 1 0 16.2A8.1 8.1 0 0 1 12 3.9Zm3.6 8.2-4.7 4.7-2.1-2.1 1.4-1.4 0.7 0.7 3.3-3.3 1.4 1.4Z" />
              </svg>
              <input
                id="upload-foto"
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleFotoChange}
              />
            </label>
          </div>
          <span className="text-xs text-yellow-300">Clique no icone para alterar a foto</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-yellow-300">
            Nome (max. {MAX_NAME_LENGTH} letras)
            <input
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            />
          </label>
          <label className="text-sm text-yellow-300">
            Apelido (max. {MAX_NAME_LENGTH} letras)
            <input
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={apelido}
              onChange={(event) => setApelido(event.target.value)}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            />
          </label>
          <label className="text-sm text-yellow-300">
            Posicao
            <select
              value={posicao}
              onChange={(event) => setPosicao(event.target.value as PositionValue | "")}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            >
              <option value="">Selecione</option>
              {POSITION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {erro && <div className="text-red-400 text-sm mt-2">{erro}</div>}
        {sucesso && (
          <div className="text-green-400 text-center text-sm font-bold">Dados salvos!</div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-zinc-700 text-yellow-200 rounded hover:bg-zinc-800"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400"
            onClick={handleSalvar}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function toPositionValue(value: string | null | undefined): PositionValue | "" {
  const normalized = (value ?? "").toLowerCase().trim();
  if (
    normalized === "goleiro" ||
    normalized === "zagueiro" ||
    normalized === "meia" ||
    normalized === "atacante"
  ) {
    return normalized;
  }
  return "";
}

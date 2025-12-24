"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { usePerfil } from "./PerfilContext";
import type { PosicaoAtleta } from "@/types/atletas";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function ModalEditarPerfil({ onClose }: { onClose: () => void }) {
  const { usuario, atualizarPerfil } = usePerfil();
  const [nome, setNome] = useState(usuario?.nome || "");
  const [apelido, setApelido] = useState(usuario?.apelido || "");
  const [posicao, setPosicao] = useState<PosicaoAtleta | "">(usuario?.posicao || "");
  const [fotoPreview, setFotoPreview] = useState(usuario?.foto || DEFAULT_AVATAR);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome || "");
    setApelido(usuario.apelido || "");
    setPosicao(usuario.posicao || "");
    setFotoPreview(usuario.foto || DEFAULT_AVATAR);
    setFotoFile(null);
  }, [usuario]);

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErro("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setErro("Envie uma imagem com ate 2MB.");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoPreview(String(ev.target?.result || DEFAULT_AVATAR));
      setErro("");
    };
    reader.onerror = () => setErro("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  };

  async function handleSalvar() {
    if (!usuario) return;
    const trimmedNome = nome.trim();
    const trimmedApelido = apelido.trim();

    if (!trimmedNome) {
      setErro("Informe o nome.");
      return;
    }
    if (trimmedNome.split(" ").length > 1) {
      setErro("Use apenas o primeiro nome.");
      return;
    }
    if (trimmedNome.length > 10) {
      setErro("Maximo de 10 caracteres.");
      return;
    }
    if (trimmedApelido.length > 10) {
      setErro("Apelido com maximo de 10 caracteres.");
      return;
    }
    const posicaoSelecionada = (posicao || usuario.posicao) as PosicaoAtleta;
    if (!posicaoSelecionada) {
      setErro("Selecione a posicao.");
      return;
    }

    setErro("");
    try {
      setSalvando(true);
      await atualizarPerfil({
        firstName: trimmedNome,
        nickname: trimmedApelido,
        position: posicaoSelecionada,
        avatarFile: fotoFile ?? undefined,
      });
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        onClose();
      }, 800);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar perfil.";
      setErro(message);
    } finally {
      setSalvando(false);
    }
  }

  if (!usuario) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md relative border-2 border-yellow-400 shadow-xl flex flex-col gap-4">
        <button
          className="absolute right-4 top-4 text-yellow-400 text-xl"
          onClick={onClose}
          aria-label="Fechar"
          disabled={salvando}
        >
          X
        </button>
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Editar Perfil</h2>

        <div className="flex flex-col items-center mb-2 gap-2">
          <div className="relative">
            <Image
              src={fotoPreview || DEFAULT_AVATAR}
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
                accept={ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={handleFotoChange}
                disabled={salvando}
              />
            </label>
          </div>
          <span className="text-xs text-yellow-300">Clique no icone para alterar a foto</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-yellow-300">
            Nome (max. 10 letras)
            <input
              type="text"
              maxLength={10}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={salvando}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            />
          </label>
          <label className="text-sm text-yellow-300">
            Apelido (max. 10 letras)
            <input
              type="text"
              maxLength={10}
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              disabled={salvando}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            />
          </label>
          <label className="text-sm text-yellow-300">
            Posicao
            <select
              value={posicao}
              onChange={(e) => setPosicao(e.target.value as PosicaoAtleta | "")}
              disabled={salvando}
              className="w-full mt-1 px-2 py-1 rounded bg-zinc-800 border border-yellow-400 text-white"
            >
              <option value="">Selecione</option>
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
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
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";
import type { Jogador, PosicaoJogador } from "@/types/jogador";
import ImageCropperModal from "@/components/ImageCropperModal";

const POSICOES: { label: string; value: PosicaoJogador }[] = [
  { label: "Atacante", value: "atacante" },
  { label: "Meia", value: "meia" },
  { label: "Zagueiro", value: "zagueiro" },
  { label: "Goleiro", value: "goleiro" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function JogadorForm({
  jogador,
  onCancel,
  onSave,
  isLoading,
}: {
  jogador?: Jogador;
  onCancel?: () => void;
  onSave?: (jogador: Partial<Jogador>, fotoFile?: File | null) => void;
  isLoading?: boolean;
}) {
  const [form, setForm] = useState<Partial<Jogador>>(
    jogador || {
      id: "",
      nome: "",
      apelido: "",
      foto: "",
      status: "Ativo",
      mensalista: false,
      posicao: "atacante",
      posicaoSecundaria: null,
    }
  );
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(
    jogador?.foto || jogador?.photoUrl || jogador?.avatar || ""
  );
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function dataUrlToFile(dataUrl: string) {
    const [header, base64Data] = dataUrl.split(",");
    if (!base64Data) {
      throw new Error("Imagem invalida.");
    }
    const match = header?.match(/data:(.*);base64/);
    const mime = match?.[1] || "image/jpeg";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    if (blob.size > MAX_AVATAR_SIZE) {
      throw new Error("A imagem recortada ficou grande demais.");
    }
    const ext = mime.split("/")[1] || "jpg";
    return new File([blob], `avatar-${Date.now()}.${ext}`, { type: mime });
  }

  useEffect(() => {
    if (jogador) {
      setForm(jogador);
      setFotoPreview(jogador.foto || jogador.photoUrl || jogador.avatar || "");
    } else {
      setForm({
        id: "",
        nome: "",
        apelido: "",
        foto: "",
        status: "Ativo",
        mensalista: false,
        posicao: "atacante",
        posicaoSecundaria: null,
      });
      setFotoPreview("");
      setFotoFile(null);
    }
    setCropImage(null);
  }, [jogador]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Envie uma imagem com ate 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropImage(String(reader.result));
    reader.onerror = () => toast.error("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  }

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const posicaoPrimaria = String(form.posicao || "").toLowerCase();
    const posicaoSec = String(form.posicaoSecundaria || "").toLowerCase();
    if (posicaoSec && posicaoPrimaria === posicaoSec) {
      toast.error("Posicao secundaria nao pode ser igual a principal.");
      return;
    }
    if (onSave) onSave(form, fotoFile);
  }

  async function handleCropApply(cropped: string) {
    try {
      const file = dataUrlToFile(cropped);
      setFotoFile(file);
      setFotoPreview(cropped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao preparar a imagem.";
      toast.error(message);
    } finally {
      setCropImage(null);
    }
  }

  const hasPreview = !!fotoPreview && fotoPreview !== "null" && fotoPreview !== "undefined";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[#191919] rounded-xl shadow-lg p-4 border border-[#232323] max-w-xl"
    >
      <div className="flex gap-4">
        <div
          onClick={handleFotoClick}
          className="w-20 h-20 bg-[#222] rounded-lg border-2 border-dashed border-yellow-600 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition"
          title="Clique para selecionar uma foto"
        >
          {hasPreview ? (
            <img
              src={fotoPreview}
              alt="Preview foto"
              className="object-cover w-full h-full rounded-lg"
              onError={() => setFotoPreview("")}
            />
          ) : (
            <span className="text-gray-400 text-sm text-center px-2">+ Foto</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Nome</label>
            <input
              name="nome"
              value={form.nome || ""}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={20}
              required
            />
          </div>
          <div>
            <label className="block font-medium text-yellow-500 mb-1">Apelido</label>
            <input
              name="apelido"
              value={form.apelido || ""}
              onChange={handleChange}
              className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
              maxLength={15}
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-yellow-500 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium text-yellow-500 mb-1">Posição</label>
          <select
            name="posicao"
            value={form.posicao}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            {POSICOES.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 font-medium text-yellow-500 cursor-pointer mb-1">
            <input
              name="mensalista"
              type="checkbox"
              checked={!!form.mensalista}
              onChange={handleChange}
              className="accent-yellow-500"
            />
            Mensalista
          </label>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-yellow-500 mb-1">Posicao secundaria</label>
          <select
            name="posicaoSecundaria"
            value={form.posicaoSecundaria ?? ""}
            onChange={handleChange}
            className="border border-[#333] bg-[#111] text-white px-3 py-2 rounded w-full focus:outline-none focus:border-yellow-500"
          >
            <option value="">Nenhuma</option>
            {POSICOES.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`font-bold py-2 rounded transition shadow flex-1 ${
            isLoading
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
          }`}
        >
          {isLoading ? "Salvando..." : form.id ? "Salvar Alteracoes" : "Cadastrar Jogador"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600 transition shadow flex-1"
          >
            Cancelar
          </button>
        )}
      </div>

      <ImageCropperModal
        open={!!cropImage}
        imageSrc={cropImage || ""}
        aspect={1}
        shape="round"
        title="Ajustar foto do jogador"
        onCancel={() => setCropImage(null)}
        onApply={handleCropApply}
      />
    </form>
  );
}

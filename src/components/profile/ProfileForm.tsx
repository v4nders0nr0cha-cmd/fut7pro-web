"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "react-hot-toast";
import ImageCropperModal from "@/components/ImageCropperModal";

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
type Posicao = (typeof POSICOES)[number] | "";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export type ProfileFormValues = {
  firstName: string;
  nickname: string;
  position: Posicao;
  positionSecondary?: Posicao | null;
  avatarUrl?: string | null;
};

type ProfileFormProps = {
  initialValues: ProfileFormValues;
  email?: string | null;
  saving?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: ProfileFormValues & { avatarFile?: File | null }) => Promise<void>;
};

export default function ProfileForm({
  initialValues,
  email,
  saving = false,
  submitLabel = "Salvar",
  onCancel,
  onSubmit,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [position, setPosition] = useState<Posicao>(initialValues.position);
  const [positionSecondary, setPositionSecondary] = useState<Posicao | "">(
    initialValues.positionSecondary ?? ""
  );
  const [avatarPreview, setAvatarPreview] = useState<string>(
    initialValues.avatarUrl || DEFAULT_AVATAR
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

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
    setFirstName(initialValues.firstName);
    setNickname(initialValues.nickname);
    setPosition(initialValues.position);
    setPositionSecondary(initialValues.positionSecondary ?? "");
    setAvatarPreview(initialValues.avatarUrl || DEFAULT_AVATAR);
    setAvatarFile(null);
  }, [initialValues]);

  function validateForm(): string | null {
    const trimmed = firstName.trim();
    if (!trimmed) return "Informe o primeiro nome.";
    if (trimmed.split(" ").length > 1) return "Use apenas o primeiro nome.";
    if (trimmed.length > 10) return "Maximo de 10 caracteres.";
    if (nickname.trim().length > 10) return "Apelido com maximo de 10 caracteres.";
    if (!position) return "Selecione a posicao.";
    if (positionSecondary && positionSecondary === position) {
      return "Posicao secundaria nao pode ser igual a principal.";
    }
    return null;
  }

  function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
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

  async function handleCropApply(cropped: string) {
    try {
      const file = dataUrlToFile(cropped);
      setAvatarFile(file);
      setAvatarPreview(cropped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao preparar a imagem.";
      toast.error(message);
    } finally {
      setCropImage(null);
    }
  }

  async function handleSubmit() {
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }
    setFormError("");
    await onSubmit({
      firstName: firstName.trim(),
      nickname: nickname.trim(),
      position,
      positionSecondary: positionSecondary || null,
      avatarUrl: initialValues.avatarUrl ?? null,
      avatarFile,
    });
  }

  return (
    <div className="bg-[#181818] border border-[#292929] rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={avatarPreview || DEFAULT_AVATAR}
            alt="Avatar do perfil"
            width={120}
            height={120}
            className="rounded-full border-2 border-yellow-400 object-cover"
            onError={() => setAvatarPreview(DEFAULT_AVATAR)}
          />
          <label className="absolute -bottom-2 right-0 cursor-pointer rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-bold text-black shadow">
            Alterar foto
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={saving}
            />
          </label>
        </div>

        <div className="flex-1 w-full">
          {email && (
            <p className="text-sm text-zinc-400 mb-2">
              Email: <span className="text-zinc-200">{email}</span>
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Nome *
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={10}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Apelido
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={10}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Posicao *
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Posicao)}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              >
                <option value="">Selecione</option>
                {POSICOES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Posicao secundaria
              <select
                value={positionSecondary}
                onChange={(e) => setPositionSecondary(e.target.value as Posicao | "")}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              >
                <option value="">Nenhuma</option>
                {POSICOES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {formError && (
        <div className="mt-4 rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-sm text-red-200">
          {formError}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
        >
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>

      <ImageCropperModal
        open={!!cropImage}
        imageSrc={cropImage || ""}
        aspect={1}
        shape="round"
        title="Ajustar foto do perfil"
        onCancel={() => setCropImage(null)}
        onApply={handleCropApply}
      />
    </div>
  );
}

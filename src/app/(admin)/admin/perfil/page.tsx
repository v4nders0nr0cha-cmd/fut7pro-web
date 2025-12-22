"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import ImageCropperModal from "@/components/ImageCropperModal";
import { useAboutAdmin } from "@/hooks/useAbout";
import type { AboutData } from "@/types/about";

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
type Posicao = (typeof POSICOES)[number] | "";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

function resolvePosicao(value?: string | null): Posicao {
  if (!value) return "";
  return POSICOES.includes(value as (typeof POSICOES)[number]) ? (value as Posicao) : "";
}

export default function PerfilAdmin() {
  const { data: session } = useSession();
  const { about, update, isLoading } = useAboutAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [posicao, setPosicao] = useState<Posicao>("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [cropImage, setCropImage] = useState<string | null>(null);

  const profileFromSource = useMemo(() => {
    const presidente = typeof about === "object" && about ? about.presidente : undefined;
    const sessionUser = session?.user as
      | { name?: string | null; email?: string | null }
      | undefined;

    return {
      nome: presidente?.nome || sessionUser?.name || "",
      apelido: presidente?.apelido || "",
      posicao: resolvePosicao(presidente?.posicao),
      email: presidente?.email || sessionUser?.email || "",
      avatarUrl: presidente?.avatarUrl || "",
    };
  }, [about, session?.user]);

  useEffect(() => {
    if (isEditing) return;
    setNome(profileFromSource.nome);
    setApelido(profileFromSource.apelido);
    setPosicao(profileFromSource.posicao);
    setEmail(profileFromSource.email);
    setAvatarUrl(profileFromSource.avatarUrl || DEFAULT_AVATAR);
  }, [profileFromSource, isEditing]);

  const disableActions = isLoading || saving;

  function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      toast.error("Envie uma imagem PNG ou JPG de ate 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropImage(String(reader.result));
    reader.onerror = () => toast.error("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  }

  function validateForm(): string | null {
    const trimmed = nome.trim();
    if (!trimmed) return "Informe o primeiro nome.";
    if (trimmed.split(" ").length > 1) return "Use apenas o primeiro nome.";
    if (trimmed.length > 10) return "Maximo de 10 caracteres.";
    if (apelido.trim().length > 10) return "Apelido com maximo de 10 caracteres.";
    if (!posicao) return "Selecione a posicao.";
    return null;
  }

  async function handleSave() {
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const baseAbout: AboutData = typeof about === "object" && about ? { ...about } : {};
      const nextAvatar = avatarUrl && avatarUrl !== DEFAULT_AVATAR ? avatarUrl : null;

      const next: AboutData = {
        ...baseAbout,
        presidente: {
          ...(baseAbout.presidente || {}),
          nome: nome.trim(),
          apelido: apelido.trim() || null,
          posicao,
          avatarUrl: nextAvatar,
          email: email.trim() || undefined,
        },
      };

      await update(next);
      toast.success("Perfil atualizado.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setFormError("");
    setNome(profileFromSource.nome);
    setApelido(profileFromSource.apelido);
    setPosicao(profileFromSource.posicao);
    setEmail(profileFromSource.email);
    setAvatarUrl(profileFromSource.avatarUrl || DEFAULT_AVATAR);
  }

  const displayName = nome || profileFromSource.nome || "Administrador";
  const displayEmail = email || profileFromSource.email || "email@nao-informado";
  const displayAvatar = avatarUrl || DEFAULT_AVATAR;

  return (
    <>
      <Head>
        <title>Perfil do Administrador | Fut7Pro Admin</title>
        <meta name="description" content="Gerencie seu perfil administrativo no painel Fut7Pro." />
        <meta name="keywords" content="fut7, perfil admin, administracao, painel, saas" />
      </Head>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">Perfil do Administrador</h1>

        <div className="bg-[#181818] border border-[#292929] rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={displayAvatar}
                alt={`Avatar do administrador ${displayName}`}
                width={120}
                height={120}
                className="rounded-full border-2 border-yellow-400 object-cover"
              />
              {isEditing && (
                <label className="absolute -bottom-2 right-0 cursor-pointer rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-bold text-black shadow">
                  Alterar foto
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={disableActions}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-white">{displayName}</h2>
              <span className="inline-block bg-yellow-400 text-black rounded px-3 py-1 font-bold text-sm mt-1">
                Presidente
              </span>
              <p className="mt-2 text-zinc-300">{displayEmail}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Perfil publico do presidente exibido no site do racha.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Nome *
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={10}
                disabled={!isEditing || disableActions}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Apelido
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                maxLength={10}
                disabled={!isEditing || disableActions}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Posicao *
              <select
                value={posicao}
                onChange={(e) => setPosicao(e.target.value as Posicao)}
                disabled={!isEditing || disableActions}
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
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing || disableActions}
                className="mt-2 w-full rounded-lg bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              />
            </label>
          </div>
        </div>

        {formError && (
          <div className="mt-4 rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-sm text-red-200">
            {formError}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={disableActions}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={disableActions}
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar perfil"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={disableActions}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              Editar perfil
            </button>
          )}
        </div>
      </section>

      <ImageCropperModal
        open={!!cropImage}
        imageSrc={cropImage || ""}
        aspect={1}
        shape="round"
        title="Ajustar foto do presidente"
        onCancel={() => setCropImage(null)}
        onApply={(cropped) => {
          setAvatarUrl(cropped);
          setCropImage(null);
        }}
      />
    </>
  );
}

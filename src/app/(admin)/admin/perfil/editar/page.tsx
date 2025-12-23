"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ProfileForm, { type ProfileFormValues } from "@/components/profile/ProfileForm";
import { useMe } from "@/hooks/useMe";

const POSITION_MAP: Record<string, ProfileFormValues["position"]> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

function normalizePosition(value?: string | null): ProfileFormValues["position"] {
  if (!value) return "";
  const normalized = value.toLowerCase();
  return POSITION_MAP[normalized] ?? (value as ProfileFormValues["position"]);
}

export default function EditarPerfilPage() {
  const router = useRouter();
  const { me, isLoading, isError, mutate } = useMe();
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 text-zinc-200">
        Carregando perfil...
      </section>
    );
  }

  if (isError || !me?.athlete || !me.tenant?.tenantId) {
    return (
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <div className="rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-sm text-red-200">
          Nao foi possivel carregar o perfil. Recarregue a pagina ou faca login novamente.
        </div>
      </section>
    );
  }

  const initialValues: ProfileFormValues = {
    firstName: me.athlete.firstName || "",
    nickname: me.athlete.nickname || "",
    position: normalizePosition(me.athlete.position),
    avatarUrl: me.athlete.avatarUrl || null,
  };

  async function handleSubmit(values: ProfileFormValues & { avatarFile?: File | null }) {
    try {
      setSaving(true);
      let avatarUrl: string | null | undefined = undefined;

      if (values.avatarFile) {
        const formData = new FormData();
        formData.append("file", values.avatarFile);
        const uploadRes = await fetch("/api/uploads/avatar", {
          method: "POST",
          body: formData,
        });
        const uploadBody = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadBody?.message || uploadBody?.error || "Erro ao enviar imagem.");
        }
        avatarUrl = uploadBody.url;
      }

      const payload: Record<string, unknown> = {
        firstName: values.firstName.trim(),
        nickname: values.nickname.trim(),
        position: values.position,
      };
      if (typeof avatarUrl !== "undefined") {
        payload.avatarUrl = avatarUrl;
      }

      const res = await fetch(`/api/tenants/${me.tenant.tenantId}/athletes/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message || "Erro ao salvar perfil.");
      }

      await mutate();
      toast.success("Perfil atualizado.");
      router.push("/admin/perfil");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar perfil.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Editar Perfil | Fut7Pro Admin</title>
        <meta name="description" content="Edite seu perfil administrativo no painel Fut7Pro." />
      </Head>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">Editar Perfil</h1>

        <ProfileForm
          initialValues={initialValues}
          email={me.user.email}
          saving={saving}
          submitLabel="Salvar perfil"
          onCancel={() => router.push("/admin/perfil")}
          onSubmit={handleSubmit}
        />
      </section>
    </>
  );
}

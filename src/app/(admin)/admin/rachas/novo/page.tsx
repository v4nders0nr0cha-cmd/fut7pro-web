"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import RachaForm from "@/components/admin/RachaForm";
import { rachaApi } from "@/lib/api";
import type { Racha } from "@/types/racha";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

export default function NovoRachaPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const { update } = useSession();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      router.replace("/admin");
    }
  }, [user?.tenantId, router]);

  const handleSave = async (dados: Partial<Racha>) => {
    if (isSaving || user?.tenantId) return;
    setIsSaving(true);

    try {
      const response = await rachaApi.create(dados);

      if (response.error || !response.data) {
        const hasSlugConflict =
          typeof response.error === "string" && /409|conflict/i.test(response.error);
        notify({
          message: hasSlugConflict
            ? "Slug já está em uso."
            : response.error || "Não foi possível cadastrar o racha.",
          type: "error",
        });
        return;
      }

      notify({ message: "Racha cadastrado com sucesso!", type: "success" });

      try {
        if (typeof update === "function") {
          await update();
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Falha ao atualizar sessão após criação do racha", error);
        }
      }

      router.replace("/admin");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Erro ao cadastrar racha", error);
      }
      notify({ message: "Erro inesperado ao criar o racha.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-20 pb-12 px-4">
      <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white border border-[#2c2c2c]">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Cadastre seu Racha</h1>
        <p className="text-sm text-gray-300 mb-6">
          Preencha as informações abaixo para finalizar o onboarding e liberar todas as
          funcionalidades do painel.
        </p>

        {isSaving && (
          <p className="text-sm text-gray-400 mb-4">Salvando racha... aguarde um instante.</p>
        )}

        <RachaForm onSave={handleSave} />
      </div>
    </div>
  );
}

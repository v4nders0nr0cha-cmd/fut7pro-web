"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AtualizarPerfilPayload, PerfilUsuario } from "@/types/perfil";
import { adaptPerfilResponse, usePerfilAdmin } from "@/hooks/usePerfilAdmin";
import type { PerfilResponseRaw } from "@/types/perfil";

interface PerfilContextType {
  usuario: PerfilUsuario | null;
  isLoading: boolean;
  error: string | null;
  atualizarPerfil: (dados: AtualizarPerfilPayload) => Promise<void>;
}

const PerfilContext = createContext<PerfilContextType | null>(null);

export function usePerfil() {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error("usePerfil deve ser usado dentro de um PerfilProvider");
  }
  return context;
}

export function PerfilProvider({ children }: { children: ReactNode }) {
  const { perfil, isLoading, error, mutate, isValidating } = usePerfilAdmin();
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(perfil);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (perfil) {
      setUsuario(perfil);
    }
  }, [perfil]);

  async function atualizarPerfil(dados: AtualizarPerfilPayload) {
    const formData = new FormData();
    if (typeof dados.nome === "string") {
      formData.append("nome", dados.nome);
    }
    const nickname = typeof dados.nickname === "string" ? dados.nickname : null;
    if (nickname) {
      formData.append("nickname", nickname);
    }
    if (typeof dados.posicao === "string") {
      formData.append("posicao", dados.posicao);
    }
    if (dados.removerFoto) {
      formData.append("removerFoto", "true");
    }
    if (dados.fotoFile) {
      formData.append("foto", dados.fotoFile);
    }

    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/admin/atletas/me", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          (payload && typeof payload.message === "string" && payload.message) ||
          "Falha ao atualizar perfil";
        throw new Error(message);
      }

      const updatedRaw = (await response.json()) as PerfilResponseRaw;
      const adapted = adaptPerfilResponse(updatedRaw);
      setUsuario(adapted);
      await mutate(adapted, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao salvar perfil";
      setSaveError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  const contextValue = useMemo<PerfilContextType>(
    () => ({
      usuario,
      isLoading: isLoading || isValidating || saving,
      error: error ?? saveError,
      atualizarPerfil,
    }),
    [usuario, isLoading, isValidating, saving, error, saveError]
  );

  return <PerfilContext.Provider value={contextValue}>{children}</PerfilContext.Provider>;
}

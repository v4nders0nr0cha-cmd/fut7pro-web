// src/hooks/useMembership.ts
import { useState, useCallback } from "react";
import { useTenant } from "./useTenant";
import { membershipApi } from "@/lib/api";
import { InviteUserData, UpdateMembershipData, Membership } from "@/types/tenant";
import { toast } from "react-hot-toast";

export function useMembership() {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUser = useCallback(
    async (data: InviteUserData) => {
      if (!tenant?.slug) {
        setError("Nenhum tenant selecionado");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await membershipApi.invite(tenant.slug, data);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("Convite enviado com sucesso!");
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao enviar convite";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenant?.slug]
  );

  const approveMembership = useCallback(
    async (membershipId: string) => {
      if (!tenant?.slug) {
        setError("Nenhum tenant selecionado");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await membershipApi.approve(tenant.slug, membershipId);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("Membership aprovado com sucesso!");
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao aprovar membership";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenant?.slug]
  );

  const suspendMembership = useCallback(
    async (membershipId: string) => {
      if (!tenant?.slug) {
        setError("Nenhum tenant selecionado");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await membershipApi.suspend(tenant.slug, membershipId);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("Membership suspenso com sucesso!");
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao suspender membership";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenant?.slug]
  );

  const removeMembership = useCallback(
    async (membershipId: string) => {
      if (!tenant?.slug) {
        setError("Nenhum tenant selecionado");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await membershipApi.delete(tenant.slug, membershipId);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("Membership removido com sucesso!");
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao remover membership";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenant?.slug]
  );

  const updateMembership = useCallback(
    async (membershipId: string, data: UpdateMembershipData) => {
      if (!tenant?.slug) {
        setError("Nenhum tenant selecionado");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await membershipApi.update(tenant.slug, membershipId, data);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("Membership atualizado com sucesso!");
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar membership";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenant?.slug]
  );

  return {
    loading,
    error,
    inviteUser,
    approveMembership,
    suspendMembership,
    removeMembership,
    updateMembership,
  };
}

// src/components/tenant/MembershipList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { membershipApi } from "@/lib/api";
import { Membership } from "@/types/tenant";
import { toast } from "react-hot-toast";

interface MembershipListProps {
  showPendingOnly?: boolean;
  onMembershipUpdate?: () => void;
}

export function MembershipList({
  showPendingOnly = false,
  onMembershipUpdate,
}: MembershipListProps) {
  const { tenant } = useTenant();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = useCallback(async () => {
    if (!tenant?.slug) return;

    try {
      setLoading(true);
      setError(null);

      const response = showPendingOnly
        ? await membershipApi.getPending(tenant.slug)
        : await membershipApi.getAll(tenant.slug);

      if (response.error) {
        throw new Error(response.error);
      }

      setMemberships(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar membros";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tenant?.slug, showPendingOnly]);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  const handleApprove = async (membershipId: string) => {
    try {
      await membershipApi.approve(tenant!.slug, membershipId);
      toast.success("Membro aprovado com sucesso!");
      loadMemberships();
      onMembershipUpdate?.();
    } catch (err) {
      toast.error("Erro ao aprovar membro");
    }
  };

  const handleSuspend = async (membershipId: string) => {
    try {
      await membershipApi.suspend(tenant!.slug, membershipId);
      toast.success("Membro suspenso com sucesso!");
      loadMemberships();
      onMembershipUpdate?.();
    } catch (err) {
      toast.error("Erro ao suspender membro");
    }
  };

  const handleRemove = async (membershipId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    try {
      await membershipApi.delete(tenant!.slug, membershipId);
      toast.success("Membro removido com sucesso!");
      loadMemberships();
      onMembershipUpdate?.();
    } catch (err) {
      toast.error("Erro ao remover membro");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadMemberships}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          {showPendingOnly ? "Nenhum membro pendente" : "Nenhum membro encontrado"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memberships.map((membership) => (
        <div
          key={membership.id}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {membership.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{membership.user.name}</h3>
                <p className="text-gray-300 text-sm">{membership.user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      membership.status === "APROVADO"
                        ? "bg-green-500/20 text-green-400"
                        : membership.status === "PENDENTE"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {membership.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      membership.role === "ADMIN"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {membership.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {membership.status === "PENDENTE" && (
                <button
                  onClick={() => handleApprove(membership.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Aprovar
                </button>
              )}

              {membership.status === "APROVADO" && (
                <button
                  onClick={() => handleSuspend(membership.id)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Suspender
                </button>
              )}

              <button
                onClick={() => handleRemove(membership.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

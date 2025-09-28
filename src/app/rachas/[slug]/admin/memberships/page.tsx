// src/app/rachas/[slug]/admin/memberships/page.tsx
"use client";

import { TenantLayout } from "@/components/tenant/TenantLayout";
import { MembershipList } from "@/components/tenant/MembershipList";
import { InviteUserModal } from "@/components/tenant/InviteUserModal";
import { useState } from "react";
import { useTenant } from "@/hooks/useTenant";

interface MembershipsPageProps {
  params: {
    slug: string;
  };
}

export default function MembershipsPage({ params }: MembershipsPageProps) {
  const { isAdmin } = useTenant();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  if (!isAdmin) {
    return (
      <TenantLayout requireAuth={true} requireAdmin={true}>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você não tem permissão para acessar esta página.</p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout requireAuth={true} requireAdmin={true}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gerenciar Membros</h1>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Convidar Usuário
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="border-b border-white/20 p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Todos os Membros
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>

          <div className="p-6">
            <MembershipList
              showPendingOnly={activeTab === 'pending'}
              onMembershipUpdate={() => {
                // Recarregar lista se necessário
              }}
            />
          </div>
        </div>

        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            // Recarregar lista
            window.location.reload();
          }}
        />
      </div>
    </TenantLayout>
  );
}

"use client";

import { useState } from "react";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { MembershipList } from "@/components/tenant/MembershipList";
import { InviteUserModal } from "@/components/tenant/InviteUserModal";

const tabs = [
  { key: "pending" as const, label: "Pendentes" },
  { key: "all" as const, label: "Todos" },
];

export default function AdminSolicitacoesPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("pending");
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <TenantLayout requireAuth={true} requireAdmin={true}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Solicitacoes de Jogadores</h1>
            <p className="text-gray-400 text-sm">
              Aprove, suspenda ou convide atletas para o seu racha em poucos cliques.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Convidar atleta
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="border-b border-white/20 p-4">
            <div className="flex space-x-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <MembershipList
              showPendingOnly={activeTab === "pending"}
              onMembershipUpdate={() => {
                // no-op; membership list handles reload internally
              }}
            />
          </div>
        </div>
      </div>

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          window.location.reload();
        }}
      />
    </TenantLayout>
  );
}

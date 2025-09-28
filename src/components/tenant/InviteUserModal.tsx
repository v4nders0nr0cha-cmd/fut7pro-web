// src/components/tenant/InviteUserModal.tsx
"use client";

import { useState } from "react";
import { useMembership } from "@/hooks/useMembership";
import { InviteUserData } from "@/types/tenant";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { inviteUser, loading } = useMembership();
  const [formData, setFormData] = useState<InviteUserData>({
    email: "",
    role: "ATLETA",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await inviteUser(formData);
      setFormData({ email: "", role: "ATLETA" });
      onClose();
      onSuccess?.();
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleClose = () => {
    setFormData({ email: "", role: "ATLETA" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Convidar Usuário</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
              Função
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as "ATLETA" | "ADMIN" }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ATLETA">Atleta</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Convidar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

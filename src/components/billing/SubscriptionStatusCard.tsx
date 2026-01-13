"use client";

import { useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaPause, FaTimes } from "react-icons/fa";
import type { Subscription, SubscriptionStatus } from "@/lib/api/billing";

interface SubscriptionStatusCardProps {
  subscription: Subscription;
  status: SubscriptionStatus | null;
  onRefresh: () => void;
  planLabel?: string;
}

export default function SubscriptionStatusCard({
  subscription,
  status,
  onRefresh,
  planLabel,
}: SubscriptionStatusCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getStatusIcon = () => {
    if (subscription.status === "active") return <FaCheckCircle className="text-green-500" />;
    if (subscription.status === "trialing") return <FaClock className="text-blue-500" />;
    if (subscription.status === "past_due")
      return <FaExclamationTriangle className="text-yellow-500" />;
    if (subscription.status === "paused") return <FaPause className="text-orange-500" />;
    if (subscription.status === "canceled" || subscription.status === "expired")
      return <FaTimes className="text-red-500" />;
    return <FaClock className="text-gray-500" />;
  };

  const getStatusText = () => {
    if (subscription.status === "active") return "Ativa";
    if (subscription.status === "trialing") return "Período de Teste";
    if (subscription.status === "past_due") return "Pagamento Atrasado";
    if (subscription.status === "paused") return "Pausada";
    if (subscription.status === "canceled") return "Cancelada";
    if (subscription.status === "expired") return "Expirada";
    return "Desconhecido";
  };

  const getStatusColor = () => {
    if (subscription.status === "active") return "bg-green-100 text-green-800 border-green-200";
    if (subscription.status === "trialing") return "bg-blue-100 text-blue-800 border-blue-200";
    if (subscription.status === "past_due")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (subscription.status === "paused") return "bg-orange-100 text-orange-800 border-orange-200";
    if (subscription.status === "canceled" || subscription.status === "expired")
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getTrialDaysRemaining = () => {
    if (subscription.status !== "trialing" || !subscription.trialEnd) return null;

    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status da Assinatura</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Informações do Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Plano</label>
            <p className="text-lg font-semibold text-gray-900">
              {planLabel || subscription.planKey}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Período</label>
            <p className="text-lg font-semibold text-gray-900">
              {subscription.currentPeriodStart && subscription.currentPeriodEnd
                ? `${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Trial Days */}
        {trialDaysRemaining !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-500" />
              <span className="text-blue-800 font-medium">
                {trialDaysRemaining > 0
                  ? `${trialDaysRemaining} dias restantes no período de teste`
                  : "Período de teste expirado"}
              </span>
            </div>
          </div>
        )}

        {/* Enterprise Status */}
        {subscription.requiresUpfront && status && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Status Enterprise</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Assinatura:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    status.preapproval === "authorized"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status.preapproval === "authorized" ? "Autorizada" : "Pendente"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">PIX Upfront:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    status.upfront === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status.upfront === "paid" ? "Pago" : "Pendente"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Status */}
        {subscription.marketingEnabled !== undefined && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Marketing:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                subscription.marketingEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {subscription.marketingEnabled ? "Habilitado" : "Desabilitado"}
            </span>
          </div>
        )}

        {/* Cupom */}
        {subscription.couponCode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Cupom:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {subscription.couponCode}
              {subscription.discountPct && ` (${subscription.discountPct}% off)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

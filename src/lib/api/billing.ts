// API para integração com Mercado Pago
import config from "@/config/env";

const API_BASE_URL = config.apiUrl;

export interface Plan {
  key: string;
  label: string;
  amount: number;
  interval: "month" | "year";
  trialDays: number;
  marketingStartsAfterFirstPayment: boolean;
  requiresUpfront?: boolean;
  upfrontAmount?: number;
  recurringAmount?: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planKey: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "paused" | "expired";
  trialStart?: string;
  trialEnd?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  firstPaymentAt?: string;
  marketingEnabled: boolean;
  requiresUpfront: boolean;
  upfrontInvoiceId?: string;
  mpPreapprovalId?: string;
  payerEmail?: string;
  couponCode?: string;
  discountPct?: number;
  extraTrialDays?: number;
}

export interface SubscriptionStatus {
  preapproval: "authorized" | "pending" | "cancelled";
  upfront: "paid" | "pending" | "expired";
  active: boolean;
}

export class BillingAPI {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar todos os planos disponíveis
  static async getPlans(): Promise<{ plans: Plan[] }> {
    return this.request<{ plans: Plan[] }>("/billing/plans");
  }

  // Buscar assinatura por tenant
  static async getSubscriptionByTenant(tenantId: string): Promise<Subscription> {
    return this.request<Subscription>(`/billing/subscription/tenant/${tenantId}`);
  }

  // Buscar status da assinatura
  static async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    return this.request<SubscriptionStatus>(`/billing/subscription/${subscriptionId}/status`);
  }

  // Criar nova assinatura
  static async createSubscription(data: {
    tenantId: string;
    planKey: string;
    payerEmail: string;
    couponCode?: string;
  }): Promise<{ subscriptionId: string; checkoutUrl: string }> {
    return this.request<{ subscriptionId: string; checkoutUrl: string }>("/billing/subscription", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Ativar assinatura
  static async activateSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/billing/subscription/${subscriptionId}/activate`, {
      method: "POST",
    });
  }

  // Cancelar assinatura
  static async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/billing/subscription/${subscriptionId}/cancel`, {
      method: "POST",
    });
  }

  // Iniciar fluxo Enterprise Monthly
  static async startEnterpriseMonthly(data: {
    tenantId: string;
    payerEmail: string;
    payerName: string;
  }): Promise<{
    subscriptionId: string;
    preapprovalUrl: string;
    pix: {
      qrCode: string;
      qrCodeBase64: string;
      ticketUrl: string;
    };
    invoiceId: string;
  }> {
    return this.request<{
      subscriptionId: string;
      preapprovalUrl: string;
      pix: {
        qrCode: string;
        qrCodeBase64: string;
        ticketUrl: string;
      };
      invoiceId: string;
    }>("/billing/subscription/enterprise-monthly/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Validar cupom
  static async validateCoupon(code: string): Promise<{
    valid: boolean;
    discountPct?: number;
    extraTrialDays?: number;
    allowedPlans?: string[];
  }> {
    return this.request<{
      valid: boolean;
      discountPct?: number;
      extraTrialDays?: number;
      allowedPlans?: string[];
    }>(`/billing/coupon/${code}`);
  }
}

export default BillingAPI;

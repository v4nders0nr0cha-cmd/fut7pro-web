// API para integraçao com Mercado Pago via proxys do App Router

const API_BASE_URL = "/api/admin/billing";

export type PlanCtaType = "checkout" | "contact";

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
  description?: string;
  features?: string[];
  limits?: string[];
  badge?: string;
  highlight?: boolean;
  ctaLabel?: string;
  ctaType?: PlanCtaType;
  contactEmail?: string;
  order?: number;
  active?: boolean;
  paymentNote?: string;
}

export interface PlanCatalogMeta {
  bannerTitle?: string;
  bannerSubtitle?: string;
  annualNote?: string;
  trialDaysDefault?: number;
}

export interface PlanCatalog {
  version?: number;
  updatedAt?: string;
  meta?: PlanCatalogMeta;
  plans: Plan[];
}

export interface Invoice {
  id: string;
  amount: number;
  status?: string | null;
  paidAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  mpPaymentId?: string | null;
  metadata?: Record<string, any> | null;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planKey: string;
  interval?: "month" | "year";
  amount?: number;
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
  invoices?: Invoice[];
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
      const message = await response.text();
      throw new Error(message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar todos os planos disponiveis
  static async getPlans(): Promise<PlanCatalog> {
    return this.request<PlanCatalog>("/plans");
  }

  // Buscar assinatura por tenant
  static async getSubscriptionByTenant(tenantId: string): Promise<Subscription> {
    return this.request<Subscription>(`/subscription/tenant/${tenantId}`);
  }

  // Buscar status da assinatura
  static async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    return this.request<SubscriptionStatus>(`/subscription/${subscriptionId}/status`);
  }

  // Criar nova assinatura
  static async createSubscription(data: {
    tenantId: string;
    planKey: string;
    payerEmail: string;
    couponCode?: string;
  }): Promise<{ subscriptionId: string; checkoutUrl: string }> {
    return this.request<{ subscriptionId: string; checkoutUrl: string }>("/subscription", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Ativar assinatura
  static async activateSubscription(
    subscriptionId: string,
    backUrl: string
  ): Promise<{ checkoutUrl?: string }> {
    return this.request<{ checkoutUrl?: string }>(`/subscription/${subscriptionId}/activate`, {
      method: "POST",
      body: JSON.stringify({ backUrl }),
    });
  }

  // Cancelar assinatura
  static async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/subscription/${subscriptionId}/cancel`, {
      method: "POST",
    });
  }

  // Iniciar fluxo Enterprise Monthly
  static async startEnterpriseMonthly(data: {
    tenantId: string;
    payerEmail: string;
    payerName: string;
  }): Promise<{
    subscription: Subscription;
    preapproval: {
      id: string;
      url: string;
    };
    pix: {
      id: string;
      qrCode: string;
      qrCodeBase64: string;
      ticketUrl: string;
    };
    upfrontInvoice: {
      id: string;
      amount: number;
      status: string;
    };
  }> {
    return this.request<{
      subscription: Subscription;
      preapproval: {
        id: string;
        url: string;
      };
      pix: {
        id: string;
        qrCode: string;
        qrCodeBase64: string;
        ticketUrl: string;
      };
      upfrontInvoice: {
        id: string;
        amount: number;
        status: string;
      };
    }>("/subscription/enterprise-monthly/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async changeSubscriptionPlan(
    subscriptionId: string,
    planKey: string
  ): Promise<Subscription> {
    return this.request<Subscription>(`/subscription/${subscriptionId}/change-plan`, {
      method: "POST",
      body: JSON.stringify({ planKey }),
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
    }>(`/coupon/${code}`);
  }
}

export default BillingAPI;

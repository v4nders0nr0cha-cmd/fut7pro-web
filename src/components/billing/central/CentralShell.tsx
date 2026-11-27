"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, LayoutDashboard, Gift, ReceiptText, Layers } from "lucide-react";
import { type ReactNode } from "react";
import { CentralProvider, useCentral } from "./CentralProvider";
import { Notice } from "./Common";
import s from "./central.module.css";
import FinancialDialogs from "./FinancialDialogs";
const sections = [
  { href: "/admin/assinatura", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/assinatura/beneficios", label: "Benefícios", icon: Gift },
  { href: "/admin/assinatura/pagamentos", label: "Pagamentos", icon: ReceiptText },
  { href: "/admin/assinatura/planos", label: "Planos", icon: Layers },
];
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const c = useCentral();
  return (
    <div className={s.central}>
      <header className={s.heading}>
        <div>
          <p className={s.eyebrow}>Assinatura Fut7Pro</p>
          <h1>Minha assinatura</h1>
          <p className={s.muted}>Plano, pagamentos, benefícios e histórico do seu grupo.</p>
        </div>
        <button
          type="button"
          className={s.secondary}
          onClick={() => void c.refresh()}
          disabled={c.subscriptionLoading || c.capabilities.loading || !c.tenantId}
        >
          <RefreshCw size={15} aria-hidden="true" />
          {c.subscriptionLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </header>
      <nav className={s.nav} aria-label="Central de Assinatura">
        {sections.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      {c.actionError && !c.dialog && <Notice error>{c.actionError}</Notice>}
      {c.actionSuccess && <Notice>{c.actionSuccess}</Notice>}
      {!c.tenantId ? <Notice>Selecione um grupo para consultar sua assinatura.</Notice> : children}
      <FinancialDialogs key={c.scope} />
      <p className={`${s.small} mt-8`}>
        Esta central reúne a assinatura do grupo com o Fut7Pro. As finanças internas dos atletas e
        do grupo permanecem na área Financeiro.
      </p>
    </div>
  );
}
export default function CentralShell({ children }: { children: ReactNode }) {
  return (
    <CentralProvider>
      <Shell>{children}</Shell>
    </CentralProvider>
  );
}

"use client";
import type { ReactNode } from "react";
import s from "./central.module.css";
export function Skeleton({
  label = "Consultando informações da assinatura...",
}: {
  label?: string;
}) {
  return (
    <div className={s.skeleton} role="status" aria-label={label}>
      <p className={s.muted}>{label}</p>
      <div />
      <div style={{ maxWidth: "50%" }} />
      <div />
      <div style={{ maxWidth: "65%" }} />
    </div>
  );
}
export function Notice({
  children,
  error = false,
  retry,
}: {
  children: ReactNode;
  error?: boolean;
  retry?: () => void;
}) {
  return (
    <div role={error ? "alert" : "status"} className={`${s.notice} ${error ? s.error : ""}`}>
      {children}
      {retry && (
        <div>
          <button type="button" className={s.linkButton} onClick={retry}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className={s.empty}>{children}</div>;
}
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "danger";
}) {
  return <span className={`${s.pill} ${tone === "neutral" ? "" : s[tone]}`}>{children}</span>;
}
export function Restricted() {
  return (
    <Empty>
      O histórico detalhado está disponível aos responsáveis financeiros do grupo. Você pode
      consultar o resumo e as opções de regularização permitidas.
    </Empty>
  );
}
export function HistoryCoverage({ incomplete }: { incomplete?: boolean }) {
  return incomplete ? (
    <p className={s.small}>
      Parte do histórico anterior não foi registrada. Exibimos somente as informações disponíveis,
      sem estimar valores ou benefícios.
    </p>
  ) : null;
}

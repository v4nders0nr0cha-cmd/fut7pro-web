"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaCalendarCheck, FaChevronRight, FaUserPlus } from "react-icons/fa";
import { useRacha } from "@/context/RachaContext";
import { useMe } from "@/hooks/useMe";

const ENTRY_ROLES = new Set(["PRESIDENTE", "VICE_PRESIDENTE", "ADMIN", "SUPERADMIN"]);
const MONTHLY_ROLES = new Set([
  "PRESIDENTE",
  "VICE_PRESIDENTE",
  "DIRETOR_FINANCEIRO",
  "ADMIN",
  "SUPERADMIN",
]);

type Props = {
  variant: "header" | "bottom";
  total: number | null;
  entryPending: number | null;
  entryLoading: boolean;
  monthlyPending: number | null;
  monthlyLoading: boolean;
};

function Count({ value, loading }: { value: number | null; loading: boolean }) {
  return (
    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
      {loading ? "…" : (value ?? "—")}
    </span>
  );
}

function RequestOption({
  title,
  description,
  href,
  count,
  loading,
  allowed,
  icon: Icon,
  onSelect,
}: {
  title: string;
  description: string;
  href: string;
  count: number | null;
  loading: boolean;
  allowed: boolean;
  icon: typeof FaUserPlus;
  onSelect: () => void;
}) {
  const content = (
    <>
      <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-white">{title}</span>
        <span className="mt-1 block text-xs text-zinc-400">
          {allowed ? description : "Análise indisponível para seu cargo neste grupo."}
        </span>
      </span>
      <Count value={count} loading={loading} />
      {allowed && <FaChevronRight aria-hidden="true" className="shrink-0 text-xs text-zinc-500" />}
    </>
  );
  const className =
    "flex min-h-16 w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand";

  return allowed ? (
    <Link href={href} className={`${className} hover:bg-white/10`} onClick={onSelect}>
      {content}
    </Link>
  ) : (
    <div className={`${className} opacity-70`} aria-disabled="true">
      {content}
    </div>
  );
}

export default function AdminRequestsMenu({
  variant,
  total,
  entryPending,
  entryLoading,
  monthlyPending,
  monthlyLoading,
}: Props) {
  const pathname = usePathname() ?? "";
  const { tenantSlug } = useRacha();
  const { me } = useMe({ context: "admin", tenantSlug, enabled: Boolean(tenantSlug) });
  const role = String(me?.membership?.role || "").toUpperCase();
  const canManageEntry = Boolean(tenantSlug) && ENTRY_ROLES.has(role);
  const canManageMonthly = Boolean(tenantSlug) && MONTHLY_ROLES.has(role);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isBottom = variant === "bottom";
  const active =
    pathname === "/admin/solicitacoes" ||
    pathname === "/admin/jogadores/listar-cadastrar" ||
    pathname === "/admin/jogadores/mensalistas";
  const menuId = `admin-requests-${variant}`;

  useEffect(() => setOpen(false), [pathname, tenantSlug]);

  useEffect(() => {
    if (!open) return;
    (panelRef.current?.querySelector<HTMLElement>("a, button") || panelRef.current)?.focus();
    const previousOverflow = document.body.style.overflow;
    if (isBottom) document.body.style.overflow = "hidden";

    const onPointerDown = (event: PointerEvent) => {
      if (!isBottom && !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (isBottom && event.key === "Tab") {
        const focusable = Array.from(
          panelRef.current?.querySelectorAll<HTMLElement>("a, button") || []
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      if (isBottom) document.body.style.overflow = previousOverflow;
    };
  }, [open, isBottom]);

  const panel = (
    <div
      ref={panelRef}
      id={menuId}
      role="dialog"
      aria-modal={isBottom ? true : undefined}
      aria-label="Selecionar tipo de solicitação"
      tabIndex={-1}
      className={
        isBottom
          ? "fixed inset-x-0 bottom-0 z-[101] max-h-[min(80dvh,32rem)] overflow-y-auto rounded-t-2xl border border-white/15 bg-[#1b1d22] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
          : "absolute right-0 top-full z-[60] mt-2 max-h-[calc(100dvh-72px)] w-80 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-white/15 bg-[#1b1d22] p-3 shadow-2xl"
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-2 pb-3">
        <h2 className="font-semibold text-white">Solicitações</h2>
        <div className="flex items-center gap-2">
          <Count value={total} loading={entryLoading || monthlyLoading} />
          {isBottom && (
            <button
              type="button"
              aria-label="Fechar solicitações"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1 pt-2">
        <RequestOption
          title="Entrada de jogadores"
          description={
            entryPending === null
              ? "Contagem indisponível"
              : entryPending === 0
                ? "Nenhum pedido pendente"
                : `${entryPending} pedido${entryPending === 1 ? "" : "s"} aguardando análise`
          }
          href="/admin/jogadores/listar-cadastrar#solicitacoes"
          count={entryPending}
          loading={entryLoading}
          allowed={canManageEntry}
          icon={FaUserPlus}
          onSelect={() => setOpen(false)}
        />
        <RequestOption
          title="Solicitações de mensalista"
          description={
            monthlyPending === null
              ? "Contagem indisponível"
              : monthlyPending === 0
                ? "Nenhum pedido pendente"
                : `${monthlyPending} pedido${monthlyPending === 1 ? "" : "s"} aguardando análise`
          }
          href="/admin/jogadores/mensalistas#solicitacoes-mensalista"
          count={monthlyPending}
          loading={monthlyLoading}
          allowed={canManageMonthly}
          icon={FaCalendarCheck}
          onSelect={() => setOpen(false)}
        />
      </div>
      {!tenantSlug && (
        <p className="px-3 pt-2 text-xs text-zinc-400">Selecione um grupo para analisar pedidos.</p>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={isBottom ? "min-w-0 flex-1" : "relative hidden lg:block"}
      onBlur={(event) => {
        if (!isBottom && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Solicitações"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-current={active ? "page" : undefined}
        data-testid={`admin-${variant}-requests-trigger`}
        onClick={() => setOpen((value) => !value)}
        className={
          isBottom
            ? "group relative flex min-h-[56px] w-full flex-col items-center justify-center text-xs"
            : `relative flex items-center gap-2 rounded px-2 py-1 transition hover:bg-zinc-800 ${active || open ? "bg-zinc-800 text-brand" : ""}`
        }
      >
        <FaUserPlus
          aria-hidden="true"
          size={isBottom ? 24 : 20}
          className={isBottom ? `${active ? "text-brand" : "text-zinc-300"} mb-0.5` : "text-brand"}
        />
        <span
          className={
            isBottom
              ? `${active ? "font-semibold text-brand" : "text-zinc-300"}`
              : "hidden text-sm font-medium text-white lg:inline"
          }
        >
          Solicitações
        </span>
        {total !== null && total > 0 && (
          <span
            className={
              isBottom
                ? "absolute right-3 top-0 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white"
                : "absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white"
            }
          >
            {total}
          </span>
        )}
      </button>
      {open &&
        (isBottom
          ? createPortal(
              <>
                <div
                  className="fixed inset-0 z-[100] bg-black/65"
                  aria-hidden="true"
                  onClick={() => setOpen(false)}
                />
                {panel}
              </>,
              document.body
            )
          : panel)}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import {
  accessHintSeen,
  guideAccessScope,
  rememberAccessHint,
  GUIDE_CLOSED,
  GUIDE_ACCESS_USED,
  type GuideAccessIdentity,
} from "@/lib/admin-guide-access";

type Position = {
  mobile: boolean;
  left: number;
  width: number;
  arrow: number;
  top?: number;
  bottom?: number;
};
export default function AdminGuideAccessHint() {
  const { guide } = useAdminGuide();
  const pathname = usePathname();
  const scope = guide
    ? guideAccessScope({
        tenantId: guide.tenant.id,
        membershipId: guide.administrator.membershipId,
      })
    : "";
  const [requested, setRequested] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [blocked, setBlocked] = useState(true);
  const eligible = Boolean(
    guide &&
      !guide.activationProgress.complete &&
      !guide.pedagogicalState.dashboardInviteDismissedAt
  );
  useEffect(() => {
    setRequested("");
    const closed = (event: Event) => {
      const identity = (event as CustomEvent<GuideAccessIdentity>).detail;
      if (eligible && identity && guideAccessScope(identity) === scope && !accessHintSeen(scope))
        setRequested(scope);
    };
    const used = (event: Event) => {
      const identity = (event as CustomEvent<GuideAccessIdentity>).detail;
      if (identity && guideAccessScope(identity) === scope) {
        setRequested("");
      }
    };
    window.addEventListener(GUIDE_CLOSED, closed);
    window.addEventListener(GUIDE_ACCESS_USED, used);
    return () => {
      window.removeEventListener(GUIDE_CLOSED, closed);
      window.removeEventListener(GUIDE_ACCESS_USED, used);
    };
  }, [scope, pathname, eligible]);
  useEffect(() => {
    if (!scope || requested !== scope) return;
    const measure = () => {
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      const anchor = document.getElementById(
        mobile ? "admin-guide-mobile-link" : "admin-help-launcher"
      );
      const occluded = [
        ...document.querySelectorAll<HTMLElement>(
          '[role="dialog"], [role="alertdialog"], [aria-expanded="true"][aria-controls], [data-guide-navigation-open="true"]'
        ),
      ].some((element) => element.getClientRects().length > 0);
      setBlocked(occluded || !anchor || !anchor.getClientRects().length);
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 32);
      const center = rect.left + rect.width / 2;
      const left = Math.max(16, Math.min(window.innerWidth - width - 16, center - width + 28));
      const next = {
        mobile,
        left,
        width,
        arrow: Math.max(16, Math.min(width - 24, center - left)),
        ...(mobile ? { top: rect.bottom + 12 } : { bottom: window.innerHeight - rect.top + 12 }),
      };
      setPosition((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-expanded", "aria-hidden", "data-guide-navigation-open"],
    });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [requested, scope]);
  const visible = Boolean(eligible && requested === scope && position && !blocked);
  useEffect(() => {
    if (visible) rememberAccessHint(scope);
  }, [visible, scope]);
  if (!visible || !position) return null;
  return (
    <aside
      role="status"
      aria-live="polite"
      aria-labelledby="guide-access-hint-title"
      data-testid="guide-access-hint"
      className="fixed z-[60] rounded-xl border border-amber-200/25 bg-[#23272f] p-4 text-white shadow-xl"
      style={{
        left: position.left,
        width: position.width,
        top: position.top,
        bottom: position.bottom,
      }}
    >
      <span
        aria-hidden="true"
        className={`absolute h-3 w-3 rotate-45 border-amber-200/25 bg-[#23272f] ${position.mobile ? "-top-1.5 border-l border-t" : "-bottom-1.5 border-b border-r"}`}
        style={{ left: position.arrow - 6 }}
      />
      <h2 id="guide-access-hint-title" className="text-sm font-semibold text-amber-100">
        {position.mobile ? "Continue quando quiser" : "Seu guia está sempre por aqui!"}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
        {position.mobile
          ? "Seu Guia Interativo está disponível neste ícone, ao lado da sua foto."
          : "Fechou o Guia Interativo? Quando quiser continuar, basta abrir pelo botão de ajuda (?)."}
      </p>
      <button
        type="button"
        className="mt-2 min-h-11 rounded px-2 text-xs font-semibold text-yellow-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
        onClick={() => setRequested("")}
      >
        Entendi
      </button>
    </aside>
  );
}

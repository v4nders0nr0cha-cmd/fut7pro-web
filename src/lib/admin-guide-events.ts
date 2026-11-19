export const ADMIN_GUIDE_CHANGED = "fut7pro:guide-data-changed";

// Uma assinatura por controlador. Agrupa eventos simultâneos e não perde um
// salvamento ocorrido durante uma leitura anterior àquele salvamento.
export function subscribeGuideChanges(revalidate: () => Promise<unknown>) {
  let active = true;
  let running = false;
  let dirty = false;
  const drain = async () => {
    if (!active || running) return;
    running = true;
    try {
      while (active && dirty) {
        dirty = false;
        await revalidate().catch(() => undefined);
      }
    } finally {
      running = false;
    }
  };
  const refresh = () => {
    dirty = true;
    queueMicrotask(() => void drain());
  };
  window.addEventListener(ADMIN_GUIDE_CHANGED, refresh);
  return () => {
    active = false;
    window.removeEventListener(ADMIN_GUIDE_CHANGED, refresh);
  };
}

export function notifyAdminGuideChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_GUIDE_CHANGED));
}

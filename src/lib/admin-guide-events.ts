export const ADMIN_GUIDE_CHANGED = "fut7pro:guide-data-changed";

export function notifyAdminGuideChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_GUIDE_CHANGED));
}

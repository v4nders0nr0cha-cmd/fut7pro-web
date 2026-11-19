"use client";
import { BookOpen } from "lucide-react";
import { useAdminGuideController } from "./AdminGuideController";

export default function AdminGuideMobileAccess() {
  const controller = useAdminGuideController();
  const status = controller?.state.error?.status;
  if (
    !controller?.scope ||
    controller.state.guide?.activationProgress.complete ||
    status === 401 ||
    status === 403
  )
    return null;
  return (
    <button
      type="button"
      id="admin-guide-mobile-link"
      aria-label="Abrir Guia Interativo"
      title="Guia Interativo"
      onClick={controller.openGuide}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-yellow-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 lg:hidden"
    >
      <BookOpen size={21} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

"use client";
import { useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import AdminGuideAbout from "./AdminGuideAbout";
export default function AdminGuideDialog({
  open,
  onClose,
  onCloseByButton,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onCloseByButton?: () => void;
  children: ReactNode;
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <Fut7DialogBase
      open={open}
      title="Guia Interativo Fut7Pro"
      size="xl"
      onClose={() => {
        setAboutOpen(false);
        onClose();
      }}
      onCloseButton={() => {
        setAboutOpen(false);
        onClose();
        onCloseByButton?.();
      }}
      icon={
        <button
          ref={trigger}
          type="button"
          aria-label="Sobre o Guia Interativo"
          aria-expanded={aboutOpen}
          onClick={() => setAboutOpen((value) => !value)}
          className="flex h-full w-full items-center justify-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
        >
          <Info size={24} aria-hidden="true" />
        </button>
      }
    >
      {aboutOpen && (
        <AdminGuideAbout
          onBack={() => {
            setAboutOpen(false);
            trigger.current?.focus();
          }}
        />
      )}
      <div hidden={aboutOpen} className="pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </Fut7DialogBase>
  );
}

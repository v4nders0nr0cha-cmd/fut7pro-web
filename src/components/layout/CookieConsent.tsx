"use client";
import { useEffect, useState } from "react";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { publicHref } = usePublicLinks();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setVisible(saved !== "accepted");
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] rounded-md bg-neutral-800 text-white p-4 shadow-lg border border-neutral-700">
      <p className="text-sm">
        Usamos cookies essenciais para funcionamento e, opcionalmente, para analytics após seu
        consentimento. Leia nossos{" "}
        <a href={publicHref("/privacidade")} className="underline">
          termos de privacidade
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          className="px-3 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-sm"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "rejected");
            } catch {}
            setVisible(false);
          }}
        >
          Rejeitar
        </button>
        <button
          className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-sm"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "accepted");
            } catch {}
            setVisible(false);
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}

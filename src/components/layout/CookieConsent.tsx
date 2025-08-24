"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

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
    <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 rounded-md border border-neutral-700 bg-neutral-800 p-4 text-white shadow-lg">
      <p className="text-sm">
        Usamos cookies essenciais para funcionamento e, opcionalmente, para
        analytics após seu consentimento. Leia nossos{" "}
        <a href="/privacidade" className="underline">
          termos de privacidade
        </a>
        .
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          className="rounded bg-neutral-600 px-3 py-1 text-sm hover:bg-neutral-500"
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
          className="rounded bg-green-600 px-3 py-1 text-sm hover:bg-green-500"
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

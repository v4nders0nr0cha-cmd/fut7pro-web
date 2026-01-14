import { Suspense } from "react";
import ConfirmarEmailClient from "./ConfirmarEmailClient";

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16 pt-4">
          <section className="rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl sm:p-8">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-4 h-6 w-3/4 rounded-full bg-white/10" />
            <div className="mt-2 h-4 w-full rounded-full bg-white/10" />
            <div className="mt-6 h-10 w-full rounded-lg bg-white/10" />
          </section>
        </div>
      }
    >
      <ConfirmarEmailClient />
    </Suspense>
  );
}

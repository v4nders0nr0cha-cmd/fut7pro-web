import { Suspense } from "react";
import AdminHubClient from "./AdminHubClient";

export default function AdminHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f16] text-white px-4 py-10">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="h-8 w-48 rounded-full bg-white/10" />
            <div className="h-10 w-full rounded-xl bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <AdminHubClient />
    </Suspense>
  );
}

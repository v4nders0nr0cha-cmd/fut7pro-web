import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="w-full lg:w-[420px] rounded-2xl border border-white/10 bg-[#0c111d]/85 p-6 shadow-2xl">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-full rounded-lg bg-white/10" />
            <div className="mt-3 h-8 w-full rounded-lg bg-white/10" />
          </div>
          <div className="hidden w-full lg:block lg:w-1/2 space-y-4">
            <div className="h-4 w-48 rounded-full bg-white/10" />
            <div className="h-10 w-3/4 rounded-full bg-white/10" />
            <div className="h-4 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}

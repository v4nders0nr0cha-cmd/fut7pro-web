"use client";

import { Toaster } from "react-hot-toast";

export default function Fut7ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerClassName="!z-[120]"
      toastOptions={{
        duration: 4200,
        className:
          "!rounded-2xl !border !border-yellow-400/25 !bg-[#111214] !px-4 !py-3 !text-sm !font-semibold !text-zinc-100 !shadow-[0_24px_70px_rgba(0,0,0,0.45)]",
        success: {
          iconTheme: {
            primary: "#facc15",
            secondary: "#111214",
          },
        },
        error: {
          iconTheme: {
            primary: "#f87171",
            secondary: "#111214",
          },
        },
      }}
    />
  );
}

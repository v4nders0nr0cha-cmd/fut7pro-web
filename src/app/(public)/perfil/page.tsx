import type { Metadata } from "next";
import GlobalPerfilClient from "./GlobalPerfilClient";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export const metadata: Metadata = {
  title: "Perfil Global Fut7Pro | Minha Conta",
  description: "Centralize seus dados e rachas do Fut7Pro em um unico perfil global.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${APP_URL}/perfil`,
  },
};

export default function PerfilGlobalPage() {
  return <GlobalPerfilClient />;
}

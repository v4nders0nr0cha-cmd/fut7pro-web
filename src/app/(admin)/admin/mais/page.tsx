import type { Metadata } from "next";
import MoreClient from "./MoreClient";

export const metadata: Metadata = {
  title: "Mais | Painel administrativo | Fut7Pro",
  robots: { index: false, follow: false },
};

export default function MorePage() {
  return <MoreClient />;
}

import type { Metadata } from "next";
import OwnershipTransferConfirmationClient from "./OwnershipTransferConfirmationClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar transferência de Presidência | Fut7Pro",
  description: "Confirme ou recuse uma transferência de Presidência do Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function OwnershipTransferConfirmationPage() {
  return <OwnershipTransferConfirmationClient />;
}

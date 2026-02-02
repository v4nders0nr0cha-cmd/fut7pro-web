import type { Metadata } from "next";
import TransferirPropriedadeClient from "./TransferirPropriedadeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transferir Propriedade | Fut7Pro Admin",
  description: "Transfira a presidência do racha para outro administrador de forma segura.",
};

export default function TransferirPropriedadePage() {
  return <TransferirPropriedadeClient />;
}

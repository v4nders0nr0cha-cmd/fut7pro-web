import { redirect } from "next/navigation";
import { rachaConfig } from "@/config/racha.config";

export default function TimesDoDiaRedirect() {
  redirect(`/${rachaConfig.slug}/partidas/times-do-dia`);
}

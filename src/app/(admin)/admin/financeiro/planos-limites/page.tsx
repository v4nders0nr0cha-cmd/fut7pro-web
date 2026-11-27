import { redirect } from "next/navigation";
import { legacySubscriptionDestination } from "@/lib/subscription-navigation";
export default async function LegacyBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(legacySubscriptionDestination(await searchParams));
}

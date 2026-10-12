"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Fut7SuccessDialog from "@/components/ui/feedback/Fut7SuccessDialog";
import {
  consumePublicAuthSuccessFeedback,
  discardPublicAuthSuccessFeedback,
  type PublicAuthSuccessFeedback,
} from "@/utils/public-auth-feedback";

const AUTO_CLOSE_MS = 2600;

export default function PublicAuthSuccessDialog({
  suppress = false,
  discard = false,
}: {
  suppress?: boolean;
  discard?: boolean;
}) {
  const pathname = usePathname();
  const { status } = useSession();
  const [feedback, setFeedback] = useState<PublicAuthSuccessFeedback | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (discard) {
      discardPublicAuthSuccessFeedback();
      setFeedback(null);
      return;
    }
    if (suppress) return;

    const nextFeedback = consumePublicAuthSuccessFeedback();
    if (!nextFeedback) return;

    setFeedback(nextFeedback);
  }, [discard, pathname, status, suppress]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  if (!feedback || suppress || discard) return null;

  return (
    <Fut7SuccessDialog
      open
      title={feedback.title}
      description={feedback.message}
      primaryLabel="Continuar"
      onPrimary={() => setFeedback(null)}
      onClose={() => setFeedback(null)}
    />
  );
}

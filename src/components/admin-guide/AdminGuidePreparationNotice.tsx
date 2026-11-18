"use client";
import { useEffect, useRef, useState } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import AdminGuideDialog from "./AdminGuideDialog";
import AdminGuidePhaseTransition from "./AdminGuidePhaseTransition";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
export default function AdminGuidePreparationNotice() {
  const { guide, update, updating } = useAdminGuide();
  const requested = useRef("");
  const currentScope = useRef("");
  const alive = useRef(true);
  const [openScope, setOpenScope] = useState("");
  const [inviting, setInviting] = useState(false);
  const scope = guide?.administrator.membershipId ?? "";
  currentScope.current = scope;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (
      !guide?.transition?.preparationCelebrationPending ||
      guide.activationProgress.complete ||
      !scope ||
      requested.current === scope
    )
      return;
    requested.current = scope;
    void update({ action: "PREPARATION_CELEBRATED" }).then((claimed) => {
      if (claimed && alive.current && currentScope.current === scope) setOpenScope(scope);
    });
  }, [guide, scope, update]);
  if (!guide) return null;
  const close = () => {
    setOpenScope("");
    setInviting(false);
  };
  return (
    <AdminGuideDialog open={Boolean(openScope && openScope === scope)} onClose={close}>
      {inviting ? (
        <AdminGuideInvitationPanel
          guide={guide}
          updating={updating}
          update={update}
          onBack={() => setInviting(false)}
        />
      ) : (
        <AdminGuidePhaseTransition
          guide={guide}
          kind="CELEBRATION"
          updating={updating}
          onInvite={() => setInviting(true)}
          onClose={close}
          onStart={() =>
            void update({ action: "FOOTBALL_STARTED" }).then((saved) => {
              if (saved) close();
            })
          }
        />
      )}
    </AdminGuideDialog>
  );
}

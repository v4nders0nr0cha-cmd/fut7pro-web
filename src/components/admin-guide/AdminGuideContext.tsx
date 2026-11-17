"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { guideDestination } from "@/lib/admin-guide-navigation";
import { STEP_HELP } from "@/lib/admin-onboarding";
export default function AdminGuideContext() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { guide, retry } = useAdminGuide();
  const id = params?.get("guia");
  const task = guide?.tasks.find((item) => item.id === id);
  const destination = guide && task ? guideDestination(guide, task) : null;
  const visible = Boolean(task && destination === pathname);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => void retry(), 5000);
    return () => window.clearInterval(timer);
  }, [visible, retry]);
  if (!visible || !task) return null;
  return (
    <aside
      className="mx-4 mt-4 rounded-xl border border-yellow-400/30 bg-[#23272F] p-4 text-sm text-white md:mt-4"
      aria-label="Orientação do guia"
    >
      <h2 className="font-bold text-yellow-200">
        {task.completed ? "Etapa concluída" : task.title}
      </h2>
      <p className="mt-2">
        {task.id === "ACTIVE_PLAYERS"
          ? "Clique em Cadastrar Jogador, preencha o perfil e salve. Abrir o formulário mantém a etapa pendente até o cadastro ser concluído."
          : STEP_HELP[task.id]}
      </p>
      <Link
        href="/admin/guia-fut7pro"
        className="mt-2 inline-flex min-h-11 items-center text-yellow-200 underline"
      >
        {task.completed ? "Continuar guia" : "Voltar ao guia"}
      </Link>
    </aside>
  );
}

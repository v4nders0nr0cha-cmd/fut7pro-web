"use client";

import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { FaSave, FaSpinner } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useBranding } from "@/hooks/useBranding";
import type { Plan, PlanCatalog } from "@/lib/api/billing";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function PlanPreviewCard({ plan, brand }: { plan: Plan; brand: string }) {
  const isHighlight = Boolean(plan.highlight);
  const intervalLabel = plan.interval === "year" ? "ano" : "mes";
  const title = plan.label.replace(/fut7pro/gi, brand);
  const description = plan.description?.replace(/fut7pro/gi, brand);
  const paymentNote = plan.paymentNote?.replace(/fut7pro/gi, brand);
  const features = (plan.features || []).map((item) => item.replace(/fut7pro/gi, brand));
  const limits = (plan.limits || []).map((item) => item.replace(/fut7pro/gi, brand));
  const ctaLabel =
    plan.ctaLabel || (plan.interval === "year" ? "Assinar plano anual" : "Assinar plano mensal");

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col shadow-xl border-2 ${isHighlight ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-800"}`}
    >
      {plan.badge && (
        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${isHighlight ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"}`}
        >
          {plan.badge}
        </span>
      )}
      <div className="text-xl font-extrabold mb-1">{title}</div>
      <div className="text-lg font-bold mb-1">
        {plan.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
        })}
        <span className="text-xs text-neutral-400">/{intervalLabel}</span>
      </div>
      {paymentNote && (
        <p className={`mb-2 text-xs ${isHighlight ? "text-black/70" : "text-neutral-400"}`}>
          {paymentNote}
        </p>
      )}
      {description && (
        <p className={`mb-3 text-sm ${isHighlight ? "text-black/80" : "text-neutral-300"}`}>
          {description}
        </p>
      )}
      <ul className="mb-4 space-y-1">
        {features.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`font-bold ${isHighlight ? "text-yellow-900" : "text-yellow-400"}`}>
              V
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mb-4 flex flex-wrap gap-2">
        {limits.map((limite, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${isHighlight ? "bg-yellow-300 text-black" : "bg-neutral-700 text-yellow-200"}`}
          >
            {limite}
          </span>
        ))}
      </div>
      <button
        type="button"
        className={`mt-auto px-5 py-2 rounded-xl font-bold ${isHighlight ? "bg-black text-yellow-300" : "bg-yellow-400 text-black"}`}
        disabled
      >
        {ctaLabel}
      </button>
    </div>
  );
}

export default function PlanosSuperAdminPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const applyBrand = useCallback(
    (text: string) => text.replace(/(__BRAND__|fut7pro)/gi, () => brand),
    [brand]
  );

  const { data, error } = useSWR<PlanCatalog>("/api/superadmin/planos", fetcher);
  const isLoading = !data && !error;
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setCatalog(data);
    }
  }, [data]);

  const meta = catalog?.meta || {};

  const plansByInterval = useMemo(() => {
    if (!catalog?.plans) return [];
    const interval = planoAtivo === "anual" ? "year" : "month";
    return [...catalog.plans]
      .filter((plan) => plan.interval === interval)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [catalog, planoAtivo]);

  const updateMeta = (field: keyof NonNullable<PlanCatalog["meta"]>, value: string | number) => {
    setCatalog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meta: {
          ...(prev.meta || {}),
          [field]: value,
        },
      };
    });
  };

  const updatePlan = (key: string, patch: Partial<Plan>) => {
    setCatalog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        plans: prev.plans.map((plan) => (plan.key === key ? { ...plan, ...patch } : plan)),
      };
    });
  };

  const handleSave = async () => {
    if (!catalog) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/superadmin/planos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planosCatalogo: catalog }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Falha ao salvar catalogo de planos");
      }

      const updated = (await res.json()) as PlanCatalog;
      setCatalog(updated);
      toast.success("Catalogo de planos atualizado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar catalogo de planos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>{applyBrand("Planos & Precos | __BRAND__ SuperAdmin")}</title>
        <meta
          name="description"
          content={applyBrand(
            "Edite planos, precos, limites e beneficios do __BRAND__. Tudo o que for salvo aqui aparece no painel dos rachas."
          )}
        />
      </Head>
      <Toaster />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">Planos & Precos</h1>
          <p className="text-sm text-neutral-300 max-w-2xl">
            {applyBrand(
              "Edite textos, precos, limites, destaques e CTAs. As alteracoes sao aplicadas no painel dos rachas apos salvar."
            )}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 text-yellow-400">
            <FaSpinner className="animate-spin" />
            <span>Carregando catalogo...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-red-100">
            Erro ao carregar catalogo. Tente novamente.
          </div>
        )}

        {catalog && (
          <>
            <section className="mb-8 rounded-2xl border border-[#2b2b2b] bg-[#151515] p-6">
              <h2 className="text-lg font-bold text-yellow-300 mb-4">Texto e regras globais</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-neutral-300">
                  Banner principal
                  <input
                    className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    value={meta.bannerTitle || ""}
                    onChange={(e) => updateMeta("bannerTitle", e.target.value)}
                    placeholder="Texto principal do banner"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-neutral-300">
                  Subtitulo do banner
                  <input
                    className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    value={meta.bannerSubtitle || ""}
                    onChange={(e) => updateMeta("bannerSubtitle", e.target.value)}
                    placeholder="Complemento do banner"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-neutral-300">
                  Observacao do anual
                  <input
                    className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    value={meta.annualNote || ""}
                    onChange={(e) => updateMeta("annualNote", e.target.value)}
                    placeholder="Ex: 2 meses gratis ja embutidos no valor anual"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-neutral-300">
                  Dias de teste padrao
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    value={meta.trialDaysDefault ?? 0}
                    onChange={(e) => updateMeta("trialDaysDefault", Number(e.target.value))}
                  />
                </label>
              </div>
            </section>

            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  className={`px-5 py-2 rounded-l-xl font-bold transition border ${planoAtivo === "mensal" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
                  onClick={() => setPlanoAtivo("mensal")}
                >
                  Planos Mensais
                </button>
                <button
                  className={`px-5 py-2 rounded-r-xl font-bold transition border-t border-b border-r ${planoAtivo === "anual" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
                  onClick={() => setPlanoAtivo("anual")}
                >
                  Planos Anuais
                </button>
              </div>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl px-6 py-2 flex items-center gap-2 font-bold transition shadow-lg"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Salvar alteracoes
              </button>
            </div>

            <div className="grid gap-8">
              {plansByInterval.map((plan) => {
                const isContact = plan.ctaType === "contact";
                return (
                  <div
                    key={plan.key}
                    className="rounded-2xl border border-[#2b2b2b] bg-[#111111] p-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]"
                  >
                    <PlanPreviewCard plan={plan} brand={brand} />

                    <div className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Nome do plano
                          <input
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.label}
                            onChange={(e) => updatePlan(plan.key, { label: e.target.value })}
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Preco (BRL)
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.amount}
                            onChange={(e) =>
                              updatePlan(plan.key, { amount: Number(e.target.value) })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Badge
                          <input
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.badge || ""}
                            onChange={(e) => updatePlan(plan.key, { badge: e.target.value })}
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Ordem de exibicao
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.order ?? 0}
                            onChange={(e) =>
                              updatePlan(plan.key, { order: Number(e.target.value) })
                            }
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Intervalo
                          <input
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white/60"
                            value={plan.interval === "year" ? "Anual" : "Mensal"}
                            readOnly
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Dias de teste
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.trialDays ?? 0}
                            onChange={(e) =>
                              updatePlan(plan.key, { trialDays: Number(e.target.value) })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          CTA (texto do botao)
                          <input
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.ctaLabel || ""}
                            onChange={(e) => updatePlan(plan.key, { ctaLabel: e.target.value })}
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          Tipo de CTA
                          <select
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.ctaType || "checkout"}
                            onChange={(e) =>
                              updatePlan(plan.key, { ctaType: e.target.value as Plan["ctaType"] })
                            }
                          >
                            <option value="checkout">Checkout</option>
                            <option value="contact">Contato comercial</option>
                          </select>
                        </label>
                      </div>

                      {isContact && (
                        <label className="flex flex-col gap-2 text-sm text-neutral-300">
                          E-mail de contato
                          <input
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                            value={plan.contactEmail || ""}
                            onChange={(e) => updatePlan(plan.key, { contactEmail: e.target.value })}
                          />
                        </label>
                      )}

                      <label className="flex flex-col gap-2 text-sm text-neutral-300">
                        Descrição
                        <textarea
                          rows={3}
                          className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                          value={plan.description || ""}
                          onChange={(e) => updatePlan(plan.key, { description: e.target.value })}
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-neutral-300">
                        Recursos (1 por linha)
                        <textarea
                          rows={6}
                          className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                          value={(plan.features || []).join("\n")}
                          onChange={(e) =>
                            updatePlan(plan.key, { features: splitLines(e.target.value) })
                          }
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-neutral-300">
                        Limites (1 por linha)
                        <textarea
                          rows={4}
                          className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                          value={(plan.limits || []).join("\n")}
                          onChange={(e) =>
                            updatePlan(plan.key, { limits: splitLines(e.target.value) })
                          }
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            className="accent-yellow-500"
                            checked={plan.active !== false}
                            onChange={(e) => updatePlan(plan.key, { active: e.target.checked })}
                          />
                          Plano ativo
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            className="accent-yellow-500"
                            checked={Boolean(plan.highlight)}
                            onChange={(e) => updatePlan(plan.key, { highlight: e.target.checked })}
                          />
                          Destacar plano
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            className="accent-yellow-500"
                            checked={Boolean(plan.marketingStartsAfterFirstPayment)}
                            onChange={(e) =>
                              updatePlan(plan.key, {
                                marketingStartsAfterFirstPayment: e.target.checked,
                              })
                            }
                          />
                          Marketing apos primeiro pagamento
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            className="accent-yellow-500"
                            checked={Boolean(plan.requiresUpfront)}
                            onChange={(e) =>
                              updatePlan(plan.key, { requiresUpfront: e.target.checked })
                            }
                          />
                          Exige entrada (upfront)
                        </label>
                      </div>

                      {plan.requiresUpfront && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="flex flex-col gap-2 text-sm text-neutral-300">
                            Valor de entrada (BRL)
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                              value={plan.upfrontAmount ?? 0}
                              onChange={(e) =>
                                updatePlan(plan.key, { upfrontAmount: Number(e.target.value) })
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-neutral-300">
                            Valor recorrente (BRL)
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                              value={plan.recurringAmount ?? 0}
                              onChange={(e) =>
                                updatePlan(plan.key, {
                                  recurringAmount: Number(e.target.value),
                                })
                              }
                            />
                          </label>
                        </div>
                      )}

                      <label className="flex flex-col gap-2 text-sm text-neutral-300">
                        Nota de pagamento
                        <input
                          className="w-full rounded-lg border border-[#2b2b2b] bg-[#0f0f0f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                          value={plan.paymentNote || ""}
                          onChange={(e) => updatePlan(plan.key, { paymentNote: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl px-6 py-2 flex items-center gap-2 font-bold transition shadow-lg"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Salvar alteracoes
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

"use client";

import Head from "next/head";
import { useState, useRef } from "react";
import {
  FaSave,
  FaLink,
  FaKey,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaUpload,
} from "react-icons/fa";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";

const configSchema = z.object({
  empresa: z.string().min(2, "Nome muito curto").max(40, "Máx 40 letras"),
  logo: z.string().url("URL inválida").optional(),
  suporteEmail: z.string().email("E-mail inválido"),
  dominio: z.string().regex(/^[\w.-]+\.[a-z]{2,}$/, "Domínio inválido"),
  plano: z.enum(["Enterprise", "Pro", "Essencial"]),
  vencimento: z.string().min(1, "Defina o vencimento"),
  webhook: z.string().url("URL do webhook inválida").or(z.literal("")),
  apiKey: z.string().min(8, "API Key muito curta").or(z.literal("")),
  alertas: z.object({
    financeiro: z.boolean(),
    usuarioNovo: z.boolean(),
    incidentes: z.boolean(),
  }),
  backup: z.boolean(),
});

const MOCK_CONFIG = {
  empresa: "Fut7Pro Tecnologia SaaS",
  logo: "/images/logos/logo_fut7pro.png",
  suporteEmail: "suporte@fut7pro.com.br",
  dominio: "fut7pro.com.br",
  plano: "Enterprise",
  vencimento: "2025-12-31",
  webhook: "",
  apiKey: "",
  alertas: {
    financeiro: true,
    usuarioNovo: true,
    incidentes: true,
  },
  backup: false,
};

const LOGS = [
  {
    data: "02/07/2025 03:23",
    acao: "Logo da empresa alterada",
    usuario: "SuperAdmin",
  },
  {
    data: "30/06/2025 17:10",
    acao: "Chave API atualizada",
    usuario: "SuperAdmin",
  },
  {
    data: "28/06/2025 14:45",
    acao: "Configuração de alertas salva",
    usuario: "SuperAdmin",
  },
  {
    data: "20/06/2025 09:05",
    acao: "Backup completo exportado",
    usuario: "SuperAdmin",
  },
];

// Modal simples (evite libs pesadas)
function ConfirmModal({
  show,
  onConfirm,
  onCancel,
  children,
}: {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-[#191c27] p-7 shadow-2xl">
        <div className="mb-3 text-xl text-yellow-400">
          <FaExclamationTriangle />
        </div>
        <div className="mb-5 text-center text-white">{children}</div>
        <div className="flex gap-4">
          <button
            className="rounded-lg bg-zinc-700 px-5 py-2 font-bold text-white hover:bg-zinc-600"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="rounded-lg bg-yellow-500 px-5 py-2 font-bold text-black hover:bg-yellow-600"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const [form, setForm] = useState(MOCK_CONFIG);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState<null | "salvar" | "backup">(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview de logo
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, logo: url }));
      toast.success(
        "Logo atualizada (apenas preview, não enviada para o servidor)",
      );
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;

    if (name.startsWith("alertas.")) {
      const input = e.target as HTMLInputElement;
      const key = name.split(".")[1] as keyof typeof form.alertas;
      setForm((prev) => ({
        ...prev,
        alertas: {
          ...prev.alertas,
          [key]: input.checked,
        },
      }));
    } else if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: input.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function validate() {
    const result = configSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.errors) {
        // Para campos nested (alertas.financeiro etc)
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Corrija os campos em destaque.");
      return;
    }
    setShowModal("salvar");
  }

  function onConfirmSave() {
    setShowModal(null);
    toast.success("Configurações salvas com sucesso! (mock)");
    // Aqui vai a chamada real da API futuramente.
  }

  function onBackup() {
    setShowModal("backup");
  }

  function onConfirmBackup() {
    setShowModal(null);
    toast.success("Backup exportado com sucesso! (mock)");
    // Aqui vai a chamada real da API futuramente.
  }

  return (
    <>
      <Head>
        <title>Configurações Gerais – Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Configure identidade visual, plano SaaS, integrações, alertas, segurança e backup global do Fut7Pro. Plataforma multi-tenant líder em futebol 7."
        />
        <meta
          name="keywords"
          content="Configurações Fut7Pro, SaaS, plataforma futebol 7, integrações, backup, branding, alerta, multi-tenant"
        />
      </Head>
      <Toaster />
      <ConfirmModal
        show={showModal === "salvar"}
        onConfirm={onConfirmSave}
        onCancel={() => setShowModal(null)}
      >
        Deseja realmente <b>salvar</b> as configurações globais do sistema?
      </ConfirmModal>
      <ConfirmModal
        show={showModal === "backup"}
        onConfirm={onConfirmBackup}
        onCancel={() => setShowModal(null)}
      >
        Confirma a <b>exportação do backup</b> agora?
        <br />
        Isso pode levar alguns minutos.
      </ConfirmModal>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-10">
        <section>
          <h1 className="mb-3 text-2xl font-bold text-white">
            Configurações Gerais do Sistema
          </h1>
          <p className="max-w-xl text-gray-300">
            Gerencie as informações globais do Fut7Pro SaaS. Todos os campos são
            obrigatórios para garantir o funcionamento e a identidade da sua
            plataforma.
          </p>
        </section>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Empresa & Branding */}
          <div className="rounded-2xl bg-[#181c27] p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaInfoCircle /> Empresa & Branding
            </h2>
            <div className="flex flex-col gap-4 md:gap-6">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">
                  Nome da empresa/SaaS
                </span>
                <input
                  type="text"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  className={`input-saaspadrao ${errors.empresa ? "border-red-500" : ""}`}
                  maxLength={40}
                  required
                  autoComplete="off"
                />
                {errors.empresa && (
                  <span className="text-xs text-red-400">{errors.empresa}</span>
                )}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">Logo do sistema</span>
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={form.logo}
                    alt="Logo Fut7Pro"
                    className="h-16 w-16 rounded-lg border border-zinc-700 bg-zinc-900"
                  />
                  <input
                    type="text"
                    name="logo"
                    value={form.logo}
                    onChange={handleChange}
                    className={`input-saaspadrao ${errors.logo ? "border-red-500" : ""}`}
                    placeholder="URL da logo"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
                    onClick={() => fileRef.current?.click()}
                  >
                    <FaUpload /> Upload logo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
                {errors.logo && (
                  <span className="text-xs text-red-400">{errors.logo}</span>
                )}
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-200">
                    E-mail de Suporte
                  </span>
                  <input
                    type="email"
                    name="suporteEmail"
                    value={form.suporteEmail}
                    onChange={handleChange}
                    className={`input-saaspadrao ${errors.suporteEmail ? "border-red-500" : ""}`}
                    required
                    autoComplete="off"
                  />
                  {errors.suporteEmail && (
                    <span className="text-xs text-red-400">
                      {errors.suporteEmail}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-200">
                    Domínio principal
                  </span>
                  <input
                    type="text"
                    name="dominio"
                    value={form.dominio}
                    onChange={handleChange}
                    className={`input-saaspadrao ${errors.dominio ? "border-red-500" : ""}`}
                    required
                    autoComplete="off"
                  />
                  {errors.dominio && (
                    <span className="text-xs text-red-400">
                      {errors.dominio}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Plano & Licenciamento */}
          <div className="rounded-2xl bg-[#181c27] p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaKey /> Plano & Licenciamento
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">Plano SaaS</span>
                <select
                  name="plano"
                  value={form.plano}
                  onChange={handleChange}
                  className={`input-saaspadrao ${errors.plano ? "border-red-500" : ""}`}
                  required
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Pro">Pro</option>
                  <option value="Essencial">Essencial</option>
                </select>
                {errors.plano && (
                  <span className="text-xs text-red-400">{errors.plano}</span>
                )}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">
                  Vencimento da licença
                </span>
                <input
                  type="date"
                  name="vencimento"
                  value={form.vencimento}
                  onChange={handleChange}
                  className={`input-saaspadrao ${errors.vencimento ? "border-red-500" : ""}`}
                  required
                />
                {errors.vencimento && (
                  <span className="text-xs text-red-400">
                    {errors.vencimento}
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Integrações Globais */}
          <div className="rounded-2xl bg-[#181c27] p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaLink /> Integrações Globais
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">
                  Webhook principal (endpoint)
                </span>
                <input
                  type="url"
                  name="webhook"
                  value={form.webhook}
                  onChange={handleChange}
                  className={`input-saaspadrao ${errors.webhook ? "border-red-500" : ""}`}
                  placeholder="https://suaapi.com/webhook"
                />
                {errors.webhook && (
                  <span className="text-xs text-red-400">{errors.webhook}</span>
                )}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-200">
                  Chave de API (global)
                </span>
                <input
                  type="text"
                  name="apiKey"
                  value={form.apiKey}
                  onChange={handleChange}
                  className={`input-saaspadrao ${errors.apiKey ? "border-red-500" : ""}`}
                  placeholder="sk-..."
                  autoComplete="off"
                />
                {errors.apiKey && (
                  <span className="text-xs text-red-400">{errors.apiKey}</span>
                )}
              </label>
            </div>
          </div>

          {/* Alertas & Segurança */}
          <div className="rounded-2xl bg-[#181c27] p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaShieldAlt /> Alertas & Segurança
            </h2>
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="alertas.financeiro"
                    checked={form.alertas.financeiro}
                    onChange={handleChange}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-200">
                    Alertar sobre pendências financeiras
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="alertas.usuarioNovo"
                    checked={form.alertas.usuarioNovo}
                    onChange={handleChange}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-200">
                    Alertar ao cadastrar novo usuário
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="alertas.incidentes"
                    checked={form.alertas.incidentes}
                    onChange={handleChange}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-200">
                    Alertas de incidentes/segurança
                  </span>
                </label>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="backup"
                    checked={form.backup}
                    onChange={handleChange}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-200">
                    Backup automático diário (recomendado)
                  </span>
                </label>
                <button
                  type="button"
                  className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 font-bold text-yellow-400 shadow transition-all hover:bg-yellow-400 hover:text-black"
                  onClick={onBackup}
                >
                  <FaCloudUploadAlt /> Exportar Backup Agora
                </button>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <FaExclamationTriangle /> Ações sensíveis requerem confirmação por
              e-mail para maior segurança.
            </p>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black shadow-lg transition hover:bg-yellow-600"
            >
              <FaSave /> Salvar Configurações
            </button>
          </div>
        </form>

        {/* Logs Recentes */}
        <div className="mt-8 rounded-2xl bg-[#181c27] p-5 shadow-lg">
          <h3 className="text-md mb-3 flex items-center gap-2 font-bold text-yellow-400">
            <FaHistory /> Logs Recentes
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {LOGS.map((log, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 md:flex-row md:items-center"
              >
                <span className="min-w-[125px] font-mono text-gray-400">
                  {log.data}
                </span>
                <span className="font-bold text-white">{log.acao}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {log.usuario}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .input-saaspadrao {
          background: #11131a;
          border: 1.5px solid #222534;
          border-radius: 10px;
          padding: 10px 16px;
          color: #fff;
          font-size: 1rem;
          transition: border 0.2s;
          outline: none;
        }
        .input-saaspadrao:focus {
          border: 1.5px solid #ffe066;
        }
        .border-red-500 {
          border-color: #f87171 !important;
        }
      `}</style>
    </>
  );
}

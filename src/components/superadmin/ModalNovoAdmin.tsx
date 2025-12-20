"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaTimes, FaUserShield, FaSave, FaCopy } from "react-icons/fa";

type RachaOption = {
  id: string;
  nome: string;
  slug: string;
  status?: string;
};

type UsuarioOption = {
  id: string;
  nome?: string;
  name?: string;
  email?: string;
  role?: string;
  tenantId?: string | null;
};

export type CreatePresidentePayload = {
  rachaNome?: string;
  rachaSlug?: string;
  cidade?: string;
  estado?: string;
  adminNome: string;
  adminApelido?: string;
  adminPosicao: string;
  adminEmail: string;
  existingTenantId?: string;
  existingRachaSlug?: string;
  skipTenantCreate?: boolean;
  autoPassword?: boolean;
};

export type SaveResult = {
  message?: string;
  temporaryPassword?: string;
  adminEmail?: string;
  tenantName?: string;
};

interface ModalNovoAdminProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreatePresidentePayload) => Promise<SaveResult>;
  rachas?: RachaOption[];
  usuarios?: UsuarioOption[];
}

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

function buildSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function isAdminRole(role?: string | null) {
  const value = (role || "").toUpperCase();
  return value === "ADMIN" || value === "SUPERADMIN";
}

export default function ModalNovoAdmin({
  open,
  onClose,
  onSave,
  rachas = [],
  usuarios = [],
}: ModalNovoAdminProps) {
  const [flow, setFlow] = useState<"novo" | "existente">("novo");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [permitirCopresidencia, setPermitirCopresidencia] = useState(false);
  const [rachaNome, setRachaNome] = useState("");
  const [rachaSlug, setRachaSlug] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [adminApelido, setAdminApelido] = useState("");
  const [adminPosicao, setAdminPosicao] = useState<string>(POSICOES[0]);
  const [adminEmail, setAdminEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  const selectedRacha = useMemo(
    () => rachas.find((racha) => racha.id === selectedTenantId) || null,
    [rachas, selectedTenantId]
  );

  const slugSugerido = useMemo(() => buildSlug(rachaNome), [rachaNome]);

  const hasExistingPresident = useMemo(() => {
    if (!selectedTenantId) return false;
    return usuarios.some(
      (usuario) => usuario.tenantId === selectedTenantId && isAdminRole(usuario.role)
    );
  }, [usuarios, selectedTenantId]);

  useEffect(() => {
    if (!open) return;
    setFlow("novo");
    setSelectedTenantId("");
    setPermitirCopresidencia(false);
    setRachaNome("");
    setRachaSlug("");
    setCidade("");
    setEstado("");
    setAdminNome("");
    setAdminApelido("");
    setAdminPosicao(POSICOES[0]);
    setAdminEmail("");
    setErrors({});
    setIsSubmitting(false);
    setResult(null);
  }, [open]);

  function handleSlugAutoFill() {
    if (!rachaSlug && slugSugerido) {
      setRachaSlug(slugSugerido);
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!adminNome.trim()) {
      newErrors.adminNome = "Informe o primeiro nome do presidente.";
    } else if (adminNome.trim().split(" ").length > 1) {
      newErrors.adminNome = "Use apenas o primeiro nome, sem sobrenome.";
    }

    if (!adminPosicao) {
      newErrors.adminPosicao = "Selecione a posicao do presidente.";
    }

    if (!adminEmail.trim()) {
      newErrors.adminEmail = "Informe o email do presidente.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      newErrors.adminEmail = "Email invalido.";
    }

    if (flow === "novo") {
      if (!rachaNome.trim() || rachaNome.trim().length < 3) {
        newErrors.rachaNome = "Nome do racha precisa ter ao menos 3 caracteres.";
      }
      if (!rachaSlug.trim() || !SLUG_REGEX.test(rachaSlug.trim())) {
        newErrors.rachaSlug = "Slug invalido: use minusculas, numeros e hifens (3-50).";
      }
      if (!cidade.trim()) {
        newErrors.cidade = "Informe a cidade do racha.";
      }
      if (!estado.trim()) {
        newErrors.estado = "Selecione o estado do racha.";
      }
    }

    if (flow === "existente") {
      if (!selectedTenantId) {
        newErrors.existingTenantId = "Selecione o racha existente.";
      } else if (hasExistingPresident && !permitirCopresidencia) {
        newErrors.existingTenantId = "Ja existe presidente ativo para este racha.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validateForm()) return;

    const payload: CreatePresidentePayload = {
      rachaNome: flow === "novo" ? rachaNome.trim() : undefined,
      rachaSlug: flow === "novo" ? rachaSlug.trim() : selectedRacha?.slug,
      cidade: flow === "novo" ? cidade.trim() : undefined,
      estado: flow === "novo" ? estado : undefined,
      adminNome: adminNome.trim(),
      adminApelido: adminApelido.trim() || undefined,
      adminPosicao,
      adminEmail: adminEmail.trim().toLowerCase(),
      existingTenantId: flow === "existente" ? selectedTenantId : undefined,
      existingRachaSlug: flow === "existente" ? selectedRacha?.slug : undefined,
      skipTenantCreate: flow === "existente",
      autoPassword: true,
    };

    setIsSubmitting(true);
    setErrors({});
    setResult(null);

    try {
      const saveResult = await onSave(payload);
      setResult(saveResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar presidente.";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyPassword() {
    if (!result?.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
    } catch {
      // No-op: fallback is manual copy.
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaUserShield className="h-6 w-6 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Criar presidente manual</h2>
              <p className="text-xs text-gray-400">
                Fluxo operacional para onboarding assistido, migracoes e trocas de presidencia.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFlow("novo")}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                flow === "novo"
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-200"
                  : "border-gray-700 bg-gray-800 text-gray-300"
              }`}
            >
              <div className="text-sm font-semibold">Novo racha + presidente</div>
              <div className="text-xs text-gray-400">Cria tenant e ja cadastra o presidente.</div>
            </button>
            <button
              type="button"
              onClick={() => setFlow("existente")}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                flow === "existente"
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-200"
                  : "border-gray-700 bg-gray-800 text-gray-300"
              }`}
            >
              <div className="text-sm font-semibold">Presidente para racha existente</div>
              <div className="text-xs text-gray-400">Vincula presidente a um tenant ja criado.</div>
            </button>
          </div>

          {flow === "existente" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Racha existente *</label>
              <select
                value={selectedTenantId}
                onChange={(event) => setSelectedTenantId(event.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                  errors.existingTenantId ? "border-red-500" : "border-gray-600"
                }`}
              >
                <option value="">Selecione um racha</option>
                {rachas.map((racha) => (
                  <option key={racha.id} value={racha.id}>
                    {racha.nome} ({racha.slug})
                  </option>
                ))}
              </select>
              {errors.existingTenantId && (
                <p className="text-sm text-red-400">{errors.existingTenantId}</p>
              )}
              {selectedRacha && hasExistingPresident && !permitirCopresidencia && (
                <div className="text-xs text-yellow-300">
                  Este racha ja possui presidente ativo. Marque "Permitir copresidencia" para
                  seguir.
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={permitirCopresidencia}
                  onChange={(event) => setPermitirCopresidencia(event.target.checked)}
                  className="rounded border-gray-600 text-yellow-400 focus:ring-yellow-400 bg-gray-700"
                />
                <span>Permitir copresidencia (mais de um ADMIN ativo)</span>
              </label>
            </div>
          )}

          {flow === "novo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do racha *
                </label>
                <input
                  type="text"
                  value={rachaNome}
                  onChange={(event) => setRachaNome(event.target.value)}
                  onBlur={handleSlugAutoFill}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                    errors.rachaNome ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Ex: Resenha FC"
                />
                {errors.rachaNome && <p className="text-sm text-red-400">{errors.rachaNome}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                <input
                  type="text"
                  value={rachaSlug}
                  onChange={(event) => setRachaSlug(event.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                    errors.rachaSlug ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="resenha-fc"
                />
                {errors.rachaSlug && <p className="text-sm text-red-400">{errors.rachaSlug}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  URL publica: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(event) => setCidade(event.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                      errors.cidade ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Cidade do racha"
                  />
                  {errors.cidade && <p className="text-sm text-red-400">{errors.cidade}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado *</label>
                  <select
                    value={estado}
                    onChange={(event) => setEstado(event.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                      errors.estado ? "border-red-500" : "border-gray-600"
                    }`}
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  {errors.estado && <p className="text-sm text-red-400">{errors.estado}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Dados do presidente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primeiro nome *
                </label>
                <input
                  type="text"
                  value={adminNome}
                  onChange={(event) => setAdminNome(event.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                    errors.adminNome ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Ex: Carlos"
                />
                {errors.adminNome && <p className="text-sm text-red-400">{errors.adminNome}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Apelido</label>
                <input
                  type="text"
                  value={adminApelido}
                  onChange={(event) => setAdminApelido(event.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posicao *</label>
                <select
                  value={adminPosicao}
                  onChange={(event) => setAdminPosicao(event.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                    errors.adminPosicao ? "border-red-500" : "border-gray-600"
                  }`}
                >
                  {POSICOES.map((posicao) => (
                    <option key={posicao} value={posicao}>
                      {posicao}
                    </option>
                  ))}
                </select>
                {errors.adminPosicao && (
                  <p className="text-sm text-red-400">{errors.adminPosicao}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white ${
                    errors.adminEmail ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="presidente@racha.com"
                />
                {errors.adminEmail && <p className="text-sm text-red-400">{errors.adminEmail}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-sm text-gray-300">
            Senha temporaria sera gerada automaticamente. O fluxo de convite por e-mail com token
            expira em etapa futura.
          </div>

          {errors.submit && <div className="text-sm text-red-400">{errors.submit}</div>}

          {result && (
            <div className="rounded-lg border border-green-600/40 bg-green-900/30 p-4 text-sm text-green-200">
              <div className="font-semibold">{result.message || "Presidente criado."}</div>
              {result.temporaryPassword && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="text-xs text-green-100">
                    Senha temporaria para {result.adminEmail || "presidente"}:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={result.temporaryPassword}
                      className="flex-1 rounded-lg bg-gray-900 border border-green-600/40 px-3 py-2 text-green-100"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600/30 px-3 py-2 text-xs font-semibold text-green-100 hover:bg-green-600/50"
                    >
                      <FaCopy /> Copiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaSave className="h-4 w-4" />
              <span>{isSubmitting ? "Criando..." : "Criar presidente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

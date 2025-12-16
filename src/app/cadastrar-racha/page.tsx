"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCropperModal from "@/components/ImageCropperModal";

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

type UploadTarget = "logo" | "avatar";

export default function CadastroRachaPage() {
  const router = useRouter();

  const [adminNome, setAdminNome] = useState("");
  const [adminApelido, setAdminApelido] = useState("");
  const [adminPosicao, setAdminPosicao] = useState<string>(POSICOES[0]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [adminConfirmSenha, setAdminConfirmSenha] = useState("");
  const [adminAvatar, setAdminAvatar] = useState<string>();

  const [rachaNome, setRachaNome] = useState("");
  const [rachaSlug, setRachaSlug] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [rachaLogo, setRachaLogo] = useState<string>();

  const [erro, setErro] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [cropImage, setCropImage] = useState<string>();
  const [cropTarget, setCropTarget] = useState<UploadTarget | null>(null);

  const slugSugerido = useMemo(() => {
    if (!rachaNome) return "";
    return rachaNome
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }, [rachaNome]);

  function handleSlugAutoFill() {
    if (!rachaSlug && slugSugerido) {
      setRachaSlug(slugSugerido);
    }
  }

  async function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>, target: UploadTarget) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isTooBig = file.size > 1_000_000;
    if (!isImage || isTooBig) {
      setErro("Envie uma imagem (PNG ou JPG) de ate 1MB.");
      return;
    }
    try {
      const base64 = await toBase64(file);
      setCropImage(base64);
      setCropTarget(target);
      setErro("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar a imagem");
    }
  }

  function validar() {
    if (!adminNome.trim()) return "Informe apenas o primeiro nome do administrador.";
    if (adminNome.trim().split(" ").length > 1)
      return "Use apenas o primeiro nome (sem sobrenome).";
    if (!adminPosicao) return "Selecione a posicao do administrador.";
    if (!adminEmail.trim()) return "Informe o e-mail.";
    if (!adminSenha || adminSenha.length < 6) return "A senha deve ter ao menos 6 caracteres.";
    if (adminSenha !== adminConfirmSenha) return "As senhas nao conferem.";
    if (!rachaNome.trim() || rachaNome.trim().length < 3)
      return "O nome do racha deve ter ao menos 3 caracteres.";
    if (!rachaSlug.trim() || !/^[a-z0-9-]{3,50}$/.test(rachaSlug.trim()))
      return "Slug invalido: use minusculas, numeros e hifens (3-50).";
    if (!cidade.trim()) return "Informe a cidade.";
    if (!estado.trim()) return "Selecione o estado.";
    return null;
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const erroMsg = validar();
    if (erroMsg) {
      setErro(erroMsg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rachaNome: rachaNome.trim(),
          rachaSlug: rachaSlug.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
          rachaLogoBase64: rachaLogo,
          adminNome: adminNome.trim(),
          adminApelido: adminApelido.trim() || undefined,
          adminPosicao,
          adminEmail: adminEmail.trim(),
          adminSenha,
          adminAvatarBase64: adminAvatar,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message || "Erro ao cadastrar. Tente novamente.";
        setErro(msg);
        return;
      }

      setSucesso("Cadastro realizado! Agora faca login para acessar o painel.");
      setTimeout(() => router.push("/admin/login"), 1200);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
      <section className="lg:w-1/2 bg-[#161820] border border-[#1f2230] rounded-2xl p-6 shadow-xl">
        <div className="text-xs text-yellow-400 font-semibold uppercase tracking-[0.2em] mb-2">
          Experimente o Fut7Pro
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">Cadastre seu racha</h1>
        <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
          Crie seu racha e complete seu perfil: voce ja entra como presidente. A partir daqui o
          Fut7Pro liga tudo no painel e no site do racha - sorteio inteligente, rankings e
          estatisticas, conquistas e notificacoes, gestao financeira e patrocinadores - com
          seguranca e estrutura profissional multi-admin.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="bg-[#1b1e29] border border-[#24283a] rounded-lg p-3">
            <div className="text-yellow-300 font-semibold text-lg">100%</div>
            <div>Multi-tenant com slug</div>
          </div>
          <div className="bg-[#1b1e29] border border-[#24283a] rounded-lg p-3">
            <div className="text-yellow-300 font-semibold text-lg">Logo dinamica</div>
            <div>Aplicada no painel e no site</div>
          </div>
          <div className="bg-[#1b1e29] border border-[#24283a] rounded-lg p-3">
            <div className="text-yellow-300 font-semibold text-lg">Perfil pronto</div>
            <div>Presidente com posicao e apelido</div>
          </div>
          <div className="bg-[#1b1e29] border border-[#24283a] rounded-lg p-3">
            <div className="text-yellow-300 font-semibold text-lg">Slug publico</div>
            <div>https://app.fut7pro.com.br/&lt;slug&gt;</div>
          </div>
        </div>
      </section>

      <section className="lg:w-1/2 bg-[#0f1118] border border-[#1c2030] rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Dados do administrador</h2>
            <p className="text-sm text-gray-400">
              Use apenas o primeiro nome para nao quebrar os cards. Apelido e opcional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Primeiro nome do presidente *"
                value={adminNome}
                onChange={(e) => setAdminNome(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                maxLength={24}
                required
              />
              <input
                type="text"
                placeholder="Apelido (opcional)"
                value={adminApelido}
                onChange={(e) => setAdminApelido(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                maxLength={24}
              />
              <select
                value={adminPosicao}
                onChange={(e) => setAdminPosicao(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {POSICOES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="email"
                placeholder="E-mail do presidente *"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="Senha (min. 6 caracteres) *"
                value={adminSenha}
                onChange={(e) => setAdminSenha(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                type="password"
                placeholder="Confirmar senha *"
                value={adminConfirmSenha}
                onChange={(e) => setAdminConfirmSenha(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1">
                <span className="block text-xs text-gray-400 mb-1">
                  Foto do presidente (opcional)
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleUpload(e, "avatar")}
                  className="w-full text-sm text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Dados do racha</h2>
            <p className="text-sm text-gray-400">
              Nome, cidade/estado e slug sao obrigatorios. O slug define o link publico.
            </p>
            <input
              type="text"
              placeholder="Nome do racha *"
              value={rachaNome}
              onChange={(e) => setRachaNome(e.target.value)}
              onBlur={handleSlugAutoFill}
              className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              maxLength={50}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Slug (ex: quarta-fc) *"
                value={rachaSlug}
                onChange={(e) => setRachaSlug(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                maxLength={50}
                autoCapitalize="none"
              />
              <div className="text-xs text-gray-500 self-center">
                Link publico: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Cidade *"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Estado</option>
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <label>
                <span className="block text-xs text-gray-400 mb-1">Logo do racha (opcional)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleUpload(e, "logo")}
                  className="w-full text-sm text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {erro && (
            <div className="rounded-lg bg-red-600 text-white text-sm p-3 border border-red-500">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="rounded-lg bg-green-600 text-white text-sm p-3 border border-green-500">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar racha e presidente"}
          </button>
          <div className="text-center text-sm text-gray-300">
            Ja tem painel?{" "}
            <a href="/admin/login" className="text-yellow-300 underline hover:text-yellow-200">
              Entrar
            </a>
          </div>
        </form>
      </section>
      <ImageCropperModal
        open={!!cropImage && !!cropTarget}
        imageSrc={cropImage || ""}
        aspect={1}
        shape={cropTarget === "avatar" ? "round" : "rect"}
        title={cropTarget === "logo" ? "Ajustar logo do racha" : "Ajustar foto do presidente"}
        onCancel={() => {
          setCropImage(undefined);
          setCropTarget(null);
        }}
        onApply={(cropped) => {
          if (cropTarget === "logo") setRachaLogo(cropped);
          if (cropTarget === "avatar") setAdminAvatar(cropped);
          setCropImage(undefined);
          setCropTarget(null);
        }}
      />
    </main>
  );
}

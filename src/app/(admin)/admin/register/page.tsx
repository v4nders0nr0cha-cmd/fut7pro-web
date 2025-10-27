"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AvatarCropModal from "@/components/admin/AvatarCropModal";

const FOTO_FALLBACK = "/images/Perfil-sem-Foto-Fut7.png";
const LOGO_FALLBACK = "/images/logos/logo_fut7pro.png";
const ESTADOS = [
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
const POSICOES = ["GOLEIRO", "ZAGUEIRO", "MEIA", "ATACANTE"] as const;

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminRegisterPage() {
  const router = useRouter();

  const [nomeRacha, setNomeRacha] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const [presidenteNome, setPresidenteNome] = useState("");
  const [presidenteApelido, setPresidenteApelido] = useState("");
  const [presidentePosicao, setPresidentePosicao] = useState<(typeof POSICOES)[number]>("ATACANTE");
  const [presidenteFotoDataUrl, setPresidenteFotoDataUrl] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cropTarget, setCropTarget] = useState<"logo" | "presidente" | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);

  const fotoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const avatarPreview = presidenteFotoDataUrl ?? FOTO_FALLBACK;
  const logoPreview = logoDataUrl ?? LOGO_FALLBACK;

  useEffect(() => {
    if (!slugEdited) setSlug(normalizeSlug(nomeRacha));
  }, [nomeRacha, slugEdited]);

  const presidentePrimeiroNome = useMemo(() => {
    const trimmed = presidenteNome.trim();
    if (!trimmed) return "";
    return trimmed.split(/\s+/)[0];
  }, [presidenteNome]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");

    const normalizedSlug = normalizeSlug(slug || nomeRacha);

    if (nomeRacha.trim().length < 3 || nomeRacha.trim().length > 64) {
      setErro("Nome do racha deve ter entre 3 e 64 caracteres.");
      return;
    }
    if (presidentePrimeiroNome.length < 2 || presidentePrimeiroNome.length > 60) {
      setErro("Nome do presidente deve ter entre 2 e 60 caracteres.");
      return;
    }
    if (presidenteApelido.trim() && (presidenteApelido.trim().length < 2 || presidenteApelido.trim().length > 20)) {
      setErro("Apelido deve ter entre 2 e 20 caracteres.");
      return;
    }
    if (!presidentePosicao) {
      setErro("Selecione a posicao do presidente.");
      return;
    }
    if (!cidade.trim() || !estado.trim()) {
      setErro("Informe a cidade e o estado do racha.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(normalizedSlug) || normalizedSlug.length < 3) {
      setErro("Slug deve ser minusculo, sem espacos e conter apenas letras, numeros e hifens.");
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas nao conferem.");
      return;
    }
    if (senha.length < 8) {
      setErro("Senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeRacha.trim(),
          slug: normalizedSlug,
          cidade: cidade.trim(),
          estado: estado.trim(),
          email: email.trim(),
          senha,
          presidenteNome: presidentePrimeiroNome,
          presidenteApelido: presidenteApelido.trim(),
          presidentePosicao,
          presidenteFotoUrl: presidenteFotoDataUrl ?? undefined,
          logoUrl: logoDataUrl ?? undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        alert(payload?.message ?? "Cadastro recebido! Aguarde a validacao da equipe Fut7Pro.");
        router.push("/admin/login");
        return;
      }

      const errorMessage =
        payload && typeof payload.error === "string" ? payload.error : "Erro ao cadastrar racha.";
      setErro(errorMessage);
    } catch (error) {
      console.error("Falha ao cadastrar racha", error);
      setErro("Erro inesperado ao cadastrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelected = (file: File | undefined, type: "logo" | "presidente") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setCropTarget(type);
        setCropImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Head>
        <title>Cadastre seu racha | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Crie a conta do seu racha, informe o presidente e solicite o acesso ao painel administrativo Fut7Pro."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0f0f0f] to-[#191919] text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-start">
          <section className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-200">
              Fut7Pro Admin
            </span>
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                Seu racha, com gestao profissional
              </h1>
              <p className="mt-4 text-base leading-relaxed text-zinc-200">
                Voce sera o presidente deste racha. Escolha o nome e o slug publico e solicite a liberacao
                do painel administrativo. Apos a aprovacao, personalize cores, adicione patrocinadores,
                organize as agendas e convide atletas — tudo isso e muito mais em um unico lugar.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-zinc-100">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <h2 className="font-semibold text-yellow-300 uppercase tracking-wide text-xs">
                  01 · Identidade do racha
                </h2>
                <p className="mt-2 text-zinc-200/90">
                  Defina o nome, cidade, estado e o slug publico que sera exibido para os atletas.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <h2 className="font-semibold text-yellow-300 uppercase tracking-wide text-xs">
                  02 · Dados do presidente
                </h2>
                <p className="mt-2 text-zinc-200/90">
                  Cadastre o presidente como primeiro atleta com posicao e foto ajustada no tamanho correto.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <h2 className="font-semibold text-yellow-300 uppercase tracking-wide text-xs">
                  03 · Painel liberado
                </h2>
                <p className="mt-2 text-zinc-200/90">
                  Apos a validacao, voce recebe acesso total ao Fut7Pro Admin para publicar jogos, rankings e muito mais.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-center">Solicitar acesso ao Fut7Pro Admin</h2>
            <p className="mt-2 text-sm text-center text-zinc-300">
              Preencha os dados abaixo. Entraremos em contato por e-mail assim que o painel for liberado.
            </p>

            {erro && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {erro}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-8">
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                  Dados do racha
                </legend>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <Image src={logoPreview} alt="Previa da logo do racha" fill className="object-cover" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-zinc-300">Emblema do racha (opcional)</p>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="rounded-full border border-yellow-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                    >
                      {logoDataUrl ? "Trocar emblema" : "Enviar emblema"}
                    </button>
                    {logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoDataUrl(null)}
                        className="block text-xs text-red-300 hover:text-red-200"
                      >
                        Remover emblema
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-200">Nome do racha</label>
                  <input
                    type="text"
                    value={nomeRacha}
                    onChange={(event) => setNomeRacha(event.target.value)}
                    required
                    minLength={3}
                    maxLength={64}
                    placeholder="Ex.: Quinta Master Fut7"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Slug publico</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(event) => {
                        setSlug(event.target.value);
                        setSlugEdited(true);
                      }}
                      minLength={3}
                      maxLength={32}
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="ex: quinta-master"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Cidade</label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(event) => setCidade(event.target.value)}
                      required
                      placeholder="ex: Sao Paulo"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Estado</label>
                    <select
                      value={estado}
                      onChange={(event) => setEstado(event.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    >
                      <option value="">Selecione</option>
                      {ESTADOS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                  Dados do presidente
                </legend>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-yellow-400/60 bg-black/40">
                    <Image src={avatarPreview} alt="Previa do presidente" fill className="object-cover" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <button
                      type="button"
                      onClick={() => fotoInputRef.current?.click()}
                      className="rounded-full border border-yellow-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                    >
                      {presidenteFotoDataUrl ? "Trocar foto" : "Enviar foto"}
                    </button>
                    {presidenteFotoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPresidenteFotoDataUrl(null)}
                        className="block text-xs text-red-300 hover:text-red-200"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Nome (apenas primeiro)</label>
                    <input
                      type="text"
                      value={presidenteNome}
                      onChange={(event) => setPresidenteNome(event.target.value)}
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder="Apenas o primeiro nome"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Apelido (opcional)</label>
                    <input
                      type="text"
                      value={presidenteApelido}
                      onChange={(event) => setPresidenteApelido(event.target.value)}
                      maxLength={20}
                      placeholder="Como e conhecido"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-200">Posicao</label>
                  <select
                    value={presidentePosicao}
                    onChange={(event) => setPresidentePosicao(event.target.value as (typeof POSICOES)[number])}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  >
                    {POSICOES.map((posicao) => (
                      <option key={posicao} value={posicao}>
                        {posicao[0] + posicao.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                  Dados de acesso
                </legend>
                <div>
                  <label className="text-sm font-semibold text-zinc-200">E-mail do presidente</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="contato@seuracha.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Senha</label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimo 8 caracteres"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-200">Confirmar senha</label>
                    <input
                      type="password"
                      value={confirmSenha}
                      onChange={(event) => setConfirmSenha(event.target.value)}
                      required
                      minLength={8}
                      placeholder="Repita a senha"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                    />
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-yellow-400 py-3 text-base font-bold uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(255,215,0,0.35)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Solicitar acesso"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-300">
              Ja tem um login?{" "}
              <button
                type="button"
                onClick={() => router.push("/admin/login")}
                className="font-semibold text-yellow-300 hover:text-yellow-200"
              >
                Entrar no painel
              </button>
            </p>
          </section>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            handleFileSelected(file, "logo");
          }}
        />
        <input
          ref={fotoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            handleFileSelected(file, "presidente");
          }}
        />

        <AvatarCropModal
          open={cropTarget !== null && cropImage !== null}
          imageSrc={cropImage}
          onClose={() => {
            setCropTarget(null);
            setCropImage(null);
          }}
          onConfirm={(dataUrl) => {
            if (cropTarget === "logo") setLogoDataUrl(dataUrl);
            if (cropTarget === "presidente") setPresidenteFotoDataUrl(dataUrl);
            setCropTarget(null);
            setCropImage(null);
          }}
        />
      </main>
    </>
  );
}


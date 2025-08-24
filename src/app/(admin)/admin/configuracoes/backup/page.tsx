"use client";

import Head from "next/head";
import { useRef, useState } from "react";
import {
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaHistory,
  FaDatabase,
  FaQuestionCircle,
  FaCheckCircle,
} from "react-icons/fa";

type BackupStatus = "ok" | "pendente" | "erro";

export default function BackupPage() {
  const [status, setStatus] = useState<BackupStatus>("ok");
  const [file, setFile] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    setMensagem("Backup gerado e pronto para download!");
    setTimeout(() => setMensagem(""), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    setMensagem("");
  };

  const handleRestore = () => {
    if (!file) {
      setMensagem("Selecione um arquivo de backup válido (.zip ou .json).");
      return;
    }
    setMensagem(
      "Backup restaurado com sucesso! Os dados serão atualizados em breve.",
    );
    setTimeout(() => setMensagem(""), 3500);
    setFile(null);
  };

  return (
    <>
      <Head>
        <title>Backup & Recuperação | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Faça backup, restaure ou exporte os dados do seu racha no Fut7Pro com segurança."
        />
        <meta
          name="keywords"
          content="Fut7, backup, exportação, recuperação, restauração, SaaS, admin, segurança"
        />
      </Head>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaDatabase /> Backup & Recuperação
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Proteja e controle os dados do seu racha.
          </b>
          <br />
          Faça backup manual dos dados do Fut7Pro, exporte informações para
          Excel/planilhas e recupere dados em caso de emergência.
          <br />
          <span className="text-gray-300">
            Recomendamos fazer backup sempre antes de grandes mudanças no painel
            ou atualizações importantes.
          </span>
        </div>

        {/* Cards de opções */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="animate-fadeIn flex flex-col gap-2 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-5 shadow">
            <div className="flex items-center gap-2">
              <FaCloudDownloadAlt className="text-xl text-yellow-300" />
              <span className="text-lg font-bold text-yellow-300">
                Exportar/Backup Manual
              </span>
            </div>
            <div className="text-sm text-gray-200">
              Faça backup de todos os dados do racha e baixe um arquivo seguro
              (.zip ou .json).
            </div>
            <button
              className="mt-2 w-fit rounded bg-yellow-400 px-4 py-2 font-bold text-[#232323] transition hover:bg-yellow-500"
              onClick={handleBackup}
            >
              Baixar Backup
            </button>
          </div>
          <div className="animate-fadeIn flex flex-col gap-2 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-5 shadow">
            <div className="flex items-center gap-2">
              <FaCloudUploadAlt className="text-xl text-yellow-300" />
              <span className="text-lg font-bold text-yellow-300">
                Restaurar Dados
              </span>
            </div>
            <div className="text-sm text-gray-200">
              Importe um backup para recuperar o racha (aceita .zip ou .json
              exportados do Fut7Pro).
            </div>
            <input
              type="file"
              accept=".zip,.json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-2 rounded border border-yellow-400 bg-[#181818] p-2 text-sm text-gray-200"
            />
            <button
              className="mt-2 w-fit rounded bg-yellow-400 px-4 py-2 font-bold text-[#232323] transition hover:bg-yellow-500"
              onClick={handleRestore}
              disabled={!file}
            >
              Restaurar Backup
            </button>
          </div>
          <div className="animate-fadeIn flex flex-col gap-2 rounded-lg border-l-4 border-yellow-700 bg-[#232323] p-5 shadow">
            <div className="flex items-center gap-2">
              <FaHistory className="text-xl text-yellow-300" />
              <span className="text-lg font-bold text-yellow-300">
                Histórico de Backups
              </span>
            </div>
            <div className="text-sm text-gray-200">
              Consulte todos os backups feitos manualmente, datas e quem fez.
              (Em breve)
            </div>
            <span className="mt-2 w-fit rounded bg-yellow-800 px-2 py-1 text-xs text-yellow-200">
              Em breve
            </span>
          </div>
          <div className="animate-fadeIn flex flex-col gap-2 rounded-lg border-l-4 border-yellow-700 bg-[#232323] p-5 shadow">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-xl text-yellow-300" />
              <span className="text-lg font-bold text-yellow-300">
                Backup Automático
              </span>
            </div>
            <div className="text-sm text-gray-200">
              Seus dados são salvos automaticamente e com criptografia em
              servidores seguros. (Em breve)
            </div>
            <span className="mt-2 w-fit rounded bg-yellow-800 px-2 py-1 text-xs text-yellow-200">
              Em breve
            </span>
          </div>
        </div>

        {/* Mensagem mock de status */}
        {mensagem && (
          <div className="animate-fadeIn mb-8 rounded-lg border border-yellow-700 bg-[#222] p-3 text-center font-semibold text-yellow-200">
            {mensagem}
          </div>
        )}

        {/* FAQ */}
        <div className="rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow">
          <div className="mb-2 flex items-center gap-1 font-bold text-yellow-300">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <b>Com que frequência devo fazer backup?</b> Recomendamos fazer ao
              menos 1x por mês ou antes de grandes alterações.
            </li>
            <li>
              <b>Perdi meus dados, e agora?</b> Importe seu backup mais recente
              para restaurar o racha.
            </li>
            <li>
              <b>Consigo restaurar para uma data específica?</b> Só se você
              tiver o backup manual do dia desejado.
            </li>
            <li>
              <b>Backup automático?</b> Em breve todos os planos pagos terão
              backup diário automático.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a
                href="/admin/comunicacao/suporte"
                className="text-yellow-400 underline"
              >
                Abrir chamado
              </a>
            </li>
          </ul>
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.3s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}

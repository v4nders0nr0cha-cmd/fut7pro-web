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
    setMensagem("Backup restaurado com sucesso! Os dados serão atualizados em breve.");
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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaDatabase /> Backup & Recuperação
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Proteja e controle os dados do seu racha.</b>
          <br />
          Faça backup manual dos dados do Fut7Pro, exporte informações para Excel/planilhas e
          recupere dados em caso de emergência.
          <br />
          <span className="text-gray-300">
            Recomendamos fazer backup sempre antes de grandes mudanças no painel ou atualizações
            importantes.
          </span>
        </div>

        {/* Cards de opções */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#232323] rounded-lg p-5 shadow border-l-4 border-yellow-400 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FaCloudDownloadAlt className="text-yellow-300 text-xl" />
              <span className="font-bold text-yellow-300 text-lg">Exportar/Backup Manual</span>
            </div>
            <div className="text-gray-200 text-sm">
              Faça backup de todos os dados do racha e baixe um arquivo seguro (.zip ou .json).
            </div>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 py-2 rounded w-fit mt-2 transition"
              onClick={handleBackup}
            >
              Baixar Backup
            </button>
          </div>
          <div className="bg-[#232323] rounded-lg p-5 shadow border-l-4 border-yellow-400 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FaCloudUploadAlt className="text-yellow-300 text-xl" />
              <span className="font-bold text-yellow-300 text-lg">Restaurar Dados</span>
            </div>
            <div className="text-gray-200 text-sm">
              Importe um backup para recuperar o racha (aceita .zip ou .json exportados do Fut7Pro).
            </div>
            <input
              type="file"
              accept=".zip,.json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="text-gray-200 text-sm bg-[#181818] mt-2 p-2 rounded border border-yellow-400"
            />
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 py-2 rounded w-fit mt-2 transition"
              onClick={handleRestore}
              disabled={!file}
            >
              Restaurar Backup
            </button>
          </div>
          <div className="bg-[#232323] rounded-lg p-5 shadow border-l-4 border-yellow-700 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FaHistory className="text-yellow-300 text-xl" />
              <span className="font-bold text-yellow-300 text-lg">Histórico de Backups</span>
            </div>
            <div className="text-gray-200 text-sm">
              Consulte todos os backups feitos manualmente, datas e quem fez. (Em breve)
            </div>
            <span className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded w-fit mt-2">
              Em breve
            </span>
          </div>
          <div className="bg-[#232323] rounded-lg p-5 shadow border-l-4 border-yellow-700 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-yellow-300 text-xl" />
              <span className="font-bold text-yellow-300 text-lg">Backup Automático</span>
            </div>
            <div className="text-gray-200 text-sm">
              Seus dados são salvos automaticamente e com criptografia em servidores seguros. (Em
              breve)
            </div>
            <span className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded w-fit mt-2">
              Em breve
            </span>
          </div>
        </div>

        {/* Mensagem mock de status */}
        {mensagem && (
          <div className="bg-[#222] border border-yellow-700 rounded-lg p-3 text-yellow-200 font-semibold text-center mb-8 animate-fadeIn">
            {mensagem}
          </div>
        )}

        {/* FAQ */}
        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Com que frequência devo fazer backup?</b> Recomendamos fazer ao menos 1x por mês ou
              antes de grandes alterações.
            </li>
            <li>
              <b>Perdi meus dados, e agora?</b> Importe seu backup mais recente para restaurar o
              racha.
            </li>
            <li>
              <b>Consigo restaurar para uma data específica?</b> Só se você tiver o backup manual do
              dia desejado.
            </li>
            <li>
              <b>Backup automático?</b> Em breve todos os planos pagos terão backup diário
              automático.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
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

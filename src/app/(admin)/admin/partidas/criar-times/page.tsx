"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { FaPlus, FaTrash, FaEdit, FaLightbulb } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import { useTimes } from "@/hooks/useTimes";
import { rachaConfig } from "@/config/racha.config";

export default function CriarTimesPage() {
  const rachaId = rachaConfig.slug;
  const { times, addTime, updateTime, deleteTime } = useTimes(rachaId);

  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#FFD700");
  const [logo, setLogo] = useState("");
  const [editandoTime, setEditandoTime] = useState<string | null>(null);
  const [dicasOpen, setDicasOpen] = useState(false);

  const handleAdicionarTime = async () => {
    if (!nome.trim()) return alert("Digite o nome do time!");

    if (editandoTime) {
      const timeExistente = times.find((t) => t.id === editandoTime);
      if (timeExistente) {
        await updateTime({
          ...timeExistente,
          nome,
          cor,
          logo: logo || timeExistente.logo,
        });
      }
      setEditandoTime(null);
    } else {
      await addTime({
        nome,
        cor,
        logo: logo || "/images/times/time_padrao_01.png",
        slug: nome.toLowerCase().replace(/\s+/g, "-"),
        rachaId,
      });
    }

    setNome("");
    setCor("#FFD700");
    setLogo("");
  };

  const handleEditar = (timeId: string) => {
    const time = times.find((t) => t.id === timeId);
    if (time) {
      setEditandoTime(time.id);
      setNome(time.nome);
      setCor(time.cor);
      setLogo(time.logo);
    }
  };

  const handleExcluir = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este time?")) {
      await deleteTime(id);
    }
  };

  return (
    <>
      <Head>
        <title>Criar Times | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre os times do seu racha para utilização no sorteio inteligente, partidas e rankings do Fut7Pro."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">Criar Times</h1>
          <button
            onClick={() => setDicasOpen(true)}
            className="mt-3 flex items-center gap-2 rounded bg-yellow-400 px-3 py-1.5 font-bold text-black hover:bg-yellow-500 sm:mt-0"
          >
            <FaLightbulb /> Dicas
          </button>
        </div>

        <p className="mb-6 max-w-3xl text-gray-300">
          Nesta página você pode cadastrar os{" "}
          <strong>times oficiais do seu racha</strong>. Esses times serão
          utilizados no <strong>Sorteio Inteligente</strong>, nas{" "}
          <strong>partidas</strong> e nos <strong>rankings</strong>. Utilize
          nomes criativos ou aproveite esta funcionalidade para{" "}
          <strong>vender patrocínios</strong> com grande visibilidade.
        </p>

        <div className="mb-6 rounded-lg bg-[#1a1a1a] p-4 shadow">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Nome do Time
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded border border-[#333] bg-[#222] p-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Cor do Time
              </label>
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="h-10 w-16 rounded border border-[#333] p-1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Logo do Time
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setLogo(url);
                  }
                }}
                className="w-full text-sm text-gray-300"
              />
              {logo && (
                <Image
                  src={logo}
                  alt="Logo preview"
                  width={60}
                  height={60}
                  className="mt-2 rounded"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleAdicionarTime}
            className="flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-500"
          >
            <FaPlus /> {editandoTime ? "Salvar Alterações" : "Adicionar Time"}
          </button>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold text-yellow-400">
            Times Cadastrados
          </h2>
          {times.length === 0 ? (
            <p className="text-gray-400">Nenhum time cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {times.map((time) => (
                <div
                  key={time.id}
                  className="flex flex-col items-center rounded-lg border border-[#333] bg-[#1a1a1a] p-4"
                >
                  <Image
                    src={time.logo}
                    alt={time.nome}
                    width={60}
                    height={60}
                    className="mb-2 rounded"
                  />
                  <h3 className="text-lg font-bold text-white">{time.nome}</h3>
                  <span
                    className="mt-1 h-6 w-6 rounded-full border"
                    style={{ backgroundColor: time.cor }}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditar(time.id)}
                      className="text-yellow-400 hover:text-yellow-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleExcluir(time.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={dicasOpen}
        onClose={() => setDicasOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-[#1a1a1a] p-6 shadow-lg">
            <Dialog.Title className="mb-4 text-2xl font-bold text-yellow-400">
              💡 Dicas de Monetização com Times
            </Dialog.Title>
            <p className="mb-4 text-gray-300">
              Você pode utilizar a criação de times para gerar novas
              oportunidades de patrocínio. Cadastre times com{" "}
              <strong>nomes dos patrocinadores</strong> e aumente a visibilidade
              das marcas em diversos pontos da plataforma.
            </p>
            <ul className="mb-4 list-inside list-disc text-gray-300">
              <li>
                <strong>Plano Básico:</strong> Logo e link do patrocinador no
                rodapé e na página de patrocinadores.
              </li>
              <li>
                <strong>Plano Médio:</strong> Tudo do Plano Básico + logo nos
                destaques, rankings e redes sociais.
              </li>
              <li>
                <strong>Plano Master:</strong> Tudo dos anteriores + time
                nomeado com o patrocinador e uniformes personalizados.
              </li>
            </ul>
            <p className="text-gray-300">
              Essa estratégia aumenta o engajamento com as marcas e gera mais
              receita para o seu racha. Combine criatividade e pacotes de
              patrocínio para oferecer o máximo de visibilidade aos
              patrocinadores.
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setDicasOpen(false)}
                className="rounded bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-500"
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

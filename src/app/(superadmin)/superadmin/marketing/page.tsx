"use client";

import { useState } from "react";
import Link from "next/link";

// TIPAGEM do formulário/editável
type InfluencerForm = {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  cupom: string;
  status: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  outros: string;
  whatsapp: string;
  tipoRemuneracao: string;
  valorRemuneracao: string;
  vendasPagas: number;
  cuponsUsados: number;
  trialsConvertidos: number;
  trialsNaoConvertidos: number;
  valorMensalEstimado: string;
  valorRecebido: number;
};

const initialInfluencers: InfluencerForm[] = [
  {
    id: "1",
    nome: "Gabriel Souza",
    sobrenome: "",
    cpf: "111.222.333-44",
    cupom: "GABRIEL10",
    status: "ativo",
    instagram: "@gabrielsz",
    youtube: "",
    tiktok: "",
    outros: "",
    whatsapp: "",
    tipoRemuneracao: "fixo",
    valorRemuneracao: "50",
    vendasPagas: 7,
    cuponsUsados: 12,
    trialsConvertidos: 7,
    trialsNaoConvertidos: 5,
    valorMensalEstimado: "-",
    valorRecebido: 350,
  },
  {
    id: "2",
    nome: "Ana Pereira",
    sobrenome: "",
    cpf: "222.333.444-55",
    cupom: "ANA123",
    status: "inativo",
    instagram: "",
    youtube: "",
    tiktok: "",
    outros: "",
    whatsapp: "(11) 90000-1234",
    tipoRemuneracao: "porcentagem",
    valorRemuneracao: "30",
    vendasPagas: 3,
    cuponsUsados: 8,
    trialsConvertidos: 3,
    trialsNaoConvertidos: 5,
    valorMensalEstimado: "R$ 120.00/mês",
    valorRecebido: 825,
  },
];

// MODAL EDITAR/ADICIONAR INFLUENCER
function InfluencerModal({
  influencer,
  onClose,
  onSave,
  isEdit,
}: {
  influencer: InfluencerForm;
  onClose: () => void;
  onSave: (data: InfluencerForm, isNew: boolean) => void;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<InfluencerForm>({ ...influencer });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form, !isEdit); // isNew=true se não for edição
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-2">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-lg shadow-2xl relative animate-fadeIn">
        <button
          className="absolute top-2 right-4 text-2xl text-zinc-400 hover:text-red-500"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-400">
          {isEdit ? "Editar perfil do influencer" : "Cadastrar novo influencer"}
        </h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              maxLength={40}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="Nome *"
            />
            <input
              name="sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              maxLength={40}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="Sobrenome"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              maxLength={18}
              className="w-44 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="CPF *"
            />
            <input
              name="cupom"
              value={form.cupom}
              onChange={handleChange}
              required
              maxLength={16}
              className="w-44 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="Cupom único *"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded px-2 py-2 bg-zinc-800 text-white"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              maxLength={20}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="WhatsApp (opcional)"
            />
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              maxLength={60}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="Instagram"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="youtube"
              value={form.youtube}
              onChange={handleChange}
              maxLength={60}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="YouTube"
            />
            <input
              name="tiktok"
              value={form.tiktok}
              onChange={handleChange}
              maxLength={60}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="TikTok"
            />
            <input
              name="outros"
              value={form.outros}
              onChange={handleChange}
              maxLength={60}
              className="flex-1 rounded px-2 py-2 bg-zinc-800 text-white"
              placeholder="Outros"
            />
          </div>
          <button
            className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 mt-3"
            type="submit"
          >
            {isEdit ? "Salvar alterações" : "Salvar influencer"}
          </button>
        </form>
      </div>
    </div>
  );
}

// PÁGINA PRINCIPAL
export default function SuperAdminMarketingPage() {
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [itens, setItens] = useState<InfluencerForm[]>(initialInfluencers);
  const [search, setSearch] = useState("");

  function handleSaveEdit(updated: InfluencerForm, isNew: boolean) {
    if (isNew) {
      setItens((prev) => [
        {
          ...updated,
          id: (Date.now() + Math.random()).toString(),
          vendasPagas: 0,
          cuponsUsados: 0,
          trialsConvertidos: 0,
          trialsNaoConvertidos: 0,
          valorMensalEstimado: updated.tipoRemuneracao === "fixo" ? "-" : "R$ 0,00/mês",
          valorRecebido: 0,
        },
        ...prev,
      ]);
    } else {
      setItens((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  }

  // Busca filtrada
  const itensFiltrados = itens.filter((inf) =>
    (inf.nome + " " + inf.sobrenome).toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h1 className="text-2xl font-bold">Marketing & Expansão — Influencers</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar influencer por nome"
            className="px-3 py-2 rounded bg-zinc-800 text-white text-sm w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow"
            onClick={() => setShowAdd(true)}
          >
            + Adicionar influencer
          </button>
        </div>
      </div>
      <div className="bg-zinc-900 rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-2 px-2">Influencer</th>
              <th className="py-2 px-2">Cupons Usados</th>
              <th className="py-2 px-2">Trials Convertidos</th>
              <th className="py-2 px-2">Trials Não Convertidos</th>
              <th className="py-2 px-2">Vendas Pagas</th>
              <th className="py-2 px-2">Forma Pagamento</th>
              <th className="py-2 px-2">Valor Mensal (estimado)</th>
              <th className="py-2 px-2">Valor Recebido (total)</th>
              <th className="py-2 px-2">Ver Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.map((inf) => (
              <tr key={inf.id} className="border-b border-zinc-800 hover:bg-zinc-800 transition">
                <td className="py-2 px-2">
                  <button
                    className="text-blue-400 hover:underline font-bold"
                    onClick={() => setEditId(inf.id)}
                  >
                    {inf.nome}
                  </button>
                </td>
                <td className="py-2 px-2">{inf.cuponsUsados}</td>
                <td className="py-2 px-2 text-green-400">{inf.trialsConvertidos}</td>
                <td className="py-2 px-2 text-red-400">{inf.trialsNaoConvertidos}</td>
                <td className="py-2 px-2">{inf.vendasPagas}</td>
                <td className="py-2 px-2">
                  {inf.tipoRemuneracao === "fixo"
                    ? `R$ ${parseFloat(inf.valorRemuneracao).toFixed(2)} por venda`
                    : `${parseFloat(inf.valorRemuneracao).toFixed(2)}% mensal recorrente`}
                </td>
                <td className="py-2 px-2 text-yellow-300">{inf.valorMensalEstimado}</td>
                <td className="py-2 px-2 text-green-400">R$ {inf.valorRecebido.toFixed(2)}</td>
                <td className="py-2 px-2">
                  <Link
                    href={`/superadmin/marketing/${inf.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition"
                  >
                    VER +
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {itensFiltrados.length === 0 && (
          <div className="text-zinc-400 text-center py-8">Nenhum influencer encontrado...</div>
        )}
      </div>
      {(editId || showAdd) && (
        <InfluencerModal
          influencer={
            editId
              ? itens.find((i) => i.id === editId)!
              : {
                  id: "",
                  nome: "",
                  sobrenome: "",
                  cpf: "",
                  cupom: "",
                  status: "ativo",
                  instagram: "",
                  youtube: "",
                  tiktok: "",
                  outros: "",
                  whatsapp: "",
                  tipoRemuneracao: "fixo",
                  valorRemuneracao: "50",
                  vendasPagas: 0,
                  cuponsUsados: 0,
                  trialsConvertidos: 0,
                  trialsNaoConvertidos: 0,
                  valorMensalEstimado: "-",
                  valorRecebido: 0,
                }
          }
          onClose={() => {
            setEditId(null);
            setShowAdd(false);
          }}
          onSave={handleSaveEdit}
          isEdit={!!editId}
        />
      )}
    </div>
  );
}

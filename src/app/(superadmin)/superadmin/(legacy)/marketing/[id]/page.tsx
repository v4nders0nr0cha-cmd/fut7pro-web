"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// MOCK (idêntico ao anterior, mas com suporte ao comprovante)
const influencersMockBase = [
  {
    id: "1",
    nome: "Gabriel Souza",
    cupom: "GABRIEL10",
    tipoRemuneracao: "fixo",
    valorRemuneracao: "50",
    vendasPagas: 7,
    presidentesAtivos: [],
    valorPlano: null,
    cuponsUsados: 12,
    trialsConvertidos: 7,
    trialsNaoConvertidos: 5,
    trialsEmPeriodoGratis: 3,
    status: "ativo",
    instagram: "@gabrielsz",
    pagamentosRecebidos: [
      { valor: 100, data: "2025-05-10", metodo: "PIX", obs: "", comprovante: null },
      {
        valor: 250,
        data: "2025-06-20",
        metodo: "PIX",
        obs: "Bônus de campanha",
        comprovante: null,
      },
    ],
  },
];

function calcularTotalVendas(inf: any) {
  if (inf.tipoRemuneracao === "fixo") {
    return inf.vendasPagas * parseFloat(inf.valorRemuneracao || "0");
  }
  if (inf.tipoRemuneracao === "porcentagem" && Array.isArray(inf.presidentesAtivos)) {
    let total = 0;
    inf.presidentesAtivos.forEach((p: any) => {
      total += p.valorPlano * (parseFloat(inf.valorRemuneracao || "0") / 100) * (p.mesesAtivo || 1);
    });
    return total;
  }
  return 0;
}
function calcularValorPago(inf: any) {
  return inf.pagamentosRecebidos.reduce((acc: number, p: any) => acc + (p.valor || 0), 0);
}
function calcularValorAPagar(inf: any) {
  return calcularTotalVendas(inf) - calcularValorPago(inf);
}
function calcularValorMensalEstimado(inf: any) {
  if (inf.tipoRemuneracao === "porcentagem" && Array.isArray(inf.presidentesAtivos)) {
    let total = 0;
    inf.presidentesAtivos.forEach((p: any) => {
      total += p.valorPlano * (parseFloat(inf.valorRemuneracao || "0") / 100);
    });
    return total;
  }
  return 0;
}

// MODAL REGISTRAR PAGAMENTO MANUAL
function RegistrarPagamentoModal({
  onClose,
  onAddPagamento,
}: {
  onClose: () => void;
  onAddPagamento: (p: any) => void;
}) {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState("PIX");
  const [obs, setObs] = useState("");
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setComprovante(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || isNaN(Number(valor))) return;
    let comprovanteUrl: string | null = null;
    if (comprovante && previewUrl) {
      comprovanteUrl = previewUrl;
    }
    onAddPagamento({
      valor: Number(valor),
      data: new Date().toISOString().slice(0, 10),
      metodo,
      obs,
      comprovante: comprovanteUrl,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm relative">
        <button
          className="absolute top-2 right-4 text-2xl text-zinc-400 hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-2 text-yellow-300">Registrar pagamento manual</h3>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            type="number"
            min={1}
            step={0.01}
            placeholder="Valor"
            className="rounded px-2 py-2 bg-zinc-800 text-white"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
          <select
            className="rounded px-2 py-2 bg-zinc-800 text-white"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <option value="PIX">PIX</option>
            <option value="Espécie">Espécie</option>
          </select>
          <input
            placeholder="Observação (opcional)"
            className="rounded px-2 py-2 bg-zinc-800 text-white"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
          <label className="block text-xs text-zinc-300 mt-1">
            Comprovante (opcional):
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block mt-1"
            />
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Prévia comprovante"
              className="mt-2 w-28 rounded border border-zinc-700"
            />
          )}
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded mt-2"
            type="submit"
          >
            Salvar pagamento
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InfluencerDetalhePage() {
  const params = useParams<{ id: string }>();
  const [modalPagamento, setModalPagamento] = useState(false);

  // Simulando state para pagamentos em tempo real
  const [influencer, setInfluencer] = useState(() => {
    const i = influencersMockBase.find((i) => i.id === (params && params.id));
    return i ? { ...i, pagamentosRecebidos: [...i.pagamentosRecebidos] } : null;
  });

  if (!params || !params.id || !influencer) {
    return <div className="p-8 text-red-400">Influencer não encontrado.</div>;
  }

  function addPagamento(p: any) {
    setInfluencer((inf: any) => ({
      ...inf,
      pagamentosRecebidos: [...inf.pagamentosRecebidos, p],
    }));
  }

  return (
    <main className="bg-zinc-950 min-h-screen px-4 py-10 flex flex-col items-center">
      <section className="bg-zinc-900 max-w-2xl w-full rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2 text-yellow-400">{influencer.nome}</h1>
        <p className="mb-2 text-base text-zinc-300">
          Cupom: <span className="text-blue-400 font-mono">{influencer.cupom}</span>
          <br />
          Status:{" "}
          <span
            className={
              influencer.status === "ativo" ? "text-green-400 font-bold" : "text-red-400 font-bold"
            }
          >
            {influencer.status}
          </span>
          <br />
          Instagram: {influencer.instagram || "-"}
        </p>

        {/* Resultados até o momento */}
        <div className="mb-4">
          <div className="text-lg font-bold text-zinc-100 mb-2">Resultados até o momento</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span>Cupons usados:</span>
            <span className="font-bold">{influencer.cuponsUsados}</span>
            <span>Compras realizadas:</span>
            <span className="font-bold text-green-400">{influencer.trialsConvertidos}</span>
            <span>Em período grátis:</span>
            <span className="font-bold text-yellow-400">
              {influencer.trialsEmPeriodoGratis ?? 0}
            </span>
            <span>Não converteram:</span>
            <span className="font-bold text-red-400">{influencer.trialsNaoConvertidos}</span>
            <span>Status do cupom:</span>
            <span
              className={
                influencer.status === "ativo"
                  ? "font-bold text-green-400"
                  : "font-bold text-red-400"
              }
            >
              {influencer.status}
            </span>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2 text-yellow-300">Resumo Financeiro</div>
          <div>
            <div>
              <span className="font-bold">Total em vendas:</span>{" "}
              <span className="text-blue-300">R$ {calcularTotalVendas(influencer).toFixed(2)}</span>
            </div>
            <div>
              <span className="font-bold">Valor já pago:</span>{" "}
              <span className="text-green-400">R$ {calcularValorPago(influencer).toFixed(2)}</span>
            </div>
            <div>
              <span className="font-bold">Valor a pagar:</span>{" "}
              <span className="text-yellow-400">
                R$ {calcularValorAPagar(influencer).toFixed(2)}
              </span>
            </div>
            <div className="mt-4">
              {influencer.tipoRemuneracao === "fixo" ? (
                <div>
                  Recebe{" "}
                  <b className="text-blue-300">
                    R$ {parseFloat(influencer.valorRemuneracao).toFixed(2)}
                  </b>{" "}
                  por venda realizada.
                  <br />
                  Total de vendas pagas:{" "}
                  <span className="text-green-400 font-bold">{influencer.vendasPagas}</span>
                </div>
              ) : (
                <div>
                  Recebe{" "}
                  <b className="text-blue-300">
                    {parseFloat(influencer.valorRemuneracao).toFixed(2)}%
                  </b>{" "}
                  do valor do plano de cada presidente indicado <b>TODO MÊS</b>, enquanto o
                  presidente estiver ativo.
                  <br />
                  Valor mensal estimado:{" "}
                  <span className="text-yellow-300 font-bold">
                    R$ {calcularValorMensalEstimado(influencer).toFixed(2)}/mês
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela detalhada de pagamentos recebidos */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Pagamentos recebidos por suas indicações</div>
          <table className="w-full text-xs bg-zinc-800 rounded-lg overflow-hidden mb-2">
            <thead>
              <tr className="text-zinc-300">
                <th className="py-2">Valor</th>
                <th className="py-2">Data</th>
                <th className="py-2">Método</th>
                <th className="py-2">Obs</th>
                <th className="py-2">Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {influencer.pagamentosRecebidos.map((p: any, i: number) => (
                <tr key={i} className="border-b border-zinc-700">
                  <td>R$ {p.valor.toFixed(2)}</td>
                  <td>{new Date(p.data).toLocaleDateString()}</td>
                  <td>{p.metodo}</td>
                  <td>{p.obs || "-"}</td>
                  <td>
                    {p.comprovante ? (
                      <a href={p.comprovante} target="_blank" rel="noopener noreferrer">
                        <img
                          src={p.comprovante}
                          alt="Comprovante"
                          className="inline-block w-10 h-10 object-cover rounded border border-zinc-700"
                        />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-xs font-bold"
            onClick={() => setModalPagamento(true)}
          >
            Registrar pagamento manual
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-800 text-white px-4 py-2 rounded shadow text-xs font-bold">
            Exportar histórico
          </button>
        </div>

        {modalPagamento && (
          <RegistrarPagamentoModal
            onClose={() => setModalPagamento(false)}
            onAddPagamento={addPagamento}
          />
        )}

        <div className="mt-6">
          <Link href="/superadmin/marketing" className="text-blue-400 hover:underline">
            &larr; Voltar
          </Link>
        </div>
      </section>
    </main>
  );
}

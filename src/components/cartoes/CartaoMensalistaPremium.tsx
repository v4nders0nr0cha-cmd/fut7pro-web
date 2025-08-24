import Image from "next/image";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";

function CartaoMensalistaPremium({
  nome,
  logoRacha,
  ativo = true,
}: {
  nome: string;
  logoRacha: string;
  ativo?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);

  const handleDownload = async () => {
    if (!ativo || !cardRef.current) return;
    setExportando(true);
    await new Promise((r) => setTimeout(r, 60));
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2,
    });
    setExportando(false);
    const link = document.createElement("a");
    link.download = `cartao-mensalista-${nome.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex h-[160px] w-[340px] overflow-hidden rounded-2xl border-4 bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center shadow-2xl transition ${ativo ? "cursor-pointer border-green-400 shadow-green-400/50 hover:brightness-110" : "border-gray-400 shadow-gray-700/30"} `}
      style={{
        boxShadow: exportando
          ? "none"
          : ativo
            ? "0 0 18px 2px #38ff00, 0 2px 22px #0008"
            : "0 0 10px #6668",
      }}
      title={ativo ? "Clique para salvar seu Cartão Mensalista" : ""}
      onClick={ativo ? handleDownload : undefined}
      onKeyDown={
        ativo ? (e) => e.key === "Enter" && handleDownload() : undefined
      }
      role={ativo ? "button" : undefined}
      tabIndex={ativo ? 0 : undefined}
      aria-label={ativo ? "Baixar cartão mensalista" : undefined}
    >
      {/* Lado esquerdo: Selo MENSALISTA */}
      <div className="flex flex-1 flex-col justify-between py-4 pl-5">
        <div>
          <div className="text-base font-extrabold tracking-wide text-green-400 drop-shadow-sm">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito: Logo + nome abaixo */}
      <div className="flex w-[140px] flex-col items-center justify-between py-3 pr-5">
        <div className="mb-1 mt-1 text-xs font-semibold text-green-400">
          Ativo no mês
        </div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="mb-1 rounded-lg border border-white"
          draggable={false}
        />
        <div
          className="mt-2 text-center text-sm font-bold text-white"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip no canto inferior ESQUERDO */}
      {ativo && !exportando && (
        <div className="pointer-events-none absolute bottom-2 left-2 select-none rounded bg-black/70 px-2 py-1 text-[10px] text-green-300">
          Clique para baixar seu cartão!
        </div>
      )}
      {/* Neon */}
      {!exportando && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-green-400 opacity-70"
          style={{
            boxShadow: "0 0 18px 3px #38ff00, 0 0 18px #38ff0050 inset",
          }}
        />
      )}
    </div>
  );
}

export default CartaoMensalistaPremium;

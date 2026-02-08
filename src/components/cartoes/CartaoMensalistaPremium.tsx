import Image from "next/image";

function CartaoMensalistaPremium({
  nome,
  logoRacha,
  ativo = true,
}: {
  nome: string;
  logoRacha: string;
  ativo?: boolean;
}) {
  return (
    <div
      className={`
                relative w-[340px] h-[160px] rounded-2xl overflow-hidden shadow-2xl
                border-4 flex
                bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center
                transition
                ${ativo ? "border-green-400 shadow-green-400/50" : "border-gray-400 shadow-gray-700/30"}
            `}
      style={{
        boxShadow: ativo ? "0 0 18px 2px #38ff00, 0 2px 22px #0008" : "0 0 10px #6668",
      }}
    >
      {/* Lado esquerdo: Selo MENSALISTA */}
      <div className="flex flex-col justify-between pl-5 py-4 flex-1">
        <div>
          <div className="text-green-400 font-extrabold text-base drop-shadow-sm tracking-wide">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito: Logo + nome abaixo */}
      <div className="flex flex-col items-center justify-between w-[140px] py-3 pr-5">
        <div className="text-green-400 font-semibold text-xs mb-1 mt-1">Ativo no mês</div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="rounded-lg border border-white mb-1"
          draggable={false}
        />
        <div
          className="text-white font-bold text-sm mt-2 text-center"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip no canto inferior ESQUERDO */}
      {ativo && (
        <div className="absolute left-2 bottom-2 bg-black/70 px-2 py-1 rounded text-[10px] text-green-300 pointer-events-none select-none">
          Mensalista, prioridade garantida
        </div>
      )}
      {/* Neon */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-green-400 opacity-70"
        style={{
          boxShadow: "0 0 18px 3px #38ff00, 0 0 18px #38ff0050 inset",
        }}
      />
    </div>
  );
}

export default CartaoMensalistaPremium;

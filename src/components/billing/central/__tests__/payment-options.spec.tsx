import { fireEvent, render, screen } from "@testing-library/react";
import PaymentOptions from "../PaymentOptions";
import { paymentActionLabel } from "../payment-presentation";

const props = () => ({
  label: "Essencial",
  interval: "month" as const,
  pricing: {
    totalCents: 12000,
    baseAmountCents: 15000,
    recurringAmountCents: 15000,
    discountCents: 3000,
    discountPct: 20,
    isFirstPayment: true,
    firstPaymentDiscountApplied: true,
  },
  enabled: true,
  recurring: true,
  pix: true,
  canApplyCoupon: true,
  cardSelected: false,
  selectCard: jest.fn(),
  accepted: false,
  accept: jest.fn(),
  payCard: jest.fn(),
  payPix: jest.fn(),
  coupon: "",
  setCoupon: jest.fn(),
  applyCoupon: jest.fn(),
  couponMessage: null,
  quotePending: false,
  retry: jest.fn(),
});

it.each([
  ["TESTE", 0, "Configurar pagamento"],
  ["VENCIDO", 0, "Regularizar pagamento"],
  ["PENDENTE", 1, "Pagar cobrança"],
  ["PENDENTE", 0, "Opções de pagamento"],
  ["EM_DIA", 0, "Opções de pagamento"],
  [undefined, 0, "Opções de pagamento"],
] as const)("usa o estado financeiro oficial %s", (code, count, label) => {
  expect(paymentActionLabel(code, count)).toBe(label);
});
it("mostra as duas modalidades sem pedir consentimento antes da escolha", () => {
  const p = props();
  render(<PaymentOptions {...p} />);
  expect(
    screen.getByRole("region", { name: "Mercado Pago - assinatura automática" })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/cartão de crédito ou outros meios disponíveis para sua assinatura/)
  ).toBeInTheDocument();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  expect(screen.getAllByText(/120,00/)).toHaveLength(2);
  expect(screen.getByText(/Depois:.*150,00/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Ver formas de pagamento/ }));
  expect(p.selectCard).toHaveBeenCalledTimes(1);
  expect(p.payCard).not.toHaveBeenCalled();
});
it("PIX não exige consentimento de recorrência", () => {
  const p = props();
  render(<PaymentOptions {...p} />);
  fireEvent.click(screen.getByRole("button", { name: /Pagar com PIX/ }));
  expect(p.payPix).toHaveBeenCalledTimes(1);
  expect(p.payCard).not.toHaveBeenCalled();
});
it("exige autorização depois da opção Mercado Pago e informa a confirmação final", () => {
  const p = { ...props(), cardSelected: true };
  const view = render(<PaymentOptions {...p} />);
  expect(screen.getByText(/conferir o meio de pagamento, o valor/)).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toHaveFocus();
  expect(screen.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })).toBeDisabled();
  view.rerender(<PaymentOptions {...p} accepted />);
  fireEvent.click(screen.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" }));
  expect(p.payCard).toHaveBeenCalledTimes(1);
});
it("bloqueia os dois meios durante atualização após cupom", () => {
  render(<PaymentOptions {...props()} quotePending cardSelected accepted />);
  expect(screen.getByRole("button", { name: /Pagar com PIX/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })).toBeDisabled();
});
it("não inventa preços quando o resumo financeiro está indisponível", () => {
  render(<PaymentOptions {...props()} pricing={undefined} />);
  expect(screen.getAllByText("Consultando valor")).toHaveLength(2);
  expect(screen.getByRole("button", { name: /Pagar com PIX/ })).toBeDisabled();
});
it("oferece o cupom somente com permissão", () => {
  const p = props();
  const view = render(<PaymentOptions {...p} />);
  expect(screen.getByText("Tem um cupom de desconto?")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Aplicar cupom", hidden: true })).toBeDisabled();
  view.rerender(<PaymentOptions {...p} canApplyCoupon={false} />);
  expect(screen.queryByText("Tem um cupom de desconto?")).not.toBeInTheDocument();
});
it("mostra somente as modalidades permitidas e distingue condição recorrente", () => {
  const p = props();
  render(
    <PaymentOptions
      {...p}
      recurring={false}
      pricing={{ ...p.pricing, firstPaymentDiscountApplied: false, recurringDiscountApplied: true }}
    />
  );
  expect(screen.queryByRole("button", { name: /Ver formas de pagamento/ })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Pagar com PIX/ })).toBeEnabled();
});
it("explica a condição recorrente na assinatura automática e no PIX sem prometer nova promoção", () => {
  const p = props();
  render(
    <PaymentOptions
      {...p}
      pricing={{ ...p.pricing, firstPaymentDiscountApplied: false, recurringDiscountApplied: true }}
      couponCode="CREATOR"
      trialEnd="2027-01-15T12:00:00Z"
    />
  );
  expect(screen.getAllByText("Condição recorrente considerada neste valor.")).toHaveLength(2);
  expect(screen.getByText(/Teste gratuito registrado até/)).toBeInTheDocument();
  expect(screen.getByText("CREATOR")).toBeInTheDocument();
  expect(screen.queryByText(/Desconto somente nesta cobrança/)).not.toBeInTheDocument();
});

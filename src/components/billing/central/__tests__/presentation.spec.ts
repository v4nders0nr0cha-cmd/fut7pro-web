import { dateTime } from "../presentation";
it("informa hora e fuso de validade do PIX mesmo em outro fuso do navegador", () => {
  expect(dateTime("2026-11-26T22:30:00Z")).toBe("26/11/2026, 19:30 (horário de Brasília)");
  expect(dateTime("invalid")).toBe("Não registrado");
});

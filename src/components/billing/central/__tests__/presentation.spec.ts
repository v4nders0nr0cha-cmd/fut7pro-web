import { dateTime, isPixExpired } from "../presentation";
it("informa hora e fuso de validade do PIX mesmo em outro fuso do navegador", () => {
  expect(dateTime("2026-11-26T22:30:00Z")).toBe("26/11/2026, 19:30 (horário de Brasília)");
  expect(dateTime("invalid")).toBe("Não registrado");
});
it("distingue prazo do PIX encerrado, futuro e não registrado sem alterar situação financeira", () => {
  const now = Date.parse("2026-11-26T22:30:00Z");
  expect(isPixExpired("2026-11-26T22:29:59Z", now)).toBe(true);
  expect(isPixExpired("2026-11-26T22:30:00Z", now)).toBe(true);
  expect(isPixExpired("2026-11-26T22:30:01Z", now)).toBe(false);
  expect(isPixExpired(null, now)).toBe(false);
  expect(isPixExpired("invalid", now)).toBe(false);
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SecurityRecoveryPanel from "../SecurityRecoveryPanel";

const baseStatus = {
  enabled: false,
  hasMinimumMethod: false,
  requiredAt: "2026-04-01T00:00:00.000Z",
  checkedAt: "2026-03-02T00:00:00.000Z",
  methods: {
    recoveryEmail: {
      configured: false,
      verified: false,
      maskedValue: null,
      verifiedAt: null,
    },
    whatsapp: {
      configured: false,
      verified: false,
      maskedValue: null,
      verifiedAt: null,
    },
    recoveryCodes: {
      configured: false,
      activeCount: 0,
      rotatedAt: null,
    },
  },
};

describe("SecurityRecoveryPanel", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as any).fetch;
  });

  it("solicita codigo de e-mail de recuperacao", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, message: "Se estiver tudo certo, enviamos seu codigo." }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => baseStatus,
      } as any);

    render(<SecurityRecoveryPanel initialStatus={baseStatus as any} />);

    fireEvent.change(screen.getByPlaceholderText("email.recuperacao@dominio.com"), {
      target: { value: "recuperacao@fut7pro.com" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Enviar codigo" })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/perfil/security/recovery/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "recuperacao@fut7pro.com" }),
      });
    });
    expect(
      await screen.findByText("Se estiver tudo certo, enviamos seu codigo.")
    ).toBeInTheDocument();
  });

  it("gera novos recovery codes e exibe a lista na tela", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Novos recovery codes gerados.",
        codes: ["ABCD-1234-EFGH", "IJKL-5678-MNOP"],
        securityRecovery: {
          ...baseStatus,
          enabled: true,
          hasMinimumMethod: true,
          methods: {
            ...baseStatus.methods,
            recoveryCodes: {
              configured: true,
              activeCount: 2,
              rotatedAt: "2026-03-02T12:00:00.000Z",
            },
          },
        },
      }),
    } as any);

    render(<SecurityRecoveryPanel initialStatus={baseStatus as any} />);

    fireEvent.click(screen.getByRole("button", { name: "Gerar novos recovery codes" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/perfil/security/recovery/codes/regenerate", {
        method: "POST",
      });
    });
    expect(await screen.findByText(/ABCD-1234-EFGH/)).toBeInTheDocument();
    expect(screen.getByText(/IJKL-5678-MNOP/)).toBeInTheDocument();
  });
});

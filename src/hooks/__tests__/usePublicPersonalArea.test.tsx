import { renderHook } from "@testing-library/react";
import { usePublicPersonalArea } from "../usePublicPersonalArea";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";

jest.mock("next-auth/react", () => ({ useSession: jest.fn() }));
jest.mock("@/hooks/useMe", () => ({ useMe: jest.fn() }));
jest.mock("@/hooks/useGlobalProfile", () => ({ useGlobalProfile: jest.fn() }));

const session = useSession as jest.Mock;
const me = useMe as jest.Mock;
const profile = useGlobalProfile as jest.Mock;

describe("destinos pessoais públicos compartilhados", () => {
  beforeEach(() => {
    session.mockReturnValue({
      data: {
        user: {
          email: "ana@example.com",
          accessToken: "token",
          accessTokenExp: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      status: "authenticated",
    });
    profile.mockReturnValue({
      profile: {
        user: { name: "Ana" },
        memberships: [
          { tenantSlug: "azul", status: "APROVADO" },
          { tenantSlug: "verde", status: "APROVADO" },
        ],
      },
    });
    me.mockReturnValue({
      me: { membership: { status: "APROVADO" }, athlete: { firstName: "Ana", mensalista: false } },
      isError: false,
      isLoading: false,
      mutate: jest.fn(),
    });
  });

  it("mantém perfil esportivo, troca de grupo e situação no grupo aprovado", () => {
    const { result } = renderHook(() => usePublicPersonalArea("azul"));
    const items = result.current.sections.flatMap((section) => section.items);
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Meu desempenho neste grupo", href: "/azul/perfil" }),
        expect.objectContaining({ label: "Trocar de grupo", href: "/perfil#meus-rachas" }),
        expect.objectContaining({
          label: "Situação de mensalista",
          href: "/azul/minha-conta#mensalista",
        }),
      ])
    );
  });

  it("não mostra desempenho nem mensalista sem aprovação", () => {
    me.mockReturnValue({
      me: { membership: { status: "PENDENTE" }, athlete: null },
      isError: false,
      isLoading: false,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => usePublicPersonalArea("azul"));
    const labels = result.current.sections.flatMap((section) =>
      section.items.map((item) => item.label)
    );
    expect(labels).toContain("Solicitação em análise");
    expect(labels).not.toContain("Meu desempenho neste grupo");
    expect(labels).not.toContain("Situação de mensalista");
  });
});

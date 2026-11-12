import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MinhaContaPage from "../page";
import { usePublicPersonalArea } from "@/hooks/usePublicPersonalArea";
import { useOwnerAthletePremiumProfile } from "@/hooks/useAthletePremiumProfile";
import { signOut } from "next-auth/react";

jest.mock("next/navigation", () => ({
  useParams: () => ({ slug: "racha-azul" }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-auth/react", () => ({ signOut: jest.fn() }));
jest.mock("@/hooks/usePublicPersonalArea", () => ({ usePublicPersonalArea: jest.fn() }));
jest.mock("@/hooks/useAthletePremiumProfile", () => ({ useOwnerAthletePremiumProfile: jest.fn() }));
jest.mock("@/components/ui/AvatarFut7Pro", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const mockedPersonal = usePublicPersonalArea as jest.Mock;
const mockedPremium = useOwnerAthletePremiumProfile as jest.Mock;
const base = {
  authenticated: true,
  loading: false,
  approved: true,
  pending: false,
  complete: true,
  me: { athlete: { mensalista: false, mensalistaRequestStatus: null } },
  mutateMe: jest.fn(),
  name: "Ana Silva",
  email: "ana@example.com",
  avatar: "/avatar.png",
  groupSlug: "racha-azul",
  sections: [
    {
      title: "Minha conta",
      items: [{ label: "Perfil Global Fut7Pro", href: "/perfil", icon: "account" }],
    },
    {
      title: "Meu futebol",
      items: [
        { label: "Meu desempenho neste grupo", href: "/racha-azul/perfil", icon: "performance" },
      ],
    },
  ],
};

describe("área pessoal pública", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPersonal.mockReturnValue(base);
    mockedPremium.mockReturnValue({ premiumProfile: { tenant: { name: "Racha Azul" } } });
  });

  it("mostra identidade, desempenho e convite com nome real e sem benefícios inventados", () => {
    render(<MinhaContaPage />);
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meu desempenho neste grupo" })).toHaveAttribute(
      "href",
      "/racha-azul/perfil"
    );
    expect(screen.getByText("Seja mensalista do Racha Azul!")).toBeInTheDocument();
    expect(screen.queryByText(/benefícios exclusivos/i)).not.toBeInTheDocument();
  });

  it("usa o identificador do grupo quando o nome não está disponível", () => {
    mockedPremium.mockReturnValue({ premiumProfile: null });
    render(<MinhaContaPage />);
    expect(screen.getByText("Seja mensalista do racha-azul!")).toBeInTheDocument();
  });

  it("confirma uma única solicitação e substitui o convite por estado pendente", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => "{}" } as Response);
    global.fetch = fetchMock;
    render(<MinhaContaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitar vaga de mensalista" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(screen.getByText("Solicitação em análise")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/public/racha-azul/mensalistas/request", {
      method: "POST",
      cache: "no-store",
    });
    expect(
      screen.queryByRole("button", { name: "Solicitar vaga de mensalista" })
    ).not.toBeInTheDocument();
    delete (global as { fetch?: typeof fetch }).fetch;
  });

  it("reconsulta o estado quando a resposta do envio é perdida", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("Conexão interrompida"));
    global.fetch = fetchMock;
    mockedPersonal.mockReturnValue({
      ...base,
      mutateMe: jest.fn().mockResolvedValue({ athlete: { mensalistaRequestStatus: "PENDING" } }),
    });
    render(<MinhaContaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitar vaga de mensalista" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(screen.getByText("Solicitação em análise")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    delete (global as { fetch?: typeof fetch }).fetch;
  });

  it.each(["PENDING", "APPROVED"])("respeita o estado persistido %s", (state) => {
    mockedPersonal.mockReturnValue({
      ...base,
      me: { athlete: { mensalista: state === "APPROVED", mensalistaRequestStatus: state } },
    });
    render(<MinhaContaPage />);
    expect(
      screen.queryByRole("button", { name: "Solicitar vaga de mensalista" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(state === "APPROVED" ? "Mensalista do grupo" : "Solicitação em análise")
    ).toBeInTheDocument();
  });

  it("não oferece solicitação sem vínculo aprovado e preserva logout", () => {
    mockedPersonal.mockReturnValue({ ...base, approved: false, pending: true, me: null });
    render(<MinhaContaPage />);
    expect(
      screen.queryByRole("button", { name: "Solicitar vaga de mensalista" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/racha-azul" });
  });
});

import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";

jest.mock("swr");

describe("usePublicSponsors", () => {
  const mockedUseSWR = useSWR as unknown as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("preenche 10 slots no footer com placeholders e sobrescreve por ordem do patrocinador real", () => {
    mockedUseSWR.mockReturnValue({
      data: [
        {
          id: "sponsor-2",
          name: "Loja X",
          logoUrl: "https://cdn.test/logo-loja-x.png",
          displayOrder: 2,
          showOnFooter: true,
          isPlaceholder: false,
        },
        {
          id: "hidden-3",
          name: "Nao deve aparecer",
          logoUrl: "https://cdn.test/logo-hidden.png",
          displayOrder: 3,
          showOnFooter: false,
          isPlaceholder: false,
        },
      ],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => usePublicSponsors("vitrine", { fillDefaultSlots: true }));

    expect(result.current.slots).toHaveLength(10);
    expect(result.current.slots[0]).toMatchObject({
      id: "placeholder-slot-1",
      isPlaceholder: true,
      logoUrl: "/images/logos/logo_fut7pro.png",
      displayOrder: 1,
    });
    expect(result.current.slots[1]).toMatchObject({
      id: "sponsor-2",
      isPlaceholder: false,
      displayOrder: 2,
    });
    expect(result.current.slots[2]).toMatchObject({
      id: "placeholder-slot-3",
      isPlaceholder: true,
      logoUrl: "/images/patrocinadores/patrocinador_03.png",
      displayOrder: 3,
    });
  });

  it("mantem somente patrocinadores reais quando fillDefaultSlots nao for habilitado", () => {
    mockedUseSWR.mockReturnValue({
      data: [
        {
          id: "sponsor-1",
          name: "Fut7Pro",
          logoUrl: "https://cdn.test/logo-fut7pro.png",
          displayOrder: 1,
          showOnFooter: true,
          isPlaceholder: false,
        },
        {
          id: "hidden-2",
          name: "Oculto",
          logoUrl: "https://cdn.test/logo-hidden.png",
          displayOrder: 2,
          showOnFooter: false,
          isPlaceholder: false,
        },
      ],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => usePublicSponsors("vitrine"));

    expect(result.current.slots).toHaveLength(1);
    expect(result.current.slots[0]).toMatchObject({
      id: "sponsor-1",
      displayOrder: 1,
    });
    expect(result.current.sponsors).toHaveLength(1);
  });
});

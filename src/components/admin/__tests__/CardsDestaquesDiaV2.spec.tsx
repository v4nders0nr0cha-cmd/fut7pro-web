import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import type { PublicMatch } from "@/types/partida";

const matches: PublicMatch[] = [
  {
    id: "m1",
    date: "2025-12-14T12:00:00.000Z",
    location: null,
    scoreA: 3,
    scoreB: 1,
    score: { teamA: 3, teamB: 1 },
    teamA: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
    teamB: { id: "B", name: "Time Branco", logoUrl: "/logoB.png", color: "#fff" },
    presences: [
      {
        id: "p1",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a1",
        teamId: "A",
        status: "TITULAR",
        goals: 2,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a1",
          name: "Artilheiro Azul",
          nickname: "AA",
          position: "ATA",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
      {
        id: "p2",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a2",
        teamId: "A",
        status: "TITULAR",
        goals: 0,
        assists: 2,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a2",
          name: "Maestro Azul",
          nickname: "MA",
          position: "MEIA",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
      {
        id: "p3",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a3",
        teamId: "A",
        status: "TITULAR",
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a3",
          name: "Goleiro Azul",
          nickname: "GA",
          position: "GOL",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
    ],
  },
];

function makePresence(overrides: Partial<PublicMatch["presences"][number]>) {
  return {
    id: overrides.id ?? "presence",
    matchId: "m1",
    tenantId: "t1",
    athleteId: overrides.athleteId ?? "athlete",
    teamId: overrides.teamId ?? "A",
    status: overrides.status ?? "TITULAR",
    goals: overrides.goals ?? 0,
    assists: overrides.assists ?? 0,
    yellowCards: 0,
    redCards: 0,
    createdAt: "2025-12-14T12:00:00.000Z",
    updatedAt: "2025-12-14T12:00:00.000Z",
    athlete: overrides.athlete ?? {
      id: overrides.athleteId ?? "athlete",
      name: "Atleta",
      nickname: null,
      position: "MEIA",
      photoUrl: null,
    },
    team: overrides.team ?? { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
    effectivePosition: overrides.effectivePosition ?? null,
    posicaoEfetivaSorteio: overrides.posicaoEfetivaSorteio ?? null,
  } satisfies PublicMatch["presences"][number];
}

function makeMatchWithPresences(presences: PublicMatch["presences"]) {
  return {
    ...matches[0],
    presences,
  } satisfies PublicMatch;
}

describe("CardsDestaquesDiaV2", () => {
  it("renderiza apenas destaques individuais a partir das partidas reais", () => {
    render(<CardsDestaquesDiaV2 matches={matches} />);

    expect(screen.queryByText(/Time Campeão do Dia/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Atacante do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Meia do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Goleiro do Dia/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Artilheiro Azul/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maestro Azul/i).length).toBeGreaterThan(0);
  });

  it("mantem restauracao do Meia original quando o destaque recalcula para BOT", async () => {
    const onToggleAusencia = jest.fn().mockResolvedValue(undefined);
    const cleivan = makePresence({
      id: "p-cleivan",
      athleteId: "cleivan",
      assists: 2,
      effectivePosition: "MEIA",
      athlete: {
        id: "cleivan",
        name: "Cleivan",
        nickname: null,
        position: "MEIA",
        photoUrl: null,
      },
    });
    const baseMatches = [
      makeMatchWithPresences([
        makePresence({
          id: "p-ata",
          athleteId: "ata",
          goals: 1,
          athlete: {
            id: "ata",
            name: "Atacante",
            nickname: null,
            position: "ATA",
            photoUrl: null,
          },
        }),
        cleivan,
        makePresence({
          id: "p-gol",
          athleteId: "gol",
          athlete: {
            id: "gol",
            name: "Goleiro",
            nickname: null,
            position: "GOL",
            photoUrl: null,
          },
        }),
      ]),
    ];

    const { rerender } = render(
      <CardsDestaquesDiaV2 matches={baseMatches} onToggleAusencia={onToggleAusencia} />
    );

    expect(screen.getAllByText("Cleivan").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: /Marcar como ausente/i })[1]);

    await waitFor(() => expect(onToggleAusencia).toHaveBeenCalledWith("meia", "cleivan", true));

    rerender(
      <CardsDestaquesDiaV2
        matches={[
          makeMatchWithPresences([
            baseMatches[0].presences[0],
            { ...cleivan, status: "AUSENTE" },
            baseMatches[0].presences[2],
          ]),
        ]}
        faltou={{ meia: true }}
        ausenciaTargets={{ meia: "cleivan" }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Restaurar presença/i }));

    await waitFor(() =>
      expect(onToggleAusencia).toHaveBeenLastCalledWith("meia", "cleivan", false)
    );
  });

  it("restaura Meia original em estado inicial persistido apos reload", async () => {
    const onToggleAusencia = jest.fn().mockResolvedValue(undefined);
    const cleivan = makePresence({
      id: "p-cleivan",
      athleteId: "cleivan",
      assists: 2,
      status: "AUSENTE",
      effectivePosition: "MEIA",
      athlete: {
        id: "cleivan",
        name: "Cleivan",
        nickname: null,
        position: "MEIA",
        photoUrl: null,
      },
    });

    render(
      <CardsDestaquesDiaV2
        matches={[
          makeMatchWithPresences([
            makePresence({
              id: "p-ata",
              athleteId: "ata",
              goals: 1,
              athlete: {
                id: "ata",
                name: "Atacante",
                nickname: null,
                position: "ATA",
                photoUrl: null,
              },
            }),
            cleivan,
            makePresence({
              id: "p-outro-meia",
              athleteId: "outro-meia",
              assists: 1,
              athlete: {
                id: "outro-meia",
                name: "Outro Meia",
                nickname: null,
                position: "MEIA",
                photoUrl: null,
              },
            }),
            makePresence({
              id: "p-gol",
              athleteId: "gol",
              athlete: {
                id: "gol",
                name: "Goleiro",
                nickname: null,
                position: "GOL",
                photoUrl: null,
              },
            }),
          ]),
        ]}
        faltou={{
          meia: true,
          targets: { meia: { athleteId: "cleivan", presenceStatus: "TITULAR" } },
        }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Restaurar presença/i }));

    await waitFor(() => expect(onToggleAusencia).toHaveBeenCalledWith("meia", "cleivan", false));
    expect(onToggleAusencia).not.toHaveBeenCalledWith("meia", "outro-meia", false);
  });

  it("restaura o zagueiro manual original sem selecionar outro automaticamente", async () => {
    const onToggleAusencia = jest.fn().mockResolvedValue(undefined);
    const nattan = makePresence({
      id: "p-nattan",
      athleteId: "nattan",
      effectivePosition: "ZAGUEIRO",
      athlete: {
        id: "nattan",
        name: "Nattan",
        nickname: null,
        position: "ZAGUEIRO",
        photoUrl: null,
      },
    });
    const samuel = makePresence({
      id: "p-samuel",
      athleteId: "samuel",
      effectivePosition: "ZAGUEIRO",
      athlete: {
        id: "samuel",
        name: "Samuel",
        nickname: null,
        position: "ZAGUEIRO",
        photoUrl: null,
      },
    });
    const requiredPlayers = [
      makePresence({
        id: "p-ata",
        athleteId: "ata",
        goals: 1,
        athlete: {
          id: "ata",
          name: "Atacante",
          nickname: null,
          position: "ATA",
          photoUrl: null,
        },
      }),
      makePresence({
        id: "p-meia",
        athleteId: "meia",
        assists: 1,
        athlete: {
          id: "meia",
          name: "Meia",
          nickname: null,
          position: "MEIA",
          photoUrl: null,
        },
      }),
      makePresence({
        id: "p-gol",
        athleteId: "gol",
        athlete: {
          id: "gol",
          name: "Goleiro",
          nickname: null,
          position: "GOL",
          photoUrl: null,
        },
      }),
    ];

    const { rerender } = render(
      <CardsDestaquesDiaV2
        matches={[makeMatchWithPresences([nattan, samuel, ...requiredPlayers])]}
        zagueiroId="nattan"
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Nattan")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /Marcar como ausente/i })[2]);

    await waitFor(() => expect(onToggleAusencia).toHaveBeenCalledWith("zagueiro", "nattan", true));

    rerender(
      <CardsDestaquesDiaV2
        matches={[
          makeMatchWithPresences([{ ...nattan, status: "AUSENTE" }, samuel, ...requiredPlayers]),
        ]}
        zagueiroId="nattan"
        faltou={{ zagueiro: true }}
        ausenciaTargets={{ zagueiro: "nattan" }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Restaurar presença/i }));

    await waitFor(() =>
      expect(onToggleAusencia).toHaveBeenLastCalledWith("zagueiro", "nattan", false)
    );

    rerender(
      <CardsDestaquesDiaV2
        matches={[makeMatchWithPresences([nattan, samuel, ...requiredPlayers])]}
        zagueiroId="nattan"
        faltou={{ zagueiro: false }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Nattan")).toBeInTheDocument();
    expect(screen.queryByText("Samuel")).not.toBeInTheDocument();
  });

  it("restaura Zagueiro manual original em estado inicial persistido apos reload", async () => {
    const onToggleAusencia = jest.fn().mockResolvedValue(undefined);
    const nattan = makePresence({
      id: "p-nattan",
      athleteId: "nattan",
      status: "AUSENTE",
      effectivePosition: "ZAGUEIRO",
      athlete: {
        id: "nattan",
        name: "Nattan",
        nickname: null,
        position: "ZAGUEIRO",
        photoUrl: null,
      },
    });
    const samuel = makePresence({
      id: "p-samuel",
      athleteId: "samuel",
      effectivePosition: "ZAGUEIRO",
      athlete: {
        id: "samuel",
        name: "Samuel",
        nickname: null,
        position: "ZAGUEIRO",
        photoUrl: null,
      },
    });
    const requiredPlayers = [
      makePresence({
        id: "p-ata",
        athleteId: "ata",
        goals: 1,
        athlete: {
          id: "ata",
          name: "Atacante",
          nickname: null,
          position: "ATA",
          photoUrl: null,
        },
      }),
      makePresence({
        id: "p-meia",
        athleteId: "meia",
        assists: 1,
        athlete: {
          id: "meia",
          name: "Meia",
          nickname: null,
          position: "MEIA",
          photoUrl: null,
        },
      }),
      makePresence({
        id: "p-gol",
        athleteId: "gol",
        athlete: {
          id: "gol",
          name: "Goleiro",
          nickname: null,
          position: "GOL",
          photoUrl: null,
        },
      }),
    ];

    const { rerender } = render(
      <CardsDestaquesDiaV2
        matches={[makeMatchWithPresences([nattan, samuel, ...requiredPlayers])]}
        zagueiroId="nattan"
        faltou={{
          zagueiro: true,
          targets: { zagueiro: { athleteId: "nattan", presenceStatus: "TITULAR" } },
        }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Restaurar presença/i }));

    await waitFor(() => expect(onToggleAusencia).toHaveBeenCalledWith("zagueiro", "nattan", false));
    expect(onToggleAusencia).not.toHaveBeenCalledWith("zagueiro", "samuel", false);

    rerender(
      <CardsDestaquesDiaV2
        matches={[
          makeMatchWithPresences([{ ...nattan, status: "TITULAR" }, samuel, ...requiredPlayers]),
        ]}
        zagueiroId="nattan"
        faltou={{ zagueiro: false }}
        onToggleAusencia={onToggleAusencia}
      />
    );

    expect(screen.getByText("Nattan")).toBeInTheDocument();
    expect(screen.queryByText("Samuel")).not.toBeInTheDocument();
  });
});

import {
  VITRINE_CHAMPION_BANNER,
  VITRINE_DEMO_DAY,
  getVitrineDestaquesDoDiaResponse,
  getVitrineMatchesResponse,
  getVitrinePlayerRankingsResponse,
} from "@/lib/public-vitrine-demo";

describe("public-vitrine-demo", () => {
  it("usa o banner oficial do Time Campeao do Dia", () => {
    const response = getVitrineDestaquesDoDiaResponse();

    expect(response.destaque?.bannerUrl).toBe(VITRINE_CHAMPION_BANNER);
  });

  it("publica campeao demonstrativo com elenco nao vazio", () => {
    const response = getVitrineDestaquesDoDiaResponse();
    const campeao = response.destaque?.timeCampeaoDoDia;

    expect(campeao?.status).toBe("published");
    expect(campeao?.team?.name).toBe("Vanguarda");
    expect(campeao?.atletas?.length).toBeGreaterThan(0);
    expect(campeao?.atletas?.map((entry) => entry.athlete.name)).toEqual(
      expect.arrayContaining(["Bruno", "Guilherme", "Henrique", "Otavio", "Paulo", "Yago", "Zeca"])
    );
  });

  it("mantem campeao, data, partidas e destaques no mesmo fixture", () => {
    const destaque = getVitrineDestaquesDoDiaResponse().destaque;
    const matches = getVitrineMatchesResponse(new URLSearchParams(`date=${VITRINE_DEMO_DAY}`));
    const artilheiro = getVitrinePlayerRankingsResponse(
      new URLSearchParams("type=artilheiros&limit=1")
    ).results[0];
    const maestro = getVitrinePlayerRankingsResponse(
      new URLSearchParams("type=assistencias&limit=1")
    ).results[0];

    expect(destaque?.date?.slice(0, 10)).toBe(VITRINE_DEMO_DAY);
    expect(destaque?.publication?.latestCompletedMatchDate?.slice(0, 10)).toBe(VITRINE_DEMO_DAY);
    expect(matches.results.length).toBeGreaterThanOrEqual(3);
    expect(
      matches.results.some(
        (match) => match.teamA.name === "Vanguarda" && match.score.teamA > match.score.teamB
      )
    ).toBe(true);
    expect(destaque?.zagueiroId).toBe("vitrine-athlete-08");
    expect(artilheiro.nome).toBe("Yago");
    expect(maestro.nome).toBe("Paulo");
  });
});

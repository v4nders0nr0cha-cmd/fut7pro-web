import {
  VITRINE_CHAMPION_BANNER,
  VITRINE_DEMO_DAY,
  getVitrineDestaquesDoDiaResponse,
  getVitrineMatchdayLiveResponse,
  getVitrineMatchesResponse,
  getVitrinePlayerRankingsResponse,
  getVitrineTeamRankingsResponse,
  getVitrineTenantResponse,
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

  it("retorna tenant demonstrativo no mesmo formato publico e com logo existente", () => {
    const tenant = getVitrineTenantResponse();

    expect(tenant.slug).toBe("vitrine");
    expect(tenant.name).toBe("Racha Vitrine Fut7Pro");
    expect(tenant.logoUrl).toBe("/images/logos/logo_fut7pro.png");
    expect("result" in tenant).toBe(false);
  });

  it("respeita o periodo solicitado nos rankings demonstrativos", () => {
    const segundoQuadrimestre = new URLSearchParams("period=quarter&year=2026&quarter=2");
    const primeiroQuadrimestre = new URLSearchParams("period=quarter&year=2026&quarter=1");

    expect(getVitrineTeamRankingsResponse(segundoQuadrimestre).results.length).toBeGreaterThan(0);
    expect(getVitrinePlayerRankingsResponse(segundoQuadrimestre).results.length).toBeGreaterThan(0);
    expect(getVitrineTeamRankingsResponse(primeiroQuadrimestre).results).toEqual([]);
    expect(getVitrinePlayerRankingsResponse(primeiroQuadrimestre).results).toEqual([]);
  });

  it("calcula a classificacao ao vivo apenas com a rodada demonstrativa publicada", () => {
    const live = getVitrineMatchdayLiveResponse();

    expect(live.matches).toHaveLength(3);
    expect(live.standings).toHaveLength(6);
    expect(live.standings.every((row) => row.j === 1)).toBe(true);
    expect(live.standings[0]).toMatchObject({ team: "Vanguarda", pts: 3, sg: 3 });
  });
});

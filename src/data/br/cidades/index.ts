export type CityOption = { nome: string; ibge: string };

const LOADERS: Record<string, () => Promise<CityOption[]>> = {
  AC: () => import("./ac").then((mod) => mod.cities as CityOption[]),
  AL: () => import("./al").then((mod) => mod.cities as CityOption[]),
  AM: () => import("./am").then((mod) => mod.cities as CityOption[]),
  AP: () => import("./ap").then((mod) => mod.cities as CityOption[]),
  BA: () => import("./ba").then((mod) => mod.cities as CityOption[]),
  CE: () => import("./ce").then((mod) => mod.cities as CityOption[]),
  DF: () => import("./df").then((mod) => mod.cities as CityOption[]),
  ES: () => import("./es").then((mod) => mod.cities as CityOption[]),
  GO: () => import("./go").then((mod) => mod.cities as CityOption[]),
  MA: () => import("./ma").then((mod) => mod.cities as CityOption[]),
  MG: () => import("./mg").then((mod) => mod.cities as CityOption[]),
  MS: () => import("./ms").then((mod) => mod.cities as CityOption[]),
  MT: () => import("./mt").then((mod) => mod.cities as CityOption[]),
  PA: () => import("./pa").then((mod) => mod.cities as CityOption[]),
  PB: () => import("./pb").then((mod) => mod.cities as CityOption[]),
  PE: () => import("./pe").then((mod) => mod.cities as CityOption[]),
  PI: () => import("./pi").then((mod) => mod.cities as CityOption[]),
  PR: () => import("./pr").then((mod) => mod.cities as CityOption[]),
  RJ: () => import("./rj").then((mod) => mod.cities as CityOption[]),
  RN: () => import("./rn").then((mod) => mod.cities as CityOption[]),
  RO: () => import("./ro").then((mod) => mod.cities as CityOption[]),
  RR: () => import("./rr").then((mod) => mod.cities as CityOption[]),
  RS: () => import("./rs").then((mod) => mod.cities as CityOption[]),
  SC: () => import("./sc").then((mod) => mod.cities as CityOption[]),
  SE: () => import("./se").then((mod) => mod.cities as CityOption[]),
  SP: () => import("./sp").then((mod) => mod.cities as CityOption[]),
  TO: () => import("./to").then((mod) => mod.cities as CityOption[]),
};

export async function loadCitiesByUf(uf: string): Promise<CityOption[]> {
  const key = uf.trim().toUpperCase();
  const loader = LOADERS[key];
  if (!loader) return [];
  return loader();
}

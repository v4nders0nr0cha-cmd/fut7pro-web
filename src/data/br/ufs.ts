export type UfOption = { uf: string; nome: string };
export const UF_LIST: UfOption[] = [
  {
    uf: "AC",
    nome: "Acre",
  },
  {
    uf: "AL",
    nome: "Alagoas",
  },
  {
    uf: "AM",
    nome: "Amazonas",
  },
  {
    uf: "AP",
    nome: "Amapá",
  },
  {
    uf: "BA",
    nome: "Bahia",
  },
  {
    uf: "CE",
    nome: "Ceará",
  },
  {
    uf: "DF",
    nome: "Distrito Federal",
  },
  {
    uf: "ES",
    nome: "Espírito Santo",
  },
  {
    uf: "GO",
    nome: "Goiás",
  },
  {
    uf: "MA",
    nome: "Maranhão",
  },
  {
    uf: "MG",
    nome: "Minas Gerais",
  },
  {
    uf: "MS",
    nome: "Mato Grosso do Sul",
  },
  {
    uf: "MT",
    nome: "Mato Grosso",
  },
  {
    uf: "PA",
    nome: "Pará",
  },
  {
    uf: "PB",
    nome: "Paraíba",
  },
  {
    uf: "PE",
    nome: "Pernambuco",
  },
  {
    uf: "PI",
    nome: "Piauí",
  },
  {
    uf: "PR",
    nome: "Paraná",
  },
  {
    uf: "RJ",
    nome: "Rio de Janeiro",
  },
  {
    uf: "RN",
    nome: "Rio Grande do Norte",
  },
  {
    uf: "RO",
    nome: "Rondônia",
  },
  {
    uf: "RR",
    nome: "Roraima",
  },
  {
    uf: "RS",
    nome: "Rio Grande do Sul",
  },
  {
    uf: "SC",
    nome: "Santa Catarina",
  },
  {
    uf: "SE",
    nome: "Sergipe",
  },
  {
    uf: "SP",
    nome: "São Paulo",
  },
  {
    uf: "TO",
    nome: "Tocantins",
  },
];
export const UF_CODES = UF_LIST.map((item) => item.uf);

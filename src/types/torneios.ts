// src/types/torneio.ts

// Representa um torneio especial registrado na plataforma
export interface Torneio {
  nome: string; // Nome oficial do torneio (ex: Copa dos Campeões)
  slug: string; // Slug do atleta campeão (para link)
  ano: number; // Ano de realização do torneio
  campeao: string; // Nome do atleta ou time campeão
  imagem: string; // Caminho da imagem do banner/representação do torneio
}

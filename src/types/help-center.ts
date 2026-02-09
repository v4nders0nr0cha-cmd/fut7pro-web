export type HelpCenterTopic = {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  destaque?: boolean;
  ordem?: number;
  tags?: string[];
};

export type HelpCenterVideo = {
  id: string;
  titulo: string;
  url: string;
  publishedAt?: string;
  ordem?: number;
};

export type HelpCenterConfig = {
  youtubeChannelUrl: string;
  youtubeChannelLabel: string;
  showVideos: boolean;
  topics: HelpCenterTopic[];
  videos: HelpCenterVideo[];
  updatedAt?: string;
};

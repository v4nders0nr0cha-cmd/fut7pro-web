export const FUT7PRO_SOCIALS = {
  instagram: {
    label: "Instagram",
    handle: "@fut7pro_app",
    url: "https://www.instagram.com/fut7pro_app/",
  },
  threads: {
    label: "Threads",
    handle: "@fut7pro_app",
    url: "https://www.threads.net/@fut7pro_app",
  },
  facebook: {
    label: "Facebook",
    handle: "@fut7proapp",
    url: "https://www.facebook.com/fut7proapp",
  },
  youtube: {
    label: "YouTube",
    handle: "@fut7pro_app",
    url: "https://www.youtube.com/@fut7pro_app",
  },
} as const;

export const FUT7PRO_SOCIAL_LINKS = [
  FUT7PRO_SOCIALS.instagram,
  FUT7PRO_SOCIALS.threads,
  FUT7PRO_SOCIALS.facebook,
  FUT7PRO_SOCIALS.youtube,
] as const;

export const FUT7PRO_SOCIAL_SAME_AS = FUT7PRO_SOCIAL_LINKS.map((social) => social.url);

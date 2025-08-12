// Structured Data (JSON-LD) para SEO
// Implementa schema.org para eventos esportivos

import { rachaConfig } from "@/config/racha.config";

export interface EventStructuredData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address?: string;
    geo?: {
      latitude: number;
      longitude: number;
    };
  };
  organizer: {
    name: string;
    url: string;
  };
  sport: string;
  participants?: Array<{
    name: string;
    type: "Team" | "Person";
  }>;
  image?: string;
  url: string;
}

export interface OrganizationStructuredData {
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
}

export interface PersonStructuredData {
  name: string;
  description?: string;
  image?: string;
  url: string;
  jobTitle?: string;
  worksFor?: {
    name: string;
    url: string;
  };
}

// Gerar structured data para evento esportivo
export function generateEventStructuredData(event: EventStructuredData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      "@type": "Place",
      name: event.location.name,
      address: event.location.address,
      ...(event.location.geo && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: event.location.geo.latitude,
          longitude: event.location.geo.longitude,
        },
      }),
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      url: event.organizer.url,
    },
    sport: event.sport,
    url: event.url,
    ...(event.image && { image: event.image }),
    ...(event.participants && {
      participant: event.participants.map((participant) => ({
        "@type": participant.type,
        name: participant.name,
      })),
    }),
  };

  return JSON.stringify(structuredData);
}

// Gerar structured data para organização
export function generateOrganizationStructuredData(org: OrganizationStructuredData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: org.name,
    description: org.description,
    url: org.url,
    logo: {
      "@type": "ImageObject",
      url: org.logo,
    },
    ...(org.sameAs && { sameAs: org.sameAs }),
    ...(org.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: org.contactPoint.telephone,
        contactType: org.contactPoint.contactType,
        ...(org.contactPoint.email && { email: org.contactPoint.email }),
      },
    }),
  };

  return JSON.stringify(structuredData);
}

// Gerar structured data para pessoa
export function generatePersonStructuredData(person: PersonStructuredData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: person.url,
    ...(person.description && { description: person.description }),
    ...(person.image && { image: person.image }),
    ...(person.jobTitle && { jobTitle: person.jobTitle }),
    ...(person.worksFor && {
      worksFor: {
        "@type": "Organization",
        name: person.worksFor.name,
        url: person.worksFor.url,
      },
    }),
  };

  return JSON.stringify(structuredData);
}

// Gerar structured data para website
export function generateWebsiteStructuredData(): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: rachaConfig.nome,
    description: rachaConfig.seo.description,
    url: rachaConfig.urls.site,
    potentialAction: {
      "@type": "SearchAction",
      target: `${rachaConfig.urls.site}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: rachaConfig.nome,
      logo: {
        "@type": "ImageObject",
        url: `${rachaConfig.urls.site}${rachaConfig.logo}`,
      },
    },
  };

  return JSON.stringify(structuredData);
}

// Gerar structured data para breadcrumbs
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(structuredData);
}

// Gerar structured data para FAQ
export function generateFAQStructuredData(
  questions: Array<{ question: string; answer: string }>
): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return JSON.stringify(structuredData);
}

// Componente React para inserir structured data
export function StructuredData({ data }: { data: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: data }} />;
}

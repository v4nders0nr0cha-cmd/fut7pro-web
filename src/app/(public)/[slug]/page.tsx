"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import Home from "../page";
import { useRacha } from "@/context/RachaContext";

type FetchError = Error & { status?: number };

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    const error = new Error(message || `HTTP ${res.status}`) as FetchError;
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function RachaPublicPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug.trim() : "";
  const { setTenantSlug } = useRacha();
  const { isLoading, error } = useSWR(
    slug ? `/api/public/${encodeURIComponent(slug)}/about` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 6,
      errorRetryInterval: 2000,
    }
  );

  useEffect(() => {
    if (slug) {
      setTenantSlug(slug);
    }
  }, [slug, setTenantSlug]);

  if (!slug) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="mt-4 text-gray-300">Carregando racha...</p>
      </div>
    );
  }

  if (error && (error as FetchError).status === 404) {
    notFound();
  }

  return <Home />;
}

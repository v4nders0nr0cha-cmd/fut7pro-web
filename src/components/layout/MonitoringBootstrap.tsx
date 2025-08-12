"use client";
import { useEffect } from "react";
import { initMonitoring, sendWebVital } from "@/lib/monitoring";

export default function MonitoringBootstrap() {
  useEffect(() => {
    initMonitoring();
    // Coleta de Web Vitals (carrega sob demanda)
    import('web-vitals').then(({ onCLS, onFID, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS((m) => sendWebVital({ name: 'CLS', value: m.value, id: m.id }));
      onFID((m) => sendWebVital({ name: 'FID', value: m.value, id: m.id }));
      onFCP((m) => sendWebVital({ name: 'FCP', value: m.value, id: m.id }));
      onINP((m) => sendWebVital({ name: 'INP', value: m.value, id: m.id }));
      onLCP((m) => sendWebVital({ name: 'LCP', value: m.value, id: m.id }));
      onTTFB((m) => sendWebVital({ name: 'TTFB', value: m.value, id: m.id }));
    }).catch(() => {});
  }, []);

  return null;
}



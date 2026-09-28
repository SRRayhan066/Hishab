import type { MetadataRoute } from "next";
import { getLocale, getT } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [locale, t] = await Promise.all([getLocale(), getT("common")]);

  return {
    id: "/home",
    name: t("appName"),
    short_name: t("appName"),
    description: t("tagline"),
    lang: locale,
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f4ee",
    theme_color: "#f7f4ee",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

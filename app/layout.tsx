import type { Metadata, Viewport } from "next";
import { Anek_Bangla, Hind_Siliguri } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale, getT } from "@/lib/i18n/server";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const anekBangla = Anek_Bangla({
  variable: "--font-anek-bangla",
  subsets: ["bengali", "latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getT("common")]);
  const appName = t("appName");
  const description = t("tagline");

  return {
    title: {
      default: appName,
      template: `%s — ${appName}`,
    },
    description,
    applicationName: appName,
    openGraph: {
      title: appName,
      description,
      siteName: appName,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${hindSiliguri.variable} ${anekBangla.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="bg-canvas text-ink flex min-h-full flex-col font-sans"
      >
        <I18nProvider namespaces={["common", "errors"]}>{children}</I18nProvider>
      </body>
    </html>
  );
}

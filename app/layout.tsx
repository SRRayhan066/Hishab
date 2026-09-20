import type { Metadata, Viewport } from "next";
import { Anek_Bangla, Hind_Siliguri } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "টাকার হিসাব",
    template: "%s — টাকার হিসাব",
  },
  description: "মাসের শুরুতে হিসাব, মাস শেষে স্বস্তি।",
  applicationName: "টাকার হিসাব",
  openGraph: {
    title: "টাকার হিসাব",
    description: "মাসের শুরুতে হিসাব, মাস শেষে স্বস্তি।",
    siteName: "টাকার হিসাব",
    locale: "bn_BD",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${anekBangla.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="bg-canvas text-ink flex min-h-full flex-col font-sans"
      >
        {children}
      </body>
    </html>
  );
}

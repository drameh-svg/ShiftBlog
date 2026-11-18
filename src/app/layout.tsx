import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import { themeBootScript } from "@/lib/theme-script";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nersans = localFont({
  src: "./fonts/NersansThree.otf",
  variable: "--font-nersans",
  display: "swap",
  weight: "400",
});

const alteHaas = localFont({
  src: "./fonts/AlteHaasGroteskBold.ttf",
  variable: "--font-alte-haas",
  display: "swap",
  weight: "700",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SHIFT Public Policy",
    template: "%s · SHIFT Public Policy",
  },
  description:
    "A USC student-led publication on technology, artificial intelligence, ethics, and public policy. Read, discuss, contribute, and act.",
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/shift-logo.png", type: "image/png" },
    ],
    apple: "/shift-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${nersans.variable} ${alteHaas.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">{children}</body>
    </html>
  );
}

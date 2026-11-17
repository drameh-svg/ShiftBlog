import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
      className={`${montserrat.variable} ${nersans.variable} ${playfair.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
          <filter
            id="headline-texture"
            x="-20%"
            y="-30%"
            width="140%"
            height="160%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="8" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2.4" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="worn"
            />
            <feBlend in="worn" in2="soft" mode="multiply" />
          </filter>
        </svg>
        <div className="grain ink-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}

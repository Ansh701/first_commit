import type { Metadata } from "next";
import { Archivo_Black, Instrument_Serif, Manrope } from "next/font/google";
import { DemoProvider } from "@/components/demo-provider";
import { DemoWebMcpBridge } from "@/components/demo-webmcp-bridge";
import "./globals.css";
import "./redesign.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "INSIPS — Evidence into explainable trust",
    template: "%s · INSIPS",
  },
  description:
    "AI-assisted evidence preparation with human-reviewed trust signals for social-impact organizations.",
  icons: { icon: "/brand/insips-logo.png", apple: "/brand/insips-logo.png" },
  openGraph: {
    title: "INSIPS — Evidence into explainable trust",
    description:
      "Private evidence preparation with human-reviewed public trust signals.",
    images: ["/brand/insips-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${archivoBlack.variable} ${instrumentSerif.variable}`}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <DemoProvider>
          <DemoWebMcpBridge />
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}

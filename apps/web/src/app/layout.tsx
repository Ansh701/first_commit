import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { DemoProvider } from "@/components/demo-provider";
import { DemoWebMcpBridge } from "@/components/demo-webmcp-bridge";
import { ProductDemoProvider } from "@/components/product-demo-provider";
import { CognitoBootstrap } from "@/components/cognito-bootstrap";
import "./globals.css";
import "./design-tokens.css";
import "./insips.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("insips-theme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "INSIPS: Evidence into explainable trust",
    template: "%s | INSIPS",
  },
  description:
    "AI-assisted evidence preparation with human-reviewed trust signals for social-impact organizations.",
  icons: { icon: "/brand/insips-logo.svg", apple: "/brand/insips-logo.svg" },
  openGraph: {
    title: "INSIPS: Evidence into explainable trust",
    description:
      "Private evidence preparation with human-reviewed public trust signals.",
    images: ["/brand/insips-logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={publicSans.variable}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <DemoProvider>
          <ProductDemoProvider>
            <CognitoBootstrap />
            <DemoWebMcpBridge />
            {children}
          </ProductDemoProvider>
        </DemoProvider>
      </body>
    </html>
  );
}

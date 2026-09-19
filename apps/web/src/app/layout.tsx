import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo-provider";
import { DemoWebMcpBridge } from "@/components/demo-webmcp-bridge";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "INSIPS Passport — Evidence into explainable trust",
    template: "%s · INSIPS Passport",
  },
  description:
    "AI-assisted evidence preparation with human-reviewed trust signals for social-impact organizations.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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

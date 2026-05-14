import type { Metadata } from "next";
import "./globals.css";

import { WebMcpProvider } from "@/app/Components/Agent/WebMcpProvider";
import { getSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Lumina Research",
  description:
    "AI research and decision workspace for cases, cited evidence review, and report generation.",
  metadataBase: new URL(getSiteUrl()),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <WebMcpProvider />
      </body>
    </html>
  );
}

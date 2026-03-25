import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Gold Tokens - Invest in Physical Gold on the Blockchain",
  description:
    "Mint, trade, and redeem 100% physical gold-backed digital assets. Instant settlement with blockchain security. Audited by CertiK with insured reserves.",
  keywords: [
    "gold tokens",
    "blockchain gold",
    "gold-backed crypto",
    "physical gold investment",
    "decentralized gold",
    "PAXG",
    "XAUT",
    "gold DEX",
  ],
  authors: [{ name: "Gold Tokens" }],
  openGraph: {
    title: "Gold Tokens - Invest in Physical Gold on the Blockchain",
    description:
      "100% physical gold-backed digital assets with instant settlement and blockchain security.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Tokens - Physical Gold on Blockchain",
    description:
      "Mint, trade, and redeem 100% gold-backed digital assets with blockchain security.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

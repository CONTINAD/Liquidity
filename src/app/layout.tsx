import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { DataProviderWrapper } from "../lib/data-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "$TIDE — Liquidity Engine",
  description:
    "Fees accumulate. The engine buys. Liquidity deepens. On-chain proof. The Liquidity Engine protocol on Solana.",
  openGraph: {
    title: "$TIDE — Liquidity Engine",
    description: "Fees accumulate. The engine buys. Liquidity deepens.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "$TIDE — Liquidity Engine",
    description: "Fees accumulate. The engine buys. Liquidity deepens.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`}>
        <DataProviderWrapper>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer />
        </DataProviderWrapper>
      </body>
    </html>
  );
}

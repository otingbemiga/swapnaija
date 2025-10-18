import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import SupabaseProvider from "@/components/SupabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwapNaija - Swap Goods & Services in Nigeria",
  description:
    "Easily swap phones, accessories, furniture, cars, electronics, laptops, and more in Nigeria. Connect with users and trade items seamlessly on SwapNaija.",
  keywords: [
    "SwapNaija",
    "swap",
    "trade",
    "Nigeria",
    "swap phones",
    "phone swap",
    "accessories swap",
    "furniture swap",
    "car swap",
    "electronics swap",
    "laptop swap",
    "online marketplace",
  ],
  openGraph: {
    title: "SwapNaija - Swap Goods & Services in Nigeria",
    description:
      "Easily swap phones, accessories, furniture, cars, electronics, laptops, and more in Nigeria. Connect with users and trade items seamlessly on SwapNaija.",
    url: "https://swapnaija.com.ng",
    siteName: "SwapNaija",
    images: [
      {
        url: "https://swapnaija.com.ng/og-image.png",
        width: 1200,
        height: 630,
        alt: "SwapNaija",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwapNaija - Swap Goods & Services in Nigeria",
    description:
      "Easily swap phones, accessories, furniture, cars, electronics, laptops, and more in Nigeria. Connect with users and trade items seamlessly on SwapNaija.",
    images: ["https://swapnaija.com.ng/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SwapNaija",
              url: "https://swapnaija.com.ng",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://swapnaija.com.ng/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <ClientLayout>{children}</ClientLayout>
        </SupabaseProvider>
      </body>
    </html>
  );
}

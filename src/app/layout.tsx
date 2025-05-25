import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP } from 'next/font/google'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "西田明正のブログ",
    template: "%s | 西田明正のブログ",
  },
  description: "西田明正（Akimasa NISHIDA）のブログへようこそ。ここでは、ソフトウェア開発や日常の考えなどを公開しています。",
  openGraph: {
    title: "西田明正のブログ",
    description: "西田明正（Akimasa NISHIDA）のブログへようこそ。ここでは、ソフトウェア開発や日常の考えなどを公開しています。",
    url: "https://blog.akimasanishida.com",
    siteName: "西田明正のブログ",
    images: [
      {
        url: "https://blog.akimasanishida.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "西田明正のブログのOGP画像",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "西田明正のブログ",
    description: "西田明正（Akimasa NISHIDA）のブログへようこそ。ここでは、ソフトウェア開発や日常の考えなどを公開しています。",
    images: ["https://blog.akimasanishida.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.className} suppressHydrationWarning>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <div className="main-content py-4 px-4 sm:px-6 lg:px-12 pt-16 pb-2 mx-auto max-w-screen-lg">
              <main>
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
      </body>
    </html>
  );
}

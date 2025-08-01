import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP } from 'next/font/google'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import appConfig from "@/lib/appConfig";
import AppConfigProvider from "@/components/AppConfigProvider";

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const og_imageUrl = new URL(appConfig.site.og_image, appConfig.site.base_url).toString();

export const metadata: Metadata = {
  title: {
    default: appConfig.site.title,
    template: "%s | " + appConfig.site.title,
  },
  description: appConfig.site.description,
  openGraph: {
    title: appConfig.site.title,
    description: appConfig.site.description,
    url: appConfig.site.base_url,
    siteName: appConfig.site.title,
    images: [
      {
        url: og_imageUrl,
        width: 1200,
        height: 630,
        alt: (appConfig.site.title || "") + "のOGP画像",
      },
    ],
    locale: appConfig.site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.site.title,
    description: appConfig.site.description,
    images: [og_imageUrl],
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
          <AppConfigProvider config={appConfig}>
            <Header />
            <div className="main-content py-4 px-4 sm:px-6 lg:px-12 pt-16 pb-2 mx-auto max-w-screen-lg">
              <main>
                {children}
              </main>
              <Footer />
            </div>
          </AppConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

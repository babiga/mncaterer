import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { WebVitals } from "@/components/analytics/web-vitals";
import { UserInitializer } from "@/components/auth/user-initializer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});



export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Mongolian National Caterer | Crafted for Unforgettable Moments",
  description:
    "Premium high-end catering for private events, corporate functions, and VIP occasions.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Mongolian National Caterer | Crafted for Unforgettable Moments",
    description:
      "Premium high-end catering for private events, corporate functions, and VIP occasions.",
    type: "website",
    images: [{ url: "/ogimg.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mongolian National Caterer",
    description: "Premium luxury catering services.",
    images: ["/ogimg.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${playfair.variable} ${montserrat.variable}`}
        id="landing-body"
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <WebVitals />
            <UserInitializer />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import SignatureMenus from "@/components/sections/SignatureMenus";
import InternationalSection from "@/components/sections/InternationalSection";
import Chefs from "@/components/sections/Chefs";
import Events from "@/components/sections/Events";
import Footer from "@/components/layout/Footer";

type HomeData = {
  banners: {
    id: string;
    title: string | null;
    subtitle: string | null;
    imageUrl: string | null;
  }[];
  partners: { id: string; title: string | null; imageUrl: string | null }[];
  socialLinks: {
    id: string;
    title: string | null;
    link: string | null;
    icon: string | null;
  }[];
  menus: {
    id: string;
    name: string;
    description: string | null;
    downloadUrl: string | null;
    items: string[];
  }[];
  chefs: {
    id: string;
    name: string;
    avatar: string | null;
    specialty: string | null;
    rating: number;
    reviewCount: number;
    coverImage: string | null;
  }[];
  events: {
    id: string;
    title: string;
    eventType: "WEDDING" | "CORPORATE" | "PRIVATE" | "SOCIAL";
    guestCount: number;
    coverImageUrl: string | null;
    imageUrls: string[];
  }[];
};

export default function Home() {
  const t = useTranslations("Home");
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const response = await fetch("/api/home", { cache: "no-store" });
        if (!response.ok) return;

        const result = await response.json();
        if (isMounted && result.success && result.data) {
          setHomeData(result.data);
        }
      } catch {
        // Fallback rendering uses static data in sections.
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const partners = homeData?.partners ?? [];

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Navbar />
      <Hero
      // banners={homeData?.banners}
      />
      <Services />
      <HowItWorks />
      <SignatureMenus menus={homeData?.menus} />
      <InternationalSection />
      <Chefs chefs={homeData?.chefs} />
      <Events events={homeData?.events} />

      <section
        id="ctaSection"
        className="py-24 bg-white/5 border-y border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,hsl(222,40%,25%,0.3),transparent)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-white">
            {t("ctaTitle")}
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-black hover:bg-white px-10 py-6 text-lg rounded-none transition-all btn-glow"
            >
              <Link href="/booking">{t("startJourney")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/10 hover:border-primary px-10 py-6 text-lg rounded-none"
            >
              <Link href="/inquiry">{t("consultation")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {partners.length > 0 ? (
        <div className="py-20 border-t border-white/5 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              {partners.map((partner) =>
                partner.imageUrl ? (
                  <img
                    key={partner.id}
                    src={partner.imageUrl}
                    alt={partner.title || "Partner"}
                    className="h-12 object-contain"
                  />
                ) : (
                  <span
                    key={partner.id}
                    className="text-2xl font-serif font-bold tracking-[0.3em] uppercase text-center"
                  >
                    {partner.title}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 border-t border-white/5 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-2xl font-serif font-bold tracking-[0.3em]">
                VOGUE
              </span>
              <span className="text-2xl font-serif font-bold tracking-[0.3em]">
                FORBES
              </span>
              <span className="text-2xl font-serif font-bold tracking-[0.3em]">
                EATER
              </span>
              <span className="text-2xl font-serif font-bold tracking-[0.3em]">
                MICHELIN
              </span>
              <span className="text-2xl font-serif font-bold tracking-[0.3em]">
                ROBB REPORT
              </span>
            </div>
          </div>
        </div>
      )}

      <Footer socialLinks={homeData?.socialLinks} />
    </div>
  );
}

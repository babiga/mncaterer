"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

// Static hero images fallback
const staticHeroImages = ["/hero.png", "/hero-2.jpg", "/hero-3.jpg"];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface BannerType {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
}

export default function Hero({ banners }: { banners?: BannerType[] }) {
  const t = useTranslations("Hero");

  // Determine images to show. If DB has banners, use them. Otherwise, use static fallback.
  const heroImages = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.filter((b) => b.imageUrl).map((b) => b.imageUrl as string);
    }
    return staticHeroImages;
  }, [banners]);

  // Shuffle images on component mount
  // const shuffledImages = useMemo(() => shuffleArray(heroImages), [heroImages]);
  const shuffledImages = staticHeroImages;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance images with dissolve effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [shuffledImages.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Images with Dissolve Effect */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {shuffledImages.map(
            (image, index) =>
              index === currentImageIndex && (
                <motion.img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`Mongolian National Caterer ${index + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  style={{
                    animation: "ken-burns 20s ease-in-out infinite alternate",
                  }}
                />
              ),
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      </div>

      {/* Image Indicator Dots - Commented out for now */}
      {/* <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {shuffledImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
              ? 'bg-primary w-6'
              : 'bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}

      <div className="absolute inset-0 z-1 pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary blur-sm"
        />
        <motion.div
          animate={{ y: [15, -15, 15], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white blur-md"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-primary tracking-[0.2em] text-xs md:text-sm uppercase mb-4 font-medium">
            {t("tagline")}
          </h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-3xl lg:text-4xl xl:text-8xl text-white mb-6 leading-tight"
        >
          {t("title1")} <br />
          <span className="italic font-light text-foreground/90 text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-serif">
            {t("title2")}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center mt-10"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-black hover:bg-white hover:text-black text-lg px-8 py-6 rounded-none transition-all duration-300 btn-glow"
          >
            <Link href={"/booking"}>{t("bookCatering")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:border-primary hover:text-primary hover:bg-transparent text-lg px-8 py-6 rounded-none backdrop-blur-sm transition-all duration-300"
          >
            <Link href="/signup?tab=chef">{t("registerAsChef")}</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest text-white/50 uppercase">
          {t("scroll")}
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}

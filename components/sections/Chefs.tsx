"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { fallbackChefProfiles } from "@/lib/chef-profile-fallback";

type ChefType = {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string | null;
  rating: number;
  reviewCount: number;
  coverImage: string | null;
};

type ChefCard = {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviews: number;
  specialty: string;
};

export default function Chefs({ chefs: apiChefs }: { chefs?: ChefType[] }) {
  const t = useTranslations("Chefs");

  const chefsData: ChefCard[] =
    apiChefs && apiChefs.length > 0
      ? apiChefs.map((chef) => ({
          id: chef.id,
          name: chef.name,
          role: t("role"),
          image: chef.coverImage || chef.avatar || "/chef-1.png",
          rating: chef.rating,
          reviews: chef.reviewCount,
          specialty: chef.specialty || t("defaultSpecialty"),
        }))
      : fallbackChefProfiles.map((chef) => ({ ...chef, reviews: chef.reviewCount }));

  return (
    <section id="chefs" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl mb-2">{t("title")}</h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <a
            href="#"
            className="hidden md:block text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-8"
          >
            {t("viewAll")}
          </a>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {chefsData.map((chef, index) => (
              <CarouselItem key={chef.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link
                  href={`/chefs/${chef.id}`}
                  className="block"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative h-[500px] overflow-hidden cursor-pointer text-left w-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10" />

                    <img
                      src={chef.image}
                      alt={chef.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3 text-primary fill-primary" />
                          ))}
                        </div>
                        <span className="text-xs text-white/70">
                          ({chef.reviews} {t("reviews")})
                        </span>
                      </div>

                      <h3 className="text-2xl text-white mb-1">{chef.name}</h3>
                      <p className="text-primary text-sm uppercase tracking-widest mb-4">{chef.role}</p>

                      <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                        <p className="text-sm text-white/80 border-l-2 border-primary pl-3">
                          {t("specialty")}: {chef.specialty}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-wider text-primary">{t("openDetails")}</p>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-10">
            <CarouselPrevious className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
            <CarouselNext className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
          </div>
        </Carousel>

        <div className="mt-12 text-center md:hidden">
          <a
            href="#"
            className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-8"
          >
            {t("viewAll")}
          </a>
        </div>
      </div>
    </section>
  );
}

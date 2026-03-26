"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Star, GraduationCap, Award } from "lucide-react";
import { useTranslations } from "next-intl";

interface ChefCardProps {
  chef: any;
}

export function ChefCard({ chef }: ChefCardProps) {
  const t = useTranslations("Chefs");
  const image = chef.avatar || "/black.png";
  const ratingValue = Number(chef.rating);
  const yearsExperienceValue = Number(chef.yearsExperience);
  const reviewCountValue = Number(chef.reviewCount);

  const rating = Number.isFinite(ratingValue) ? ratingValue : 0;
  const yearsExperience = Number.isFinite(yearsExperienceValue)
    ? yearsExperienceValue
    : 0;
  const reviewCount = Number.isFinite(reviewCountValue) ? reviewCountValue : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/chefs/${chef.id}`} className="block h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 h-full">
          {/* Image Container */}
          <div className="relative aspect-3/4 overflow-hidden">
            <img
              src={image}
              alt={chef.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80" />

            {/* Rating Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-white text-xs font-medium">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black via-black/70 to-transparent">
              <h3 className="text-2xl font-serif text-white mb-1 group-hover:text-primary transition-colors">
                {chef.name}
              </h3>
              <p className="text-primary text-xs uppercase tracking-[0.2em] mb-4">
                {chef.specialty || t("defaultSpecialty")}
              </p>

              {/* Reveal details inside overlay without changing card height */}
              <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                <div className="overflow-hidden">
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>
                        {t("experienceLabel", {
                          years: yearsExperience,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="truncate">
                        {reviewCount} {t("reviews")}
                      </span>
                    </div>

                    <div className="pt-2 text-[10px] uppercase tracking-[0.2em] text-primary">
                      {t("openDetails")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

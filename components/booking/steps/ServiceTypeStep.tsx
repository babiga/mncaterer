"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Utensils, Star, Trophy, Heart, Layers, ArrowRight } from "lucide-react";
import { useBookingStore, type BookingServiceType } from "@/lib/store/use-booking-store";
import { staticServiceData } from "@/lib/service-data";

const SERVICE_TYPE_MAP: Record<
  string,
  { type: BookingServiceType; icon: typeof Utensils }
> = {
  corporate: { type: "CORPORATE", icon: Utensils },
  private: { type: "PRIVATE", icon: Star },
  weddings: { type: "WEDDING", icon: Heart },
  vip: { type: "VIP", icon: Trophy },
};

export function ServiceTypeStep() {
  const t = useTranslations("Booking.steps.serviceType");
  const tServices = useTranslations("Services");
  const serviceType = useBookingStore((s) => s.serviceType);
  const setServiceType = useBookingStore((s) => s.setServiceType);
  const nextStep = useBookingStore((s) => s.nextStep);

  function handleSelect(type: BookingServiceType) {
    setServiceType(type);
    // Small delay for visual feedback before advancing
    setTimeout(() => nextStep(), 300);
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staticServiceData.map((service, index) => {
          const mapping = SERVICE_TYPE_MAP[service.key];
          if (!mapping) return null;
          const isSelected = serviceType === mapping.type;
          const Icon = mapping.icon;

          return (
            <motion.button
              key={service.key}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handleSelect(mapping.type)}
              className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="aspect-4/5 sm:aspect-3/2 relative overflow-hidden">
                <img
                  src={service.image}
                  alt={tServices(`${service.key}.title`)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

                {/* Selected badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4 text-black" />
                  </motion.div>
                )}

                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                  <Icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="text-xl md:text-2xl text-white font-medium mb-1">
                    {tServices(`${service.key}.title`)}
                  </h3>
                  <p className="text-white/70 text-sm max-w-xs line-clamp-2 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0 transition-all duration-400">
                    {tServices(`${service.key}.description`)}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* OTHER option */}
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          onClick={() => handleSelect("OTHER")}
          className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 md:col-span-2 ${
            serviceType === "OTHER"
              ? "border-primary ring-2 ring-primary/30"
              : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="p-6 sm:p-8 bg-white/3 flex items-center gap-5 min-h-[120px]">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl text-white font-medium">
                {tServices("exploreMore")}
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {t("otherDescription")}
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

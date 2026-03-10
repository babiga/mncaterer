"use client";

import { motion } from "framer-motion";
import { Utensils, Star, Trophy, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { staticServiceData, type ServiceRoute } from "@/lib/service-data";

const iconByRoute: Record<ServiceRoute, typeof Utensils> = {
  corporate: Utensils,
  private: Star,
  wedding: Heart,
  vip: Trophy,
};

export default function Services() {
  const t = useTranslations("Services");
  const serviceCards = staticServiceData.map((service) => ({
    id: service.key,
    title: t(`${service.key}.title`),
    description: t(`${service.key}.description`),
    image: service.image,
    icon: iconByRoute[service.route],
    href: `/services/${service.route}`,
  }));

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCards.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden bg-card border border-white/5"
            >
              <Link href={service.href}>
                <div className="aspect-[4/5] sm:aspect-square md:aspect-video relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-black/60 md:group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <service.icon className="w-7 h-7 md:w-9 md:h-9 text-primary mb-3 md:mb-4" />
                    <h3 className="text-xl md:text-2xl text-white mb-2 font-medium">
                      {service.title}
                    </h3>
                    <p className="text-white/80 text-sm max-w-xs mb-4 md:mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0">
                      {service.description}
                    </p>
                    <Button
                      asChild
                      variant="link"
                      className="text-primary p-0 h-auto w-fit group/btn text-sm md:text-base"
                    >
                      <p>
                        {t("exploreMore")}{" "}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </p>
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

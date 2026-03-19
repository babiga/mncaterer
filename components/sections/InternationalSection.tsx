'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function InternationalSection() {
  const t = useTranslations("International");
  return (
    <section id="international" className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 md:w-1/3 h-1/3 bg-primary/5 blur-[80px] md:blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full mb-6">
              <Globe className="w-3 h-3 text-primary" />
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-primary font-medium">{t("exclusiveAccess")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-serif">
              {t("title")}<span className="text-primary italic ml-2 md:ml-3">{t("italic")}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("description")}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-4 mb-10 text-left max-w-xl mx-auto lg:mx-0">
              {(t.raw("items") as string[]).map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground/80 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button asChild className="bg-primary text-black hover:bg-primary/90 text-base md:text-lg px-8 py-6 rounded-none transition-all w-full sm:w-auto">
                <Link href="/inquiry">{t("requestAccess")}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 relative mt-12 lg:mt-0"
          >
            <div className="relative aspect-4/5 md:aspect-square lg:aspect-4/5 bg-card border border-white/5 p-2 rotate-2 md:rotate-3 hover:rotate-0 transition-transform duration-700 ease-out shadow-2xl max-w-md mx-auto lg:max-w-none">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 z-10" />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
                <p className="font-serif text-2xl md:text-3xl text-white mb-1">{t("chefName")}</p>
                <p className="text-primary text-xs md:text-sm uppercase tracking-widest font-medium">{t("chefRole")}</p>
              </div>
              <img
                src="/international-chef.png"
                alt="International Chef"
                className="w-full h-full object-cover transition-all duration-700"
              />
            </div>
            
            {/* Additional visual element for mobile depth */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-primary/20 -z-10 lg:hidden" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

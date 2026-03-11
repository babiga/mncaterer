"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Users, Calendar, ChefHat, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const EVENT_TYPE_MAP: Record<string, string> = {
  WEDDING: "Wedding",
  CORPORATE: "Corporate",
  PRIVATE: "Private",
  SOCIAL: "Social",
};

export function EventDetailClient({ event }: { event: any }) {
  const t = useTranslations("Events");
  const tChefs = useTranslations("Chefs"); // for "back"
  
  const [activeImage, setActiveImage] = useState(
    event.coverImageUrl || (event.imageUrls && event.imageUrls[0]) || "/event-private.png"
  );

  const images: string[] = [];
  if (event.coverImageUrl) images.push(event.coverImageUrl);
  if (event.imageUrls) {
    event.imageUrls.forEach((url: string) => {
      if (!images.includes(url)) images.push(url);
    });
  }
  if (images.length === 0) images.push("/event-private.png");

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <motion.div {...fadeIn}>
          <Button asChild variant="ghost" className="mb-8 w-fit text-white/60 hover:text-white hover:bg-white/10">
            <Link href="/#events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tChefs("back")}
            </Link>
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.6 }} className="space-y-8">
            <div className="aspect-[4/3] relative rounded-3xl overflow-hidden border border-white/10 bg-white/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={event.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary" : "border-transparent hover:border-white/20"}`}
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {t(`types.${EVENT_TYPE_MAP[event.eventType] || event.eventType}`) || event.eventType}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white">{event.title}</h1>
              {event.description && (
                <p className="text-xl text-white/60 font-light leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 py-8 border-y border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/40">
                  <Users className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-wider">{t("guests")}</span>
                </div>
                <p className="text-2xl text-white font-light">{event.guestCount}</p>
              </div>
              
              {event.eventDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-2xl text-white font-light">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {(event.chefProfile?.dashboardUser || event.companyProfile?.dashboardUser) && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wider text-white/40">Catered By</h3>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  {event.chefProfile?.dashboardUser?.avatar || event.companyProfile?.dashboardUser?.avatar ? (
                    <img 
                      src={event.chefProfile?.dashboardUser?.avatar || event.companyProfile?.dashboardUser?.avatar} 
                      alt="Caterer" 
                      className="w-12 h-12 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {event.chefProfile ? <ChefHat className="w-6 h-6 text-white/50" /> : <Building2 className="w-6 h-6 text-white/50" />}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {event.chefProfile?.dashboardUser?.name || event.companyProfile?.companyName || event.companyProfile?.dashboardUser?.name}
                    </p>
                    <p className="text-sm text-white/50">{event.chefProfile ? "Chef" : "Company"}</p>
                  </div>
                </div>
              </div>
            )}

            <Button asChild size="lg" className="bg-primary text-black hover:bg-white w-full sm:w-auto px-10 h-14 rounded-full font-semibold text-lg transition-all shadow-lg shadow-primary/20">
              <Link href="/inquiry">Inquire for Similar Event</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

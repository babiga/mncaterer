"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Users, Calendar, Video } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventCardProps {
  event: any;
}

const EVENT_TYPE_MAP: Record<string, string> = {
  WEDDING: "Wedding",
  CORPORATE: "Corporate",
  PRIVATE: "Private",
  SOCIAL: "Social",
};

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("Events");
  const typeLabel = EVENT_TYPE_MAP[event.eventType] || event.eventType;
  const image = event.coverImageUrl || (event.imageUrls && event.imageUrls[0]) || "/event-private.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/events/${event.id}`} className="block h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-4/3 overflow-hidden">
            <img
              src={image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
            
            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white border border-white/10 rounded-sm">
                {t(`types.${typeLabel}`)}
              </span>
            </div>

            {/* Video indicator */}
            {event.videoUrl && (
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                <Video className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 grow flex flex-col">
            <h3 className="text-xl font-light text-white mb-3 group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
            
            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-auto">
              <div className="flex items-center gap-1.5 text-white/40 text-sm">
                <Users className="w-4 h-4" />
                <span>{event.guestCount} {t("guests")}</span>
              </div>
              
              {event.eventDate && (
                <div className="flex items-center gap-1.5 text-white/40 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {t("openDetails")}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

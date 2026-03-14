'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const events = [
  {
    id: 1,
    title: "The Vanderbilt Wedding",
    type: "Wedding",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    guests: "250 Guests",
    highlights: ["Custom tasting menu", "Floral-plated dessert course", "Late-night snack bar"],
  },
  {
    id: 2,
    title: "TechFlow Annual Gala",
    type: "Corporate",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    guests: "500 Guests",
    highlights: ["Live carving stations", "Branded cocktail pairings", "Executive lounge service"],
  },
  {
    id: 3,
    title: "Penthouse Private Dining",
    type: "Private",
    image: "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?q=80&w=2072&auto=format&fit=crop",
    guests: "20 Guests",
    highlights: ["Chef's table presentation", "Wine pairing flight", "Seasonal tasting progression"],
  },
  {
    id: 4,
    title: "Summer Garden Soiree",
    type: "Social",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop",
    guests: "80 Guests",
    highlights: ["Garden canape circulation", "Signature dessert wall", "Sunset welcome drinks"],
  },
] as const;

type EventType = {
  id: string;
  title: string;
  eventType: "WEDDING" | "CORPORATE" | "PRIVATE" | "SOCIAL";
  guestCount: number;
  coverImageUrl: string | null;
  imageUrls: string[];
};

type EventCard = {
  id: string | number;
  title: string;
  type: "Wedding" | "Corporate" | "Private" | "Social";
  image: string;
  guests: string;
  highlights: readonly string[];
};

const EVENT_TYPE_TRANSLATION_KEY: Record<EventType["eventType"], EventCard["type"]> = {
  WEDDING: "Wedding",
  CORPORATE: "Corporate",
  PRIVATE: "Private",
  SOCIAL: "Social",
};

const EVENT_HIGHLIGHTS: Record<EventCard["type"], string[]> = {
  Wedding: ["Bespoke tasting menu", "Elegant dessert station", "Premium table service"],
  Corporate: ["Fast-paced service team", "Executive menu curation", "Branded food presentation"],
  Private: ["Intimate plated dinner", "Chef-led storytelling", "Tailored dietary planning"],
  Social: ["Shareable small plates", "Seasonal beverage program", "Immersive ambiance design"],
};

export default function Events({ events: apiEvents }: { events?: EventType[] }) {
  const t = useTranslations("Events");
  const isMobile = useIsMobile();

  const eventCards: EventCard[] =
    apiEvents && apiEvents.length > 0
      ? apiEvents.map((event) => {
          const type = EVENT_TYPE_TRANSLATION_KEY[event.eventType];
          return {
            id: event.id,
            title: event.title,
            type,
            image: event.coverImageUrl || event.imageUrls[0] || "/event-private.png",
            guests: `${event.guestCount} Guests`,
            highlights: EVENT_HIGHLIGHTS[type],
          };
        })
      : events.map((event) => ({ ...event }));

  // Detail content removed in favor of detail page

  return (
    <section id="events" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {eventCards.map((event) => (
              <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link href={`/events/${event.id}`} className="block w-full">
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-card border border-white/5 overflow-hidden group text-left w-full h-full"
                  >
                    <div className="relative aspect-4/3 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-sm border border-white/10">
                        <span className="text-xs uppercase tracking-wider text-white">{t(`types.${event.type}`)}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl text-white mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.guests.replace("Guests", t("guests"))}</p>
                      <p className="mt-3 text-xs uppercase tracking-wider text-primary">{t("openDetails")}</p>
                    </div>
                  </motion.div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-10">
            <CarouselPrevious className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
            <CarouselNext className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
          </div>
        </Carousel>
        <div className="flex justify-center mt-16">
          <Button asChild variant="outline" size="lg" className="border-white/10 hover:border-primary px-10 py-6 text-lg rounded-none transition-all">
            <Link href="/events">{t("seeAllTitle")}</Link>
          </Button>
        </div>
      </div>

      {/* Modals removed in favor of detail page */}
    </section>
  );
}

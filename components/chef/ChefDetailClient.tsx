"use client";

import { Button } from "@/components/ui/button";
import { ChefReviewsSection, type ChefReviewItem } from "@/components/chef/chef-reviews-section";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Star, Award, MapPin, Clock, Users, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

type PortfolioEvent = {
  id: string;
  title: string;
  eventType: string;
  guestCount: number;
  coverImageUrl: string | null;
  imageUrls: string[];
};

type ChefDetailProps = {
  chef: any;
  fallbackChef: any;
  customer: any;
  initialReviews: ChefReviewItem[];
  canReview: boolean;
  rating: number;
  reviews: number;
};

export function ChefDetailClient({
  chef,
  fallbackChef,
  customer,
  initialReviews,
  canReview,
  rating,
  reviews,
}: ChefDetailProps) {
  const t = useTranslations("Chefs");

  const displayName = chef?.name ?? fallbackChef?.name ?? "";
  const avatar = chef?.avatar ?? fallbackChef?.image ?? "/chef-1.png";
  const specialty = chef?.chefProfile?.specialty ?? fallbackChef?.specialty ?? t("defaultSpecialty");
  const bio = chef?.chefProfile?.bio ?? fallbackChef?.bio ?? t("detailDescription", { name: displayName });
  const yearsExperience = chef?.chefProfile?.yearsExperience ?? 0;
  const certifications = (chef?.chefProfile?.certifications as string[]) ?? [];
  const events = (chef?.chefProfile?.portfolioEvents as PortfolioEvent[]) ?? [];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="space-y-0">
      {/* Dynamic Header Section - No Cover Image, Just Avatar */}
      <div className="relative pt-32 pb-16 w-full">
        <div className="container relative mx-auto px-6">
          <motion.div {...fadeIn}>
            <Button asChild variant="ghost" className="mb-12 w-fit text-white/60 hover:text-white hover:bg-white/10">
              <Link href="/#chefs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back")}
              </Link>
            </Button>
          </motion.div>
          
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-8"
            >
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary/30 shadow-2xl md:h-48 md:w-48 group relative">
                <img 
                  src={avatar} 
                  alt={displayName} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-3">
                <Badge variant="outline" className="border-primary/50 text-primary uppercase tracking-[0.2em] text-[10px] py-1 px-3">
                  {t("role")}
                </Badge>
                <h1 className="text-5xl font-light text-white md:text-7xl tracking-tight">{displayName}</h1>
                <p className="text-xl text-primary/80 font-medium italic">{specialty}</p>
              </div>
            </motion.div>
            
            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-2"
            >
              <Button asChild size="lg" className="bg-primary text-black hover:bg-white px-10 h-14 rounded-full font-semibold text-base transition-all duration-300 shadow-lg shadow-primary/20">
                <Link href="/inquiry">{t("bookConsultation")}</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* Stats Grid - All Real Data */}
            <motion.div 
              variants={{
                animate: { transition: { staggerChildren: 0.1 } }
              }}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { icon: Star, value: rating.toFixed(1), label: t("reviews"), fill: true },
                { icon: Clock, value: yearsExperience, label: t("experience") },
                { icon: Users, value: reviews, label: t("reviewsSectionTitle") },
                { icon: Calendar, value: events.length, label: "Events" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={{
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 }
                  }}
                  className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="mb-3 text-primary group-hover:scale-110 transition-transform">
                    <stat.icon className={`h-6 w-6 ${stat.fill ? 'fill-primary' : ''}`} />
                  </div>
                  <div className="text-3xl font-light text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* About */}
            <motion.section 
              {...fadeIn}
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <h2 className="text-xl font-medium text-white uppercase tracking-[0.2em] whitespace-nowrap">{t("bio")}</h2>
                <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-xl leading-relaxed text-white/70 font-light">
                  {bio}
                </p>
              </div>
            </motion.section>

            {/* Certifications if any */}
            {certifications.length > 0 && (
              <motion.section 
                {...fadeIn}
                whileInView="animate"
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="flex items-center gap-6">
                  <h2 className="text-xl font-medium text-white uppercase tracking-[0.2em] whitespace-nowrap">{t("certifications")}</h2>
                  <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-4">
                  {certifications.map((cert: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-3 text-sm text-primary hover:bg-primary/10 transition-colors duration-300">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Portfolio Grid */}
            {events.length > 0 && (
              <motion.section 
                {...fadeIn}
                whileInView="animate"
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between gap-6">
                  <h2 className="text-xl font-medium text-white uppercase tracking-[0.2em] whitespace-nowrap">{t("portfolio")}</h2>
                  <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  {events.map((event: PortfolioEvent) => (
                    <Card key={event.id} className="group overflow-hidden border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 rounded-3xl">
                      <div className="relative aspect-16/10 overflow-hidden">
                        <img 
                          src={event.coverImageUrl || event.imageUrls[0] || "/event-private.png"} 
                          alt={event.title} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-primary text-black font-semibold border-none rounded-full px-4 py-1.5 shadow-lg">
                            {event.eventType}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-light text-white mb-4 group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-6 text-sm text-white/50">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{event.guestCount} Guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>Private Event</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Reviews Section */}
            <motion.div 
              {...fadeIn}
              whileInView="animate"
              viewport={{ once: true }}
              className="pt-12 border-t border-white/5"
            >
              <ChefReviewsSection
                chefId={chef?.id ?? null}
                initialReviews={initialReviews}
                initialAverageRating={rating}
                initialReviewCount={reviews}
                isCustomerLoggedIn={Boolean(customer)}
                currentCustomerId={customer?.id ?? null}
                canReview={canReview}
              />
            </motion.div>
          </div>

          {/* Sidebar - No Mock Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="sticky top-32"
            >
              <Card className="overflow-hidden border-primary/20 bg-white/5 backdrop-blur-2xl rounded-3xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-light text-white tracking-tight">Direct Inquiry</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Connect directly with {displayName.split(' ')[0]} to discuss your upcoming event, dietary requirements, and custom menu options.
                    </p>
                  </div>
                  
                  <Button asChild className="w-full bg-primary text-black hover:bg-white h-16 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-primary/10">
                    <Link href="/inquiry">{t("requestConsultation")}</Link>
                  </Button>
                  
                  <div className="pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Official Portfolio</p>
                  </div>
                </CardContent>
              </Card>

              {/* Minimal Info Card with Only Real Data */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md"
              >
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Culinary Identity</h4>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Primary Specialty</span>
                    <span className="text-white/80 font-light">{specialty}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Experience Level</span>
                    <span className="text-white/80 font-light">{yearsExperience} {t("years", { count: yearsExperience })}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

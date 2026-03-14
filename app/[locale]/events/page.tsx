import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { EventListClient } from "@/components/event/EventListClient";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Events" });

  return {
    title: `${t("seeAllTitle")} | Mongolian National Caterer`,
    description: t("seeAllDescription"),
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Initial fetch for first page
  const initialEvents = await prisma.event.findMany({
    where: {},
    include: {
      chefProfile: {
        include: {
          dashboardUser: {
            select: { name: true, avatar: true },
          },
        },
      },
      companyProfile: {
        include: {
          dashboardUser: {
            select: { name: true, avatar: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const totalEvents = await prisma.event.count();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <EventListClient 
              initialEvents={JSON.parse(JSON.stringify(initialEvents))} 
              totalCount={totalEvents}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

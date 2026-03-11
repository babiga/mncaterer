import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { fallbackEvents } from "@/lib/event-fallback";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/event/EventDetailClient";
import { getTranslations } from "next-intl/server";

type EventPageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  // Try db
  const eventFromDb = await prisma.event.findUnique({
    where: { id },
    include: {
      chefProfile: {
        include: {
          dashboardUser: true
        }
      },
      companyProfile: {
        include: {
          dashboardUser: true
        }
      }
    }
  });

  const event = eventFromDb ?? fallbackEvents.find((e) => e.id === id || e.id.toString() === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Navbar trimmed />
      <EventDetailClient event={event} />
      <Footer />
    </div>
  );
}

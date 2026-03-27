import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ChefReviewsSection, type ChefReviewItem } from "@/components/chef/chef-reviews-section";
import { prisma } from "@/lib/prisma";
import { fallbackChefProfiles } from "@/lib/chef-profile-fallback";
import { getCurrentCustomer } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ChefDetailClient } from "@/components/chef/ChefDetailClient";

type ChefProfilePageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function ChefProfilePage({ params }: ChefProfilePageProps) {
  const { id } = await params;
  const customer = await getCurrentCustomer();

  const chef = await prisma.dashboardUser.findFirst({
    where: {
      id,
      role: "CHEF",
      isActive: true,
      isVerified: true,
      chefProfile: {
        is: {
          taxStatus: { in: ["PAID", "WAIVED"] },
        }
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      chefProfile: {
        select: {
          id: true,
          specialty: true,
          rating: true,
          reviewCount: true,
          coverImage: true,
          bio: true,
          yearsExperience: true,
          certifications: true,
          specialties: true,
          education: true,
          experience: true,
          events: true,
          degrees: true,
          awards: true,
          portfolioEvents: {
            take: 6,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              eventType: true,
              guestCount: true,
              coverImageUrl: true,
              imageUrls: true,
            }
          }
        },
      },
    },
  });

  const fallbackChef = fallbackChefProfiles.find((item) => item.id === id);
  if (!chef && !fallbackChef) {
    notFound();
  }

  let initialReviews: ChefReviewItem[] = [];
  let canReview = false;
  let liveAverageRating = chef?.chefProfile?.rating ?? fallbackChef?.rating ?? 0;
  let liveReviewCount = chef?.chefProfile?.reviewCount ?? fallbackChef?.reviewCount ?? 0;

  if (chef?.chefProfile?.id) {
    const [dbReviews, aggregate] = await prisma.$transaction([
      prisma.review.findMany({
        where: { chefProfileId: chef.chefProfile.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.aggregate({
        where: { chefProfileId: chef.chefProfile.id },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    initialReviews = dbReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      customer: review.customer,
    }));
    liveAverageRating = aggregate._avg.rating ?? 0;
    liveReviewCount = aggregate._count._all;

    if (customer) {
      const eligibleBooking = await prisma.booking.findFirst({
        where: {
          customerId: customer.id,
          chefProfileId: chef.chefProfile.id,
          status: "COMPLETED",
          reviews: {
            none: {
              customerId: customer.id,
            },
          },
        },
        select: { id: true },
      });

      canReview = Boolean(eligibleBooking);
    }
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Navbar trimmed />

      <ChefDetailClient
        chef={chef}
        fallbackChef={fallbackChef}
        customer={customer}
        initialReviews={initialReviews}
        canReview={canReview}
        rating={liveAverageRating}
        reviews={liveReviewCount}
      />

      <Footer />
    </div>
  );
}

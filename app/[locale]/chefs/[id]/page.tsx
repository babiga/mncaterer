import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChefReviewsSection, type ChefReviewItem } from "@/components/chef/chef-reviews-section";
import { prisma } from "@/lib/prisma";
import { fallbackChefProfiles } from "@/lib/chef-profile-fallback";
import { getCurrentCustomer } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type ChefProfilePageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function ChefProfilePage({ params }: ChefProfilePageProps) {
  const { id } = await params;
  const t = await getTranslations("Chefs");
  const customer = await getCurrentCustomer();

  const chef = await prisma.dashboardUser.findFirst({
    where: {
      id,
      role: "CHEF",
      isActive: true,
      isVerified: true,
      chefProfile: { isNot: null },
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

  const displayName = chef?.name ?? fallbackChef?.name ?? "";
  const image = chef?.chefProfile?.coverImage ?? chef?.avatar ?? fallbackChef?.image ?? "/chef-1.png";
  const rating = liveAverageRating;
  const reviews = liveReviewCount;
  const specialty = chef?.chefProfile?.specialty ?? fallbackChef?.specialty ?? t("defaultSpecialty");
  const role = fallbackChef?.role ?? t("role");
  const bio = fallbackChef?.bio ?? t("detailDescription", { name: displayName });

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28 space-y-10">
        <Button asChild variant="ghost" className="text-white hover:bg-white/10">
          <Link href="/#chefs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Link>
        </Button>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-card/80 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/10">
            <img src={image} alt={displayName} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl text-white md:text-4xl">{displayName}</h1>
              <p className="mt-1 text-primary uppercase tracking-widest text-sm">{role}</p>
            </div>
          </div>

          <div className="space-y-6 self-center text-white">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(rating) ? "fill-primary text-primary" : "text-white/30"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">
                {rating.toFixed(1)} ({reviews} {t("reviews")})
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wider text-primary">{t("specialty")}</p>
              <p className="text-sm text-white/80 border-l-2 border-primary/60 pl-3">{specialty}</p>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">{bio}</p>

            <Button asChild className="bg-primary text-black hover:bg-white">
              <Link href="/inquiry">{t("requestConsultation")}</Link>
            </Button>
          </div>
        </section>

        <ChefReviewsSection
          chefId={chef?.id ?? null}
          initialReviews={initialReviews}
          initialAverageRating={rating}
          initialReviewCount={reviews}
          isCustomerLoggedIn={Boolean(customer)}
          currentCustomerId={customer?.id ?? null}
          canReview={canReview}
        />
      </main>
      <Footer />
    </div>
  );
}

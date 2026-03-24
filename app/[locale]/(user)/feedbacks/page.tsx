import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/routing";
import { UserFeedbacksList, type UserReviewItem } from "@/components/user/user-feedbacks-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UserFeedbacks.page");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function UserFeedbacksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect({ href: "/login", locale });
    return null; // unreachable but satisfies TS
  }

  const customerId = customer.id;
  const t = await getTranslations("UserFeedbacks.page");

  const dbReviews = await prisma.review.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      chefProfile: {
        select: {
          id: true,
          dashboardUser: {
            select: {
              name: true,
            },
          },
        },
      },
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          eventDate: true,
        },
      },
    },
  });

  const reviews: UserReviewItem[] = dbReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    chefProfile: {
      id: r.chefProfile.id,
      dashboardUser: {
        name: r.chefProfile.dashboardUser.name,
      },
    },
    booking: {
      id: r.booking.id,
      bookingNumber: r.booking.bookingNumber,
      eventDate: r.booking.eventDate.toISOString(),
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-lg">{t("description")}</p>
      </div>
      <UserFeedbacksList initialReviews={reviews} />
    </div>
  );
}

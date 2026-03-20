import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserOrdersList } from "@/components/user/user-orders-list";
import { getTranslations } from "next-intl/server";

export default async function UserOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("UserOrders.page");
  const user = await getCurrentCustomer();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      serviceTier: {
        select: {
          id: true,
          name: true,
          pricePerGuest: true,
        },
      },
      menu: {
        select: {
          id: true,
          name: true,
        },
      },
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
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-lg">{t("description")}</p>
      </div>

      <UserOrdersList
        bookings={bookings.map((booking) => ({
          ...booking,
          eventDate: booking.eventDate.toISOString(),
          createdAt: booking.createdAt.toISOString(),
          totalPrice: Number(booking.totalPrice),
          depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
          serviceTier: {
            ...booking.serviceTier,
            pricePerGuest: Number(booking.serviceTier.pricePerGuest),
          },
        }))}
      />
    </div>
  );
}

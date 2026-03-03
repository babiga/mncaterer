import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserOrdersBooking } from "@/components/user/user-orders-booking";
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

  const [serviceTiers, menus, chefs, bookings] = await Promise.all([
    prisma.serviceTier.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        pricePerGuest: true,
        isVIP: true,
      },
    }),
    prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        serviceTierId: true,
      },
    }),
    prisma.chefProfile.findMany({
      where: {
        dashboardUser: {
          role: "CHEF",
          isActive: true,
          isVerified: true,
        },
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      select: {
        id: true,
        specialty: true,
        rating: true,
        dashboardUser: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.booking.findMany({
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
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <UserOrdersBooking
        serviceTiers={serviceTiers.map((item) => ({
          ...item,
          pricePerGuest: Number(item.pricePerGuest),
        }))}
        menus={menus}
        chefs={chefs.map((chef) => ({
          id: chef.id,
          name: chef.dashboardUser.name,
          specialty: chef.specialty || "Chef",
          rating: chef.rating,
        }))}
        initialBookings={bookings.map((booking) => ({
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
        initialCustomer={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        }}
      />
    </div>
  );
}

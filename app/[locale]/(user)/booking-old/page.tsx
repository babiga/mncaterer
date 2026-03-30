import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserBookingForm } from "@/components/user/user-booking-form";
import { getTranslations } from "next-intl/server";

export default async function UserBookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("UserBooking.page");
  const ordersT = await getTranslations("UserOrders.list");
  const user = await getCurrentCustomer();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [serviceTiers, menus, chefs] = await Promise.all([
    prisma.serviceTier.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        pricePerGuest: true,
        isVIP: true,
        sortOrder: true,
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
        taxStatus: { in: ["PAID", "WAIVED"] },
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
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <UserBookingForm
        serviceTiers={serviceTiers.map((item) => ({
          ...item,
          pricePerGuest: Number(item.pricePerGuest),
        }))}
        menus={menus}
        chefs={chefs.map((chef) => ({
          id: chef.id,
          name: chef.dashboardUser.name,
          specialty: chef.specialty || ordersT("chef"),
          rating: chef.rating,
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

import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingFlow } from "@/components/booking/BookingFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking" });

  return {
    title: `${t("title")} | Mongolian National Caterer`,
    description: t("subtitle"),
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentCustomer();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [serviceTiers, menus, chefs, menuItems] = await Promise.all([
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
      include: {
        serviceTier: {
          select: {
            id: true,
            name: true,
            isVIP: true,
            pricePerGuest: true,
          },
        },
        items: {
          orderBy: [{ sortOrder: "asc" }, { menuItem: { name: "asc" } }],
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
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
          select: { name: true },
        },
      },
    }),
    prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
      },
    }),
  ]);

  const formattedServiceTiers = serviceTiers.map((t) => ({
    ...t,
    pricePerGuest: Number(t.pricePerGuest),
  }));

  const formattedMenus = JSON.parse(JSON.stringify(menus));

  const formattedChefs = chefs.map((chef) => ({
    id: chef.id,
    name: chef.dashboardUser.name,
    specialty: chef.specialty || "Chef",
    rating: chef.rating,
  }));

  const formattedMenuItems = menuItems.map((item) => ({
    ...item,
    price: Number(item.price),
  }));

  return (
    <main className="pt-24 pb-12 lg:pt-36">
      <BookingFlow
        serviceTiers={formattedServiceTiers}
        menus={formattedMenus}
        chefs={formattedChefs}
        menuItems={formattedMenuItems}
        initialCustomer={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        }}
      />
    </main>
  );
}

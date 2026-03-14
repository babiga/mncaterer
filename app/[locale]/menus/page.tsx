import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MenuListClient } from "@/components/menu/MenuListClient";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignatureMenus" });

  return {
    title: `${t("seeAllTitle")} | Mongolian National Caterer`,
    description: t("seeAllDescription"),
  };
}

export default async function MenusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Initial fetch for first page
  const [menus, totalMenus, serviceTiers] = await Promise.all([
    prisma.menu.findMany({
      where: {
        isActive: true,
      },
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
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.menu.count({
      where: {
        isActive: true,
      }
    }),
    prisma.serviceTier.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true }
    })
  ]);

  // Clean data for transport
  const formattedMenus = JSON.parse(JSON.stringify(menus));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <MenuListClient 
              initialMenus={formattedMenus} 
              totalCount={totalMenus}
              serviceTiers={JSON.parse(JSON.stringify(serviceTiers))}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

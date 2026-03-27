import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChefListClient } from "@/components/chef/ChefListClient";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Chefs" });

  return {
    title: `${t("seeAllTitle")} | Mongolian National Caterer`,
    description: t("seeAllDescription"),
  };
}

export default async function ChefsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Initial fetch for first page
  const chefs = await prisma.dashboardUser.findMany({
    where: {
      role: "CHEF",
      isActive: true,
      isVerified: true,
      chefProfile: {
        is: {
          taxStatus: { in: ["PAID", "WAIVED"] },
        }
      }
    },
    include: {
      chefProfile: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const totalChefs = await prisma.dashboardUser.count({
    where: {
      role: "CHEF",
      isActive: true,
      isVerified: true,
      chefProfile: {
        is: {
          taxStatus: { in: ["PAID", "WAIVED"] },
        }
      }
    }
  });

  const formattedChefs = chefs.map((chef) => ({
    id: chef.id,
    name: chef.name,
    avatar: chef.avatar,
    role: chef.chefProfile?.specialty || "Chef",
    specialty: chef.chefProfile?.specialty,
    yearsExperience: chef.chefProfile?.yearsExperience,
    bio: chef.chefProfile?.bio,
    rating: chef.chefProfile?.rating || 0,
    reviewCount: chef.chefProfile?.reviewCount || 0,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <ChefListClient 
              initialChefs={JSON.parse(JSON.stringify(formattedChefs))} 
              totalCount={totalChefs}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

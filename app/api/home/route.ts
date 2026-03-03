import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      banners,
      partners,
      socialLinks,
      serviceTiers,
      menus,
      chefs,
      featuredEvents,
    ] = await Promise.all([
      prisma.siteContent.findMany({
        where: { type: "BANNER", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.siteContent.findMany({
        where: { type: "PARTNER", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.siteContent.findMany({
        where: { type: "SOCIAL_LINK", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.serviceTier.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 4,
      }),
      prisma.menu.findMany({
        where: { isActive: true },
        include: {
          items: {
            select: { name: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
            take: 4,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.dashboardUser.findMany({
        where: {
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
              specialty: true,
              rating: true,
              reviewCount: true,
              coverImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.event.findMany({
        where: { isFeatured: true },
        orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

    const events =
      featuredEvents.length > 0
        ? featuredEvents
        : await prisma.event.findMany({
            orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
            take: 6,
          });

    return NextResponse.json({
      success: true,
      data: {
        banners: banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl,
        })),
        partners: partners.map((p) => ({
          id: p.id,
          title: p.title,
          imageUrl: p.imageUrl,
        })),
        socialLinks: socialLinks.map((s) => ({
          id: s.id,
          title: s.title,
          link: s.link,
          icon: s.icon,
        })),
        serviceTiers: serviceTiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          isVIP: tier.isVIP,
          pricePerGuest: Number(tier.pricePerGuest),
        })),
        menus: menus.map((menu) => ({
          id: menu.id,
          name: menu.name,
          description: menu.description,
          downloadUrl: menu.downloadUrl,
          items: menu.items.map((item) => item.name),
        })),
        chefs: chefs.map((chef) => ({
          id: chef.id,
          name: chef.name,
          avatar: chef.avatar,
          specialty: chef.chefProfile?.specialty ?? null,
          rating: chef.chefProfile?.rating ?? 0,
          reviewCount: chef.chefProfile?.reviewCount ?? 0,
          coverImage: chef.chefProfile?.coverImage ?? null,
        })),
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          eventType: event.eventType,
          guestCount: event.guestCount,
          coverImageUrl: event.coverImageUrl,
          imageUrls: event.imageUrls,
        })),
      },
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

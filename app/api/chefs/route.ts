import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chefsQuerySchema } from "@/lib/validations/chefs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = chefsQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, search, specialty, minExperience } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      role: "CHEF",
      isActive: true,
      // Only show chefs who have a profile
      chefProfile: {
        is: {
          taxStatus: { in: ["PAID", "WAIVED"] },
        }
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { chefProfile: { specialty: { contains: search, mode: "insensitive" } } },
        { chefProfile: { bio: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (specialty) {
      where.chefProfile = {
        ...where.chefProfile,
        specialty: { contains: specialty, mode: "insensitive" },
      };
    }

    if (minExperience !== undefined) {
      where.chefProfile = {
        ...where.chefProfile,
        yearsExperience: { gte: minExperience },
      };
    }

    const [chefs, total] = await Promise.all([
      prisma.dashboardUser.findMany({
        where,
        include: {
          chefProfile: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.dashboardUser.count({ where }),
    ]);

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

    return NextResponse.json({
      success: true,
      data: formattedChefs,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("[CHEFS_GET]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

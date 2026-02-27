import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { reviewsQuerySchema } from "@/lib/validations/reviews";

function isAdminSession(
  session: Awaited<ReturnType<typeof getSession>>,
): session is NonNullable<Awaited<ReturnType<typeof getSession>>> {
  return Boolean(session && session.userType === "dashboard" && session.role === "ADMIN");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parseResult = reviewsQuerySchema.safeParse({
      limit: searchParams.get("limit") || 100,
      sortOrder: searchParams.get("sortOrder") || "desc",
      minRating: searchParams.get("minRating") || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { limit, sortOrder, minRating } = parseResult.data;
    const where: Record<string, unknown> = {};
    if (typeof minRating === "number") {
      where.rating = { gte: minRating };
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chefProfile: {
          select: {
            id: true,
            dashboardUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("List reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}


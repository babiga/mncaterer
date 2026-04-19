import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { dashboardBookingsQuerySchema } from "@/lib/validations/bookings";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryResult = dashboardBookingsQuerySchema.safeParse({
      limit: searchParams.get("limit") || 200,
      status: searchParams.get("status") || undefined,
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { limit, status, sortOrder } = queryResult.data;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings.map((booking) => ({
        ...booking,
        totalPrice: Number(booking.totalPrice),
        depositAmount: booking.depositAmount
          ? Number(booking.depositAmount)
          : null,
        serviceTier: {
          ...booking.serviceTier,
          pricePerGuest: Number(booking.serviceTier.pricePerGuest),
        },
      })),
    });
  } catch (error) {
    console.error("List dashboard bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

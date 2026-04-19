import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateCustomerSchema } from "@/lib/validations/users";

// GET /api/users/[id] - Get single customer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getSession();
    if (
      !session ||
      session.userType !== "dashboard" ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        userType: true,
        organizationName: true,
        companyLegalNo: true,
        avatar: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const activeStatuses = ["PENDING", "CONFIRMED", "DEPOSIT_PAID", "IN_PROGRESS"] as const;
    const [recentBookingsRaw, bookingStatusBreakdownRaw, bookingTotalsRaw, upcomingOrdersCount] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          bookingNumber: true,
          serviceType: true,
          status: true,
          eventDate: true,
          eventTime: true,
          guestCount: true,
          venue: true,
          totalPrice: true,
          depositAmount: true,
          createdAt: true,
          serviceTier: {
            select: {
              id: true,
              name: true,
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
                },
              },
            },
          },
        },
      }),
      prisma.booking.groupBy({
        by: ["status"],
        where: { customerId: id },
        _count: {
          status: true,
        },
      }),
      prisma.booking.aggregate({
        where: { customerId: id },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.booking.count({
        where: {
          customerId: id,
          eventDate: { gte: now },
          status: { in: [...activeStatuses] },
        },
      }),
    ]);

    const statusBreakdown = bookingStatusBreakdownRaw.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const recentBookings = recentBookingsRaw.map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        recentBookings,
        bookingInsights: {
          totalOrders: user._count.bookings,
          totalSpent: Number(bookingTotalsRaw._sum.totalPrice ?? 0),
          completedOrders: statusBreakdown.COMPLETED ?? 0,
          cancelledOrders: statusBreakdown.CANCELLED ?? 0,
          upcomingOrders: upcomingOrdersCount,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update customer information
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getSession();
    if (
      !session ||
      session.userType !== "dashboard" ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const result = updateCustomerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: result.data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        userType: true,
        organizationName: true,
        companyLegalNo: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getSession();
    if (
      !session ||
      session.userType !== "dashboard" ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

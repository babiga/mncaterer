import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBookingApiSchema } from "@/lib/validations/bookings";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: session.userId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: bookings.map((booking) => ({
        ...booking,
        totalPrice: Number(booking.totalPrice),
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
        serviceTier: {
          ...booking.serviceTier,
          pricePerGuest: Number(booking.serviceTier.pricePerGuest),
        },
      })),
    });
  } catch (error) {
    console.error("List bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = createBookingApiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = result.data;
    const eventDate = new Date(`${data.eventDate}T00:00:00`);
    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid event date" },
        { status: 400 },
      );
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (eventDate < today) {
      return NextResponse.json(
        { success: false, error: "Event date cannot be in the past" },
        { status: 400 },
      );
    }

    const serviceTier = await prisma.serviceTier.findUnique({
      where: { id: data.serviceTierId },
      select: {
        id: true,
        pricePerGuest: true,
      },
    });

    if (!serviceTier) {
      return NextResponse.json(
        { success: false, error: "Selected service tier was not found" },
        { status: 400 },
      );
    }

    if (data.menuId) {
      const menu = await prisma.menu.findUnique({
        where: { id: data.menuId },
        select: {
          id: true,
          isActive: true,
          serviceTierId: true,
        },
      });

      if (!menu || !menu.isActive) {
        return NextResponse.json(
          { success: false, error: "Selected menu is not available" },
          { status: 400 },
        );
      }

      if (menu.serviceTierId && menu.serviceTierId !== data.serviceTierId) {
        return NextResponse.json(
          { success: false, error: "Menu does not match selected service tier" },
          { status: 400 },
        );
      }
    }

    if (data.chefProfileId) {
      const chef = await prisma.chefProfile.findUnique({
        where: { id: data.chefProfileId },
        include: {
          dashboardUser: {
            select: {
              role: true,
              isActive: true,
              isVerified: true,
            },
          },
        },
      });

      if (
        !chef ||
        chef.dashboardUser.role !== "CHEF" ||
        !chef.dashboardUser.isActive ||
        !chef.dashboardUser.isVerified
      ) {
        return NextResponse.json(
          { success: false, error: "Selected chef is not available" },
          { status: 400 },
        );
      }
    }

    const totalPrice = Number(serviceTier.pricePerGuest) * data.guestCount;
    const depositAmount = Number((totalPrice * 0.3).toFixed(2));

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.contactName.trim(),
        phone: data.contactPhone.trim(),
      },
    });

    const requestDetails: string[] = [];
    if (data.specialRequests?.trim()) {
      requestDetails.push(data.specialRequests.trim());
    }
    if (data.contactEmail !== user.email) {
      requestDetails.push(`Contact email for this booking: ${data.contactEmail}`);
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: session.userId,
        serviceTierId: data.serviceTierId,
        menuId: data.menuId || null,
        chefProfileId: data.chefProfileId || null,
        serviceType: data.serviceType,
        eventDate,
        eventTime: data.eventTime,
        guestCount: data.guestCount,
        venue: data.venue.trim(),
        venueAddress: data.venueAddress?.trim() || null,
        specialRequests: requestDetails.length > 0 ? requestDetails.join("\n") : null,
        totalPrice,
        depositAmount,
      },
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
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...booking,
        totalPrice: Number(booking.totalPrice),
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
        serviceTier: {
          ...booking.serviceTier,
          pricePerGuest: Number(booking.serviceTier.pricePerGuest),
        },
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

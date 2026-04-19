import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateBookingStatusSchema } from "@/lib/validations/bookings";

function mapBooking(booking: any) {
  return {
    ...booking,
    totalPrice: Number(booking.totalPrice),
    depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
    serviceTier: booking.serviceTier
      ? {
          ...booking.serviceTier,
          pricePerGuest: Number(booking.serviceTier.pricePerGuest),
        }
      : null,
    payments: Array.isArray(booking.payments)
      ? booking.payments.map((payment: any) => ({
          ...payment,
          amount: Number(payment.amount),
          invoice: payment.invoice
            ? {
                ...payment.invoice,
                subtotal: Number(payment.invoice.subtotal),
                tax: Number(payment.invoice.tax),
                total: Number(payment.invoice.total),
              }
            : null,
        }))
      : [],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
        serviceTier: {
          select: {
            id: true,
            name: true,
            pricePerGuest: true,
            isVIP: true,
          },
        },
        menu: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        chefProfile: {
          select: {
            id: true,
            specialty: true,
            dashboardUser: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        contract: {
          select: {
            id: true,
            status: true,
            signatureUrl: true,
            signedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transactionId: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                subtotal: true,
                tax: true,
                total: true,
                issuedAt: true,
                paidAt: true,
                dueDate: true,
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        isCustomMenu: true,
        customMenuData: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mapBooking(booking),
    });
  } catch (error) {
    console.error("Get dashboard booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (
      !session ||
      session.userType !== "dashboard" ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parseResult = updateBookingStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: parseResult.data.status },
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
      message: "Booking status updated",
      data: mapBooking(updated),
    });
  } catch (error) {
    console.error("Update dashboard booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

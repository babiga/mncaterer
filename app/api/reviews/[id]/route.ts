import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateReviewAdminSchema } from "@/lib/validations/reviews";

function isAdminSession(
  session: Awaited<ReturnType<typeof getSession>>,
): session is NonNullable<Awaited<ReturnType<typeof getSession>>> {
  return Boolean(session && session.userType === "dashboard" && session.role === "ADMIN");
}

async function recalculateChefRating(chefProfileId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { chefProfileId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await prisma.chefProfile.update({
    where: { id: chefProfileId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all,
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, chefProfileId: true, customerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const isAdmin = isAdminSession(session);
    const isOwner = session.userType === "customer" && session.userId === existing.customerId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = updateReviewAdminSchema.safeParse(body);
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

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: parseResult.data.rating,
        comment: parseResult.data.comment?.trim() || null,
      },
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

    await recalculateChefRating(existing.chefProfileId);

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, chefProfileId: true, customerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const isAdmin = isAdminSession(session);
    const isOwner = session.userType === "customer" && session.userId === existing.customerId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id },
    });

    await recalculateChefRating(existing.chefProfileId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}


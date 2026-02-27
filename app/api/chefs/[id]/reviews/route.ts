import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createChefReviewSchema } from "@/lib/validations/reviews";

async function resolveChefProfileId(id: string) {
  const chef = await prisma.dashboardUser.findFirst({
    where: {
      id,
      role: "CHEF",
      isActive: true,
      isVerified: true,
      chefProfile: { isNot: null },
    },
    select: {
      chefProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  return chef?.chefProfile?.id ?? null;
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

  return {
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count._all,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const chefProfileId = await resolveChefProfileId(id);

    if (!chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Chef not found" },
        { status: 404 },
      );
    }

    const [reviews, aggregate] = await prisma.$transaction([
      prisma.review.findMany({
        where: { chefProfileId },
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: 50,
      }),
      prisma.review.aggregate({
        where: { chefProfileId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const totalReviews = aggregate._count._all;
    const averageRating = aggregate._avg.rating ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        averageRating,
        totalReviews,
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          customer: {
            id: review.customer.id,
            name: review.customer.name,
            avatar: review.customer.avatar,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Get chef reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const chefProfileId = await resolveChefProfileId(id);

    if (!chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Chef not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parseResult = createChefReviewSchema.safeParse(body);
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

    const comment = parseResult.data.comment?.trim() || null;

    const eligibleBooking = await prisma.booking.findFirst({
      where: {
        customerId: session.userId,
        chefProfileId,
        status: "COMPLETED",
        reviews: {
          none: {
            customerId: session.userId,
          },
        },
      },
      orderBy: { eventDate: "desc" },
      select: { id: true },
    });

    if (!eligibleBooking) {
      return NextResponse.json(
        { success: false, error: "No eligible completed booking found for review" },
        { status: 400 },
      );
    }

    const [review, aggregate, customer] = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: eligibleBooking.id,
          customerId: session.userId,
          chefProfileId,
          rating: parseResult.data.rating,
          comment,
        },
      });

      const summary = await tx.review.aggregate({
        where: { chefProfileId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.chefProfile.update({
        where: { id: chefProfileId },
        data: {
          rating: summary._avg.rating ?? 0,
          reviewCount: summary._count._all,
        },
      });

      const currentCustomer = await tx.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, avatar: true },
      });

      return [created, summary, currentCustomer] as const;
    });

    return NextResponse.json({
      success: true,
      data: {
        averageRating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count._all,
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          customer: customer,
        },
      },
    });
  } catch (error) {
    console.error("Create chef review error:", error);
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
    if (!session || session.userType !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const chefProfileId = await resolveChefProfileId(id);
    if (!chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Chef not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const reviewId = typeof body?.reviewId === "string" ? body.reviewId : "";
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 },
      );
    }

    const parseResult = createChefReviewSchema.safeParse(body);
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

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, customerId: true, chefProfileId: true },
    });

    if (!existing || existing.chefProfileId !== chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    if (existing.customerId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const comment = parseResult.data.comment?.trim() || null;

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: parseResult.data.rating,
        comment,
      },
      include: {
        customer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const summary = await recalculateChefRating(chefProfileId);

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          customer: review.customer,
        },
      },
    });
  } catch (error) {
    console.error("Update chef review error:", error);
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
    if (!session || session.userType !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const chefProfileId = await resolveChefProfileId(id);
    if (!chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Chef not found" },
        { status: 404 },
      );
    }

    const reviewId = request.nextUrl.searchParams.get("reviewId");
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, customerId: true, chefProfileId: true },
    });

    if (!existing || existing.chefProfileId !== chefProfileId) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    if (existing.customerId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    const summary = await recalculateChefRating(chefProfileId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Delete chef review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

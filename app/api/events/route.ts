import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { eventsQuerySchema, createEventSchema } from "@/lib/validations/events";

// GET /api/events - List all events with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryResult = eventsQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 12,
      search: searchParams.get("search") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      isFeatured: searchParams.get("isFeatured") || undefined,
      minGuests: searchParams.get("minGuests") || undefined,
      maxGuests: searchParams.get("maxGuests") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
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

    const {
      page,
      limit,
      search,
      eventType,
      isFeatured,
      minGuests,
      maxGuests,
      sortBy,
      sortOrder,
    } = queryResult.data;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (typeof isFeatured === "boolean") {
      where.isFeatured = isFeatured;
    }

    if (minGuests !== undefined || maxGuests !== undefined) {
      where.guestCount = {};
      if (minGuests !== undefined) where.guestCount.gte = minGuests;
      if (maxGuests !== undefined) where.guestCount.lte = maxGuests;
    }

    // Get total count
    const total = await prisma.event.count({ where });

    // Get events
    const events = await prisma.event.findMany({
      where,
      include: {
        chefProfile: {
          include: {
            dashboardUser: {
              select: { name: true, avatar: true },
            },
          },
        },
        companyProfile: {
          include: {
            dashboardUser: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List events error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
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
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const result = createEventSchema.safeParse(body);
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

    const { eventDate, ...data } = result.data;

    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
      include: {
        chefProfile: {
          include: {
            dashboardUser: {
              select: { name: true },
            },
          },
        },
        companyProfile: {
          include: {
            dashboardUser: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

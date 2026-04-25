import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import {
  dashboardUsersQuerySchema,
  createDashboardUserApiSchema,
} from "@/lib/validations/users";

// GET /api/dashboard-users - List all dashboard users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    // Verify dashboard session
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryResult = dashboardUsersQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      isVerified: searchParams.get("isVerified") || undefined,
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
      role,
      isActive,
      isVerified,
      sortBy,
      sortOrder,
    } = queryResult.data;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (typeof isVerified === "boolean") {
      where.isVerified = isVerified;
    }

    // Get total count
    const total = await prisma.dashboardUser.count({ where });

    // Get users
    const users = await prisma.dashboardUser.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        chefProfile: {
          select: {
            specialty: true,
            rating: true,
            taxStatus: true,
            isFeatured: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List dashboard users error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/dashboard-users - Create new dashboard user
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
    const result = createDashboardUserApiSchema.safeParse(body);
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

    const { email, password, phone, avatar, ...data } = result.data;

    // Check if email exists in DashboardUser
    const existingDashboardUser = await prisma.dashboardUser.findUnique({
      where: { email },
    });

    if (existingDashboardUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 },
      );
    }

    // Also check User table
    const existingCustomer = await prisma.user.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.dashboardUser.create({
        data: {
          ...data,
          email,
          phone: phone || null,
          avatar: avatar || null,
          password: hashedPassword,
          isVerified: false,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (data.role === "CHEF") {
        await tx.chefProfile.create({
          data: {
            dashboardUserId: newUser.id,
            specialty: (data as any).specialty || "General",
          },
        });
      }

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard user created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create dashboard user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

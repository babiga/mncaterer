import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMenuSchema, menusQuerySchema } from "@/lib/validations/menus";

function serializeMenu(menu: any) {
  return {
    ...menu,
    items: (menu.items ?? []).map((join: any) => ({
      ...join.menuItem,
      price: Number(join.menuItem.price),
      sortOrder: join.sortOrder,
      joinId: join.id,
    })),
  };
}

async function validateServiceTier(serviceTierId: string | null | undefined) {
  if (!serviceTierId) return null;
  return prisma.serviceTier.findUnique({ where: { id: serviceTierId }, select: { id: true } });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const isDashboard = session && session.userType === "dashboard";

    const searchParams = request.nextUrl.searchParams;
    const queryResult = menusQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 12,
      search: searchParams.get("search") || undefined,
      serviceTierId: searchParams.get("serviceTierId") || undefined,
      isActive: searchParams.get("isActive") || (isDashboard ? "all" : "true"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 },
      );
    }

    const { page, limit, search, serviceTierId, isActive, sortBy, sortOrder } = queryResult.data;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (serviceTierId) where.serviceTierId = serviceTierId;
    if (isActive !== "all") where.isActive = isActive === "true";

    const [total, menus] = await Promise.all([
      prisma.menu.count({ where }),
      prisma.menu.findMany({
        where,
        include: {
          serviceTier: { select: { id: true, name: true, isVIP: true, pricePerGuest: true } },
          items: {
            include: { menuItem: true },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { items: true, bookings: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: menus.map(serializeMenu),
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("List menus error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createMenuSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const serviceTierId = result.data.serviceTierId?.trim() || null;
    const serviceTier = await validateServiceTier(serviceTierId);
    if (serviceTierId && !serviceTier) {
      return NextResponse.json(
        { success: false, error: "Selected service tier does not exist" },
        { status: 400 },
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name: result.data.name,
        description: result.data.description || null,
        downloadUrl: result.data.downloadUrl || null,
        serviceTierId,
        isActive: result.data.isActive,
        items: {
          create: result.data.menuItemIds.map((menuItemId, index) => ({
            menuItemId,
            sortOrder: index,
          })),
        },
      },
      include: {
        serviceTier: { select: { id: true, name: true, isVIP: true } },
        items: { include: { menuItem: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { items: true, bookings: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu created successfully",
      data: serializeMenu(menu),
    });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

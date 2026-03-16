import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMenuItemSchema, menuItemsQuerySchema } from "@/lib/validations/menu-items";

function serializeMenuItem(item: any) {
  return {
    ...item,
    price: Number(item.price),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryResult = menuItemsQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || "all",
      isActive: searchParams.get("isActive") || "all",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 },
      );
    }

    const { page, limit, search, category, isActive, sortBy, sortOrder } = queryResult.data;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (isActive !== "all") {
      where.isActive = isActive === "true";
    }

    const [total, items] = await Promise.all([
      prisma.menuItem.count({ where }),
      prisma.menuItem.findMany({
        where,
        include: {
          _count: { select: { menus: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map(serializeMenuItem),
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("List menu items error:", error);
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
    const result = createMenuItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        name: result.data.name,
        description: result.data.description || null,
        price: result.data.price,
        category: result.data.category,
        ingredients: result.data.ingredients,
        allergens: result.data.allergens,
        imageUrl: result.data.imageUrl || null,
        isActive: result.data.isActive,
        sortOrder: result.data.sortOrder,
      },
      include: { _count: { select: { menus: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item created successfully",
      data: serializeMenuItem(item),
    });
  } catch (error) {
    console.error("Create menu item error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateMenuItemSchema } from "@/lib/validations/menu-items";

function serializeMenuItem(item: any) {
  return {
    ...item,
    price: Number(item.price),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        _count: { select: { menus: true } },
        menus: {
          include: { menu: { select: { id: true, name: true } } },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeMenuItem(item) });
  } catch (error) {
    console.error("Get menu item error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateMenuItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Menu item not found" }, { status: 404 });
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name: result.data.name,
        description:
          result.data.description === undefined ? undefined : result.data.description || null,
        price: result.data.price,
        category: result.data.category,
        ingredients: result.data.ingredients,
        allergens: result.data.allergens,
        imageUrl:
          result.data.imageUrl === undefined ? undefined : result.data.imageUrl || null,
        isActive: result.data.isActive,
        sortOrder: result.data.sortOrder,
      },
      include: { _count: { select: { menus: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      data: serializeMenuItem(item),
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Menu item not found" }, { status: 404 });
    }

    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

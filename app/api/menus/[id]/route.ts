import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateMenuSchema } from "@/lib/validations/menus";

function serializeMenu(menu: any) {
  return {
    ...menu,
    items: menu.items.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

async function validateServiceTier(serviceTierId: string | null | undefined) {
  if (!serviceTierId) {
    return null;
  }

  const serviceTier = await prisma.serviceTier.findUnique({
    where: { id: serviceTierId },
    select: { id: true },
  });

  return serviceTier;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        serviceTier: {
          select: {
            id: true,
            name: true,
            isVIP: true,
          },
        },
        items: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        _count: {
          select: {
            items: true,
            bookings: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: serializeMenu(menu) });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
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

    const result = updateMenuSchema.safeParse(body);
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

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 },
      );
    }

    const serviceTierId = result.data.serviceTierId === undefined
      ? existing.serviceTierId
      : result.data.serviceTierId?.trim() || null;

    const serviceTier = await validateServiceTier(serviceTierId);
    if (serviceTierId && !serviceTier) {
      return NextResponse.json(
        { success: false, error: "Selected service tier does not exist" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.menu.update({
        where: { id },
        data: {
          name: result.data.name,
          description: result.data.description === undefined
            ? undefined
            : result.data.description || null,
          downloadUrl: result.data.downloadUrl === undefined
            ? undefined
            : result.data.downloadUrl || null,
          serviceTierId,
          isActive: result.data.isActive,
        },
      });

      if (result.data.items) {
        await tx.menuItem.deleteMany({
          where: { menuId: id },
        });

        if (result.data.items.length > 0) {
          await tx.menuItem.createMany({
            data: result.data.items.map((item) => ({
              menuId: id,
              name: item.name,
              description: item.description || null,
              price: item.price,
              ingredients: item.ingredients,
              allergens: item.allergens,
              imageUrl: item.imageUrl || null,
              sortOrder: item.sortOrder,
            })),
          });
        }
      }
    });

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        serviceTier: {
          select: {
            id: true,
            name: true,
            isVIP: true,
          },
        },
        items: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        _count: {
          select: {
            items: true,
            bookings: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu updated successfully",
      data: menu ? serializeMenu(menu) : null,
    });
  } catch (error) {
    console.error("Update menu error:", error);
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
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 },
      );
    }

    await prisma.menu.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

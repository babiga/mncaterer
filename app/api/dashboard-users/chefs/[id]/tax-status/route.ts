import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateChefTaxStatusSchema } from "@/lib/validations/users";

// PATCH /api/dashboard-users/chefs/[id]/tax-status - Update chef tax status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const result = updateChefTaxStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check if user exists and is a chef
    const existingUser = await prisma.dashboardUser.findUnique({
      where: { id },
      include: { chefProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Dashboard user not found" },
        { status: 404 }
      );
    }

    if (existingUser.role !== "CHEF" || !existingUser.chefProfile) {
      return NextResponse.json(
        { success: false, error: "User is not a chef or profile is missing" },
        { status: 400 }
      );
    }

    // Update chef profile
    const updatedProfile = await prisma.chefProfile.update({
      where: { dashboardUserId: id },
      data: { taxStatus: result.data.taxStatus },
    });

    return NextResponse.json({
      success: true,
      message: "Chef tax status updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update chef tax status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

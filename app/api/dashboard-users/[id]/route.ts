import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateDashboardUserSchema } from "@/lib/validations/users";

// GET /api/dashboard-users/[id] - Get single dashboard user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify dashboard session
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const user = await prisma.dashboardUser.findUnique({
      where: { id },
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
            id: true,
            specialty: true,
            bio: true,
            yearsExperience: true,
            rating: true,
            reviewCount: true,
            taxStatus: true,
          },
        },
        companyProfile: {
          select: {
            id: true,
            companyName: true,
            description: true,
            approvalStatus: true,
          },
        },
        _count: {
          select: {
            jobPostings: true,
            jobInvitations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Dashboard user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get dashboard user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/dashboard-users/[id] - Update dashboard user information
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify session
    const session = await getSession();
    const { id } = await params;

    if (
      !session ||
      session.userType !== "dashboard" ||
      (session.role !== "ADMIN" && session.userId !== id)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await request.json();

    // Validate request body
    const result = updateDashboardUserSchema.safeParse(body);
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

    // Check if user exists
    const existingUser = await prisma.dashboardUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Dashboard user not found" },
        { status: 404 },
      );
    }

    const { specialty, ...userData } = result.data;

    // Clean up phone field
    if (userData.phone === "") {
      userData.phone = null;
    }
    if (userData.avatar === "") {
      userData.avatar = null;
    }

    // Update user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.dashboardUser.update({
        where: { id },
        data: userData as any,
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
        },
      });

      if (
        updatedUser.role === "CHEF" &&
        specialty !== undefined
      ) {
        await tx.chefProfile.update({
          where: { dashboardUserId: id },
          data: {
            specialty: specialty || undefined,
          },
        });
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard user updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update dashboard user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/dashboard-users/[id] - Delete a dashboard user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 401 },
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (session.userId === id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.dashboardUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Dashboard user not found" },
        { status: 404 },
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.dashboardUser.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard user deleted successfully",
    });
  } catch (error) {
    console.error("Delete dashboard user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
